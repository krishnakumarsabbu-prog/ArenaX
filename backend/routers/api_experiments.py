"""API Experiments router."""
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime

from database import get_db
import models, schemas

router = APIRouter()


@router.post("/", response_model=schemas.ExperimentOut, status_code=201)
def create_experiment(payload: schemas.ExperimentCreate, db: Session = Depends(get_db)):
    exp = models.ApiExperiment(
        name=payload.name,
        description=payload.description or "",
        execution_mode=payload.execution_mode,
        environment=payload.environment,
        method=payload.method,
        base_url=payload.base_url,
        path=payload.path,
        query_params=json.dumps(payload.query_params),
        body_template=payload.body_template or "",
        request_headers=json.dumps(payload.request_headers),
        auth_type=payload.auth_type,
        auth_value=payload.auth_value or "",
        timeout_ms=payload.timeout_ms,
        max_retries=payload.max_retries,
        scoring_rules=json.dumps(payload.scoring_rules.model_dump()),
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return _enrich(exp, db)


@router.get("/", response_model=List[schemas.ExperimentOut])
def list_experiments(db: Session = Depends(get_db)):
    exps = db.query(models.ApiExperiment).order_by(models.ApiExperiment.created_at.desc()).all()
    return [_enrich(e, db) for e in exps]


@router.get("/{exp_id}", response_model=schemas.ExperimentOut)
def get_experiment(exp_id: str, db: Session = Depends(get_db)):
    exp = _get_or_404(exp_id, db)
    return _enrich(exp, db)


@router.patch("/{exp_id}", response_model=schemas.ExperimentOut)
def update_experiment(exp_id: str, payload: schemas.ExperimentUpdate, db: Session = Depends(get_db)):
    exp = _get_or_404(exp_id, db)
    data = payload.model_dump(exclude_none=True)
    if "scoring_rules" in data:
        data["scoring_rules"] = json.dumps(data["scoring_rules"])
    for k, v in data.items():
        setattr(exp, k, v)
    if payload.status == schemas.ExperimentStatus.concluded:
        exp.concluded_at = datetime.utcnow()
    db.commit()
    db.refresh(exp)
    return _enrich(exp, db)


@router.delete("/{exp_id}", status_code=204)
def delete_experiment(exp_id: str, db: Session = Depends(get_db)):
    exp = _get_or_404(exp_id, db)
    db.delete(exp)
    db.commit()


@router.get("/{exp_id}/variants", response_model=List[schemas.VariantOut])
def list_variants(exp_id: str, db: Session = Depends(get_db)):
    _get_or_404(exp_id, db)
    variants = db.query(models.ApiVariant).filter_by(experiment_id=exp_id).all()
    return [_enrich_variant(v, db) for v in variants]


@router.post("/{exp_id}/variants", response_model=schemas.VariantOut, status_code=201)
def create_variant(exp_id: str, payload: schemas.VariantCreate, db: Session = Depends(get_db)):
    _get_or_404(exp_id, db)
    v = models.ApiVariant(
        experiment_id=exp_id,
        name=payload.name,
        variant_type=payload.variant_type,
        description=payload.description or "",
        weight=payload.weight,
        target_url=payload.target_url,
        feature_flags=json.dumps(payload.feature_flags),
        config_overrides=json.dumps(payload.config_overrides),
    )
    db.add(v)
    db.commit()
    db.refresh(v)
    return _enrich_variant(v, db)


@router.delete("/{exp_id}/variants/{variant_id}", status_code=204)
def delete_variant(exp_id: str, variant_id: str, db: Session = Depends(get_db)):
    v = db.query(models.ApiVariant).filter_by(id=variant_id, experiment_id=exp_id).first()
    if not v:
        raise HTTPException(404, "Variant not found")
    db.delete(v)
    db.commit()


def _get_or_404(exp_id: str, db: Session) -> models.ApiExperiment:
    exp = db.query(models.ApiExperiment).filter_by(id=exp_id).first()
    if not exp:
        raise HTTPException(404, "Experiment not found")
    return exp


def _enrich(exp: models.ApiExperiment, db: Session) -> dict:
    variants = db.query(models.ApiVariant).filter_by(experiment_id=exp.id).all()
    logs = db.query(models.ExecutionLog).filter_by(experiment_id=exp.id).all()
    total_requests = len(logs)

    all_results = []
    for log in logs:
        all_results.extend(log.variant_results)

    avg_lat = 0.0
    error_count = 0
    if all_results:
        avg_lat = sum(r.latency_ms for r in all_results) / len(all_results)
        error_count = sum(1 for r in all_results if r.status_code >= 400 or r.error_message)
        error_rate = (error_count / len(all_results)) * 100
    else:
        error_rate = 0.0

    try:
        rules = json.loads(exp.scoring_rules or "{}")
    except Exception:
        rules = {}

    return {
        "id": exp.id,
        "name": exp.name,
        "description": exp.description or "",
        "status": exp.status,
        "execution_mode": exp.execution_mode,
        "environment": exp.environment,
        "method": exp.method,
        "base_url": exp.base_url,
        "path": exp.path,
        "auth_type": exp.auth_type,
        "timeout_ms": exp.timeout_ms,
        "max_retries": exp.max_retries,
        "scoring_rules": rules,
        "variant_count": len(variants),
        "total_requests": total_requests,
        "avg_latency_ms": round(avg_lat, 1),
        "error_rate": round(error_rate, 2),
        "winner_variant_id": exp.winner_variant_id,
        "created_at": exp.created_at,
        "concluded_at": exp.concluded_at,
    }


def _enrich_variant(v: models.ApiVariant, db: Session) -> dict:
    results = v.results
    avg_lat = sum(r.latency_ms for r in results) / len(results) if results else 0.0
    errors = sum(1 for r in results if r.status_code >= 400 or r.error_message)
    error_rate = (errors / len(results) * 100) if results else 0.0

    try:
        ff = json.loads(v.feature_flags or "{}")
    except Exception:
        ff = {}
    try:
        co = json.loads(v.config_overrides or "{}")
    except Exception:
        co = {}

    return {
        "id": v.id,
        "experiment_id": v.experiment_id,
        "name": v.name,
        "variant_type": v.variant_type,
        "description": v.description or "",
        "weight": v.weight,
        "target_url": v.target_url or "",
        "feature_flags": ff,
        "config_overrides": co,
        "avg_latency_ms": round(avg_lat, 1),
        "error_rate": round(error_rate, 2),
        "request_count": len(results),
        "score": 0.0,
        "created_at": v.created_at,
    }
