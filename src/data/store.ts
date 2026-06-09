import { create } from 'zustand'
import {
  ApiExperiment, ApiVariant, ExecutionLog, ExperimentAnalytics,
  AIInsight, ThroughputPoint, VariantResult, HttpMethod,
} from '../types'

// ─── Mock data ────────────────────────────────────────────────────────────────

const rnd = (min: number, max: number) => Math.round(Math.random() * (max - min) + min)

// Experiments
const EXPERIMENTS: ApiExperiment[] = [
  {
    id: 'exp-001',
    name: 'Recommendation Engine Migration',
    description: 'Compare v1 sklearn collaborative filtering vs v2 PyTorch deep learning model',
    status: 'running',
    execution_mode: 'champion_challenger',
    environment: 'staging',
    request_config: {
      method: 'POST',
      base_url: 'https://api.internal',
      path: '/v1/recommendations',
      query_params: { limit: '10', user_type: '{{user_type}}' },
      body_template: '{"user_id": "{{user_id}}", "context": "homepage"}',
      headers: { 'Content-Type': 'application/json', 'X-App-Version': '3.2.0' },
    },
    auth_config: { type: 'bearer', value: '***' },
    timeout_ms: 500,
    max_retries: 2,
    scoring_rules: {
      success_status: 200,
      latency_weight: 0.4,
      error_weight: 0.4,
      business_metric_weight: 0.2,
      business_metric_path: 'data.click_through_rate',
    },
    variant_count: 2,
    total_requests: 48420,
    error_rate: 0.8,
    avg_latency_ms: 142,
    winner_variant_id: null,
    created_at: '2026-05-22T08:00:00Z',
    concluded_at: null,
  },
  {
    id: 'exp-002',
    name: 'Payment Gateway A/B Test',
    description: 'Compare Stripe vs Adyen for checkout success rate, latency, and error handling',
    status: 'running',
    execution_mode: 'ab',
    environment: 'staging',
    request_config: {
      method: 'POST',
      base_url: 'https://checkout.internal',
      path: '/v2/charge',
      query_params: {},
      body_template: '{"amount": {{amount}}, "currency": "{{currency}}", "payment_method": "{{pm_token}}"}',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': '{{idem_key}}' },
    },
    auth_config: { type: 'bearer', value: '***' },
    timeout_ms: 8000,
    max_retries: 1,
    scoring_rules: {
      success_status: 200,
      latency_weight: 0.3,
      error_weight: 0.5,
      business_metric_weight: 0.2,
      business_metric_path: 'data.success',
    },
    variant_count: 2,
    total_requests: 22180,
    error_rate: 2.4,
    avg_latency_ms: 298,
    winner_variant_id: null,
    created_at: '2026-05-31T10:00:00Z',
    concluded_at: null,
  },
  {
    id: 'exp-003',
    name: 'Search Engine Shadow Test',
    description: 'Shadow test Meilisearch against production Elasticsearch — compare relevance and latency',
    status: 'running',
    execution_mode: 'shadow',
    environment: 'prod',
    request_config: {
      method: 'GET',
      base_url: 'https://search.internal',
      path: '/v1/search',
      query_params: { q: '{{query}}', limit: '20', offset: '0' },
      body_template: '',
      headers: { Accept: 'application/json' },
    },
    auth_config: { type: 'api_key', key_name: 'X-Search-Key' },
    timeout_ms: 300,
    max_retries: 0,
    scoring_rules: {
      success_status: 200,
      latency_weight: 0.5,
      error_weight: 0.4,
      business_metric_weight: 0.1,
      business_metric_path: 'hits.total',
    },
    variant_count: 2,
    total_requests: 31550,
    error_rate: 0.3,
    avg_latency_ms: 58,
    winner_variant_id: null,
    created_at: '2026-06-04T14:00:00Z',
    concluded_at: null,
  },
  {
    id: 'exp-004',
    name: 'Auth Token Validation Migration',
    description: 'Migrate from HS256 symmetric JWT to RS256 asymmetric — validate latency and compatibility',
    status: 'paused',
    execution_mode: 'ab',
    environment: 'staging',
    request_config: {
      method: 'POST',
      base_url: 'https://auth.internal',
      path: '/v2/validate',
      query_params: {},
      body_template: '{"token": "{{jwt_token}}"}',
      headers: { 'Content-Type': 'application/json' },
    },
    auth_config: { type: 'none' },
    timeout_ms: 200,
    max_retries: 0,
    scoring_rules: {
      success_status: 200,
      latency_weight: 0.5,
      error_weight: 0.5,
      business_metric_weight: 0.0,
    },
    variant_count: 2,
    total_requests: 8400,
    error_rate: 1.1,
    avg_latency_ms: 18,
    winner_variant_id: null,
    created_at: '2026-05-28T09:00:00Z',
    concluded_at: null,
  },
  {
    id: 'exp-005',
    name: 'ML Inference Pipeline v4 Rollout',
    description: 'Model v4.0-beta won against v3.1 on all metrics — now in full production rollout',
    status: 'concluded',
    execution_mode: 'champion_challenger',
    environment: 'prod',
    request_config: {
      method: 'POST',
      base_url: 'https://inference.internal',
      path: '/v1/predict',
      query_params: {},
      body_template: '{"features": {{features}}, "model_hint": "{{model_hint}}"}',
      headers: { 'Content-Type': 'application/json', 'X-Priority': 'normal' },
    },
    auth_config: { type: 'bearer', value: '***' },
    timeout_ms: 1000,
    max_retries: 1,
    scoring_rules: {
      success_status: 200,
      latency_weight: 0.35,
      error_weight: 0.35,
      business_metric_weight: 0.3,
      business_metric_path: 'prediction.confidence',
    },
    variant_count: 2,
    total_requests: 95200,
    error_rate: 0.4,
    avg_latency_ms: 124,
    winner_variant_id: 'var-005b',
    created_at: '2026-04-25T08:00:00Z',
    concluded_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'exp-006',
    name: 'CDN Cache Strategy Evaluation',
    description: 'Compare aggressive TTL vs stale-while-revalidate for product catalog API performance',
    status: 'draft',
    execution_mode: 'shadow',
    environment: 'dev',
    request_config: {
      method: 'GET',
      base_url: 'https://catalog.internal',
      path: '/v1/products',
      query_params: { category: '{{category}}', page: '{{page}}' },
      body_template: '',
      headers: { Accept: 'application/json' },
    },
    auth_config: { type: 'api_key', key_name: 'X-Catalog-Key' },
    timeout_ms: 400,
    max_retries: 1,
    scoring_rules: {
      success_status: 200,
      latency_weight: 0.6,
      error_weight: 0.3,
      business_metric_weight: 0.1,
    },
    variant_count: 2,
    total_requests: 0,
    error_rate: 0,
    avg_latency_ms: 0,
    winner_variant_id: null,
    created_at: '2026-06-07T14:00:00Z',
    concluded_at: null,
  },
]

