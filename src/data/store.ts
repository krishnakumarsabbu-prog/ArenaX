import { create } from 'zustand'
import { Experiment, Challenge, Team, LeaderboardRow, ExperimentAnalytics, BracketData } from '../types'

// ─── Seeded mock data ────────────────────────────────────────────────────────

const EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-1', name: 'Hero CTA Button Color', url: 'https://app.xtest.io/home',
    status: 'running', hypothesis: 'Changing CTA to orange will increase conversions by 12%',
    goal_metric: 'conversion', traffic_pct: 80, min_sessions: 5000,
    confidence_threshold: 95, created_at: '2026-05-20T08:00:00Z', concluded_at: null,
    ai_verdict: null, variant_count: 3, total_sessions: 14820, leading_lift: 9.4,
  },
  {
    id: 'exp-2', name: 'Pricing Page Layout', url: 'https://app.xtest.io/pricing',
    status: 'running', hypothesis: 'Two-column layout increases plan selection',
    goal_metric: 'click', traffic_pct: 50, min_sessions: 3000,
    confidence_threshold: 90, created_at: '2026-05-25T10:00:00Z', concluded_at: null,
    ai_verdict: null, variant_count: 2, total_sessions: 8420, leading_lift: 14.2,
  },
  {
    id: 'exp-3', name: 'Onboarding Flow Step 1', url: 'https://app.xtest.io/onboarding',
    status: 'concluded', hypothesis: 'Shorter form reduces drop-off',
    goal_metric: 'conversion', traffic_pct: 100, min_sessions: 2000,
    confidence_threshold: 95, created_at: '2026-04-10T08:00:00Z', concluded_at: '2026-05-10T08:00:00Z',
    ai_verdict: {
      hypothesis_confirmed: true, verdict_summary: 'Shorter form variant won decisively with +18.3% lift',
      winner_variant: 'Variant B', key_insights: ['Mobile users benefited most', '3-field form vs 7-field'],
      key_segments: ['mobile', 'new_users'], next_tests: ['Step 2 simplification', 'Progress bar impact'],
      confidence_level: 'high', raw_analysis: 'Statistical significance reached at day 14'
    },
    variant_count: 2, total_sessions: 22100, leading_lift: 18.3,
  },
  {
    id: 'exp-4', name: 'Dashboard Widget Order', url: 'https://app.xtest.io/dashboard',
    status: 'paused', hypothesis: 'Metrics-first layout improves engagement',
    goal_metric: 'scroll', traffic_pct: 30, min_sessions: 4000,
    confidence_threshold: 90, created_at: '2026-06-01T09:00:00Z', concluded_at: null,
    ai_verdict: null, variant_count: 2, total_sessions: 3100, leading_lift: 3.2,
  },
  {
    id: 'exp-5', name: 'Email Subject Line', url: 'https://app.xtest.io/campaigns',
    status: 'running', hypothesis: 'Personalized subject lines boost open rate',
    goal_metric: 'click', traffic_pct: 60, min_sessions: 10000,
    confidence_threshold: 95, created_at: '2026-06-03T07:00:00Z', concluded_at: null,
    ai_verdict: null, variant_count: 4, total_sessions: 19800, leading_lift: 7.1,
  },
  {
    id: 'exp-6', name: 'Feature Discovery Banner', url: 'https://app.xtest.io/features',
    status: 'draft', hypothesis: 'Contextual banners improve feature adoption',
    goal_metric: 'click', traffic_pct: 40, min_sessions: 2500,
    confidence_threshold: 90, created_at: '2026-06-07T14:00:00Z', concluded_at: null,
    ai_verdict: null, variant_count: 2, total_sessions: 0, leading_lift: null,
  },
]

