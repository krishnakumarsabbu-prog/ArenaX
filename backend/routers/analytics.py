from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List

from database import get_db
import models, schemas
from services.significance import SignificanceEngine

router = APIRouter()
sig_engine = SignificanceEngine()


@router.get("/{exp_id}", response_model=schemas.ExperimentAnalytics)
def get_analytics(exp_id: str, db: Session = Depends(get_db)):
    exp = db.query(models.Experiment).filter_by(id=exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    variants = db.query(models.Variant).filter_by(experiment_id=exp_id).all()
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

    ctrl_cvr = ctrl_convs / ctrl_imps if ctrl_imps else 0.0

    variant_stats = []
    for v in variants:
        imps = db.query(func.count(models.Event.id)).filter_by(
            variant_id=v.id, event_type="impression"
        ).scalar() or 0
        convs = db.query(func.count(models.Event.id)).filter_by(
            variant_id=v.id, event_type="conversion"
        ).scalar() or 0
        cvr = convs / imps if imps else 0.0

        if v.key == "control":
            lift = None
            confidence = 0.0
        else:
            lift = ((cvr - ctrl_cvr) / ctrl_cvr * 100) if ctrl_cvr else None
            confidence = sig_engine.compute_confidence(imps, convs, ctrl_imps, ctrl_convs)

        variant_stats.append(schemas.VariantStats(
            variant_id=v.id,
            variant_key=v.key,
            variant_name=v.name,
            impressions=imps,
            conversions=convs,
            cvr=round(cvr * 100, 2),
            traffic_weight=v.traffic_weight,
            lift_vs_control=round(lift, 2) if lift is not None else None,
            confidence=round(confidence, 4)
        ))

    segments = _compute_segments(exp_id, variants, db)
    overall_confidence = max((v.confidence for v in variant_stats if v.confidence > 0), default=0.0)
    leading = max(variant_stats, key=lambda v: v.cvr) if variant_stats else None

    days = (datetime.utcnow() - exp.created_at).days if exp.created_at else 0
    total_sessions = sum(v.impressions for v in variant_stats)
    rate = total_sessions / days if days > 0 else total_sessions
    remaining = int((exp.min_sessions - total_sessions) / rate) if rate and total_sessions < exp.min_sessions else None

    return schemas.ExperimentAnalytics(
        experiment_id=exp_id,
        total_sessions=total_sessions,
        overall_confidence=overall_confidence,
        leading_variant=leading.variant_name if leading else None,
        variant_stats=variant_stats,
        segment_breakdown=segments,
        days_running=days,
        estimated_days_remaining=remaining
    )


def _compute_segments(exp_id: str, variants: list, db: Session) -> dict:
    segments = {}
    for seg_col, seg_name in [("device_type", "device"), ("country", "country")]:
        seg_values = db.query(getattr(models.Event, seg_col)).filter_by(
            experiment_id=exp_id
        ).distinct().all()
        breakdown = []
        for (val,) in seg_values:
            if val is None:
                continue
            best_variant = None
            best_cvr = -1.0
            for v in variants:
                if v.key == "control":
                    continue
                imps = db.query(func.count(models.Event.id)).filter(
                    models.Event.variant_id == v.id,
                    getattr(models.Event, seg_col) == val
                ).scalar() or 0
                convs = db.query(func.count(models.Event.id)).filter(
                    models.Event.variant_id == v.id,
                    models.Event.event_type == "conversion",
                    getattr(models.Event, seg_col) == val
                ).scalar() or 0
                cvr = convs / imps if imps else 0
                if cvr > best_cvr:
                    best_cvr = cvr
                    best_variant = v.key
            if best_variant:
                breakdown.append(schemas.SegmentStats(
                    segment=seg_name,
                    value=str(val),
                    winner_variant=best_variant,
                    lift=round(best_cvr * 100, 1)
                ))
        segments[seg_name] = breakdown
    return segments