// Variants
const VARIANTS: ApiVariant[] = [
  // exp-001
  {
    id: 'var-001a', experiment_id: 'exp-001',
    name: 'Baseline (sklearn v1)', type: 'model',
    description: 'Production sklearn collaborative filtering model v1.2.3',
    weight: 50, routing: { target_url: 'https://ml-service-v1.internal/recommend' },
    feature_flags: {}, config_overrides: {},
    avg_latency_ms: 182, p50_latency_ms: 168, p95_latency_ms: 258, error_rate: 1.1,
    request_count: 24210, score: 71.2, is_winner: false,
  },
  {
    id: 'var-001b', experiment_id: 'exp-001',
    name: 'Challenger (PyTorch v2)', type: 'model',
    description: 'New PyTorch neural collaborative filtering model v2.0.1',
    weight: 50, routing: { target_url: 'https://ml-service-v2.internal/recommend' },
    feature_flags: {}, config_overrides: {},
    avg_latency_ms: 97, p50_latency_ms: 88, p95_latency_ms: 142, error_rate: 0.4,
    request_count: 24210, score: 88.4, is_winner: false,
  },
  // exp-002
  {
    id: 'var-002a', experiment_id: 'exp-002',
    name: 'Stripe Gateway', type: 'service_routing',
    description: 'Stripe payment processing via gateway proxy',
    weight: 50, routing: { target_url: 'https://stripe-proxy.internal/charge' },
    feature_flags: {}, config_overrides: {},
    avg_latency_ms: 264, p50_latency_ms: 248, p95_latency_ms: 410, error_rate: 1.8,
    request_count: 11090, score: 84.1, is_winner: false,
  },
  {
    id: 'var-002b', experiment_id: 'exp-002',
    name: 'Adyen Gateway', type: 'service_routing',
    description: 'Adyen payment processing via gateway proxy',
    weight: 50, routing: { target_url: 'https://adyen-proxy.internal/charge' },
    feature_flags: {}, config_overrides: {},
    avg_latency_ms: 331, p50_latency_ms: 310, p95_latency_ms: 520, error_rate: 3.1,
    request_count: 11090, score: 76.3, is_winner: false,
  },
  // exp-003
  {
    id: 'var-003a', experiment_id: 'exp-003',
    name: 'Elasticsearch (Primary)', type: 'service_routing',
    description: 'Production Elasticsearch 8.x cluster — serves all user traffic',
    weight: 100, routing: { target_url: 'https://elastic.internal/search' },
    feature_flags: {}, config_overrides: {},
    avg_latency_ms: 94, p50_latency_ms: 81, p95_latency_ms: 162, error_rate: 0.4,
    request_count: 31550, score: 79.8, is_winner: false,
  },
  {
    id: 'var-003b', experiment_id: 'exp-003',
    name: 'Meilisearch (Shadow)', type: 'service_routing',
    description: 'New Meilisearch v1.7 instance — shadow only, not returned to user',
    weight: 0, routing: { target_url: 'https://meili.internal/search' },
    feature_flags: {}, config_overrides: {},
    avg_latency_ms: 28, p50_latency_ms: 24, p95_latency_ms: 48, error_rate: 0.1,
    request_count: 31550, score: 94.6, is_winner: false,
  },
  // exp-004
  {
    id: 'var-004a', experiment_id: 'exp-004',
    name: 'HS256 (Current)', type: 'config',
    description: 'Symmetric HMAC-SHA256 token validation — current production algorithm',
    weight: 50, routing: { target_url: 'https://auth-v1.internal/validate' },
    feature_flags: {}, config_overrides: { algorithm: 'HS256', secret_ref: 'jwt_secret_v1' },
    avg_latency_ms: 12, p50_latency_ms: 10, p95_latency_ms: 22, error_rate: 0.8,
    request_count: 4200, score: 91.2, is_winner: false,
  },
  {
    id: 'var-004b', experiment_id: 'exp-004',
    name: 'RS256 (New)', type: 'config',
    description: 'Asymmetric RSA-SHA256 token validation — PKCS#1',
    weight: 50, routing: { target_url: 'https://auth-v2.internal/validate' },
    feature_flags: {}, config_overrides: { algorithm: 'RS256', public_key_ref: 'jwt_pubkey_v2' },
    avg_latency_ms: 24, p50_latency_ms: 21, p95_latency_ms: 42, error_rate: 1.4,
    request_count: 4200, score: 85.7, is_winner: false,
  },
  // exp-005
  {
    id: 'var-005a', experiment_id: 'exp-005',
    name: 'Model v3.1 (Champion)', type: 'model',
    description: 'Production gradient boosting model v3.1.4',
    weight: 50, routing: { target_url: 'https://inference-v3.internal/predict' },
    feature_flags: {}, config_overrides: {},
    avg_latency_ms: 384, p50_latency_ms: 361, p95_latency_ms: 520, error_rate: 0.6,
    request_count: 47600, score: 64.8, is_winner: false,
  },
  {
    id: 'var-005b', experiment_id: 'exp-005',
    name: 'Model v4.0-beta (Challenger)', type: 'model',
    description: 'New transformer-based model v4.0-beta — 3.2x faster, +8.4% accuracy',
    weight: 50, routing: { target_url: 'https://inference-v4.internal/predict' },
    feature_flags: {}, config_overrides: {},
    avg_latency_ms: 118, p50_latency_ms: 108, p95_latency_ms: 178, error_rate: 0.2,
    request_count: 47600, score: 94.2, is_winner: true,
  },
  // exp-006
  {
    id: 'var-006a', experiment_id: 'exp-006',
    name: 'Aggressive TTL (1h)', type: 'config',
    description: 'Cache all product API responses for 1 hour',
    weight: 50, routing: { target_url: 'https://cdn-proxy.internal/catalog' },
    feature_flags: {}, config_overrides: { cache_ttl: 3600, strategy: 'aggressive' },
    avg_latency_ms: 0, p50_latency_ms: 0, p95_latency_ms: 0, error_rate: 0,
    request_count: 0, score: 0, is_winner: false,
  },
  {
    id: 'var-006b', experiment_id: 'exp-006',
    name: 'Stale-While-Revalidate', type: 'config',
    description: 'Serve stale data immediately, revalidate in background',
    weight: 50, routing: { target_url: 'https://cdn-proxy2.internal/catalog' },
    feature_flags: {}, config_overrides: { strategy: 'swr', max_age: 60, stale_ttl: 300 },
    avg_latency_ms: 0, p50_latency_ms: 0, p95_latency_ms: 0, error_rate: 0,
    request_count: 0, score: 0, is_winner: false,
  },
]

