// Core types for XTest API Lab 2.0

export type ExperimentMode = "AB" | "CC";
export type ExperimentStatus = "draft" | "running" | "paused" | "concluded";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type AuthType = "none" | "bearer" | "api_key";

// ── A/B ───────────────────────────────────────────────────────────────────────

export interface ABVariant {
  id: string;
  experiment_id: string;
  name: string;
  weight: number;
  url_override: string;
  header_overrides: Record<string, string>;
  body_override?: string;
  description: string;
  created_at: string;
}

export interface ABExperiment {
  id: string;
  mode: "AB";
  name: string;
  description: string;
  status: ExperimentStatus;
  environment: string;
  method: HttpMethod;
  base_url: string;
  path: string;
  query_params: Record<string, string>;
  body_template: string;
  request_headers: Record<string, string>;
  auth_type: AuthType;
  auth_value: string;
  timeout_ms: number;
  variant_count: number;
  total_requests: number;
  error_rate: number;
  avg_latency_ms: number;
  variants: ABVariant[];
  created_at: string;
  updated_at: string;
}

// ── CC ────────────────────────────────────────────────────────────────────────

export interface ScoringRules {
  priority: "latency" | "error_rate" | "business";
  success_status_required: boolean;
  latency_weight: number;
  error_weight: number;
  business_metric_weight: number;
  business_metric_path?: string;
}

export interface CCExperiment {
  id: string;
  mode: "CC";
  name: string;
  description: string;
  status: ExperimentStatus;
  environment: string;
  method: HttpMethod;
  champion_url: string;
  challenger_url: string;
  path: string;
  query_params: Record<string, string>;
  body_template: string;
  request_headers: Record<string, string>;
  auth_type: AuthType;
  auth_value: string;
  timeout_ms: number;
  scoring_rules: ScoringRules;
  total_sessions: number;
  champion_stats: { count: number; avg_latency_ms: number; error_rate: number };
  challenger_stats: { count: number; avg_latency_ms: number; error_rate: number };
  champion_wins: number;
  challenger_wins: number;
  created_at: string;
  updated_at: string;
}

// ── Sessions / Calls ──────────────────────────────────────────────────────────

export interface ABCall {
  call_id: string;
  timestamp: string;
  variant_id: string;
  variant_name: string;
  url: string;
  method: string;
  status_code: number;
  latency_ms: number;
  response_body: Record<string, unknown>;
  response_headers: Record<string, string>;
  error: string | null;
  payload_size_bytes: number;
}

export interface CCCall {
  call_id: string;
  timestamp: string;
  role: "champion" | "challenger";
  url: string;
  method: string;
  status_code: number;
  latency_ms: number;
  response_body: Record<string, unknown>;
  response_headers: Record<string, string>;
  error: string | null;
  payload_size_bytes: number;
  score: number;
}

export interface ABSession {
  id: string;
  experiment_id: string;
  mode: "AB";
  n_requested: number;
  calls: ABCall[];
  created_at: string;
  updated_at: string;
}

export interface CCSession {
  id: string;
  experiment_id: string;
  mode: "CC";
  calls: CCCall[];
  winner: "champion" | "challenger";
  score_diff: number;
  champion: CCCall;
  challenger: CCCall;
  created_at: string;
  updated_at: string;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface ABVariantMetric {
  variant_id: string;
  variant_name: string;
  weight: number;
  request_count: number;
  avg_latency_ms: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  error_rate: number;
  success_rate: number;
}

export interface ABAnalytics {
  experiment_id: string;
  mode: "AB";
  total_requests: number;
  total_sessions: number;
  avg_latency_ms: number;
  error_rate: number;
  variant_metrics: ABVariantMetric[];
  latency_trend: { session: number; avg_latency: number; calls: number }[];
}

export interface RoleStats {
  count: number;
  avg_latency_ms: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  error_rate: number;
  avg_payload_bytes: number;
}

export interface CCAnalytics {
  experiment_id: string;
  mode: "CC";
  total_sessions: number;
  champion_wins: number;
  challenger_wins: number;
  champion_win_rate: number;
  challenger_win_rate: number;
  champion_stats: RoleStats;
  challenger_stats: RoleStats;
  latency_trend: { session: number; champion_latency: number; challenger_latency: number; winner: string }[];
}

export interface DashboardSummary {
  total_requests: number;
  total_sessions: number;
  running_experiments: number;
  ab_experiments: number;
  cc_experiments: number;
  avg_latency_ms: number;
  error_rate: number;
}
