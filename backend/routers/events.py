import json
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
import models, schemas

router = APIRouter()


@router.post("/", status_code=status.HTTP_202_ACCEPTED)
def ingest_event(payload: schemas.EventIngest, db: Session = Depends(get_db)):
    event = models.Event(
        experiment_id=payload.experiment_id,
        variant_id=payload.variant_id,
        fingerprint=payload.fingerprint,
        event_type=payload.event_type,
        metadata_=json.dumps(payload.metadata) if payload.metadata else None,
        device_type=payload.device_type,
        country=payload.country,
        is_new_user=int(payload.is_new_user),
        session_depth=payload.session_depth
    )
    db.add(event)

    if payload.event_type == "conversion":
        variant = db.query(models.Variant).filter_by(id=payload.variant_id).first()
        if variant:
            variant.alpha += 1.0
            db.add(variant)

    if payload.event_type == "impression":
        all_variants = db.query(models.Variant).filter_by(
            experiment_id=payload.experiment_id
        ).all()
        for v in all_variants:
            if v.id != payload.variant_id:
                v.beta += 0.1
                db.add(v)

    db.commit()
    return {"accepted": True}