// Helper to generate realistic execution logs
function makeLog(
  id: string, expId: string, expName: string, reqId: string, timestamp: string,
  method: HttpMethod, url: string, body: string | undefined,
  results: VariantResult[], winnerId: string | null,
): ExecutionLog {
  return {
    id, experiment_id: expId, experiment_name: expName,
    request_id: reqId, timestamp,
    request: { method, url, headers: { 'Content-Type': 'application/json' }, body },
    variant_results: results,
    winner_variant_id: winnerId,
  }
}

const EXECUTION_LOGS: ExecutionLog[] = [
  // exp-001 logs
  makeLog('log-001-1', 'exp-001', 'Recommendation Engine Migration', 'req-a1b2c3', '2026-06-09T10:42:18Z',
    'POST', 'https://api.internal/v1/recommendations',
    '{"user_id": "u_8821", "context": "homepage"}',
    [
      { variant_id: 'var-001a', variant_name: 'Baseline (sklearn v1)', status_code: 200, latency_ms: 178, payload_size_bytes: 612,
        response_body: { data: { recommendations: [{ id: 'p1', title: 'Premium Headphones', score: 0.91 }, { id: 'p2', title: 'Wireless Speaker', score: 0.87 }], model_version: 'v1.2.3', click_through_rate: 0.112 } },
        response_headers: { 'Content-Type': 'application/json', 'X-Model-Version': 'v1.2.3', 'X-Latency': '178ms' }, error: null },
      { variant_id: 'var-001b', variant_name: 'Challenger (PyTorch v2)', status_code: 200, latency_ms: 89, payload_size_bytes: 648,
        response_body: { data: { recommendations: [{ id: 'p1', title: 'Premium Headphones', score: 0.96 }, { id: 'p4', title: 'Noise Cancelling Buds', score: 0.93 }], model_version: 'v2.0.1', algorithm: 'neural_collab', click_through_rate: 0.168 } },
        response_headers: { 'Content-Type': 'application/json', 'X-Model-Version': 'v2.0.1', 'X-Latency': '89ms' }, error: null },
    ],
    'var-001b'
  ),
  makeLog('log-001-2', 'exp-001', 'Recommendation Engine Migration', 'req-d4e5f6', '2026-06-09T10:38:44Z',
    'POST', 'https://api.internal/v1/recommendations',
    '{"user_id": "u_5542", "context": "homepage"}',
    [
      { variant_id: 'var-001a', variant_name: 'Baseline (sklearn v1)', status_code: 200, latency_ms: 201, payload_size_bytes: 598,
        response_body: { data: { recommendations: [{ id: 'p3', title: 'Smartwatch Pro', score: 0.88 }, { id: 'p5', title: 'Fitness Tracker', score: 0.82 }], model_version: 'v1.2.3', click_through_rate: 0.094 } },
        response_headers: { 'Content-Type': 'application/json', 'X-Model-Version': 'v1.2.3' }, error: null },
      { variant_id: 'var-001b', variant_name: 'Challenger (PyTorch v2)', status_code: 200, latency_ms: 104, payload_size_bytes: 671,
        response_body: { data: { recommendations: [{ id: 'p3', title: 'Smartwatch Pro', score: 0.95 }, { id: 'p1', title: 'Premium Headphones', score: 0.91 }], model_version: 'v2.0.1', algorithm: 'neural_collab', click_through_rate: 0.181 } },
        response_headers: { 'Content-Type': 'application/json', 'X-Model-Version': 'v2.0.1' }, error: null },
    ],
    'var-001b'
  ),
  makeLog('log-001-3', 'exp-001', 'Recommendation Engine Migration', 'req-g7h8i9', '2026-06-09T10:21:05Z',
    'POST', 'https://api.internal/v1/recommendations',
    '{"user_id": "u_3317", "context": "product_page"}',
    [
      { variant_id: 'var-001a', variant_name: 'Baseline (sklearn v1)', status_code: 500, latency_ms: 498, payload_size_bytes: 88,
        response_body: { error: 'model_timeout', message: 'Model inference exceeded 500ms limit', code: 'ML_TIMEOUT' },
        response_headers: { 'Content-Type': 'application/json', 'X-Error-Code': 'ML_TIMEOUT' }, error: 'Model inference timeout' },
      { variant_id: 'var-001b', variant_name: 'Challenger (PyTorch v2)', status_code: 200, latency_ms: 112, payload_size_bytes: 638,
        response_body: { data: { recommendations: [{ id: 'p6', title: 'Gaming Headset', score: 0.94 }], model_version: 'v2.0.1', algorithm: 'neural_collab', click_through_rate: 0.154 } },
        response_headers: { 'Content-Type': 'application/json', 'X-Model-Version': 'v2.0.1' }, error: null },
    ],
    'var-001b'
  ),
  // exp-002 logs
  makeLog('log-002-1', 'exp-002', 'Payment Gateway A/B Test', 'req-j1k2l3', '2026-06-09T10:40:12Z',
    'POST', 'https://checkout.internal/v2/charge',
    '{"amount": 9900, "currency": "USD", "payment_method": "pm_xxx"}',
    [
      { variant_id: 'var-002a', variant_name: 'Stripe Gateway', status_code: 200, latency_ms: 248, payload_size_bytes: 382,
        response_body: { data: { success: true, charge_id: 'ch_3NxAbc123', amount: 9900, currency: 'USD', provider: 'stripe', status: 'succeeded' } },
        response_headers: { 'Content-Type': 'application/json', 'X-Request-Id': 'req_abc123', 'X-Stripe-Version': '2023-10-16' }, error: null },
      { variant_id: 'var-002b', variant_name: 'Adyen Gateway', status_code: 200, latency_ms: 312, payload_size_bytes: 428,
        response_body: { data: { success: true, psp_reference: 'psp_8825123456', amount: 9900, currency: 'USD', provider: 'adyen', resultCode: 'Authorised' } },
        response_headers: { 'Content-Type': 'application/json', 'X-Adyen-Version': '71' }, error: null },
    ],
    'var-002a'
  ),
  makeLog('log-002-2', 'exp-002', 'Payment Gateway A/B Test', 'req-m4n5o6', '2026-06-09T10:28:55Z',
    'POST', 'https://checkout.internal/v2/charge',
    '{"amount": 4990, "currency": "USD", "payment_method": "pm_yyy"}',
    [
      { variant_id: 'var-002a', variant_name: 'Stripe Gateway', status_code: 402, latency_ms: 188, payload_size_bytes: 204,
        response_body: { error: 'card_declined', code: 'card_declined', decline_code: 'insufficient_funds', provider: 'stripe' },
        response_headers: { 'Content-Type': 'application/json', 'X-Request-Id': 'req_def456' }, error: 'Card declined: insufficient_funds' },
      { variant_id: 'var-002b', variant_name: 'Adyen Gateway', status_code: 200, latency_ms: 422, payload_size_bytes: 394,
        response_body: { data: { success: true, psp_reference: 'psp_7734892201', amount: 4990, currency: 'USD', provider: 'adyen', resultCode: 'Authorised' } },
        response_headers: { 'Content-Type': 'application/json', 'X-Adyen-Version': '71' }, error: null },
    ],
    'var-002b'
  ),
  // exp-003 logs
  makeLog('log-003-1', 'exp-003', 'Search Engine Shadow Test', 'req-p7q8r9', '2026-06-09T10:44:02Z',
    'GET', 'https://search.internal/v1/search?q=wireless+headphones&limit=20',
    undefined,
    [
      { variant_id: 'var-003a', variant_name: 'Elasticsearch (Primary)', status_code: 200, latency_ms: 82, payload_size_bytes: 2248,
        response_body: { hits: { total: 142, hits: [{ _id: 'p1', _score: 0.94, _source: { title: 'Premium Wireless Headphones' } }, { _id: 'p4', _score: 0.91, _source: { title: 'Noise Cancelling Buds' } }] }, took: 82, _shards: { total: 3, successful: 3 } },
        response_headers: { 'Content-Type': 'application/json', 'X-Elastic-Product': 'Elasticsearch', 'X-Took': '82' }, error: null },
      { variant_id: 'var-003b', variant_name: 'Meilisearch (Shadow)', status_code: 200, latency_ms: 22, payload_size_bytes: 1824,
        response_body: { hits: [{ id: 'p1', rankingScore: 0.9921, title: 'Premium Wireless Headphones' }, { id: 'p4', rankingScore: 0.9741, title: 'Noise Cancelling Buds' }], estimatedTotalHits: 138, processingTimeMs: 22, query: 'wireless headphones' },
        response_headers: { 'Content-Type': 'application/json', 'X-Meili-Request-Id': 'ab4f8e21' }, error: null },
    ],
    'var-003b'
  ),
  makeLog('log-003-2', 'exp-003', 'Search Engine Shadow Test', 'req-s1t2u3', '2026-06-09T10:41:17Z',
    'GET', 'https://search.internal/v1/search?q=running+shoes&limit=20',
    undefined,
    [
      { variant_id: 'var-003a', variant_name: 'Elasticsearch (Primary)', status_code: 200, latency_ms: 118, payload_size_bytes: 2640,
        response_body: { hits: { total: 289, hits: [{ _id: 's1', _score: 0.96 }, { _id: 's2', _score: 0.89 }] }, took: 118 },
        response_headers: { 'Content-Type': 'application/json', 'X-Elastic-Product': 'Elasticsearch' }, error: null },
      { variant_id: 'var-003b', variant_name: 'Meilisearch (Shadow)', status_code: 200, latency_ms: 18, payload_size_bytes: 2012,
        response_body: { hits: [{ id: 's1', rankingScore: 0.9981 }, { id: 's2', rankingScore: 0.9824 }], estimatedTotalHits: 281, processingTimeMs: 18 },
        response_headers: { 'Content-Type': 'application/json', 'X-Meili-Request-Id': 'cd9a2b44' }, error: null },
    ],
    'var-003b'
  ),
  // exp-005 logs (concluded)
  makeLog('log-005-1', 'exp-005', 'ML Inference Pipeline v4 Rollout', 'req-v4w5x6', '2026-05-30T14:22:10Z',
    'POST', 'https://inference.internal/v1/predict',
    '{"features": [0.4, 0.8, 1.2, 0.6], "model_hint": "classification"}',
    [
      { variant_id: 'var-005a', variant_name: 'Model v3.1 (Champion)', status_code: 200, latency_ms: 402, payload_size_bytes: 312,
        response_body: { prediction: { label: 'positive', confidence: 0.781, model_version: 'v3.1.4', inference_time_ms: 401 } },
        response_headers: { 'Content-Type': 'application/json', 'X-Model': 'gbm-v3' }, error: null },
      { variant_id: 'var-005b', variant_name: 'Model v4.0-beta (Challenger)', status_code: 200, latency_ms: 124, payload_size_bytes: 368,
        response_body: { prediction: { label: 'positive', confidence: 0.942, model_version: 'v4.0-beta', tokens_used: 184, inference_time_ms: 123 } },
        response_headers: { 'Content-Type': 'application/json', 'X-Model': 'transformer-v4' }, error: null },
    ],
    'var-005b'
  ),
]

