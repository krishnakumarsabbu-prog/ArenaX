import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime

from database import get_db
import models, schemas
from services.bandit import BayesianBandit
from services.significance import SignificanceEngine

router = APIRouter()
bandit = BayesianBandit()
sig_engine = SignificanceEngine()


@router.post("/", response_model=schemas.ExperimentOut, status_code=status.HTTP_201_CREATED)
def create_experiment(payload: schemas.ExperimentCreate, db: Session = Depends(get_db)):
    exp = models.Experiment(
        name=payload.name,
        url=payload.url,
        hypothesis=payload.hypothesis,
        goal_metric=payload.goal_metric,
        traffic_pct=payload.traffic_pct,
        min_sessions=payload.min_sessions,
        max_sessions=payload.max_sessions,
        confidence_threshold=payload.confidence_threshold,
        owner_id="demo-user-id"
    )
    db.add(exp)
    db.flush()
    control = models.Variant(
        experiment_id=exp.id,
        key="control",
        name="Control",
        description="Original page — no changes",
        alpha=1.0,
        beta=1.0,
        changes="[]"
    )
    db.add(control)
    db.commit()
    db.refresh(exp)
    return _enrich_experiment(exp, db)


@router.get("/", response_model=List[schemas.ExperimentOut])
def list_experiments(db: Session = Depends(get_db)):
    exps = db.query(models.Experiment).order_by(models.Experiment.created_at.desc()).all()
    return [_enrich_experiment(e, db) for e in exps]


@router.get("/{exp_id}", response_model=schemas.ExperimentOut)
def get_experiment(exp_id: str, db: Session = Depends(get_db)):
    exp = _get_or_404(exp_id, db)
    return _enrich_experiment(exp, db)


@router.patch("/{exp_id}", response_model=schemas.ExperimentOut)
def update_experiment(exp_id: str, payload: schemas.ExperimentUpdate, db: Session = Depends(get_db)):
    exp = _get_or_404(exp_id, db)
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(exp, k, v)
    if payload.status == schemas.ExperimentStatus.concluded:
        exp.concluded_at = datetime.utcnow()
    db.commit()
    db.refresh(exp)
    return _enrich_experiment(exp, db)


@router.delete("/{exp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experiment(exp_id: str, db: Session = Depends(get_db)):
    exp = _get_or_404(exp_id, db)
    db.delete(exp)
    db.commit()


@router.get("/{exp_id}/assign")
def assign_variant(exp_id: str, fp: str, db: Session = Depends(get_db)):
    exp = _get_or_404(exp_id, db)
    if exp.status != "running":
        return {"variant_id": None, "changes": []}

    existing = db.query(models.SessionAssignment).filter_by(
        fingerprint=exp_id + fp,
        experiment_id=exp_id
    ).first()

    if existing:
        variant = db.query(models.Variant).filter_by(id=existing.variant_id).first()
    else:
        variants = db.query(models.Variant).filter_by(experiment_id=exp_id).all()
        variant = bandit.sample(variants)
        assignment = models.SessionAssignment(
            fingerprint=exp_id + fp,
            experiment_id=exp_id,
            variant_id=variant.id
        )
        db.add(assignment)
        db.commit()

    if not variant:
        return {"variant_id": None, "changes": []}

    changes = json.loads(variant.changes or "[]")
    return {
        "variant_id": variant.id,
        "variant_key": variant.key,
        "experiment_id": exp_id,
        "changes": changes
    }


def _get_or_404(exp_id: str, db: Session) -> models.Experiment:
    exp = db.query(models.Experiment).filter_by(id=exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp


def _enrich_experiment(exp: models.Experiment, db: Session) -> dict:
    total = db.query(func.count(models.Event.id)).filter_by(
        experiment_id=exp.id, event_type="impression"
    ).scalar() or 0

    variants = db.query(models.Variant).filter_by(experiment_id=exp.id).all()

    control = next((v for v in variants if v.key == "control"), None)
    ctrl_imps = 0
    ctrl_convs = 0
    if control:
        ctrl_imps = db.query(func.count(models.Event.id)).filter_by(
            variant_id=control.id, event_type="impression"
        ).scalar() or 0
        ctrl_convs = db.query(func.count(models.Event.id)).filter_by(
            variant_id=control.id, event_type="conversion"
        ).scalar() or 0

    ctrl_cvr = ctrl_convs / ctrl_imps if ctrl_imps else 0
    best_lift = None

    for v in variants:
        if v.key == "control":
            continue
        imps = db.query(func.count(models.Event.id)).filter_by(
            variant_id=v.id, event_type="impression"
        ).scalar() or 0
        convs = db.query(func.count(models.Event.id)).filter_by(
            variant_id=v.id, event_type="conversion"
        ).scalar() or 0
        v_cvr = convs / imps if imps else 0
        if ctrl_cvr:
            lift = (v_cvr - ctrl_cvr) / ctrl_cvr * 100
            if best_lift is None or lift > best_lift:
                best_lift = lift

    verdict = json.loads(exp.ai_verdict) if exp.ai_verdict else None
    return {
        "id": exp.id,
        "name": exp.name,
        "url": exp.url,
        "status": exp.status,
        "hypothesis": exp.hypothesis,
        "goal_metric": exp.goal_metric,
        "traffic_pct": exp.traffic_pct,
        "min_sessions": exp.min_sessions,
        "confidence_threshold": exp.confidence_threshold,
        "created_at": exp.created_at,
        "concluded_at": exp.concluded_at,
        "ai_verdict": verdict,
        "variant_count": len(variants),
        "total_sessions": total,
        "leading_lift": round(best_lift, 2) if best_lift else None
    }
