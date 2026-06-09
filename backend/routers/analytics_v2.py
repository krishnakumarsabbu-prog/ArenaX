"""Analytics router — works from in-memory sessions."""
from fastapi import APIRouter, HTTPException
from statistics import median, quantiles
import database as db

router = APIRouter()


def _pct(data: list[float], p: float) -> float:
    if not data:
        return 0.0
    sorted_d = sorted(data)
    idx = int(len(sorted_d) * p / 100)
    return sorted_d[min(idx, len(sorted_d) - 1)]


# ── A/B analytics ─────────────────────────────────────────────────────────────

@router.get("/ab/{exp_id}")
def ab_analytics(exp_id: str):
    exp = db.get_experiment(exp_id)
    if not exp or exp.get("mode") != "AB":
        raise HTTPException(404, "AB experiment not found")

    exp_variants = db.list_variants(exp_id)
    sessions = db.list_sessions(exp_id)
    all_calls = [c for s in sessions for c in s.get("calls", [])]

    # per-variant stats
    variant_metrics = []
    for v in exp_variants:
        v_calls = [c for c in all_calls if c.get("variant_id") == v["id"]]
        lats = [c["latency_ms"] for c in v_calls if "latency_ms" in c]
        errs = sum(1 for c in v_calls if c.get("status_code", 200) >= 400)
        count = len(v_calls)
        variant_metrics.append({
            "variant_id": v["id"],
            "variant_name": v["name"],
            "weight": v.get("weight", 0),
            "request_count": count,
            "avg_latency_ms": round(sum(lats) / len(lats), 2) if lats else 0.0,
            "p50_latency_ms": round(_pct(lats, 50), 2),
            "p95_latency_ms": round(_pct(lats, 95), 2),
            "p99_latency_ms": round(_pct(lats, 99), 2),
            "error_rate": round(errs / count * 100, 2) if count else 0.0,
            "success_rate": round((count - errs) / count * 100, 2) if count else 0.0,
        })

    total = len(all_calls)
    all_lats = [c["latency_ms"] for c in all_calls if "latency_ms" in c]
    all_errs = sum(1 for c in all_calls if c.get("status_code", 200) >= 400)

    # latency trend (last 10 sessions)
    trend = []
    for i, s in enumerate(sessions[:10]):
        calls = s.get("calls", [])
        lats = [c["latency_ms"] for c in calls if "latency_ms" in c]
        trend.append({
            "session": i + 1,
            "avg_latency": round(sum(lats) / len(lats), 2) if lats else 0.0,
            "calls": len(calls),
        })

    return {
        "experiment_id": exp_id,
        "mode": "AB",
        "total_requests": total,
        "total_sessions": len(sessions),
        "avg_latency_ms": round(sum(all_lats) / len(all_lats), 2) if all_lats else 0.0,
        "error_rate": round(all_errs / total * 100, 2) if total else 0.0,
        "variant_metrics": variant_metrics,
        "latency_trend": trend,
    }


# ── CC analytics ──────────────────────────────────────────────────────────────

@router.get("/cc/{exp_id}")
def cc_analytics(exp_id: str):
    exp = db.get_experiment(exp_id)
    if not exp or exp.get("mode") != "CC":
        raise HTTPException(404, "CC experiment not found")

    sessions = db.list_sessions(exp_id)

    def _role_stats(role: str) -> dict:
        calls = [c for s in sessions for c in s.get("calls", []) if c.get("role") == role]
        lats = [c["latency_ms"] for c in calls if "latency_ms" in c]
        errs = sum(1 for c in calls if c.get("status_code", 200) >= 400)
        sizes = [c.get("payload_size_bytes", 0) for c in calls]
        count = len(calls)
        return {
            "count": count,
            "avg_latency_ms": round(sum(lats) / len(lats), 2) if lats else 0.0,
            "p50_latency_ms": round(_pct(lats, 50), 2),
            "p95_latency_ms": round(_pct(lats, 95), 2),
            "p99_latency_ms": round(_pct(lats, 99), 2),
            "error_rate": round(errs / count * 100, 2) if count else 0.0,
            "avg_payload_bytes": round(sum(sizes) / len(sizes), 0) if sizes else 0,
        }

    champion_wins = sum(1 for s in sessions if s.get("winner") == "champion")
    challenger_wins = sum(1 for s in sessions if s.get("winner") == "challenger")
    total = len(sessions)

    # latency comparison trend
    trend = []
    for i, s in enumerate(sessions[:10]):
        calls = s.get("calls", [])
        c_lat = next((c["latency_ms"] for c in calls if c.get("role") == "champion"), 0)
        ch_lat = next((c["latency_ms"] for c in calls if c.get("role") == "challenger"), 0)
        trend.append({
            "session": i + 1,
            "champion_latency": c_lat,
            "challenger_latency": ch_lat,
            "winner": s.get("winner", ""),
        })

    return {
        "experiment_id": exp_id,
        "mode": "CC",
        "total_sessions": total,
        "champion_wins": champion_wins,
        "challenger_wins": challenger_wins,
        "champion_win_rate": round(champion_wins / total * 100, 2) if total else 0.0,
        "challenger_win_rate": round(challenger_wins / total * 100, 2) if total else 0.0,
        "champion_stats": _role_stats("champion"),
        "challenger_stats": _role_stats("challenger"),
        "latency_trend": trend,
    }


# ── summary (dashboard) ───────────────────────────────────────────────────────

@router.get("/summary")
def analytics_summary():
    all_sessions = db.list_all_sessions(limit=0)
    all_calls = [c for s in all_sessions for c in s.get("calls", [])]
    total_calls = len(all_calls)
    lats = [c["latency_ms"] for c in all_calls if "latency_ms" in c]
    errs = sum(1 for c in all_calls if c.get("status_code", 200) >= 400)

    ab_exps = db.list_experiments(mode="AB")
    cc_exps = db.list_experiments(mode="CC")
    running = [e for e in ab_exps + cc_exps if e.get("status") == "running"]

    return {
        "total_requests": total_calls,
        "total_sessions": len(all_sessions),
        "running_experiments": len(running),
        "ab_experiments": len(ab_exps),
        "cc_experiments": len(cc_exps),
        "avg_latency_ms": round(sum(lats) / len(lats), 2) if lats else 0.0,
        "error_rate": round(errs / total_calls * 100, 2) if total_calls else 0.0,
    }