// Analytics
function makeLatencyTrend(base: number, variance: number): { hour: string; p50: number; p95: number; p99: number; requests: number }[] {
  return Array.from({ length: 24 }, (_, i) => {
    const h = String(i).padStart(2, '0') + ':00'
    const jitter = (Math.random() - 0.5) * variance
    const p50 = Math.round(base * 0.85 + jitter)
    return { hour: h, p50, p95: Math.round(p50 * 1.6), p99: Math.round(p50 * 2.1), requests: rnd(180, 620) }
  })
}

const ANALYTICS: Record<string, ExperimentAnalytics> = {
  'exp-001': {
    experiment_id: 'exp-001', total_requests: 48420, avg_latency_ms: 142, error_rate: 0.8, winner_variant_id: null,
    variant_metrics: [
      { variant_id: 'var-001a', variant_name: 'Baseline (sklearn v1)', request_count: 24210, avg_latency_ms: 182, p50_latency_ms: 168, p95_latency_ms: 258, p99_latency_ms: 312, error_rate: 1.1, success_rate: 98.9, avg_payload_size: 608, score: 71.2 },
      { variant_id: 'var-001b', variant_name: 'Challenger (PyTorch v2)', request_count: 24210, avg_latency_ms: 97, p50_latency_ms: 88, p95_latency_ms: 142, p99_latency_ms: 172, error_rate: 0.4, success_rate: 99.6, avg_payload_size: 642, score: 88.4 },
    ],
    latency_trend: makeLatencyTrend(142, 40),
  },
  'exp-002': {
    experiment_id: 'exp-002', total_requests: 22180, avg_latency_ms: 298, error_rate: 2.4, winner_variant_id: null,
    variant_metrics: [
      { variant_id: 'var-002a', variant_name: 'Stripe Gateway', request_count: 11090, avg_latency_ms: 264, p50_latency_ms: 248, p95_latency_ms: 410, p99_latency_ms: 498, error_rate: 1.8, success_rate: 98.2, avg_payload_size: 388, score: 84.1 },
      { variant_id: 'var-002b', variant_name: 'Adyen Gateway', request_count: 11090, avg_latency_ms: 331, p50_latency_ms: 310, p95_latency_ms: 520, p99_latency_ms: 618, error_rate: 3.1, success_rate: 96.9, avg_payload_size: 424, score: 76.3 },
    ],
    latency_trend: makeLatencyTrend(298, 80),
  },
  'exp-003': {
    experiment_id: 'exp-003', total_requests: 31550, avg_latency_ms: 58, error_rate: 0.3, winner_variant_id: null,
    variant_metrics: [
      { variant_id: 'var-003a', variant_name: 'Elasticsearch (Primary)', request_count: 31550, avg_latency_ms: 94, p50_latency_ms: 81, p95_latency_ms: 162, p99_latency_ms: 204, error_rate: 0.4, success_rate: 99.6, avg_payload_size: 2280, score: 79.8 },
      { variant_id: 'var-003b', variant_name: 'Meilisearch (Shadow)', request_count: 31550, avg_latency_ms: 28, p50_latency_ms: 24, p95_latency_ms: 48, p99_latency_ms: 68, error_rate: 0.1, success_rate: 99.9, avg_payload_size: 1840, score: 94.6 },
    ],
    latency_trend: makeLatencyTrend(58, 20),
  },
  'exp-005': {
    experiment_id: 'exp-005', total_requests: 95200, avg_latency_ms: 124, error_rate: 0.4, winner_variant_id: 'var-005b',
    variant_metrics: [
      { variant_id: 'var-005a', variant_name: 'Model v3.1 (Champion)', request_count: 47600, avg_latency_ms: 384, p50_latency_ms: 361, p95_latency_ms: 520, p99_latency_ms: 604, error_rate: 0.6, success_rate: 99.4, avg_payload_size: 332, score: 64.8 },
      { variant_id: 'var-005b', variant_name: 'Model v4.0-beta (Challenger)', request_count: 47600, avg_latency_ms: 118, p50_latency_ms: 108, p95_latency_ms: 178, p99_latency_ms: 214, error_rate: 0.2, success_rate: 99.8, avg_payload_size: 374, score: 94.2 },
    ],
    latency_trend: makeLatencyTrend(124, 30),
  },
}