const EXPERIMENT_ANALYTICS: Record<string, ExperimentAnalytics> = {
  'exp-1': {
    experiment_id: 'exp-1', total_sessions: 14820, overall_confidence: 87.4,
    leading_variant: 'Variant A (Orange)',
    variant_stats: [
      { variant_id: 'v-1a', variant_key: 'control', variant_name: 'Control (Blue)', impressions: 4940, conversions: 494, cvr: 10.0, traffic_weight: 33, lift_vs_control: null, confidence: 0 },
      { variant_id: 'v-1b', variant_key: 'variant_a', variant_name: 'Variant A (Orange)', impressions: 4940, conversions: 584, cvr: 11.8, traffic_weight: 33, lift_vs_control: 18.0, confidence: 87.4 },
      { variant_id: 'v-1c', variant_key: 'variant_b', variant_name: 'Variant B (Green)', impressions: 4940, conversions: 519, cvr: 10.5, traffic_weight: 33, lift_vs_control: 5.0, confidence: 62.1 },
    ],
    segment_breakdown: {
      device: [
        { segment: 'device', value: 'mobile', winner_variant: 'Variant A (Orange)', lift: 22.4 },
        { segment: 'device', value: 'desktop', winner_variant: 'Variant A (Orange)', lift: 14.2 },
        { segment: 'device', value: 'tablet', winner_variant: 'Control (Blue)', lift: -1.2 },
      ],
      user_type: [
        { segment: 'user_type', value: 'new', winner_variant: 'Variant A (Orange)', lift: 28.1 },
        { segment: 'user_type', value: 'returning', winner_variant: 'Variant A (Orange)', lift: 11.0 },
      ],
    },
    days_running: 20, estimated_days_remaining: 8,
  },
  'exp-2': {
    experiment_id: 'exp-2', total_sessions: 8420, overall_confidence: 91.2,
    leading_variant: 'Variant A (Two-column)',
    variant_stats: [
      { variant_id: 'v-2a', variant_key: 'control', variant_name: 'Control (Single column)', impressions: 4210, conversions: 337, cvr: 8.0, traffic_weight: 50, lift_vs_control: null, confidence: 0 },
      { variant_id: 'v-2b', variant_key: 'variant_a', variant_name: 'Variant A (Two-column)', impressions: 4210, conversions: 414, cvr: 9.8, traffic_weight: 50, lift_vs_control: 22.5, confidence: 91.2 },
    ],
    segment_breakdown: {
      device: [
        { segment: 'device', value: 'desktop', winner_variant: 'Variant A (Two-column)', lift: 31.0 },
        { segment: 'device', value: 'mobile', winner_variant: 'Control (Single column)', lift: -8.0 },
      ],
    },
    days_running: 15, estimated_days_remaining: 4,
  },
  'exp-5': {
    experiment_id: 'exp-5', total_sessions: 19800, overall_confidence: 78.9,
    leading_variant: 'Variant C (First-name)',
    variant_stats: [
      { variant_id: 'v-5a', variant_key: 'control', variant_name: 'Control (Generic)', impressions: 4950, conversions: 891, cvr: 18.0, traffic_weight: 25, lift_vs_control: null, confidence: 0 },
      { variant_id: 'v-5b', variant_key: 'variant_a', variant_name: 'Variant A (Company)', impressions: 4950, conversions: 921, cvr: 18.6, traffic_weight: 25, lift_vs_control: 3.3, confidence: 55.4 },
      { variant_id: 'v-5c', variant_key: 'variant_b', variant_name: 'Variant B (Role)', impressions: 4950, conversions: 945, cvr: 19.1, traffic_weight: 25, lift_vs_control: 6.1, confidence: 68.2 },
      { variant_id: 'v-5d', variant_key: 'variant_c', variant_name: 'Variant C (First-name)', impressions: 4950, conversions: 1049, cvr: 21.2, traffic_weight: 25, lift_vs_control: 17.8, confidence: 78.9 },
    ],
    segment_breakdown: {
      user_type: [
        { segment: 'user_type', value: 'enterprise', winner_variant: 'Variant C (First-name)', lift: 24.1 },
        { segment: 'user_type', value: 'smb', winner_variant: 'Variant C (First-name)', lift: 12.6 },
      ],
    },
    days_running: 6, estimated_days_remaining: 12,
  },
}

const CHALLENGES: Challenge[] = [
  {
    id: 'ch-1', name: 'Q2 Conversion Sprint', status: 'running',
    current_round: 2, total_rounds: 3, team_count: 8, top_team: 'Team Falcon', top_score: 94.2,
    ai_analysis: {
      gap_analysis: 'Team Falcon leads by 6.8 points. Mobile optimization is the key differentiator.',
      quick_wins: ['Optimize above-the-fold CTA', 'Reduce form friction', 'Add social proof'],
      strategic_tests: ['Checkout flow redesign', 'Personalized homepage'],
      risk_moves: ['Radical navigation overhaul', 'Remove product images'],
      predicted_outcome: 'Team Falcon projected winner with 78% probability.',
      confidence: 'high',
    },
  },
  {
    id: 'ch-2', name: 'Mobile UX Championship', status: 'running',
    current_round: 1, total_rounds: 4, team_count: 12, top_team: 'Team Atlas', top_score: 88.5,
    ai_analysis: null,
  },
  {
    id: 'ch-3', name: 'Onboarding Funnel Open', status: 'concluded',
    current_round: 3, total_rounds: 3, team_count: 6, top_team: 'Team Nexus', top_score: 97.8,
    ai_analysis: null,
  },
  {
    id: 'ch-4', name: 'Retention Hackathon', status: 'draft',
    current_round: 0, total_rounds: 2, team_count: 0, top_team: null, top_score: null,
    ai_analysis: null,
  },
]

