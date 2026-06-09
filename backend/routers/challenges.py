import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas
from services.scoring import ScoringEngine

router = APIRouter()
scoring = ScoringEngine()


@router.post("/", response_model=schemas.ChallengeOut, status_code=status.HTTP_201_CREATED)
def create_challenge(payload: schemas.ChallengeCreate, db: Session = Depends(get_db)):
    challenge = models.Challenge(
        name=payload.name,
        description=payload.description,
        scoring_config=json.dumps(payload.scoring_config.model_dump()),
        total_rounds=payload.total_rounds,
        start_date=payload.start_date,
        end_date=payload.end_date,
        owner_id="demo-user-id"
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return _enrich_challenge(challenge, db)


@router.get("/", response_model=List[schemas.ChallengeOut])
def list_challenges(db: Session = Depends(get_db)):
    challenges = db.query(models.Challenge).order_by(models.Challenge.created_at.desc()).all()
    return [_enrich_challenge(c, db) for c in challenges]


@router.get("/{challenge_id}", response_model=schemas.ChallengeOut)
def get_challenge(challenge_id: str, db: Session = Depends(get_db)):
    challenge = _get_or_404(challenge_id, db)
    return _enrich_challenge(challenge, db)


@router.patch("/{challenge_id}/status")
def update_status(challenge_id: str, body: dict, db: Session = Depends(get_db)):
    challenge = _get_or_404(challenge_id, db)
    if "status" in body:
        challenge.status = body["status"]
    db.commit()
    db.refresh(challenge)
    return _enrich_challenge(challenge, db)


@router.get("/{challenge_id}/bracket")
def get_bracket(challenge_id: str, db: Session = Depends(get_db)):
    challenge = _get_or_404(challenge_id, db)
    teams = db.query(models.Team).filter_by(challenge_id=challenge_id).all()

    results = {}
    for team in teams:
        latest = db.query(models.RoundResult).filter_by(
            challenge_id=challenge_id,
            team_id=team.id,
            round_number=challenge.current_round
        ).order_by(models.RoundResult.computed_at.desc()).first()
        if not latest:
            latest = db.query(models.RoundResult).filter_by(
                challenge_id=challenge_id,
                team_id=team.id
            ).order_by(models.RoundResult.round_number.desc()).first()
        results[team.id] = latest

    sorted_teams = sorted(
        teams,
        key=lambda t: results[t.id].rank if results.get(t.id) and results[t.id].rank else 99
    )
    pairs = []
    for i in range(0, len(sorted_teams), 2):
        pair = {"round": challenge.current_round}
        if i < len(sorted_teams):
            t = sorted_teams[i]
            r = results.get(t.id)
            pair["team_a"] = {
                "id": t.id, "name": t.name, "url": t.url,
                "score": r.composite_score if r else None,
                "cvr": r.cvr if r else None,
                "sessions": r.session_count if r else None,
                "rank": r.rank if r else None
            }
        if i + 1 < len(sorted_teams):
            t = sorted_teams[i + 1]
            r = results.get(t.id)
            pair["team_b"] = {
                "id": t.id, "name": t.name, "url": t.url,
                "score": r.composite_score if r else None,
                "cvr": r.cvr if r else None,
                "sessions": r.session_count if r else None,
                "rank": r.rank if r else None
            }
        pairs.append(pair)

    return {
        "challenge_id": challenge_id,
        "name": challenge.name,
        "current_round": challenge.current_round,
        "total_rounds": challenge.total_rounds,
        "status": challenge.status,
        "bracket": pairs
    }


@router.post("/{challenge_id}/advance-round")
def advance_round(challenge_id: str, db: Session = Depends(get_db)):
    challenge = _get_or_404(challenge_id, db)
    if challenge.current_round >= challenge.total_rounds:
        raise HTTPException(status_code=400, detail="All rounds already completed")

    teams = db.query(models.Team).filter_by(challenge_id=challenge_id).all()
    config = json.loads(challenge.scoring_config)

    for team in teams:
        exp = db.query(models.Experiment).filter_by(id=team.experiment_id).first() if team.experiment_id else None
        score_data = scoring.compute(team, exp, config, db)
        result = models.RoundResult(
            challenge_id=challenge_id,
            team_id=team.id,
            round_number=challenge.current_round,
            **score_data
        )
        db.add(result)

    db.flush()

    round_results = db.query(models.RoundResult).filter_by(
        challenge_id=challenge_id,
        round_number=challenge.current_round
    ).order_by(models.RoundResult.composite_score.desc()).all()
    for rank, result in enumerate(round_results, 1):
        result.rank = rank

    challenge.current_round += 1
    db.commit()
    return {"message": "Round advanced", "new_round": challenge.current_round}


def _get_or_404(challenge_id: str, db: Session) -> models.Challenge:
    c = db.query(models.Challenge).filter_by(id=challenge_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return c


def _enrich_challenge(challenge: models.Challenge, db: Session) -> dict:
    teams = db.query(models.Team).filter_by(challenge_id=challenge.id).all()
    top_result = db.query(models.RoundResult).filter_by(
        challenge_id=challenge.id
    ).order_by(models.RoundResult.composite_score.desc()).first()
    top_team = None
    if top_result:
        t = db.query(models.Team).filter_by(id=top_result.team_id).first()
        top_team = t.name if t else None

    ai_analysis = None
    if challenge.ai_analysis:
        import json as _json
        try:
            ai_analysis = _json.loads(challenge.ai_analysis)
        except Exception:
            pass

    return {
        "id": challenge.id,
        "name": challenge.name,
        "status": challenge.status,
        "current_round": challenge.current_round,
        "total_rounds": challenge.total_rounds,
        "team_count": len(teams),
        "top_team": top_team,
        "top_score": round(top_result.composite_score, 2) if top_result else None,
        "ai_analysis": ai_analysis,
    }
