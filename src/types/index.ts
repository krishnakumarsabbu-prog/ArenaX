// ── Enums & primitives ────────────────────────────────────────────────────────

export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'concluded'
export type ExecutionMode = 'ab' | 'champion_challenger' | 'shadow'
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
export type AuthType = 'none' | 'bearer' | 'api_key' | 'oauth2' | 'mtls'
export type VariantType = 'service_routing' | 'model' | 'feature_flag' | 'config'
export type Environment = 'dev' | 'staging' | 'prod'
export type AIConfidence = 'low' | 'medium' | 'high'

// ── Request / Auth config ────────────────────────────────────────────────────

export interface RequestConfig {
  method: HttpMethod
  base_url: string
  path: string
  query_params: Record<string, string>
  body_template: string
  headers: Record<string, string>
}

export interface AuthConfig {
  type: AuthType
  value?: string
  key_name?: string
}

export interface ScoringRules {
  success_status: number
  latency_weight: number
  error_weight: number
  business_metric_weight: number
  business_metric_path?: string
}

// ── API Experiment ────────────────────────────────────────────────────────────

export interface ApiExperiment {
  id: string
  name: string
  description: string
  status: ExperimentStatus
  execution_mode: ExecutionMode
  environment: Environment
  request_config: RequestConfig
  auth_config: AuthConfig
  timeout_ms: number
  max_retries: number
  scoring_rules: ScoringRules
  variant_count: number
  total_requests: number
  error_rate: number
  avg_latency_ms: number
  winner_variant_id: string | null
  created_at: string
  concluded_at: string | null
}

// ── API Variant ───────────────────────────────────────────────────────────────

export interface ApiVariant {
  id: string
  experiment_id: string
  name: string
  type: VariantType
  description: string
  weight: number
  routing: { target_url: string }
  feature_flags: Record<string, boolean | string | number>
  config_overrides: Record<string, unknown>
  avg_latency_ms: number
  p50_latency_ms: number
  p95_latency_ms: number
  error_rate: number
  request_count: number
  score: number
  is_winner: boolean
}

// ── Execution log ─────────────────────────────────────────────────────────────

export interface VariantResult {
  variant_id: string
  variant_name: string
  status_code: number
  latency_ms: number
  response_body: Record<string, unknown>
  response_headers: Record<string, string>
  error: string | null
  payload_size_bytes: number
}

export interface ExecutionLog {
  id: string
  experiment_id: string
  experiment_name: string
  request_id: string
  timestamp: string
  request: {
    method: HttpMethod
    url: string
    headers: Record<string, string>
    body?: string
  }
  variant_results: VariantResult[]
  winner_variant_id: string | null
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface VariantMetrics {
  variant_id: string
  variant_name: string
  request_count: number
  avg_latency_ms: number
  p50_latency_ms: number
  p95_latency_ms: number
  p99_latency_ms: number
  error_rate: number
  success_rate: number
  avg_payload_size: number
  score: number
}

export interface LatencyDataPoint {
  hour: string
  p50: number
  p95: number
  p99: number
  requests: number
}

export interface ExperimentAnalytics {
  experiment_id: string
  total_requests: number
  avg_latency_ms: number
  error_rate: number
  winner_variant_id: string | null
  variant_metrics: VariantMetrics[]
  latency_trend: LatencyDataPoint[]
}

// ── AI insights ───────────────────────────────────────────────────────────────

export interface AIInsight {
  experiment_id: string
  experiment_name: string
  generated_at: string
  winner_variant: string | null
  winner_reason: string
  risk_warnings: string[]
  performance_summary: string
  recommendation: string
  suggested_next_experiments: string[]
  confidence: AIConfidence
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface ThroughputPoint {
  time: string
  requests: number
  errors: number
}

// ── Admin types (kept for admin panel) ───────────────────────────────────────

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string | null
}

export interface Role {
  id: string
  name: string
  description: string | null
  permissions: Permission[]
}

export interface APIToken {
  id: string
  name: string
  prefix: string
  scopes: string[]
  is_active: boolean
  last_used: string | null
  expires_at: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  resource: string
  resource_id: string | null
  details: string | null
  ip_address: string | null
  status: string
  created_at: string
}
