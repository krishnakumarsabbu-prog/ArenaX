from sqlalchemy import func
import models


class ScoringEngine:
    """Composite score for Challenge Champion rounds."""

    def compute(self, team: models.Team, experiment: models.Experiment, config: dict, db) -> dict:
        if not experiment:
            return {
                "cvr": 0.0,
                "engagement_score": 0.0,
                "session_count": 0,
                "composite_score": 0.0
            }

        variants = db.query(models.Variant).filter_by(experiment_id=experiment.id).all()
        best_cvr = 0.0
        best_engagement = 0.0
        total_sessions = 0

        for v in variants:
            imps = db.query(func.count(models.Event.id)).filter_by(
                variant_id=v.id, event_type="impression"
            ).scalar() or 0
            convs = db.query(func.count(models.Event.id)).filter_by(
                variant_id=v.id, event_type="conversion"
            ).scalar() or 0

            if imps:
                cvr = convs / imps
                best_cvr = max(best_cvr, cvr)
                total_sessions += imps

            scrolls_raw = db.query(models.Event.metadata_).filter_by(
                variant_id=v.id, event_type="scroll"
            ).all()
            if scrolls_raw:
                import json
                depths = []
                for (meta,) in scrolls_raw:
                    if meta:
                        try:
                            d = json.loads(meta)
                            if isinstance(d, dict) and "scroll_depth" in d:
                                depths.append(float(d["scroll_depth"]))
                        except Exception:
                            pass
                if depths:
                    best_engagement = max(best_engagement, sum(depths) / len(depths))

        composite = (
            best_cvr * 100 * config.get("cvr_weight", 0.6) * 100 +
            best_engagement * config.get("engagement_weight", 0.25) +
            min(total_sessions / 1000, 100) * config.get("session_volume_weight", 0.15)
        )

        return {
            "cvr": round(best_cvr, 6),
            "engagement_score": round(best_engagement, 2),
            "session_count": total_sessions,
            "composite_score": round(composite, 2)
        }
