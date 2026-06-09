import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_team(payload: schemas.TeamCreate, db: Session = Depends(get_db)):
    challenge = db.query(models.Challenge).filter_by(id=payload.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    team = models.Team(
        challenge_id=payload.challenge_id,
        name=payload.name,
        url=payload.url,
        members=json.dumps(payload.members)
    )
    db.add(team)
    db.commit()
    db.refresh(team)
    return _enrich_team(team, db)


@router.get("/")
def list_teams(challenge_id: str, db: Session = Depends(get_db)):
    teams = db.query(models.Team).filter_by(challenge_id=challenge_id).all()
    return [_enrich_team(t, db) for t in teams]


@router.get("/{team_id}")
def get_team(team_id: str, db: Session = Depends(get_db)):
    team = _get_or_404(team_id, db)
    return _enrich_team(team, db)


@router.patch("/{team_id}")
def update_team(team_id: str, payload: dict, db: Session = Depends(get_db)):
    team = _get_or_404(team_id, db)
    for k, v in payload.items():
        if k == "members":
            team.members = json.dumps(v)
        elif hasattr(team, k):
            setattr(team, k, v)
    db.commit()
    db.refresh(team)
    return _enrich_team(team, db)


def _get_or_404(team_id: str, db: Session) -> models.Team:
    t = db.query(models.Team).filter_by(id=team_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Team not found")
    return t


def _enrich_team(team: models.Team, db: Session) -> dict:
    latest = db.query(models.RoundResult).filter_by(
        team_id=team.id
    ).order_by(models.RoundResult.computed_at.desc()).first()
    members = json.loads(team.members or "[]")
    return {
        "id": team.id,
        "challenge_id": team.challenge_id,
        "name": team.name,
        "url": team.url,
        "members": members,
        "latest_score": round(latest.composite_score, 2) if latest else None,
        "rank": latest.rank if latest else None,
    }
