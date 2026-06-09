"""Seed demo data for XTest API Lab."""
import json
import uuid
import random
from datetime import datetime, timedelta

from database import SessionLocal
import models


def _id():
    return str(uuid.uuid4())


def seed_demo_data():
    db = SessionLocal()
    try:
        if db.query(models.ApiExperiment).first():
            return

        # ── Users ──────────────────────────────────────────────────────────────
        user = models.User(id="demo-user-id", name="Kai Patel", email="kai@xtest.io", initials="KP")
        db.add(user)

        # Roles
        admin_role = models.Role(id=_id(), name="admin", description="Full platform access")
        editor_role = models.Role(id=_id(), name="editor", description="Can manage experiments")
        viewer_role = models.Role(id=_id(), name="viewer", description="Read-only access")
        db.add_all([admin_role, editor_role, viewer_role])
        db.flush()

        db.add(models.UserRole(user_id="demo-user-id", role_id=admin_role.id))
        db.flush()

        # ── Experiment 1: Recommendation Engine Migration ─────────────────────
        exp1_id = _id()
        var1a_id = _id()  # Baseline sklearn
        var1b_id = _id()  # Challenger PyTorch

        exp1 = models.ApiExperiment(
            id=exp1_id,
            name="Recommendation Engine Migration",
            description="Compare v1 sklearn collaborative filtering vs v2 PyTorch deep learning model for real-time recommendations",
            status="running",
            execution_mode="champion_challenger",
            environment="staging",
            method="POST",
            base_url="https://api.internal",
            path="/v1/recommendations",
            query_params=json.dumps({"limit": "10", "user_type": "{{user_type}}"}),
            body_template='{"user_id": "{{user_id}}", "context": "homepage", "session_id": "{{session_id}}"}',
            request_headers=json.dumps({"Content-Type": "application/json", "X-App-Version": "3.2.0"}),
            auth_type="bearer",
            auth_value="***",
            timeout_ms=500,
            max_retries=2,
            scoring_rules=json.dumps({
                "success_status": 200,
                "latency_weight": 0.4,
                "error_weight": 0.4,
                "business_metric_weight": 0.2,
                "business_metric_path": "data.click_through_rate"
            }),
            created_at=datetime.utcnow() - timedelta(days=18),
        )
        db.add(exp1)
        db.add(models.ApiVariant(
            id=var1a_id, experiment_id=exp1_id,
            name="Baseline (sklearn v1)", variant_type="model",
            description="Production sklearn collaborative filtering model v1.2.3",
            weight=50, target_url="https://ml-service-v1.internal/recommend",
        ))
        db.add(models.ApiVariant(
            id=var1b_id, experiment_id=exp1_id,
            name="Challenger (PyTorch v2)", variant_type="model",
            description="New PyTorch neural collaborative filtering model v2.0.1",
            weight=50, target_url="https://ml-service-v2.internal/recommend",
        ))
        db.flush()

        # Execution logs for exp1
        recs_v1 = [
            {"id": "p1", "title": "Premium Headphones", "score": 0.91},
            {"id": "p2", "title": "Wireless Speaker", "score": 0.87},
            {"id": "p3", "title": "Smartwatch Pro", "score": 0.84},
        ]
        recs_v2 = [
            {"id": "p1", "title": "Premium Headphones", "score": 0.96},
            {"id": "p4", "title": "Noise Cancelling Buds", "score": 0.93},
            {"id": "p2", "title": "Wireless Speaker", "score": 0.89},
        ]
        for i in range(12):
            log_id = _id()
            lat_a = round(random.uniform(130, 210), 1)
            lat_b = round(random.uniform(75, 130), 1)
            ts = datetime.utcnow() - timedelta(hours=random.randint(0, 72))
            log = models.ExecutionLog(
                id=log_id, experiment_id=exp1_id,
                request_id=_id(),
                timestamp=ts,
                request_method="POST",
                request_url="https://api.internal/v1/recommendations",
                request_headers=json.dumps({"Content-Type": "application/json"}),
                request_body='{"user_id": "u_' + str(random.randint(1000, 9999)) + '", "context": "homepage"}',
                winner_variant_id=var1b_id if lat_b < lat_a else var1a_id,
                created_at=ts,
            )
            db.add(log)
            db.flush()
            db.add(models.VariantResult(
                id=_id(), execution_log_id=log_id, variant_id=var1a_id,
                status_code=200, latency_ms=lat_a,
                response_body=json.dumps({"data": {"recommendations": recs_v1, "model_version": "v1.2.3", "click_through_rate": round(random.uniform(0.08, 0.14), 3)}}),
                response_headers=json.dumps({"Content-Type": "application/json", "X-Model-Version": "v1.2.3"}),
                payload_size_bytes=random.randint(480, 620),
            ))
            db.add(models.VariantResult(
                id=_id(), execution_log_id=log_id, variant_id=var1b_id,
                status_code=200, latency_ms=lat_b,
                response_body=json.dumps({"data": {"recommendations": recs_v2, "model_version": "v2.0.1", "algorithm": "neural_collab", "click_through_rate": round(random.uniform(0.12, 0.20), 3)}}),
                response_headers=json.dumps({"Content-Type": "application/json", "X-Model-Version": "v2.0.1"}),
                payload_size_bytes=random.randint(510, 680),
            ))

        # ── Experiment 2: Payment Gateway Comparison ──────────────────────────
        exp2_id = _id()
        var2a_id = _id()  # Stripe
        var2b_id = _id()  # Adyen

        exp2 = models.ApiExperiment(
            id=exp2_id,
            name="Payment Gateway A/B Test",
            description="Compare Stripe vs Adyen for checkout success rate, latency, and error handling",
            status="running",
            execution_mode="ab",
            environment="staging",
            method="POST",
            base_url="https://checkout.internal",
            path="/v2/charge",
            query_params=json.dumps({}),
            body_template='{"amount": {{amount}}, "currency": "{{currency}}", "payment_method": "{{pm_token}}"}',
            request_headers=json.dumps({"Content-Type": "application/json", "Idempotency-Key": "{{idem_key}}"}),
            auth_type="bearer",
            auth_value="***",
            timeout_ms=8000,
            max_retries=1,
            scoring_rules=json.dumps({
                "success_status": 200,
                "latency_weight": 0.3,
                "error_weight": 0.5,
                "business_metric_weight": 0.2,
                "business_metric_path": "data.success"
            }),
            created_at=datetime.utcnow() - timedelta(days=9),
        )
        db.add(exp2)
        db.add(models.ApiVariant(
            id=var2a_id, experiment_id=exp2_id,
            name="Stripe Gateway", variant_type="service_routing",
            description="Stripe payment processing via gateway proxy",
            weight=50, target_url="https://stripe-proxy.internal/charge",
        ))
        db.add(models.ApiVariant(
            id=var2b_id, experiment_id=exp2_id,
            name="Adyen Gateway", variant_type="service_routing",
            description="Adyen payment processing via gateway proxy",
            weight=50, target_url="https://adyen-proxy.internal/charge",
        ))
        db.flush()

        for i in range(10):
            log_id = _id()
            stripe_ok = random.random() > 0.03
            adyen_ok = random.random() > 0.06
            lat_a = round(random.uniform(180, 380), 1)
            lat_b = round(random.uniform(220, 520), 1)
            ts = datetime.utcnow() - timedelta(hours=random.randint(0, 48))
            log = models.ExecutionLog(
                id=log_id, experiment_id=exp2_id,
                request_id=_id(), timestamp=ts,
                request_method="POST",
                request_url="https://checkout.internal/v2/charge",
                request_body='{"amount": 9900, "currency": "USD"}',
                winner_variant_id=var2a_id if stripe_ok and not adyen_ok else (var2b_id if adyen_ok and not stripe_ok else var2a_id),
                created_at=ts,
            )
            db.add(log)
            db.flush()
            db.add(models.VariantResult(
                id=_id(), execution_log_id=log_id, variant_id=var2a_id,
                status_code=200 if stripe_ok else 402,
                latency_ms=lat_a,
                response_body=json.dumps({"data": {"success": stripe_ok, "charge_id": "ch_" + _id()[:12], "provider": "stripe"}} if stripe_ok else {"error": "card_declined", "provider": "stripe"}),
                response_headers=json.dumps({"Content-Type": "application/json", "X-Request-Id": _id()[:8]}),
                error_message=None if stripe_ok else "Card declined",
                payload_size_bytes=random.randint(280, 420),
            ))
            db.add(models.VariantResult(
                id=_id(), execution_log_id=log_id, variant_id=var2b_id,
                status_code=200 if adyen_ok else 422,
                latency_ms=lat_b,
                response_body=json.dumps({"data": {"success": adyen_ok, "psp_reference": "psp_" + _id()[:12], "provider": "adyen"}} if adyen_ok else {"error": "refused", "provider": "adyen"}),
                response_headers=json.dumps({"Content-Type": "application/json", "X-Adyen-Version": "71"}),
                error_message=None if adyen_ok else "Refused by issuer",
                payload_size_bytes=random.randint(310, 460),
            ))

        # ── Experiment 3: Search Service (Shadow Mode) ────────────────────────
        exp3_id = _id()
        var3a_id = _id()  # Elasticsearch
        var3b_id = _id()  # Meilisearch

        exp3 = models.ApiExperiment(
            id=exp3_id,
            name="Search Engine Shadow Test",
            description="Shadow test Meilisearch against production Elasticsearch — compare relevance and latency",
            status="running",
            execution_mode="shadow",
            environment="prod",
            method="GET",
            base_url="https://search.internal",
            path="/v1/search",
            query_params=json.dumps({"q": "{{query}}", "limit": "20", "offset": "0"}),
            body_template="",
            request_headers=json.dumps({"Accept": "application/json"}),
            auth_type="api_key",
            auth_value="***",
            timeout_ms=300,
            max_retries=0,
            scoring_rules=json.dumps({
                "success_status": 200,
                "latency_weight": 0.5,
                "error_weight": 0.4,
                "business_metric_weight": 0.1,
                "business_metric_path": "hits.total"
            }),
            created_at=datetime.utcnow() - timedelta(days=5),
        )
        db.add(exp3)
        db.add(models.ApiVariant(
            id=var3a_id, experiment_id=exp3_id,
            name="Elasticsearch (Primary)", variant_type="service_routing",
            description="Production Elasticsearch 8.x cluster",
            weight=100, target_url="https://elastic.internal/search",
        ))
        db.add(models.ApiVariant(
            id=var3b_id, experiment_id=exp3_id,
            name="Meilisearch (Shadow)", variant_type="service_routing",
            description="New Meilisearch v1.7 instance — shadow only, not returned to user",
            weight=0, target_url="https://meili.internal/search",
        ))
        db.flush()

        for i in range(15):
            log_id = _id()
            lat_a = round(random.uniform(55, 180), 1)
            lat_b = round(random.uniform(12, 65), 1)
            ts = datetime.utcnow() - timedelta(hours=random.randint(0, 24))
            query_terms = ["laptop", "wireless headphones", "running shoes", "coffee maker", "gaming chair"]
            q = random.choice(query_terms)
            log = models.ExecutionLog(
                id=log_id, experiment_id=exp3_id,
                request_id=_id(), timestamp=ts,
                request_method="GET",
                request_url=f"https://search.internal/v1/search?q={q}&limit=20",
                winner_variant_id=var3b_id,
                created_at=ts,
            )
            db.add(log)
            db.flush()
            db.add(models.VariantResult(
                id=_id(), execution_log_id=log_id, variant_id=var3a_id,
                status_code=200, latency_ms=lat_a,
                response_body=json.dumps({"hits": {"total": random.randint(18, 200), "hits": [{"_id": str(i), "_score": round(random.uniform(0.6, 1.0), 3)} for i in range(5)]}, "took": lat_a}),
                response_headers=json.dumps({"Content-Type": "application/json", "X-Elastic-Product": "Elasticsearch"}),
                payload_size_bytes=random.randint(1200, 2400),
            ))
            db.add(models.VariantResult(
                id=_id(), execution_log_id=log_id, variant_id=var3b_id,
                status_code=200, latency_ms=lat_b,
                response_body=json.dumps({"hits": [{"id": str(i), "rankingScore": round(random.uniform(0.7, 1.0), 4)} for i in range(5)], "estimatedTotalHits": random.randint(18, 200), "processingTimeMs": round(lat_b)}),
                response_headers=json.dumps({"Content-Type": "application/json", "X-Meili-Request-Id": _id()[:8]}),
                payload_size_bytes=random.randint(980, 1800),
            ))

        # ── Experiment 4: Auth Service Migration (Paused) ─────────────────────
        exp4_id = _id()
        var4a_id = _id()
        var4b_id = _id()

        exp4 = models.ApiExperiment(
            id=exp4_id,
            name="Auth Token Validation Migration",
            description="Migrate from HS256 symmetric JWT to RS256 asymmetric — validate latency and compatibility",
            status="paused",
            execution_mode="ab",
            environment="staging",
            method="POST",
            base_url="https://auth.internal",
            path="/v2/validate",
            query_params=json.dumps({}),
            body_template='{"token": "{{jwt_token}}"}',
            request_headers=json.dumps({"Content-Type": "application/json"}),
            auth_type="none",
            timeout_ms=200,
            max_retries=0,
            scoring_rules=json.dumps({
                "success_status": 200,
                "latency_weight": 0.5,
                "error_weight": 0.5,
            }),
            created_at=datetime.utcnow() - timedelta(days=12),
        )
        db.add(exp4)
        db.add(models.ApiVariant(
            id=var4a_id, experiment_id=exp4_id,
            name="HS256 (Current)", variant_type="config",
            description="Symmetric HMAC-SHA256 token validation",
            weight=50, target_url="https://auth-v1.internal/validate",
            config_overrides=json.dumps({"algorithm": "HS256", "secret_ref": "jwt_secret_v1"}),
        ))
        db.add(models.ApiVariant(
            id=var4b_id, experiment_id=exp4_id,
            name="RS256 (New)", variant_type="config",
            description="Asymmetric RSA-SHA256 token validation — PKCS#1",
            weight=50, target_url="https://auth-v2.internal/validate",
            config_overrides=json.dumps({"algorithm": "RS256", "public_key_ref": "jwt_pubkey_v2"}),
        ))
        db.flush()

        for i in range(6):
            log_id = _id()
            lat_a = round(random.uniform(8, 22), 1)
            lat_b = round(random.uniform(14, 38), 1)
            ts = datetime.utcnow() - timedelta(hours=random.randint(12, 96))
            log = models.ExecutionLog(
                id=log_id, experiment_id=exp4_id,
                request_id=_id(), timestamp=ts,
                request_method="POST",
                request_url="https://auth.internal/v2/validate",
                winner_variant_id=var4a_id,
                created_at=ts,
            )
            db.add(log)
            db.flush()
            db.add(models.VariantResult(
                id=_id(), execution_log_id=log_id, variant_id=var4a_id,
                status_code=200, latency_ms=lat_a,
                response_body=json.dumps({"valid": True, "user_id": "u_" + str(random.randint(100, 999)), "exp": 1780000000, "alg": "HS256"}),
                response_headers=json.dumps({"Content-Type": "application/json"}),
                payload_size_bytes=random.randint(120, 180),
            ))
            db.add(models.VariantResult(
                id=_id(), execution_log_id=log_id, variant_id=var4b_id,
                status_code=200, latency_ms=lat_b,
                response_body=json.dumps({"valid": True, "user_id": "u_" + str(random.randint(100, 999)), "exp": 1780000000, "alg": "RS256", "kid": "key-2026-01"}),
                response_headers=json.dumps({"Content-Type": "application/json"}),
                payload_size_bytes=random.randint(140, 200),
            ))

        # ── Experiment 5: ML Inference Pipeline (Concluded) ───────────────────
        exp5_id = _id()
        var5a_id = _id()  # Model v3.1 (old champion)
        var5b_id = _id()  # Model v4.0 (new winner)

        exp5 = models.ApiExperiment(
            id=exp5_id,
            name="ML Inference Pipeline v4 Rollout",
            description="Concluded: Model v4.0-beta won against v3.1 on all metrics — now in production",
            status="concluded",
            execution_mode="champion_challenger",
            environment="prod",
            method="POST",
            base_url="https://inference.internal",
            path="/v1/predict",
            query_params=json.dumps({}),
            body_template='{"features": {{features}}, "model_hint": "{{model_hint}}"}',
            request_headers=json.dumps({"Content-Type": "application/json", "X-Priority": "normal"}),
            auth_type="bearer",
            auth_value="***",
            timeout_ms=1000,
            max_retries=1,
            scoring_rules=json.dumps({
                "success_status": 200,
                "latency_weight": 0.35,
                "error_weight": 0.35,
                "business_metric_weight": 0.3,
                "business_metric_path": "prediction.confidence"
            }),
            created_at=datetime.utcnow() - timedelta(days=45),
            concluded_at=datetime.utcnow() - timedelta(days=8),
        )
        db.add(exp5)
        db.add(models.ApiVariant(
            id=var5a_id, experiment_id=exp5_id,
            name="Model v3.1 (Champion)", variant_type="model",
            description="Production gradient boosting model v3.1.4",
            weight=50, target_url="https://inference-v3.internal/predict",
        ))
        db.add(models.ApiVariant(
            id=var5b_id, experiment_id=exp5_id,
            name="Model v4.0-beta (Challenger)", variant_type="model",
            description="New transformer-based model v4.0-beta — 3.2x faster, +8% accuracy",
            weight=50, target_url="https://inference-v4.internal/predict",
        ))
        exp5.winner_variant_id = var5b_id
        db.flush()

        for i in range(8):
            log_id = _id()
            lat_a = round(random.uniform(280, 520), 1)
            lat_b = round(random.uniform(85, 165), 1)
            ts = datetime.utcnow() - timedelta(days=random.randint(9, 40))
            log = models.ExecutionLog(
                id=log_id, experiment_id=exp5_id,
                request_id=_id(), timestamp=ts,
                request_method="POST",
                request_url="https://inference.internal/v1/predict",
                winner_variant_id=var5b_id,
                created_at=ts,
            )
            db.add(log)
            db.flush()
            db.add(models.VariantResult(
                id=_id(), execution_log_id=log_id, variant_id=var5a_id,
                status_code=200, latency_ms=lat_a,
                response_body=json.dumps({"prediction": {"label": random.choice(["positive", "negative"]), "confidence": round(random.uniform(0.72, 0.88), 3), "model_version": "v3.1.4"}}),
                response_headers=json.dumps({"Content-Type": "application/json", "X-Model": "gbm-v3"}),
                payload_size_bytes=random.randint(280, 360),
            ))
            db.add(models.VariantResult(
                id=_id(), execution_log_id=log_id, variant_id=var5b_id,
                status_code=200, latency_ms=lat_b,
                response_body=json.dumps({"prediction": {"label": random.choice(["positive", "negative"]), "confidence": round(random.uniform(0.89, 0.97), 3), "model_version": "v4.0-beta", "tokens_used": random.randint(128, 256)}}),
                response_headers=json.dumps({"Content-Type": "application/json", "X-Model": "transformer-v4"}),
                payload_size_bytes=random.randint(320, 410),
            ))

        # ── Experiment 6: CDN Cache Strategy (Draft) ──────────────────────────
        exp6_id = _id()
        exp6 = models.ApiExperiment(
            id=exp6_id,
            name="CDN Cache Strategy Evaluation",
            description="Compare aggressive TTL caching vs stale-while-revalidate strategy for product catalog API",
            status="draft",
            execution_mode="shadow",
            environment="dev",
            method="GET",
            base_url="https://catalog.internal",
            path="/v1/products",
            query_params=json.dumps({"category": "{{category}}", "page": "{{page}}"}),
            request_headers=json.dumps({"Accept": "application/json"}),
            auth_type="api_key",
            timeout_ms=400,
            max_retries=1,
            scoring_rules=json.dumps({
                "success_status": 200,
                "latency_weight": 0.6,
                "error_weight": 0.3,
                "business_metric_weight": 0.1,
            }),
            created_at=datetime.utcnow() - timedelta(days=2),
        )
        db.add(exp6)
        db.add(models.ApiVariant(
            id=_id(), experiment_id=exp6_id,
            name="Aggressive TTL (1h)", variant_type="config",
            description="Cache all product API responses for 1 hour",
            weight=50, target_url="https://cdn-proxy.internal/catalog",
            config_overrides=json.dumps({"cache_ttl": 3600, "strategy": "aggressive"}),
        ))
        db.add(models.ApiVariant(
            id=_id(), experiment_id=exp6_id,
            name="Stale-While-Revalidate", variant_type="config",
            description="Serve stale data immediately, revalidate in background (max-age=60, stale=300)",
            weight=50, target_url="https://cdn-proxy2.internal/catalog",
            config_overrides=json.dumps({"strategy": "swr", "max_age": 60, "stale_ttl": 300}),
        ))

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Seed error (non-fatal): {e}")
    finally:
        db.close()
