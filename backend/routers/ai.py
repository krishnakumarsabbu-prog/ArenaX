import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
import models, schemas
from services.ai_synthesis import AIService

router = APIRouter()
ai_service = AIService()


@router.post("/synthesize")
async def synthesize_experiment(payload: schemas.AISynthesisRequest, db: Session = Depends(get_db)):
    exp = db.query(models.Experiment).filter_by(id=payload.experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    variants = db.query(models.Variant).filter_by(experiment_id=exp.id).all()
    variant_stats = []
    for v in variants:
        imps = db.query(func.count(models.Event.id)).filter_by(
            variant_id=v.id, event_type="impression"
        ).scalar() or 0
        convs = db.query(func.count(models.Event.id)).filter_by(
            variant_id=v.id, event_type="conversion"
        ).scalar() or 0
        variant_stats.append({
            "key": v.key,
            "name": v.name,
            "impressions": imps,
            "conversions": convs,
            "cvr": round(convs / imps * 100, 2) if imps else 0,
        })

    exp_data = {
        "name": exp.name,
        "url": exp.url,
        "hypothesis": exp.hypothesis,
        "goal_metric": exp.goal_metric,
    }

    result = await ai_service.synthesize_experiment(exp_data, variant_stats)

    exp.ai_verdict = json.dumps(result)
    db.commit()

    return result


@router.post("/champion")
async def champion_strategy(payload: schemas.AIChampionRequest, db: Session = Depends(get_db)):
    challenge = db.query(models.Challenge).filter_by(id=payload.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    team = db.query(models.Team).filter_by(id=payload.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    team_result = db.query(models.RoundResult).filter_by(
        team_id=team.id, challenge_id=payload.challenge_id
    ).order_by(models.RoundResult.composite_score.desc()).first()

    # Find top competitor
    all_results = db.query(models.RoundResult).filter_by(
        challenge_id=payload.challenge_id
    ).order_by(models.RoundResult.composite_score.desc()).all()

    competitor_result = next(
        (r for r in all_results if r.team_id != team.id), None
    )
    competitor_team = db.query(models.Team).filter_by(
        id=competitor_result.team_id
    ).first() if competitor_result else None

    challenge_data = {
        "name": challenge.name,
        "current_round": challenge.current_round,
        "total_rounds": challenge.total_rounds,
    }
    team_data = {
        "name": team.name,
        "url": team.url,
        "score": team_result.composite_score if team_result else 0,
        "cvr": team_result.cvr if team_result else 0,
    }
    competitor_data = {
        "name": competitor_team.name if competitor_team else "Unknown",
        "score": competitor_result.composite_score if competitor_result else 0,
        "cvr": competitor_result.cvr if competitor_result else 0,
    }

    result = await ai_service.champion_strategy(challenge_data, team_data, competitor_data)
    return result
