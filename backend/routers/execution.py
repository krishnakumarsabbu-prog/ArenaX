"""Execution engine for A/B and Champion-vs-Challenger modes.

A/B: one request → one variant (weighted random selection).
CC:  one request → both champion AND challenger (parallel).

All real HTTP calls are made with httpx.  If the target URL is unreachable
the engine returns a simulated error response so the session is still stored.
"""
from __future__ import annotations
import asyncio
import time
import random
import json
import uuid
from datetime import datetime
from typing import Any
from fastapi import APIRouter, HTTPException

import httpx
import database as db
from schemas import ABExecuteRequest, CCExecuteRequest

router = APIRouter()


# ── helpers ───────────────────────────────────────────────────────────────────

def _ts() -> str:
    return datetime.utcnow().isoformat() + "Z"

def _cid() -> str:
    return str(uuid.uuid4())


def _select_variant(exp_variants: list[dict]) -> dict:
    """Weighted-random variant selection for A/B mode."""
    total = sum(v.get("weight", 0) for v in exp_variants)
    if total == 0:
        return random.choice(exp_variants)
    r = random.uniform(0, total)
    cumulative = 0
    for v in exp_variants:
        cumulative += v.get("weight", 0)
        if r <= cumulative:
            return v
    return exp_variants[-1]


async def _http_call(
    method: str,
    url: str,
    headers: dict,
    body: Any,
    timeout_ms: int,
) -> dict:
    """Execute one HTTP request and return a normalised result dict."""
    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=timeout_ms / 1000) as client:
            resp = await client.request(
                method=method,
                url=url,
                headers=headers,
                json=body if body else None,
            )
        latency = round((time.perf_counter() - start) * 1000, 2)
        try:
            resp_body = resp.json()
        except Exception:
            resp_body = {"_raw": resp.text[:2000]}
        return {
            "status_code": resp.status_code,
            "latency_ms": latency,
            "response_body": resp_body,
            "response_headers": dict(resp.headers),
            "error": None,
            "payload_size_bytes": len(resp.content),
        }
    except Exception as exc:
        latency = round((time.perf_counter() - start) * 1000, 2)
        return {
            "status_code": 0,
            "latency_ms": latency,
            "response_body": {},
            "response_headers": {},
            "error": str(exc),
            "payload_size_bytes": 0,
        }


def _build_headers(exp: dict, extra: dict | None) -> dict:
    headers = {**exp.get("request_headers", {})}
    if exp.get("auth_type") == "bearer" and exp.get("auth_value"):
        headers["Authorization"] = f"Bearer {exp['auth_value']}"
    elif exp.get("auth_type") == "api_key" and exp.get("auth_value"):
        headers["X-API-Key"] = exp["auth_value"]
    if extra:
        headers.update(extra)
    return headers


def _resolve_url(exp: dict, override: str | None) -> str:
    base = (override or exp.get("base_url", "")).rstrip("/")
    path = exp.get("path", "/")
    if not path.startswith("/"):
        path = "/" + path
    return base + path


# ── scoring (CC winner detection) ─────────────────────────────────────────────

def _cc_score(call: dict, rules: dict) -> float:
    lw = rules.get("latency_weight", 0.6)
    ew = rules.get("error_weight", 0.3)
    bw = rules.get("business_metric_weight", 0.1)

    # latency score: lower is better, normalise to 0-1 (cap at 5000 ms)
    lat = call.get("latency_ms", 5000)
    latency_score = max(0.0, 1.0 - lat / 5000)

    # error score
    sc = call.get("status_code", 0)
    error_score = 1.0 if (200 <= sc < 400) else 0.0

    # business metric
    bm_score = 0.5
    bm_path = rules.get("business_metric_path")
    if bm_path:
        try:
            parts = bm_path.split(".")
            val = call.get("response_body", {})
            for p in parts:
                val = val[p]
            bm_score = float(val)
            bm_score = max(0.0, min(1.0, bm_score))
        except Exception:
            pass

    return round(lw * latency_score + ew * error_score + bw * bm_score, 4)


def _determine_winner(champion_call: dict, challenger_call: dict, rules: dict) -> str:
    cs = champion_call.get("status_code", 0)
    chs = challenger_call.get("status_code", 0)
    c_ok = 200 <= cs < 400
    ch_ok = 200 <= chs < 400

    if rules.get("success_status_required", True):
        if c_ok and not ch_ok:
            return "champion"
        if ch_ok and not c_ok:
            return "challenger"

    c_score = _cc_score(champion_call, rules)
    ch_score = _cc_score(challenger_call, rules)

    if c_score >= ch_score:
        return "champion"
    return "challenger"


# ── A/B execution ──────────────────────────────────────────────────────────────