const TEAMS: Team[] = [
  { id: 't-1', challenge_id: 'ch-1', name: 'Team Falcon', url: 'falcon.xtest.io', members: ['Ana Silva', 'Dev Kumar', 'Jay Park'], latest_score: 94.2, rank: 1 },
  { id: 't-2', challenge_id: 'ch-1', name: 'Team Storm', url: 'storm.xtest.io', members: ['Maria Lopez', 'Sam Chen'], latest_score: 87.4, rank: 2 },
  { id: 't-3', challenge_id: 'ch-1', name: 'Team Nova', url: 'nova.xtest.io', members: ['Blake Rivers', 'Kim Tanaka', 'Obi Eze'], latest_score: 82.1, rank: 3 },
  { id: 't-4', challenge_id: 'ch-1', name: 'Team Apex', url: 'apex.xtest.io', members: ['Priya Sharma', 'Liam Walsh'], latest_score: 79.8, rank: 4 },
  { id: 't-5', challenge_id: 'ch-1', name: 'Team Zenith', url: 'zenith.xtest.io', members: ['Rina Mori', 'Chris Bay'], latest_score: 75.3, rank: 5 },
  { id: 't-6', challenge_id: 'ch-1', name: 'Team Pulse', url: 'pulse.xtest.io', members: ['Aditi Roy', 'Marcus J'], latest_score: 71.0, rank: 6 },
  { id: 't-7', challenge_id: 'ch-1', name: 'Team Edge', url: 'edge.xtest.io', members: ['Nadia Voss', 'Sean Kim'], latest_score: 68.5, rank: 7 },
  { id: 't-8', challenge_id: 'ch-1', name: 'Team Craft', url: 'craft.xtest.io', members: ['Eli Torres'], latest_score: 62.9, rank: 8 },
  { id: 't-9', challenge_id: 'ch-2', name: 'Team Atlas', url: 'atlas.xtest.io', members: ['Zoe Grant', 'Finn Beck'], latest_score: 88.5, rank: 1 },
  { id: 't-10', challenge_id: 'ch-2', name: 'Team Orbit', url: 'orbit.xtest.io', members: ['Leo Chase', 'Nina Park'], latest_score: 83.2, rank: 2 },
]

const LEADERBOARD: LeaderboardRow[] = [
  { team_id: 't-1', team_name: 'Team Falcon', team_url: 'falcon.xtest.io', composite_score: 94.2, cvr: 14.8, session_count: 28400, rank: 1, delta: 2 },
  { team_id: 't-2', team_name: 'Team Storm', team_url: 'storm.xtest.io', composite_score: 87.4, cvr: 13.1, session_count: 24100, rank: 2, delta: 0 },
  { team_id: 't-3', team_name: 'Team Nova', team_url: 'nova.xtest.io', composite_score: 82.1, cvr: 12.4, session_count: 21800, rank: 3, delta: -1 },
  { team_id: 't-4', team_name: 'Team Apex', team_url: 'apex.xtest.io', composite_score: 79.8, cvr: 11.9, session_count: 19200, rank: 4, delta: 1 },
  { team_id: 't-5', team_name: 'Team Zenith', team_url: 'zenith.xtest.io', composite_score: 75.3, cvr: 11.0, session_count: 17600, rank: 5, delta: -2 },
  { team_id: 't-6', team_name: 'Team Pulse', team_url: 'pulse.xtest.io', composite_score: 71.0, cvr: 10.5, session_count: 15400, rank: 6, delta: 0 },
  { team_id: 't-7', team_name: 'Team Edge', team_url: 'edge.xtest.io', composite_score: 68.5, cvr: 10.1, session_count: 14200, rank: 7, delta: 3 },
  { team_id: 't-8', team_name: 'Team Craft', team_url: 'craft.xtest.io', composite_score: 62.9, cvr: 9.4, session_count: 12100, rank: 8, delta: -1 },
]

