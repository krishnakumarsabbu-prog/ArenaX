"""Pure in-memory data store — no SQLAlchemy / SQLite dependency."""
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Any

# ── helpers ──────────────────────────────────────────────────────────────────

def _now() -> str:
    return datetime.utcnow().isoformat() + "Z"

def _id() -> str:
    return str(uuid.uuid4())

# ── tables (plain dicts) ──────────────────────────────────────────────────────

experiments: dict[str, dict] = {}   # id -> experiment
variants: dict[str, dict] = {}      # id -> variant
sessions: dict[str, dict] = {}      # id -> session

# ── experiment CRUD ───────────────────────────────────────────────────────────

def get_experiment(exp_id: str) -> dict | None:
    return experiments.get(exp_id)

def list_experiments(mode: str | None = None) -> list[dict]:
    rows = list(experiments.values())
    if mode:
        rows = [e for e in rows if e.get("mode") == mode]
    return sorted(rows, key=lambda e: e["created_at"], reverse=True)

def create_experiment(data: dict) -> dict:
    eid = _id()
    now = _now()
    exp = {"id": eid, "created_at": now, "updated_at": now, "status": "draft", **data}
    experiments[eid] = exp
    return exp

def update_experiment(exp_id: str, data: dict) -> dict | None:
    exp = experiments.get(exp_id)
    if not exp:
        return None
    exp.update(data)
    exp["updated_at"] = _now()
    return exp

def delete_experiment(exp_id: str) -> bool:
    if exp_id not in experiments:
        return False
    del experiments[exp_id]
    for v in [v for v in list(variants.values()) if v["experiment_id"] == exp_id]:
        del variants[v["id"]]
    for s in [s for s in list(sessions.values()) if s["experiment_id"] == exp_id]:
        del sessions[s["id"]]
    return True

# ── variant CRUD ──────────────────────────────────────────────────────────────

def get_variant(var_id: str) -> dict | None:
    return variants.get(var_id)

def list_variants(exp_id: str) -> list[dict]:
    return [v for v in variants.values() if v["experiment_id"] == exp_id]

def create_variant(data: dict) -> dict:
    vid = _id()
    now = _now()
    v = {"id": vid, "created_at": now, **data}
    variants[vid] = v
    return v

def update_variant(var_id: str, data: dict) -> dict | None:
    v = variants.get(var_id)
    if not v:
        return None
    v.update(data)
    return v

def delete_variant(var_id: str) -> bool:
    if var_id not in variants:
        return False
    del variants[var_id]
    return True

# ── session CRUD ──────────────────────────────────────────────────────────────

def get_session(session_id: str) -> dict | None:
    return sessions.get(session_id)

def list_sessions(exp_id: str) -> list[dict]:
    return sorted(
        [s for s in sessions.values() if s["experiment_id"] == exp_id],
        key=lambda s: s["created_at"], reverse=True,
    )

def list_all_sessions(limit: int = 50) -> list[dict]:
    rows = sorted(sessions.values(), key=lambda s: s["created_at"], reverse=True)
    return rows[:limit]

def create_session(data: dict) -> dict:
    sid = _id()
    now = _now()
    s = {"id": sid, "created_at": now, "updated_at": now, "calls": [], **data}
    sessions[sid] = s
    return s

def append_call(session_id: str, call: dict) -> dict | None:
    s = sessions.get(session_id)
    if not s:
        return None
    s["calls"].append(call)
    s["updated_at"] = _now()
    return s
