"""Seed demo data into the in-memory database on startup."""
import json
import uuid
from datetime import datetime, timedelta
import random

from database import SessionLocal
import models


def _id():
    return str(uuid.uuid4())


def seed_demo_data():
    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(models.User).first():
            return

        # ── Users ──────────────────────────────────────────────────────────────
        user = models.User(
            id="demo-user-id",
            name="Kai Patel",
            email="kai@xtest.io",
            initials="KP"
        )
        db.add(user)
        db.flush()

        # ── Experiments ────────────────────────────────────────────────────────
        experiments_data = [
            {
                "name": "Checkout CTA Copy Test",
                "url": "https://demo.xtest.io/checkout",
                "status": "running",
                "hypothesis": "Changing 'Buy Now' to 'Get Yours Today' will reduce friction and increase checkout CVR by 12%.",
                "goal_metric": "conversion",
                "min_sessions": 2000,
                "confidence_threshold": 0.95,
            },
            {
                "name": "Homepage Hero Image",
                "url": "https://demo.xtest.io/",
                "status": "running",
                "hypothesis": "A lifestyle hero image outperforms product-only imagery for top-of-funnel engagement.",
                "goal_metric": "click",
                "min_sessions": 1500,
                "confidence_threshold": 0.90,
            },
            {
                "name": "Pricing Page Layout",
                "url": "https://demo.xtest.io/pricing",
                "status": "concluded",
                "hypothesis": "3-column pricing with a highlighted 'Most Popular' tier increases plan selection rate.",
                "goal_metric": "conversion",
                "min_sessions": 1000,
                "confidence_threshold": 0.95,
                "ai_verdict": json.dumps({
                    "hypothesis_confirmed": True,
                    "verdict_summary": "The 3-column highlighted layout increased conversions by 18.4% with 97.2% confidence. The 'Most Popular' badge created strong anchoring effect.",
                    "winner_variant": "variant_b",
                    "key_insights": ["Highlighted tier drives 2.1x more clicks", "Mobile CVR improved 23%"],
                    "key_segments": ["Mobile users saw 23% higher lift", "New users responded 2x better"],
                    "next_tests": ["Test CTA button color", "Test annual vs monthly toggle prominence"],
                    "confidence_level": "high",
                    "raw_analysis": "Strong statistical evidence supports the hypothesis. Winner variant outperformed control across all device types."
                })
            },
            {
                "name": "Onboarding Flow Step 2",
                "url": "https://demo.xtest.io/onboarding/step-2",
                "status": "draft",
                "hypothesis": "Reducing form fields from 7 to 4 will decrease abandonment by 25%.",
                "goal_metric": "conversion",
                "min_sessions": 500,
                "confidence_threshold": 0.95,
            },
        ]

        exp_ids = []
        for i, ed in enumerate(experiments_data):
            exp_id = _id()
            exp_ids.append(exp_id)
            ai_verdict = ed.pop("ai_verdict", None)
            exp = models.Experiment(
                id=exp_id,
                owner_id="demo-user-id",
                created_at=datetime.utcnow() - timedelta(days=random.randint(2, 30)),
                ai_verdict=ai_verdict,
                **ed
            )
            db.add(exp)
            db.flush()

            # Control variant
            ctrl_id = _id()
            db.add(models.Variant(
                id=ctrl_id,
                experiment_id=exp_id,
                key="control",
                name="Control",
                description="Original page — no changes",
                alpha=float(random.randint(40, 200)),
                beta=float(random.randint(900, 2000)),
                changes="[]"
            ))

            # Treatment variant
            var_b_id = _id()
            db.add(models.Variant(
                id=var_b_id,
                experiment_id=exp_id,
                key="variant_b",
                name="Variant B",
                description="Test variant",
                alpha=float(random.randint(60, 250)),
                beta=float(random.randint(800, 1800)),
                changes=json.dumps([{
                    "selector": "#cta-button",
                    "property": "textContent",
                    "value": "Get Started Today"
                }])
            ))
            db.flush()

            # Seed events for running/concluded experiments
            if ed.get("status") in ("running", "concluded"):
                devices = ["desktop", "mobile", "tablet"]
                countries = ["US", "GB", "CA", "AU", "DE"]
                for variant_id in [ctrl_id, var_b_id]:
                    n_imp = random.randint(400, 1200)
                    n_conv = random.randint(int(n_imp * 0.03), int(n_imp * 0.12))
                    for _ in range(n_imp):
                        fp = _id()[:16]
                        db.add(models.Event(
                            id=_id(),
                            experiment_id=exp_id,
                            variant_id=variant_id,
                            fingerprint=fp,
                            event_type="impression",
                            device_type=random.choice(devices),
                            country=random.choice(countries),
                            is_new_user=random.randint(0, 1),
                            created_at=datetime.utcnow() - timedelta(
                                hours=random.randint(0, 240)
                            )
                        ))
                    for _ in range(n_conv):
                        fp = _id()[:16]
                        db.add(models.Event(
                            id=_id(),
                            experiment_id=exp_id,
                            variant_id=variant_id,
                            fingerprint=fp,
                            event_type="conversion",
                            device_type=random.choice(devices),
                            country=random.choice(countries),
                            is_new_user=random.randint(0, 1),
                            created_at=datetime.utcnow() - timedelta(
                                hours=random.randint(0, 240)
                            )
                        ))

        db.commit()

        # ── Challenges ─────────────────────────────────────────────────────────
        challenge_id = _id()
        challenge = models.Challenge(
            id=challenge_id,
            name="Q3 Growth Hackathon",
            description="Compete to drive the highest conversion lift across your landing pages.",
            status="running",
            scoring_config=json.dumps({"cvr_weight": 0.6, "engagement_weight": 0.25, "session_volume_weight": 0.15}),
            total_rounds=3,
            current_round=2,
            start_date=datetime.utcnow() - timedelta(days=14),
            end_date=datetime.utcnow() + timedelta(days=7),
            owner_id="demo-user-id"
        )
        db.add(challenge)
        db.flush()

        teams_data = [
            ("Team Alpha", "https://alpha.demo.io", ["Alice Chen", "Bob Kim"]),
            ("Team Nexus", "https://nexus.demo.io", ["Carol Wu", "Dave Singh"]),
            ("Team Orbit", "https://orbit.demo.io", ["Eve Park", "Frank Lee"]),
            ("Team Pulse", "https://pulse.demo.io", ["Grace Tan", "Hiro Nakamura"]),
        ]

        team_ids = []
        for tname, turl, tmembers in teams_data:
            tid = _id()
            team_ids.append(tid)
            db.add(models.Team(
                id=tid,
                challenge_id=challenge_id,
                name=tname,
                url=turl,
                members=json.dumps(tmembers),
                experiment_id=exp_ids[0] if len(exp_ids) > 0 else None
            ))

        db.flush()

        # Seed round 1 results
        scores = [82.4, 74.1, 68.7, 61.2]
        for rank, (tid, score) in enumerate(zip(team_ids, scores), 1):
            db.add(models.RoundResult(
                id=_id(),
                challenge_id=challenge_id,
                team_id=tid,
                round_number=1,
                cvr=round(0.03 + random.random() * 0.08, 4),
                engagement_score=round(45 + random.random() * 40, 1),
                session_count=random.randint(800, 2500),
                composite_score=score,
                rank=rank,
                computed_at=datetime.utcnow() - timedelta(days=7)
            ))

        # Seed round 2 results (current in-progress)
        scores2 = [88.1, 71.3, 79.4, 55.8]
        for rank_idx, (tid, score) in enumerate(zip(team_ids, scores2)):
            sorted_rank = sorted(range(len(scores2)), key=lambda x: scores2[x], reverse=True).index(rank_idx) + 1
            db.add(models.RoundResult(
                id=_id(),
                challenge_id=challenge_id,
                team_id=tid,
                round_number=2,
                cvr=round(0.04 + random.random() * 0.09, 4),
                engagement_score=round(50 + random.random() * 35, 1),
                session_count=random.randint(1000, 3000),
                composite_score=score,
                rank=sorted_rank,
                computed_at=datetime.utcnow() - timedelta(hours=2)
            ))

        # Second challenge (draft)
        ch2_id = _id()
        db.add(models.Challenge(
            id=ch2_id,
            name="Winter Sprint Cup",
            description="4-week optimization sprint for e-commerce teams.",
            status="draft",
            scoring_config=json.dumps({"cvr_weight": 0.5, "engagement_weight": 0.3, "session_volume_weight": 0.2}),
            total_rounds=4,
            current_round=1,
            owner_id="demo-user-id"
        ))

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Seed error (non-fatal): {e}")
    finally:
        db.close()
