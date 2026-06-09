"""Analytics router for API experiments."""
import json
import statistics
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta

from database import get_db
import models, schemas

router = APIRouter()


@router.get("/{exp_id}", response_model=schemas.ExperimentAnalyticsOut)
def get_analytics(exp_id: str, db: Session = Depends(get_db)):
    exp = db.query(models.ApiExperiment).filter_by(id=exp_id).first()
    if not exp:
        raise HTTPException(404, "Experiment not found")

    variants = db.query(models.ApiVariant).filter_by(experiment_id=exp_id).all()
    logs = db.query(models.ExecutionLog).filter_by(experiment_id=exp_id).all()

    all_results = []
    for log in logs:
        all_results.extend(log.variant_results)

    total_requests = len(logs)
    overall_latencies = [r.latency_ms for r in all_results]
    avg_latency = sum(overall_latencies) / len(overall_latencies) if overall_latencies else 0.0
    error_count = sum(1 for r in all_results if r.status_code >= 400 or r.error_message)
    error_rate = (error_count / len(all_results) * 100) if all_results else 0.0

    variant_metrics = []
    for v in variants:
        v_results = [r for r in all_results if r.variant_id == v.id]
        if not v_results:
            lats = [0.0]
        else:
            lats = sorted([r.latency_ms for r in v_results])

        v_errors = sum(1 for r in v_results if r.status_code >= 400 or r.error_message)
        v_err_rate = (v_errors / len(v_results) * 100) if v_results else 0.0
        v_avg_lat = sum(lats) / len(lats) if lats else 0.0
        p50 = lats[int(len(lats) * 0.5)] if lats else 0.0
        p95 = lats[int(len(lats) * 0.95)] if lats else 0.0
        p99 = lats[int(len(lats) * 0.99)] if lats else 0.0

        score = max(0.0, 100.0 - v_err_rate * 2 - v_avg_lat / 10)

        variant_metrics.append({
            "variant_id": v.id,
            "variant_name": v.name,
            "request_count": len(v_results),
            "avg_latency_ms": round(v_avg_lat, 1),
            "p50_latency_ms": round(p50, 1),
            "p95_latency_ms": round(p95, 1),
            "p99_latency_ms": round(p99, 1),
            "error_rate": round(v_err_rate, 2),
            "success_rate": round(100.0 - v_err_rate, 2),
            "avg_payload_size": round(sum(r.payload_size_bytes for r in v_results) / len(v_results), 0) if v_results else 0.0,
            "score": round(score, 1),
        })

    # Build latency trend (last 24 hours, hourly buckets)
    now = datetime.utcnow()
    trend = []
    for h in range(23, -1, -1):
        bucket_start = now - timedelta(hours=h + 1)
        bucket_end = now - timedelta(hours=h)
        bucket_results = [r for log in logs for r in log.variant_results
                          if bucket_start <= log.timestamp <= bucket_end]
        if bucket_results:
            lats = sorted([r.latency_ms for r in bucket_results])
            trend.append({
                "hour": bucket_end.strftime("%H:%M"),
                "p50": round(lats[int(len(lats) * 0.5)], 1),
                "p95": round(lats[int(len(lats) * 0.95)], 1),
                "p99": round(lats[int(len(lats) * 0.99)], 1),
                "requests": len(bucket_results),
            })

    return {
        "experiment_id": exp_id,
        "total_requests": total_requests,
        "avg_latency_ms": round(avg_latency, 1),
        "error_rate": round(error_rate, 2),
        "winner_variant_id": exp.winner_variant_id,
        "variant_metrics": variant_metrics,
        "latency_trend": trend,
    }
