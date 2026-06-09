import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db
import models, schemas

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_variant(payload: schemas.VariantCreate, db: Session = Depends(get_db)):
    exp = db.query(models.Experiment).filter_by(id=payload.experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    existing_keys = [v.key for v in db.query(models.Variant).filter_by(experiment_id=payload.experiment_id).all()]
    if payload.key in existing_keys:
        raise HTTPException(status_code=400, detail=f"Key '{payload.key}' already exists in this experiment")

    variant = models.Variant(
        experiment_id=payload.experiment_id,
        key=payload.key,
        name=payload.name,
        description=payload.description,
        changes=json.dumps([c.model_dump() for c in payload.changes])
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return _enrich_variant(variant, db)


@router.get("/")
def list_variants(experiment_id: str, db: Session = Depends(get_db)):
    variants = db.query(models.Variant).filter_by(experiment_id=experiment_id).all()
    return [_enrich_variant(v, db) for v in variants]


@router.get("/{variant_id}")
def get_variant(variant_id: str, db: Session = Depends(get_db)):
    v = _get_or_404(variant_id, db)
    return _enrich_variant(v, db)


@router.patch("/{variant_id}")
def update_variant(variant_id: str, payload: dict, db: Session = Depends(get_db)):
    v = _get_or_404(variant_id, db)
    for k, val in payload.items():
        if k == "changes":
            setattr(v, k, json.dumps(val))
        elif hasattr(v, k):
            setattr(v, k, val)
    db.commit()
    db.refresh(v)
    return _enrich_variant(v, db)


@router.delete("/{variant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_variant(variant_id: str, db: Session = Depends(get_db)):
    v = _get_or_404(variant_id, db)
    if v.key == "control":
        raise HTTPException(status_code=400, detail="Cannot delete control variant")
    db.delete(v)
    db.commit()


def _get_or_404(variant_id: str, db: Session) -> models.Variant:
    v = db.query(models.Variant).filter_by(id=variant_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Variant not found")
    return v


def _enrich_variant(v: models.Variant, db: Session) -> dict:
    imps = db.query(func.count(models.Event.id)).filter_by(
        variant_id=v.id, event_type="impression"
    ).scalar() or 0
    convs = db.query(func.count(models.Event.id)).filter_by(
        variant_id=v.id, event_type="conversion"
    ).scalar() or 0
    changes = json.loads(v.changes or "[]")
    return {
        "id": v.id,
        "experiment_id": v.experiment_id,
        "key": v.key,
        "name": v.name,
        "description": v.description,
        "traffic_weight": v.traffic_weight,
        "alpha": v.alpha,
        "beta": v.beta,
        "changes": changes,
        "impressions": imps,
        "conversions": convs,
        "cvr": round(convs / imps * 100, 2) if imps else 0.0,
    }
