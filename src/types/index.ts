export interface Experiment {
  id: string
  name: string
  url: string
  status: 'draft' | 'running' | 'paused' | 'concluded'
  hypothesis: string | null
  goal_metric: 'conversion' | 'click' | 'scroll'
  traffic_pct: number
  min_sessions: number
  confidence_threshold: number
  created_at: string
  concluded_at: string | null
  ai_verdict: AIVerdict | null
  variant_count: number
  total_sessions: number
  leading_lift: number | null
}

export interface AIVerdict {
  hypothesis_confirmed: boolean
  verdict_summary: string
  winner_variant: string | null
  key_insights: string[]
  key_segments: string[]
  next_tests: string[]
  confidence_level: 'high' | 'medium' | 'low'
  raw_analysis: string
}

export interface VariantChange {
  selector: string
  property: string
  value: string
}

export interface Variant {
  id: string
  experiment_id: string
  key: string
  name: string
  description: string | null
  traffic_weight: number
  alpha: number
  beta: number
  changes: VariantChange[]
  impressions: number
  conversions: number
  cvr: number
}

export interface VariantStats {
  variant_id: string
  variant_key: string
  variant_name: string
  impressions: number
  conversions: number
  cvr: number
  traffic_weight: number
  lift_vs_control: number | null
  confidence: number
}

export interface SegmentStats {
  segment: string
  value: string
  winner_variant: string
  lift: number
}

export interface ExperimentAnalytics {
  experiment_id: string
  total_sessions: number
  overall_confidence: number
  leading_variant: string | null
  variant_stats: VariantStats[]
  segment_breakdown: Record<string, SegmentStats[]>
  days_running: number
  estimated_days_remaining: number | null
}

export interface Challenge {
  id: string
  name: string
  status: 'draft' | 'open' | 'running' | 'concluded'
  current_round: number
  total_rounds: number
  team_count: number
  top_team: string | null
  top_score: number | null
  ai_analysis?: AIChampionAnalysis | null
}

export interface AIChampionAnalysis {
  gap_analysis: string
  quick_wins: string[]
  strategic_tests: string[]
  risk_moves: string[]
  predicted_outcome: string
  confidence: string
}

export interface Team {
  id: string
  challenge_id: string
  name: string
  url: string
  members: string[]
  latest_score: number | null
  rank: number | null
}

export interface BracketPair {
  round: number
  team_a?: BracketTeam
  team_b?: BracketTeam
}

export interface BracketTeam {
  id: string
  name: string
  url: string
  score: number | null
  cvr: number | null
  sessions: number | null
  rank: number | null
}

export interface BracketData {
  challenge_id: string
  name: string
  current_round: number
  total_rounds: number
  status: string
  bracket: BracketPair[]
}

export interface LeaderboardRow {
  team_id: string
  team_name: string
  team_url: string
  composite_score: number
  cvr: number
  session_count: number
  rank: number
  delta: number
}

export interface ExperimentCreate {
  name: string
  url: string
  hypothesis?: string
  goal_metric: 'conversion' | 'click' | 'scroll'
  min_sessions: number
  confidence_threshold: number
  traffic_pct: number
}

export interface ChallengeCreate {
  name: string
  description?: string
  scoring_config: {
    cvr_weight: number
    engagement_weight: number
    session_volume_weight: number
  }
  total_rounds: number
  start_date?: string
  end_date?: string
}

// ── Security / RBAC ───────────────────────────────────────────────────────────

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

export interface RoleCreate {
  name: string
  description?: string
  permission_ids: string[]
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

export interface APITokenCreated extends APIToken {
  token: string
}

export interface APITokenCreate {
  name: string
  scopes: string[]
  expires_at?: string
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

export interface RateLimitStatus {
  key: string
  count: number
  window_end?: string
  active_window: boolean
}