@router.post("/ab/execute")
async def ab_execute(payload: ABExecuteRequest):
    exp = db.get_experiment(payload.experiment_id)
    if not exp or exp.get("mode") != "AB":
        raise HTTPException(404, "AB experiment not found")
    if exp.get("status") not in ("running", "draft"):
        raise HTTPException(400, "Experiment is not running")

    exp_variants = db.list_variants(payload.experiment_id)
    if not exp_variants:
        raise HTTPException(400, "Experiment has no variants")

    # create session
    session = db.create_session({
        "experiment_id": payload.experiment_id,
        "mode": "AB",
        "n_requested": payload.n,
    })

    headers = _build_headers(exp, payload.request_headers)
    n = max(1, min(payload.n, 50))

    for _ in range(n):
        variant = _select_variant(exp_variants)
        url = _resolve_url(exp, variant.get("url_override") or None)
        call_headers = {**headers, **variant.get("header_overrides", {})}
        body = payload.request_body
        if variant.get("body_override"):
            try:
                body = json.loads(variant["body_override"])
            except Exception:
                pass

        result = await _http_call(exp.get("method", "GET"), url, call_headers, body, exp.get("timeout_ms", 5000))

        call = {
            "call_id": _cid(),
            "timestamp": _ts(),
            "variant_id": variant["id"],
            "variant_name": variant["name"],
            "url": url,
            "method": exp.get("method", "GET"),
            **result,
        }
        db.append_call(session["id"], call)

    return db.get_session(session["id"])


@router.post("/ab/sessions/{session_id}/run")
async def ab_run_more(session_id: str, n: int = 1):
    """Append more calls to an existing A/B session."""
    session = db.get_session(session_id)
    if not session or session.get("mode") != "AB":
        raise HTTPException(404, "Session not found")

    exp = db.get_experiment(session["experiment_id"])
    exp_variants = db.list_variants(session["experiment_id"])
    headers = _build_headers(exp, {})
    n = max(1, min(n, 50))

    for _ in range(n):
        variant = _select_variant(exp_variants)
        url = _resolve_url(exp, variant.get("url_override") or None)
        call_headers = {**headers, **variant.get("header_overrides", {})}

        result = await _http_call(exp.get("method", "GET"), url, call_headers, None, exp.get("timeout_ms", 5000))
        call = {
            "call_id": _cid(),
            "timestamp": _ts(),
            "variant_id": variant["id"],
            "variant_name": variant["name"],
            "url": url,
            "method": exp.get("method", "GET"),
            **result,
        }
        db.append_call(session_id, call)

    return db.get_session(session_id)


@router.get("/ab/sessions")
def list_ab_sessions(experiment_id: str):
    return db.list_sessions(experiment_id)


@router.get("/ab/sessions/{session_id}")
def get_ab_session(session_id: str):
    s = db.get_session(session_id)
    if not s:
        raise HTTPException(404, "Session not found")
    return s


# ── CC execution ───────────────────────────────────────────────────────────────

@router.post("/cc/execute")
async def cc_execute(payload: CCExecuteRequest):
    exp = db.get_experiment(payload.experiment_id)
    if not exp or exp.get("mode") != "CC":
        raise HTTPException(404, "CC experiment not found")
    if exp.get("status") not in ("running", "draft"):
        raise HTTPException(400, "Experiment is not running")

    session = db.create_session({
        "experiment_id": payload.experiment_id,
        "mode": "CC",
    })

    headers = _build_headers(exp, payload.request_headers)
    body = payload.request_body

    champion_url = _resolve_url({"base_url": exp.get("champion_url", ""), "path": exp.get("path", "/")}, None)
    challenger_url = _resolve_url({"base_url": exp.get("challenger_url", ""), "path": exp.get("path", "/")}, None)

    # parallel execution
    champion_result, challenger_result = await asyncio.gather(
        _http_call(exp.get("method", "GET"), champion_url, headers, body, exp.get("timeout_ms", 5000)),
        _http_call(exp.get("method", "GET"), challenger_url, headers, body, exp.get("timeout_ms", 5000)),
    )

    rules = exp.get("scoring_rules", {})
    winner = _determine_winner(champion_result, challenger_result, rules)
    c_score = _cc_score(champion_result, rules)
    ch_score = _cc_score(challenger_result, rules)

    champion_call = {
        "call_id": _cid(),
        "timestamp": _ts(),
        "role": "champion",
        "url": champion_url,
        "method": exp.get("method", "GET"),
        **champion_result,
        "score": c_score,
    }
    challenger_call = {
        "call_id": _cid(),
        "timestamp": _ts(),
        "role": "challenger",
        "url": challenger_url,
        "method": exp.get("method", "GET"),
        **challenger_result,
        "score": ch_score,
    }

    db.append_call(session["id"], champion_call)
    db.append_call(session["id"], challenger_call)

    session_obj = db.get_session(session["id"])
    session_obj["winner"] = winner
    session_obj["score_diff"] = round(abs(c_score - ch_score), 4)
    session_obj["champion"] = champion_call
    session_obj["challenger"] = challenger_call

    return session_obj


@router.get("/cc/sessions")
def list_cc_sessions(experiment_id: str):
    return db.list_sessions(experiment_id)


@router.get("/cc/sessions/{session_id}")
def get_cc_session(session_id: str):
    s = db.get_session(session_id)
    if not s:
        raise HTTPException(404, "Session not found")
    return s


# ── generic recent ─────────────────────────────────────────────────────────────

@router.get("/recent")
def recent_sessions(limit: int = 20):
    return db.list_all_sessions(limit)
