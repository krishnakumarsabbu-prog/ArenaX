"""Seed demo data into the in-memory store."""
import random
import uuid
from datetime import datetime, timedelta
import database as db


def _id() -> str:
    return str(uuid.uuid4())


def _ts(offset_hours: int = 0) -> str:
    return (datetime.utcnow() - timedelta(hours=offset_hours)).isoformat() + "Z"


def _make_call(role: str, url: str, method: str, lat: float, sc: int, body: dict, score: float = 0.5) -> dict:
    return {
        "call_id": _id(),
        "timestamp": _ts(random.randint(0, 48)),
        "role": role,
        "url": url,
        "method": method,
        "status_code": sc,
        "latency_ms": round(lat, 1),
        "response_body": body,
        "response_headers": {"Content-Type": "application/json"},
        "error": None if sc < 400 else "Request failed",
        "payload_size_bytes": random.randint(280, 900),
        "score": score,
    }


def _make_ab_call(variant_id: str, variant_name: str, url: str, method: str, lat: float, sc: int, body: dict) -> dict:
    return {
        "call_id": _id(),
        "timestamp": _ts(random.randint(0, 72)),
        "variant_id": variant_id,
        "variant_name": variant_name,
        "url": url,
        "method": method,
        "status_code": sc,
        "latency_ms": round(lat, 1),
        "response_body": body,
        "response_headers": {"Content-Type": "application/json"},
        "error": None if sc < 400 else "Request failed",
        "payload_size_bytes": random.randint(200, 800),
    }