// AI Insights
const AI_INSIGHTS: AIInsight[] = [
  {
    experiment_id: 'exp-001',
    experiment_name: 'Recommendation Engine Migration',
    generated_at: '2026-06-09T09:00:00Z',
    winner_variant: 'Challenger (PyTorch v2)',
    winner_reason: "PyTorch v2 delivers 47% lower average latency (97ms vs 182ms) and 63% fewer errors (0.4% vs 1.1%). Business metric click_through_rate improved from 0.112 to 0.168 — a +50% lift. Statistically significant at 99.4% confidence after 48k executions.",
    risk_warnings: ['Monitor v2 model memory usage under peak load — GPU utilization spiked at 94% during traffic bursts'],
    performance_summary: 'Analyzed 48,420 executions across 2 variants. PyTorch v2 consistently outperforms sklearn baseline on all measured dimensions.',
    recommendation: "Promote 'Challenger (PyTorch v2)' to 100% traffic. Decommission sklearn v1 service after 7-day monitoring window. Set up latency SLO alert at p95 > 200ms.",
    suggested_next_experiments: [
      'Test two-stage retrieval: dense embeddings + re-ranking',
      'Evaluate request batching to improve GPU utilization',
      'A/B test recommendation diversity vs relevance tuning',
    ],
    confidence: 'high',
  },
  {
    experiment_id: 'exp-002',
    experiment_name: 'Payment Gateway A/B Test',
    generated_at: '2026-06-09T08:30:00Z',
    winner_variant: 'Stripe Gateway',
    winner_reason: "Stripe leads with 20% lower latency (264ms vs 331ms) and 42% lower error rate (1.8% vs 3.1%). Adyen shows higher error variance suggesting infrastructure instability. Stripe's p95 (410ms) vs Adyen (520ms) confirms consistent performance advantage.",
    risk_warnings: [
      "Adyen error rate of 3.1% exceeds acceptable threshold of 2% — not safe for full production rollout",
      "Both gateways show p99 latency > 400ms — consider async processing for non-blocking UX",
    ],
    performance_summary: 'Analyzed 22,180 executions. Stripe wins on latency, error rate, and consistency. Adyen shows occasional timeout spikes.',
    recommendation: "Maintain Stripe as primary gateway. Investigate Adyen's elevated error rate with their support team before reconsidering. Set Stripe as default for new markets.",
    suggested_next_experiments: [
      'Test 3DS2 authentication impact on checkout latency',
      'Compare gateway performance by geographic region',
      'Evaluate local payment methods via gateway extensions',
    ],
    confidence: 'medium',
  },
  {
    experiment_id: 'exp-003',
    experiment_name: 'Search Engine Shadow Test',
    generated_at: '2026-06-09T10:00:00Z',
    winner_variant: 'Meilisearch (Shadow)',
    winner_reason: "Meilisearch is 70% faster than Elasticsearch (28ms vs 94ms avg latency). p95 is 48ms vs 162ms — a 3.4x improvement. Error rate is 60% lower (0.1% vs 0.4%). Smaller payload size reduces bandwidth costs. Shadow mode confirms no functional regressions.",
    risk_warnings: ['Meilisearch lacks some advanced aggregation features used in analytics queries — verify full feature parity before full migration'],
    performance_summary: 'Shadow tested 31,550 live queries. Meilisearch consistently outperforms on speed with equivalent result quality.',
    recommendation: "Begin phased Meilisearch migration: route 10% of traffic → monitor for 48h → scale to 50% → full cutover. Prioritize feature flag validation for advanced filters.",
    suggested_next_experiments: [
      'Test Meilisearch faceted search performance vs Elasticsearch aggregations',
      'Evaluate typo tolerance and ranking customization accuracy',
      'Compare cold-start latency after index updates',
    ],
    confidence: 'high',
  },
  {
    experiment_id: 'exp-005',
    experiment_name: 'ML Inference Pipeline v4 Rollout',
    generated_at: '2026-05-28T12:00:00Z',
    winner_variant: 'Model v4.0-beta (Challenger)',
    winner_reason: "Model v4.0-beta achieved 3.2x latency improvement (118ms vs 384ms), 8.4% accuracy gain (94.2% vs 85.8% confidence), and 67% error reduction. 95,200 executions provide extremely high statistical confidence. Winner already promoted to production.",
    risk_warnings: ['No significant risks. Post-rollout monitoring shows stable performance.'],
    performance_summary: 'Concluded experiment with 95,200 total executions. v4.0-beta won decisively on all metrics. Now serving 100% of production traffic.',
    recommendation: "Experiment concluded. v4.0-beta is now the production champion. Run next experiment testing v4.1 with improved tokenization for further gains.",
    suggested_next_experiments: [
      'Test v4.1 with improved feature tokenization',
      'Evaluate quantized INT8 inference for 40% additional speed gains',
      'A/B test ensemble v4.0 + v3.1 fallback vs pure v4.0',
    ],
    confidence: 'high',
  },
]

