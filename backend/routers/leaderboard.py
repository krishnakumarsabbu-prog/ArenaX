from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
import models

router = APIRouter()


@router.get("/{challenge_id}")
def get_leaderboard(challenge_id: str, db: Session = Depends(get_db)):
    challenge = db.query(models.Challenge).filter_by(id=challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    teams = db.query(models.Team).filter_by(challenge_id=challenge_id).all()
    rows = []

    for team in teams:
        # Get the best (highest) composite score across all rounds
        best = db.query(models.RoundResult).filter_by(
            team_id=team.id, challenge_id=challenge_id
        ).order_by(models.RoundResult.composite_score.desc()).first()

        # Get last two results for delta calculation
        results = db.query(models.RoundResult).filter_by(
            team_id=team.id, challenge_id=challenge_id
        ).order_by(models.RoundResult.round_number.desc()).limit(2).all()

        delta = 0
        if len(results) >= 2:
            delta = results[0].composite_score - results[1].composite_score

        rows.append({
            "team_id": team.id,
            "team_name": team.name,
            "team_url": team.url,
            "composite_score": round(best.composite_score, 2) if best else 0.0,
            "cvr": round(best.cvr * 100, 2) if best and best.cvr else 0.0,
            "session_count": best.session_count if best else 0,
            "rank": best.rank if best else 99,
            "delta": round(delta, 2),
        })

    rows.sort(key=lambda r: r["composite_score"], reverse=True)
    for i, row in enumerate(rows):
        row["rank"] = i + 1

    return rows