def seed_demo_data():
    if db.list_experiments():
        return  # already seeded

    # ─── A/B Experiment 1: Payment Gateway ────────────────────────────────────
    ab1 = db.create_experiment({
        "mode": "AB",
        "name": "Payment Gateway A/B Test",
        "description": "Compare Stripe vs Adyen for checkout success rate and latency",
        "status": "running",
        "environment": "staging",
        "method": "POST",
        "base_url": "https://checkout-mock.httpbin.org",
        "path": "/post",
        "query_params": {},
        "body_template": '{"amount": 9900, "currency": "USD"}',
        "request_headers": {"Content-Type": "application/json"},
        "auth_type": "bearer",
        "auth_value": "demo-token",
        "timeout_ms": 5000,
    })
    va1 = db.create_variant({"experiment_id": ab1["id"], "name": "Stripe Gateway", "weight": 50, "url_override": "https://httpbin.org/post", "header_overrides": {"X-Gateway": "stripe"}, "description": "Stripe payment processing"})
    vb1 = db.create_variant({"experiment_id": ab1["id"], "name": "Adyen Gateway", "weight": 50, "url_override": "https://httpbin.org/post", "header_overrides": {"X-Gateway": "adyen"}, "description": "Adyen payment processing"})
    for i in range(8):
        s = db.create_session({"experiment_id": ab1["id"], "mode": "AB", "n_requested": 3})
        for _ in range(3):
            chosen = random.choice([va1, vb1])
            ok = random.random() > 0.05
            s["calls"].append(_make_ab_call(
                chosen["id"], chosen["name"],
                chosen.get("url_override", ""),
                "POST",
                random.uniform(120, 380),
                200 if ok else 402,
                {"success": ok, "charge_id": "ch_" + _id()[:8]},
            ))

    # ─── A/B Experiment 2: Auth Token Validation ──────────────────────────────
    ab2 = db.create_experiment({
        "mode": "AB",
        "name": "Auth Token Validation Migration",
        "description": "Migrate from HS256 to RS256 — validate latency and compatibility",
        "status": "running",
        "environment": "staging",
        "method": "POST",
        "base_url": "https://httpbin.org",
        "path": "/post",
        "query_params": {},
        "body_template": '{"token": "eyJ..."}',
        "request_headers": {"Content-Type": "application/json"},
        "auth_type": "none",
        "auth_value": "",
        "timeout_ms": 3000,
    })
    va2 = db.create_variant({"experiment_id": ab2["id"], "name": "HS256 (Current)", "weight": 50, "url_override": "https://httpbin.org/post", "header_overrides": {"X-Algorithm": "HS256"}, "description": "Symmetric JWT"})
    vb2 = db.create_variant({"experiment_id": ab2["id"], "name": "RS256 (New)", "weight": 50, "url_override": "https://httpbin.org/post", "header_overrides": {"X-Algorithm": "RS256"}, "description": "Asymmetric JWT"})
    for i in range(6):
        s = db.create_session({"experiment_id": ab2["id"], "mode": "AB", "n_requested": 2})
        for _ in range(2):
            chosen = random.choice([va2, vb2])
            s["calls"].append(_make_ab_call(
                chosen["id"], chosen["name"],
                chosen.get("url_override", ""),
                "POST",
                random.uniform(8, 45),
                200,
                {"valid": True, "alg": chosen["name"].split()[0], "user_id": "u_" + str(random.randint(100, 999))},
            ))

    # ─── A/B Experiment 3: CDN Cache (Draft) ──────────────────────────────────
    ab3 = db.create_experiment({
        "mode": "AB",
        "name": "CDN Cache Strategy",
        "description": "Aggressive TTL vs stale-while-revalidate for product catalog API",
        "status": "draft",
        "environment": "dev",
        "method": "GET",
        "base_url": "https://httpbin.org",
        "path": "/get",
        "query_params": {"category": "electronics"},
        "body_template": "",
        "request_headers": {"Accept": "application/json"},
        "auth_type": "none",
        "auth_value": "",
        "timeout_ms": 2000,
    })
    db.create_variant({"experiment_id": ab3["id"], "name": "Aggressive TTL (1h)", "weight": 50, "url_override": "https://httpbin.org/get", "header_overrides": {"Cache-Control": "max-age=3600"}, "description": "Cache 1 hour"})
    db.create_variant({"experiment_id": ab3["id"], "name": "Stale-While-Revalidate", "weight": 50, "url_override": "https://httpbin.org/get", "header_overrides": {"Cache-Control": "max-age=60, stale-while-revalidate=300"}, "description": "SWR strategy"})

    # ─── CC Experiment 1: Recommendation Engine ───────────────────────────────
    cc1 = db.create_experiment({
        "mode": "CC",
        "name": "Recommendation Engine Migration",
        "description": "Compare sklearn v1 vs PyTorch v2 deep learning model",
        "status": "running",
        "environment": "staging",
        "method": "POST",
        "champion_url": "https://httpbin.org",
        "challenger_url": "https://httpbin.org",
        "path": "/post",
        "query_params": {},
        "body_template": '{"user_id": "u_123", "context": "homepage"}',
        "request_headers": {"Content-Type": "application/json"},
        "auth_type": "bearer",
        "auth_value": "demo-token",
        "timeout_ms": 2000,
        "scoring_rules": {
            "priority": "latency",
            "success_status_required": True,
            "latency_weight": 0.4,
            "error_weight": 0.4,
            "business_metric_weight": 0.2,
            "business_metric_path": "data.click_through_rate",
        },
    })
    for i in range(10):
        lat_c = random.uniform(130, 210)
        lat_ch = random.uniform(75, 130)
        c_score = round(max(0, 1 - lat_c / 5000) * 0.4 + 0.6, 4)
        ch_score = round(max(0, 1 - lat_ch / 5000) * 0.4 + 0.6, 4)
        winner = "challenger" if ch_score > c_score else "champion"
        s = db.create_session({"experiment_id": cc1["id"], "mode": "CC"})
        c_call = _make_call("champion", "https://httpbin.org/post", "POST", lat_c, 200, {"data": {"recommendations": ["p1", "p2"], "model": "sklearn-v1", "click_through_rate": round(random.uniform(0.08, 0.14), 3)}}, c_score)
        ch_call = _make_call("challenger", "https://httpbin.org/post", "POST", lat_ch, 200, {"data": {"recommendations": ["p1", "p4"], "model": "pytorch-v2", "click_through_rate": round(random.uniform(0.12, 0.20), 3)}}, ch_score)
        s["calls"].extend([c_call, ch_call])
        s["winner"] = winner
        s["score_diff"] = round(abs(c_score - ch_score), 4)
        s["champion"] = c_call
        s["challenger"] = ch_call

    # ─── CC Experiment 2: Search Engine ───────────────────────────────────────
    cc2 = db.create_experiment({
        "mode": "CC",
        "name": "Search Engine: Elasticsearch vs Meilisearch",
        "description": "Compare Elasticsearch 8.x vs Meilisearch v1.7 on latency and result quality",
        "status": "running",
        "environment": "prod",
        "method": "GET",
        "champion_url": "https://httpbin.org",
        "challenger_url": "https://httpbin.org",
        "path": "/get",
        "query_params": {"q": "laptop"},
        "body_template": "",
        "request_headers": {"Accept": "application/json"},
        "auth_type": "api_key",
        "auth_value": "demo-key",
        "timeout_ms": 1000,
        "scoring_rules": {
            "priority": "latency",
            "success_status_required": True,
            "latency_weight": 0.5,
            "error_weight": 0.4,
            "business_metric_weight": 0.1,
            "business_metric_path": None,
        },
    })
    for i in range(12):
        lat_c = random.uniform(55, 180)
        lat_ch = random.uniform(12, 65)
        c_score = round(max(0, 1 - lat_c / 5000), 4)
        ch_score = round(max(0, 1 - lat_ch / 5000), 4)
        winner = "challenger" if ch_score > c_score else "champion"
        s = db.create_session({"experiment_id": cc2["id"], "mode": "CC"})
        c_call = _make_call("champion", "https://httpbin.org/get", "GET", lat_c, 200, {"hits": {"total": random.randint(18, 200)}, "took": round(lat_c)}, c_score)
        ch_call = _make_call("challenger", "https://httpbin.org/get", "GET", lat_ch, 200, {"hits": [{"id": str(i)} for i in range(5)], "estimatedTotalHits": random.randint(18, 200)}, ch_score)
        s["calls"].extend([c_call, ch_call])
        s["winner"] = winner
        s["score_diff"] = round(abs(c_score - ch_score), 4)
        s["champion"] = c_call
        s["challenger"] = ch_call

    # ─── CC Experiment 3: ML Inference (Concluded) ────────────────────────────
    cc3 = db.create_experiment({
        "mode": "CC",
        "name": "ML Inference Pipeline v4 Rollout",
        "description": "Concluded: Model v4.0-beta won against v3.1 on all metrics",
        "status": "concluded",
        "environment": "prod",
        "method": "POST",
        "champion_url": "https://httpbin.org",
        "challenger_url": "https://httpbin.org",
        "path": "/post",
        "query_params": {},
        "body_template": '{"features": [1, 2, 3]}',
        "request_headers": {"Content-Type": "application/json"},
        "auth_type": "bearer",
        "auth_value": "demo-token",
        "timeout_ms": 3000,
        "scoring_rules": {
            "priority": "latency",
            "success_status_required": True,
            "latency_weight": 0.35,
            "error_weight": 0.35,
            "business_metric_weight": 0.3,
            "business_metric_path": "prediction.confidence",
        },
    })
    for i in range(8):
        lat_c = random.uniform(280, 520)
        lat_ch = random.uniform(85, 165)
        c_score = round(max(0, 1 - lat_c / 5000), 4)
        ch_score = round(max(0, 1 - lat_ch / 5000), 4)
        s = db.create_session({"experiment_id": cc3["id"], "mode": "CC"})
        c_call = _make_call("champion", "https://httpbin.org/post", "POST", lat_c, 200, {"prediction": {"confidence": round(random.uniform(0.72, 0.88), 3), "model": "v3.1"}}, c_score)
        ch_call = _make_call("challenger", "https://httpbin.org/post", "POST", lat_ch, 200, {"prediction": {"confidence": round(random.uniform(0.89, 0.97), 3), "model": "v4.0-beta"}}, ch_score)
        s["calls"].extend([c_call, ch_call])
        s["winner"] = "challenger"
        s["score_diff"] = round(abs(c_score - ch_score), 4)
        s["champion"] = c_call
        s["challenger"] = ch_call

    print("Demo data seeded successfully.")