// Throughput chart data (last 24h)
const THROUGHPUT_DATA: ThroughputPoint[] = Array.from({ length: 24 }, (_, i) => ({
  time: String(i).padStart(2, '0') + ':00',
  requests: rnd(1200, 4800),
  errors: rnd(4, 48),
}))

// ─── Store types ─────────────────────────────────────────────────────────────

export type NavPage =
  | 'dashboard'
  | 'experiments'
  | 'api-builder'
  | 'cockpit'
  | 'analytics'
  | 'ai-insights'
  | 'execution-logs'
  | 'response-comparator'
  | 'users'
  | 'settings'
  | 'integrations'

interface AppState {
  activePage: NavPage
  selectedExperimentId: string | null
  selectedLogId: string | null
  experiments: ApiExperiment[]
  variants: ApiVariant[]
  executionLogs: ExecutionLog[]
  analyticsMap: Record<string, ExperimentAnalytics>
  aiInsights: AIInsight[]
  throughputData: ThroughputPoint[]
  liveRequestCount: number
  liveErrorCount: number

  setPage: (page: NavPage) => void
  selectExperiment: (id: string | null) => void
  selectLog: (id: string | null) => void
  addExperiment: (exp: ApiExperiment) => void
  updateExperimentStatus: (id: string, status: ApiExperiment['status']) => void
  getVariantsForExperiment: (expId: string) => ApiVariant[]
  getLogsForExperiment: (expId: string) => ExecutionLog[]
  tickLive: () => void
}

