"""A/B Experiment CRUD router."""
from fastapi import APIRouter, HTTPException
from typing import List
import database as db
from schemas import ABExperimentCreate, ABExperimentUpdate

router = APIRouter()


def _enrich(exp: dict) -> dict:
    exp_variants = db.list_variants(exp["id"])
    exp_sessions = db.list_sessions(exp["id"])
    all_calls = [c for s in exp_sessions for c in s.get("calls", [])]
    total = len(all_calls)
    errors = sum(1 for c in all_calls if c.get("status_code", 200) >= 400)
    latencies = [c["latency_ms"] for c in all_calls if "latency_ms" in c]
    return {
        **exp,
        "variant_count": len(exp_variants),
        "total_requests": total,
        "error_rate": round(errors / total * 100, 2) if total else 0.0,
        "avg_latency_ms": round(sum(latencies) / len(latencies), 2) if latencies else 0.0,
        "variants": exp_variants,
    }


@router.get("/")
def list_ab():
    return [_enrich(e) for e in db.list_experiments(mode="AB")]


@router.get("/{exp_id}")
def get_ab(exp_id: str):
    exp = db.get_experiment(exp_id)
    if not exp or exp.get("mode") != "AB":
        raise HTTPException(404, "AB experiment not found")
    return _enrich(exp)


@router.post("/", status_code=201)
def create_ab(payload: ABExperimentCreate):
    exp_data = {
        "mode": "AB",
        "name": payload.name,
        "description": payload.description,
        "environment": payload.environment,
        "method": payload.method,
        "base_url": payload.base_url,
        "path": payload.path,
        "query_params": payload.query_params,
        "body_template": payload.body_template,
        "request_headers": payload.request_headers,
        "auth_type": payload.auth_type,
        "auth_value": payload.auth_value,
        "timeout_ms": payload.timeout_ms,
    }
    exp = db.create_experiment(exp_data)

    # create variants
    variants_in = payload.variants
    if not variants_in:
        # default two variants
        variants_in = [
            {"name": "Variant A", "weight": 50, "url_override": "", "header_overrides": {}, "description": ""},
            {"name": "Variant B", "weight": 50, "url_override": "", "header_overrides": {}, "description": ""},
        ]
    for v in variants_in:
        vd = v if isinstance(v, dict) else v.dict()
        db.create_variant({
            "experiment_id": exp["id"],
            "name": vd.get("name", "Variant"),
            "weight": vd.get("weight", 50),
            "url_override": vd.get("url_override", ""),
            "header_overrides": vd.get("header_overrides", {}),
            "body_override": vd.get("body_override"),
            "description": vd.get("description", ""),
        })

    return _enrich(exp)


@router.patch("/{exp_id}")
def update_ab(exp_id: str, payload: ABExperimentUpdate):
    exp = db.get_experiment(exp_id)
    if not exp or exp.get("mode") != "AB":
        raise HTTPException(404, "AB experiment not found")
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    updated = db.update_experiment(exp_id, updates)
    return _enrich(updated)


@router.delete("/{exp_id}", status_code=204)
def delete_ab(exp_id: str):
    if not db.delete_experiment(exp_id):
        raise HTTPException(404, "Not found")
