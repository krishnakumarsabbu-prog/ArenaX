"""API Execution Engine router — handles live execution logs."""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas

router = APIRouter()


@router.get("/{exp_id}", response_model=List[schemas.ExecutionLogOut])
def list_execution_logs(exp_id: str, limit: int = 50, db: Session = Depends(get_db)):
    exp = db.query(models.ApiExperiment).filter_by(id=exp_id).first()
    if not exp:
        raise HTTPException(404, "Experiment not found")
    logs = (
        db.query(models.ExecutionLog)
        .filter_by(experiment_id=exp_id)
        .order_by(models.ExecutionLog.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [_serialize_log(log, db) for log in logs]


@router.get("/all/recent", response_model=List[schemas.ExecutionLogOut])
def list_recent_logs(limit: int = 100, db: Session = Depends(get_db)):
    logs = (
        db.query(models.ExecutionLog)
        .order_by(models.ExecutionLog.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [_serialize_log(log, db) for log in logs]


def _serialize_log(log: models.ExecutionLog, db: Session) -> dict:
    results = []
    for r in log.variant_results:
        variant = db.query(models.ApiVariant).filter_by(id=r.variant_id).first()
        try:
            rb = json.loads(r.response_body or "{}")
        except Exception:
            rb = {}
        try:
            rh = json.loads(r.response_headers or "{}")
        except Exception:
            rh = {}
        results.append({
            "variant_id": r.variant_id,
            "variant_name": variant.name if variant else "Unknown",
            "status_code": r.status_code,
            "latency_ms": r.latency_ms,
            "response_body": rb,
            "response_headers": rh,
            "error": r.error_message,
            "payload_size_bytes": r.payload_size_bytes,
        })

    try:
        req_h = json.loads(log.request_headers or "{}")
    except Exception:
        req_h = {}

    return {
        "id": log.id,
        "experiment_id": log.experiment_id,
        "request_id": log.request_id,
        "timestamp": log.timestamp,
        "request_method": log.request_method,
        "request_url": log.request_url,
        "winner_variant_id": log.winner_variant_id,
        "variant_results": results,
    }