const BRACKET: BracketData = {
  challenge_id: 'ch-1', name: 'Q2 Conversion Sprint',
  current_round: 2, total_rounds: 3, status: 'running',
  bracket: [
    { round: 1, team_a: { id: 't-1', name: 'Team Falcon', url: 'falcon.xtest.io', score: 94.2, cvr: 14.8, sessions: 7200, rank: 1 }, team_b: { id: 't-8', name: 'Team Craft', url: 'craft.xtest.io', score: 62.9, cvr: 9.4, sessions: 5800, rank: 8 } },
    { round: 1, team_a: { id: 't-2', name: 'Team Storm', url: 'storm.xtest.io', score: 87.4, cvr: 13.1, sessions: 6900, rank: 2 }, team_b: { id: 't-7', name: 'Team Edge', url: 'edge.xtest.io', score: 68.5, cvr: 10.1, sessions: 5600, rank: 7 } },
    { round: 1, team_a: { id: 't-3', name: 'Team Nova', url: 'nova.xtest.io', score: 82.1, cvr: 12.4, sessions: 6400, rank: 3 }, team_b: { id: 't-6', name: 'Team Pulse', url: 'pulse.xtest.io', score: 71.0, cvr: 10.5, sessions: 5700, rank: 6 } },
    { round: 1, team_a: { id: 't-4', name: 'Team Apex', url: 'apex.xtest.io', score: 79.8, cvr: 11.9, sessions: 6100, rank: 4 }, team_b: { id: 't-5', name: 'Team Zenith', url: 'zenith.xtest.io', score: 75.3, cvr: 11.0, sessions: 5900, rank: 5 } },
    { round: 2, team_a: { id: 't-1', name: 'Team Falcon', url: 'falcon.xtest.io', score: 94.2, cvr: 14.8, sessions: 7400, rank: 1 }, team_b: { id: 't-2', name: 'Team Storm', url: 'storm.xtest.io', score: 87.4, cvr: 13.1, sessions: 7100, rank: 2 } },
    { round: 2, team_a: { id: 't-3', name: 'Team Nova', url: 'nova.xtest.io', score: 82.1, cvr: 12.4, sessions: 6600, rank: 3 }, team_b: { id: 't-4', name: 'Team Apex', url: 'apex.xtest.io', score: 79.8, cvr: 11.9, sessions: 6300, rank: 4 } },
  ],
}

// ─── Store types ─────────────────────────────────────────────────────────────

export type NavSection = 'dashboard' | 'ab' | 'champion' | 'admin'
export type NavPage =
  | 'dashboard'
  | 'experiments' | 'experiment-cockpit' | 'analytics' | 'variant-designer' | 'ai-insights'
  | 'tournaments' | 'brackets' | 'leaderboard' | 'team-detail' | 'ai-coach'
  | 'users' | 'settings' | 'integrations'

interface AppState {
  activePage: NavPage
  selectedExperimentId: string | null
  selectedChallengeId: string | null
  selectedTeamId: string | null
  experiments: Experiment[]
  challenges: Challenge[]
  teams: Team[]
  leaderboard: LeaderboardRow[]
  bracket: BracketData
  analyticsMap: Record<string, ExperimentAnalytics>
  liveSessionCount: number
  liveEvents: number

  setPage: (page: NavPage) => void
  selectExperiment: (id: string | null) => void
  selectChallenge: (id: string | null) => void
  selectTeam: (id: string | null) => void
  addExperiment: (exp: Experiment) => void
  addChallenge: (ch: Challenge) => void
  updateExperimentStatus: (id: string, status: Experiment['status']) => void
  tickLive: () => void
}

export const useStore = create<AppState>((set) => ({
  activePage: 'dashboard',
  selectedExperimentId: null,
  selectedChallengeId: null,
  selectedTeamId: null,
  experiments: EXPERIMENTS,
  challenges: CHALLENGES,
  teams: TEAMS,
  leaderboard: LEADERBOARD,
  bracket: BRACKET,
  analyticsMap: EXPERIMENT_ANALYTICS,
  liveSessionCount: 43820,
  liveEvents: 0,

  setPage: (page) => set({ activePage: page }),
  selectExperiment: (id) => set({ selectedExperimentId: id }),
  selectChallenge: (id) => set({ selectedChallengeId: id }),
  selectTeam: (id) => set({ selectedTeamId: id }),

  addExperiment: (exp) => set((s) => ({ experiments: [exp, ...s.experiments] })),
  addChallenge: (ch) => set((s) => ({ challenges: [ch, ...s.challenges] })),

  updateExperimentStatus: (id, status) =>
    set((s) => ({
      experiments: s.experiments.map((e) => (e.id === id ? { ...e, status } : e)),
    })),

  tickLive: () =>
    set((s) => ({
      liveSessionCount: s.liveSessionCount + Math.floor(Math.random() * 8 + 1),
      liveEvents: s.liveEvents + 1,
    })),
}))