export const useStore = create<AppState>((set, get) => ({
  activePage: 'dashboard',
  selectedExperimentId: null,
  selectedLogId: null,
  experiments: EXPERIMENTS,
  variants: VARIANTS,
  executionLogs: EXECUTION_LOGS,
  analyticsMap: ANALYTICS,
  aiInsights: AI_INSIGHTS,
  throughputData: THROUGHPUT_DATA,
  liveRequestCount: 102840,
  liveErrorCount: 248,

  setPage: (page) => set({ activePage: page }),
  selectExperiment: (id) => set({ selectedExperimentId: id }),
  selectLog: (id) => set({ selectedLogId: id }),

  addExperiment: (exp) =>
    set((s) => ({
      experiments: [exp, ...s.experiments],
      variants: [...s.variants],
    })),

  updateExperimentStatus: (id, status) =>
    set((s) => ({
      experiments: s.experiments.map((e) => e.id === id ? { ...e, status } : e),
    })),

  getVariantsForExperiment: (expId) =>
    get().variants.filter((v) => v.experiment_id === expId),

  getLogsForExperiment: (expId) =>
    get().executionLogs.filter((l) => l.experiment_id === expId),

  tickLive: () =>
    set((s) => ({
      liveRequestCount: s.liveRequestCount + Math.floor(Math.random() * 12 + 3),
      liveErrorCount: s.liveErrorCount + (Math.random() > 0.85 ? 1 : 0),
    })),
}))
