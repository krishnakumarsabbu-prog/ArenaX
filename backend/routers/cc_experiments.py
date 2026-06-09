"""Champion vs Challenger experiment CRUD router."""
from fastapi import APIRouter, HTTPException
import database as db
from schemas import CCExperimentCreate, CCExperimentUpdate

router = APIRouter()


def _enrich(exp: dict) -> dict:
    exp_sessions = db.list_sessions(exp["id"])
    all_calls = [c for s in exp_sessions for c in s.get("calls", [])]
    total = len(all_calls)

    champion_calls = [c for c in all_calls if c.get("role") == "champion"]
    challenger_calls = [c for c in all_calls if c.get("role") == "challenger"]

    def _stats(calls):
        if not calls:
            return {"count": 0, "avg_latency_ms": 0.0, "error_rate": 0.0}
        lats = [c["latency_ms"] for c in calls if "latency_ms" in c]
        errs = sum(1 for c in calls if c.get("status_code", 200) >= 400)
        return {
            "count": len(calls),
            "avg_latency_ms": round(sum(lats) / len(lats), 2) if lats else 0.0,
            "error_rate": round(errs / len(calls) * 100, 2),
        }

    champion_wins = sum(1 for s in exp_sessions if s.get("winner") == "champion")
    challenger_wins = sum(1 for s in exp_sessions if s.get("winner") == "challenger")

    return {
        **exp,
        "total_sessions": total,
        "champion_stats": _stats(champion_calls),
        "challenger_stats": _stats(challenger_calls),
        "champion_wins": champion_wins,
        "challenger_wins": challenger_wins,
    }


@router.get("/")
def list_cc():
    return [_enrich(e) for e in db.list_experiments(mode="CC")]


@router.get("/{exp_id}")
def get_cc(exp_id: str):
    exp = db.get_experiment(exp_id)
    if not exp or exp.get("mode") != "CC":
        raise HTTPException(404, "CC experiment not found")
    return _enrich(exp)


@router.post("/", status_code=201)
def create_cc(payload: CCExperimentCreate):
    exp_data = {
        "mode": "CC",
        "name": payload.name,
        "description": payload.description,
        "environment": payload.environment,
        "method": payload.method,
        "champion_url": payload.champion_url,
        "challenger_url": payload.challenger_url,
        "path": payload.path,
        "query_params": payload.query_params,
        "body_template": payload.body_template,
        "request_headers": payload.request_headers,
        "auth_type": payload.auth_type,
        "auth_value": payload.auth_value,
        "timeout_ms": payload.timeout_ms,
        "scoring_rules": payload.scoring_rules.dict(),
    }
    exp = db.create_experiment(exp_data)
    return _enrich(exp)


@router.patch("/{exp_id}")
def update_cc(exp_id: str, payload: CCExperimentUpdate):
    exp = db.get_experiment(exp_id)
    if not exp or exp.get("mode") != "CC":
        raise HTTPException(404, "CC experiment not found")
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    if "scoring_rules" in updates and updates["scoring_rules"]:
        updates["scoring_rules"] = updates["scoring_rules"].dict() if hasattr(updates["scoring_rules"], "dict") else updates["scoring_rules"]
    updated = db.update_experiment(exp_id, updates)
    return _enrich(updated)


@router.delete("/{exp_id}", status_code=204)
def delete_cc(exp_id: str):
    if not db.delete_experiment(exp_id):
        raise HTTPException(404, "Not found")
