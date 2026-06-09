"""AI Insights router for API experiments."""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os

from database import get_db
import models, schemas

router = APIRouter()


@router.get("/{exp_id}", response_model=schemas.AIInsightOut)
def get_ai_insight(exp_id: str, db: Session = Depends(get_db)):
    exp = db.query(models.ApiExperiment).filter_by(id=exp_id).first()
    if not exp:
        raise HTTPException(404, "Experiment not found")

    variants = db.query(models.ApiVariant).filter_by(experiment_id=exp_id).all()
    logs = db.query(models.ExecutionLog).filter_by(experiment_id=exp_id).all()

    if not logs or not variants:
        return {
            "experiment_id": exp_id,
            "winner_variant": None,
            "winner_reason": "Not enough execution data to generate insights.",
            "risk_warnings": [],
            "performance_summary": "No execution logs available.",
            "recommendation": "Start the experiment to collect data.",
            "suggested_next_experiments": [],
            "confidence": "low",
        }

    # Compute variant metrics
    all_results = [r for log in logs for r in log.variant_results]
    variant_stats = {}
    for v in variants:
        v_results = [r for r in all_results if r.variant_id == v.id]
        if not v_results:
            continue
        lats = sorted([r.latency_ms for r in v_results])
        errors = sum(1 for r in v_results if r.status_code >= 400 or r.error_message)
        variant_stats[v.id] = {
            "name": v.name,
            "avg_lat": sum(lats) / len(lats),
            "p95_lat": lats[int(len(lats) * 0.95)] if len(lats) > 1 else lats[0],
            "error_rate": errors / len(v_results) * 100,
            "count": len(v_results),
        }

    if not variant_stats:
        return {
            "experiment_id": exp_id,
            "winner_variant": None,
            "winner_reason": "Insufficient data.",
            "risk_warnings": [],
            "performance_summary": "No variant data.",
            "recommendation": "Run executions first.",
            "suggested_next_experiments": [],
            "confidence": "low",
        }

    # Pick winner by lowest avg latency + error_rate composite
    winner_id = min(variant_stats, key=lambda vid: variant_stats[vid]["avg_lat"] + variant_stats[vid]["error_rate"] * 50)
    winner = variant_stats[winner_id]

    others = {vid: s for vid, s in variant_stats.items() if vid != winner_id}
    lat_improvement = 0.0
    if others:
        avg_other_lat = sum(s["avg_lat"] for s in others.values()) / len(others)
        lat_improvement = round((avg_other_lat - winner["avg_lat"]) / avg_other_lat * 100, 1) if avg_other_lat > 0 else 0.0

    risk_warnings = []
    for vid, s in variant_stats.items():
        if s["error_rate"] > 5:
            risk_warnings.append(f"'{s['name']}' has high error rate ({s['error_rate']:.1f}%) — not safe for production")
        if s["p95_lat"] > 1000:
            risk_warnings.append(f"'{s['name']}' p95 latency exceeds 1s ({s['p95_lat']:.0f}ms) — investigate timeouts")

    confidence = "high" if len(logs) > 50 else ("medium" if len(logs) > 15 else "low")

    return {
        "experiment_id": exp_id,
        "winner_variant": winner["name"],
        "winner_reason": f"'{winner['name']}' delivers {lat_improvement:.1f}% lower latency ({winner['avg_lat']:.0f}ms avg) with {winner['error_rate']:.1f}% error rate — best overall score.",
        "risk_warnings": risk_warnings if risk_warnings else ["No significant risks detected."],
        "performance_summary": f"Analyzed {len(logs)} executions across {len(variant_stats)} variants. Winner shows consistent performance advantage.",
        "recommendation": f"Promote '{winner['name']}' to 100% traffic. Monitor p95 latency post-rollout for 48h.",
        "suggested_next_experiments": [
            "Test payload compression (gzip vs Brotli) to reduce transfer size",
            "Evaluate circuit breaker thresholds for improved resilience",
            "A/B test request batching vs individual calls for throughput gains",
        ],
        "confidence": confidence,
    }
