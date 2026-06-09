# XTest Portal — Full Feature Reference

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Frontend Pages](#3-frontend-pages)
4. [Frontend Components](#4-frontend-components)
5. [State Management](#5-state-management)
6. [Data Types & Interfaces](#6-data-types--interfaces)
7. [API Client](#7-api-client)
8. [Theme System](#8-theme-system)
9. [Backend — Application Entry](#9-backend--application-entry)
10. [Backend — Data Models](#10-backend--data-models)
11. [Backend — Schemas & Validation](#11-backend--schemas--validation)
12. [Backend — API Routers (Endpoints)](#12-backend--api-routers-endpoints)
13. [Backend — Services](#13-backend--services)
14. [Client-Side Snippet](#14-client-side-snippet)
15. [Seeded Demo Data](#15-seeded-demo-data)
16. [Key End-to-End Workflows](#16-key-end-to-end-workflows)

---

## 1. Project Overview

**XTest** is a full-stack A/B testing and competitive challenge platform. It provides:

- A/B experiment lifecycle management (create → run → analyse → conclude)
- Real-time live monitoring of running experiments
- AI-generated verdicts and strategic coaching (via Anthropic Claude)
- Competitive "Challenge Champion" mode with tournament brackets and leaderboards
- Advanced analytics: funnels, segment breakdowns, statistical confidence
- RBAC, API token management, audit logging, and rate limiting
- An embeddable JavaScript snippet for client-side variant assignment and event tracking

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts 2 |
| Global state | Zustand 4 |
| Server state / caching | TanStack React Query 5 |
| HTTP client | Axios |
| Icons | lucide-react |
| Backend framework | FastAPI |
| ORM | SQLAlchemy (sync) |
| Database | SQLite (in-memory, seeded on startup) |
| AI integration | Anthropic Claude API (claude-sonnet-4-5) with mock fallback |
| Real-time | WebSocket (FastAPI) |

---

## 3. Frontend Pages

All pages are rendered inside the main shell (Sidebar + Topbar). Navigation is driven by the `activePage` key in the Zustand store — there is no URL router.

---

### 3.1 Dashboard (`dashboard`)

**Purpose:** Executive overview / control room.

**Sections:**
- Welcome banner with gradient and subtitle
- **6 KPI stat cards** — Running Experiments, Total Sessions, Avg Lift %, Winning Variants, Challenges Running, Current Leaderboard Leader
- **Session Volume area chart** (last 7 days, sessions + conversions overlaid, via Recharts)
- **Experiment Lift bar chart** — per-experiment leading lift % vs control
- **Running experiments list** — inline status badge, leading lift, and quick action link to Live Cockpit
- **Live Activity Feed** — 6 most recent events with timestamps and icons

**Live data:** Session count increments every 3 s via `tickLive()`.

---

### 3.2 Experiments (`experiments`)

**Purpose:** Browse, search, filter, and manage all A/B experiments.

**Features:**
- Full-text search across experiment name and URL
- Filter tabs: **All / Running / Paused / Concluded / Draft** with per-tab counts
- Table columns: Name, Status (colour-coded badge with animated pulse), Goal Metric, Total Sessions, Variant Count, Leading Lift %, Actions
- Row actions: **View in Cockpit**, **Pause** (if running), **Resume** (if paused)
- **New Experiment** button opens `NewExperimentModal`

---

### 3.3 Live Cockpit (`experiment-cockpit`)

**Purpose:** Real-time deep-dive into a single running experiment.

**Sections:**
- Experiment selector (running experiments only, with live pulse indicator)
- **Headline metrics row:** Total Sessions, Traffic Allocated %, Days Running, Estimated Days Left
- **Statistical Confidence gauge** — radial Recharts chart with threshold line at configured value (e.g. 95 %)
- **Confidence-over-time line chart** — historical confidence progression
- **AI Verdict card** — hypothesis confirmed/rejected badge, winner variant, bullet-point key insights, next-test ideas
- **Variant Performance grid** — per-variant: CVR %, Session count, Lift % vs control, Confidence progress bar
- **Segment Breakdown grid** — split by `device` and `user_type` segments; winner variant and lift per segment

---

### 3.4 Analytics Hub (`analytics`)

**Purpose:** Deep analytics across multiple dimensions for any experiment.

**Experiment selector:** Dropdown at the top switches context for all tabs.

**Tabs:**
| Tab | Content |
|---|---|
| Metrics | Total Sessions card, Overall CVR, Statistical Confidence, Days Running + Conversion Rate Over Time area chart (control vs variant lines) |
| Funnels | 5-stage conversion funnel bar chart (Visitors → Purchase) with calculated lift % per stage |
| Segments | Device-split pie chart + tabular segment breakdowns (mobile / desktop / tablet; new / returning / enterprise / SMB) with fill bars |
| Confidence | Per-variant confidence progress bars (≥95 % green, ≥80 % amber, <80 % blue) |

---

### 3.5 AI Insights (`ai-insights`)

**Purpose:** Aggregated AI-generated recommendations, risks, and future test ideas.

**Sections:**
- **Summary stats row** — 4 metric cards: Active Recommendations, Hypotheses Reviewed, Risk Areas Detected, Future Tests Suggested
- **Insight cards** — 5 cards, each with type icon, title, summary, tag pills, and action buttons. Types: `hypothesis`, `recommendation`, `risk`, `future`
- **Concluded Experiment Analysis** — For each concluded experiment: verdict confirmation status, synthesis summary paragraph, numbered next-test suggestions

**Card colour coding:** blue (hypothesis), green (recommendation), amber (risk), purple (future), teal (secondary recommendation)

---

### 3.6 AI Coach (`ai-coach`)

**Purpose:** Strategic guidance for teams competing in a Challenge tournament.

**Features:**
- Challenge selector tabs (non-draft challenges only)
- **Predicted Outcome** box — gradient card with the AI's outcome prediction and a confidence badge (high / medium / low)
- **Gap Analysis** section — prose paragraph explaining the current gap vs competitors
- **3-column strategy cards:**
  - Quick Wins (green) — high-impact, fast to implement
  - Strategic Tests (blue) — longer-horizon experiments
  - Risk Moves (red) — aggressive bets
- Each item is numbered with a short description

**Data source:** `Challenge.ai_analysis` (type `AIChampionAnalysis`)

---

### 3.7 Leaderboard (`leaderboard`)

**Purpose:** Cross-team performance rankings.

**Sections:**
- **Podium view** — top 3 teams highlighted (gold / silver / bronze styling)
- **Full rankings table** — Rank badge, Team name, Composite Score, CVR %, Sessions, Trend delta (up/down arrow with colour)
- **Score Distribution** — horizontal bar chart for top 6 teams
- Click a team row to navigate to Team Detail page

---

### 3.8 Brackets (`brackets`)

**Purpose:** Tournament bracket visualisation.

**Features:**
- Challenge selector (running challenges only)
- Round indicator pills at top (Round X of Y)
- **Horizontally scrollable bracket** — each round is a column; each match is a card showing Team A vs Team B with winner highlighted
- "Live Match" badge on the current active round
- **Score comparison bars** — side-by-side fill bars for Team A and Team B within each match card
- Trophy icon placeholder for the Final slot

---

### 3.9 Tournaments (`tournaments`)

**Purpose:** View and manage all challenges/tournaments.

**Features:**
- Challenge card grid (2 columns on md+)
- Each card: Name, Status badge, 3 stats (Teams, Current Round, Top Score), Leader info bar with trophy icon
- **New Tournament** button opens a modal form with fields: Name, Total Rounds, Description
- Status colour coding: running / open / concluded / draft

---

### 3.10 Variant Designer (`variant-designer`)

**Purpose:** Visual WYSIWYG editor for experiment variants.

**Layout:** 4-column grid — 1 column editor panel, 3 columns preview area.

**Editor panel:**
- Variant picker buttons (switch between variants)
- Form fields: Headline text, CTA button text, CTA colour (native colour picker), Background colour (native colour picker)
- Save & Preview button

**Preview area:**
- Device switcher: Desktop / Tablet / Mobile (changes preview frame width)
- Side-by-side preview cards per variant (browser chrome mockup)
- Traffic allocation bar chart below all previews

---

### 3.11 Team Detail (`team-detail`)

**Purpose:** Per-team performance deep-dive.

**Sections:**
- Team header: avatar initials, name, URL, member pills
- 4 KPI cards: CVR %, Total Sessions, Latest Score, Team Size
- **Score Progression area chart** — score over rounds/time
- 2-column panels: Strengths (green) and Improvement Areas (amber)
- Back link to Leaderboard

---

### 3.12 Admin — Users & Roles (`admin/users`)

**Features:**
- 3 role overview cards: Admin / Experimenter / Viewer with member counts
- User search input
- Users table: Name, Email, Role badge, Team, Status (active / inactive), Edit action button
- Invite User button

---

### 3.13 Admin — Settings (`admin/settings`)

**5 configuration sections:**

| Section | Controls |
|---|---|
| Appearance | Theme select, Primary Color picker |
| Notifications | Email alerts toggle, Weekly digest toggle, Tournament updates toggle |
| Security | 2FA toggle, Session timeout (number, minutes) |
| Data | Traffic allocation % (range), Confidence threshold % (range), Minimum sessions (number) |
| Platform | Organisation name (text), Timezone (select) |

- Save Settings button

---

### 3.14 Admin — Integrations (`admin/integrations`)

**Features:**
- Status summary: X connected, Y available
- **8 integration cards:** Google Analytics 4, Segment, Slack, Mixpanel, Amplitude, Datadog, Webhook, Jira
  - Each shows: logo, name, short description, Connect button or "Connected" badge + last-sync timestamp
- **API Keys table:** Name, masked key value, Created date, Last used, Revoke action button
- New API Key button

---

## 4. Frontend Components

### 4.1 Shell

#### Sidebar (`src/components/shell/Sidebar.tsx`)
- Dark-themed sidebar (bg `#0D1117`)
- XTest brand header + version
- Green "Operational" live status indicator
- **4 navigation groups:**
  1. (ungrouped) Dashboard
  2. A/B Testing: Experiments, Live Cockpit, Analytics Hub, Variant Designer, AI Insights
  3. Challenge Champion: Tournaments, Brackets, Leaderboard, Team Performance, AI Coach
  4. Administration: Users & Roles, Settings, Integrations
- Badges on nav items showing counts and/or live pulse dots
- User profile footer (avatar initials + team name)
- Active item styled with blue background + right-side chevron

#### Topbar (`src/components/shell/Topbar.tsx`)
- Sticky header with current page title + subtitle (from `PAGE_TITLES` map)
- Centre search input (visible at md breakpoint and above)
- Right section: live experiment count (with pulse), session count display, AI Insights button (amber), notification bell (red dot)

---

### 4.2 A/B Testing Components

#### ExperimentDetail (`src/components/ab/ExperimentDetail.tsx`)
- Slide-up animated modal overlay
- Gradient accent bar header
- Status badge, goal metric tag, creation date, external link icon
- 4 KPI cells: Variant count, Total sessions, Leading lift, Target progress %
- Hypothesis text block (blue card with Target icon)
- Two-tab body: **Variant Performance** tab, **Segment Breakdown** tab
- Loading spinner while analytics are fetching
- **AI Verdict section:**
  - Regenerate Synthesis button
  - Hypothesis confirmed / rejected badge
  - Verdict summary paragraph
  - Numbered next-test suggestions
- Close (X) button

#### HypothesisBuilder (`src/components/ab/HypothesisBuilder.tsx`)
- Toggle between **Free** mode (textarea + preview) and **Guided** mode
- **Guided mode inputs:**
  - Element — free text + suggestion chips
  - Change description — free text + suggestion chips
  - Metric — select dropdown (conversion / click / scroll)
  - Magnitude — button group (5% / 10% / 15% / 20% / 25%)
  - Reason — optional free text
- Live-generated hypothesis preview in gradient box: *"By [change] the [element], we will increase [metric] by [magnitude] because [reason]."*
- "Use It" button to commit hypothesis to parent form

#### NewExperimentModal (`src/components/ab/NewExperimentModal.tsx`)
- Modal overlay with labelled form
- **Fields:** Name (3–120 chars), Target URL, Hypothesis (textarea), Goal Metric (select), Minimum Sessions (number ≥ 100)
- **Sliders:** Confidence Threshold (80–99 %), Traffic Allocation (10–100 %)
- Client-side validation (name length, URL format)
- Create / Cancel buttons

#### ExperimentTable (`src/components/ab/ExperimentTable.tsx`)
- Tabular list of experiments
- Sortable / filterable rows fed from store

#### VariantPerformance (`src/components/ab/VariantPerformance.tsx`)
- Per-variant stats block (CVR, sessions, lift, confidence bar)

#### SegmentBreakdown (`src/components/ab/SegmentBreakdown.tsx`)
- Grid of segment results (device, user_type) with winner badge and lift %

#### ABTestingTab (`src/components/ab/ABTestingTab.tsx`)
- Container tab wrapper for the A/B section

---

### 4.3 Champion Components

#### BracketView (`src/components/champion/BracketView.tsx`)
- Renders `BracketData` as a multi-column horizontally scrollable bracket
- Each `BracketPair` becomes a match card with winner highlighting

#### ChallengerCard (`src/components/champion/ChallengerCard.tsx`)
- Summary card for a team inside a challenge: name, rank, score, CVR, sessions

#### ChampionTab (`src/components/champion/ChampionTab.tsx`)
- Container tab wrapper for the Challenge Champion section

#### Leaderboard (`src/components/champion/Leaderboard.tsx`)
- Ranked list component with podium and table views

#### NewChallengeModal (`src/components/champion/NewChallengeModal.tsx`)
- Modal form to create a new tournament challenge

#### ScoreBar (`src/components/champion/ScoreBar.tsx`)
- Horizontal fill bar for comparing two team scores side-by-side

---

### 4.4 Shared / UI Components

| Component | Purpose |
|---|---|
| `Badge` | Status pill with animated pulse dot (live / running / paused / concluded / draft / winner / open) |
| `MetricCard` | KPI card with gradient icon, value, delta indicator, optional sparkline, and coloured accent strip |
| `ConfidencePill` | Small pill showing confidence percentage with colour coding |
| `EmptyState` | Generic empty-state placeholder with icon, title, and description |
| `Modal` | Reusable overlay wrapper with backdrop, close button, and slot for content |
| `ProgressBar` | Generic fill bar with configurable colour and label |
| `SparklineBar` | Miniature inline bar chart for trend indicators |
| `AiInsightBox` | Styled card container for AI-generated insight content |

---

## 5. State Management

### 5.1 Main App Store (`src/data/store.ts`) — Zustand

**State shape:**

| Field | Type | Description |
|---|---|---|
| `activePage` | `NavPage` | Currently rendered page key |
| `selectedExperimentId` | `string \| null` | Experiment selected for detail/cockpit |
| `selectedChallengeId` | `string \| null` | Challenge selected for bracket/coach |
| `selectedTeamId` | `string \| null` | Team selected for detail page |
| `experiments` | `Experiment[]` | All experiments (6 seeded) |
| `challenges` | `Challenge[]` | All challenges (4 seeded) |
| `teams` | `Team[]` | All teams (10 seeded) |
| `leaderboard` | `LeaderboardRow[]` | Ranked rows (8 seeded) |
| `bracket` | `BracketData` | Bracket for Q2 Conversion Sprint |
| `analyticsMap` | `Record<string, ExperimentAnalytics>` | Analytics keyed by experiment ID |
| `liveSessionCount` | `number` | Current session counter (starts 43,820) |
| `liveEvents` | `number` | Event counter |

**Actions:**

| Action | Signature | Description |
|---|---|---|
| `setPage` | `(page: NavPage) => void` | Navigate to a page |
| `selectExperiment` | `(id: string) => void` | Set active experiment |
| `selectChallenge` | `(id: string) => void` | Set active challenge |
| `selectTeam` | `(id: string) => void` | Set active team |
| `addExperiment` | `(exp: Experiment) => void` | Append experiment to list |
| `addChallenge` | `(ch: Challenge) => void` | Append challenge to list |
| `updateExperimentStatus` | `(id, status) => void` | Patch status in-place |
| `tickLive` | `() => void` | Increment session count + events (called every 3 s by `App.tsx`) |

---

### 5.2 Portal Store (`src/store/usePortalStore.ts`) — Zustand

Lighter store for tab-scoped UI state.

| Field | Type | Description |
|---|---|---|
| `activeTab` | `'ab' \| 'champion'` | Top-level section tab |
| `selectedExperimentId` | `string \| null` | — |
| `selectedChallengeId` | `string \| null` | — |
| `liveEvents` | `Record<string, number>` | Live event count per experiment |

**Actions:** `setTab`, `selectExperiment`, `selectChallenge`, `incrementLiveEvent`

---

## 6. Data Types & Interfaces

Defined in `src/types/index.ts`.

### 6.1 Experiment Domain

```
Experiment
  id, name, url, status, hypothesis, goal_metric
  traffic_pct, min_sessions, confidence_threshold
  created_at, concluded_at, ai_verdict (AIVerdict | null)
  variant_count, total_sessions, leading_lift

AIVerdict
  hypothesis_confirmed (bool), verdict_summary, winner_variant
  key_insights[], key_segments[], next_tests[]
  confidence_level ('high' | 'medium' | 'low'), raw_analysis

Variant
  id, experiment_id, key, name, description, traffic_weight
  alpha, beta (Bayesian priors), changes (VariantChange[])
  impressions, conversions, cvr

VariantChange
  selector, property, value

VariantStats
  variant_id, variant_key, variant_name
  impressions, conversions, cvr, traffic_weight
  lift_vs_control, confidence

SegmentStats
  segment, value, winner_variant, lift

ExperimentAnalytics
  experiment_id, total_sessions, overall_confidence
  leading_variant, variant_stats[], segment_breakdown{}
  days_running, estimated_days_remaining

ExperimentCreate
  name, url, hypothesis?, goal_metric, min_sessions
  confidence_threshold, traffic_pct
```

### 6.2 Challenge Domain

```
Challenge
  id, name, status, current_round, total_rounds
  team_count, top_team, top_score, ai_analysis (AIChampionAnalysis | null)

AIChampionAnalysis
  gap_analysis (string), quick_wins[], strategic_tests[], risk_moves[]
  predicted_outcome (string), confidence ('high' | 'medium' | 'low')

Team
  id, challenge_id, name, url, members[], latest_score, rank

BracketData
  challenge_id, name, current_round, total_rounds, status, bracket[]

BracketPair
  round, team_a (BracketTeam | null), team_b (BracketTeam | null)

BracketTeam
  id, name, url, score, cvr, sessions, rank

LeaderboardRow
  team_id, team_name, team_url
  composite_score, cvr, session_count, rank, delta

ChallengeCreate
  name, description?, scoring_config {cvr_weight, engagement_weight, session_volume_weight}
  total_rounds, start_date?, end_date?
```

### 6.3 Security Domain

```
Permission
  id, name, resource, action, description

Role
  id, name, description, permissions[]

RoleCreate
  name, description?, permission_ids[]

APIToken
  id, name, prefix, scopes[], is_active, last_used, expires_at, created_at

APITokenCreated extends APIToken
  token  (full raw token — shown only at creation)

APITokenCreate
  name, scopes[], expires_at?

AuditLog
  id, user_id, action, resource, resource_id
  details, ip_address, status, created_at

RateLimitStatus
  key, count, window_end?, active_window
```

---

## 7. API Client

`src/api/client.ts` — Axios instance.

- **Base URL:** `/api`
- **Request interceptor:** Injects `X-API-Token` header from `sessionStorage._xt_api_token` if present
- **Response interceptor:** Logs errors to console

**`securityApi` object (typed helper methods):**

| Method | HTTP | Path |
|---|---|---|
| `listPermissions()` | GET | `/security/permissions` |
| `listRoles()` | GET | `/security/roles` |
| `getRole(id)` | GET | `/security/roles/:id` |
| `createRole(data)` | POST | `/security/roles` |
| `deleteRole(id)` | DELETE | `/security/roles/:id` |
| `assignRole(userId, data)` | POST | `/security/users/:userId/roles` |
| `removeRole(userId, roleId)` | DELETE | `/security/users/:userId/roles/:roleId` |
| `getUserPermissions(userId)` | GET | `/security/users/:userId/permissions` |
| `listTokens()` | GET | `/security/tokens` |
| `createToken(data)` | POST | `/security/tokens` |
| `revokeToken(id)` | DELETE | `/security/tokens/:id` |
| `listAuditLogs(params)` | GET | `/security/audit-logs` |
| `checkRateLimit(data)` | POST | `/security/rate-limit/check` |
| `getRateLimitStatus(key)` | GET | `/security/rate-limit/status?key=` |

**React Query hooks (`src/api/hooks/`):**
- `useExperiments` — fetches experiment list
- `useAnalytics` — fetches analytics for a given experiment ID
- `useChallenges` — fetches challenge list
- `useLeaderboard` — fetches leaderboard rows

---

## 8. Theme System

`src/theme.ts` — shared design tokens.

| Token group | Description |
|---|---|
| `colors.primary` | 10-shade blue ramp (50–900) |
| `colors.teal` | 10-shade teal ramp |
| `colors.amber` | 10-shade amber ramp |
| `colors.green` | 10-shade green ramp |
| `colors.red` | 10-shade red ramp |
| `colors.neutral` | 10-shade gray ramp |
| `statusColors` | Per-status colours: running, paused, concluded, draft, live, completed |
| `shadows` | `card`, `cardMd`, `glow` |
| `gradients` | `ab` (blue→cyan), `champion` (teal→green), `gold`, `silver`, `bronze`, `header` |
| `typography` | Inter font; weights 400–800; sizes xs–3xl |
| `spacing` | Base 8 px; scale up to `2xl` (48 px) |

---

## 9. Backend — Application Entry

`backend/main.py`

- **Framework:** FastAPI
- **Lifespan hook:** Creates all DB tables and seeds demo data on startup
- **CORS:** Allows origins `localhost:5173`, `localhost:3000`, and `*` (wildcard)
- **Global middleware:** Rate limiting — 300 requests per minute per client IP; returns HTTP 429 on breach
- **Health check:** `GET /api/health` → `{status: "ok", db: "sqlite", tables: [...], ...}`

**Mounted routers:**

| Prefix | Module |
|---|---|
| `/api/experiments` | `routers.experiments` |
| `/api/variants` | `routers.variants` |
| `/api/events` | `routers.events` |
| `/api/analytics` | `routers.analytics` |
| `/api/challenges` | `routers.challenges` |
| `/api/teams` | `routers.teams` |
| `/api/leaderboard` | `routers.leaderboard` |
| `/api/ai` | `routers.ai` |
| `/api/security` | `routers.security` |
| `/api/ws` | `routers.websocket` |

---

## 10. Backend — Data Models

`backend/models.py` — SQLAlchemy ORM models (SQLite).

### User
`id` (UUID PK), `name`, `email` (unique), `initials`, `created_at`

### Experiment
`id`, `name`, `url`, `status` (enum), `hypothesis`, `goal_metric` (enum), `traffic_pct`, `min_sessions`, `max_sessions`, `confidence_threshold`, `created_at`, `concluded_at`, `ai_verdict` (JSON text), `owner_id` (FK → User)
Relations: `variants` (cascade delete), `events`

### Variant
`id`, `experiment_id` (FK), `key`, `name`, `description`, `traffic_weight`, `alpha` (Bayesian α), `beta` (Bayesian β), `changes` (JSON text — array of VariantChange), `created_at`
Relation: `experiment`

### SessionAssignment
Composite PK (`fingerprint` + `experiment_id`), `variant_id` (FK), `assigned_at`
Used for deterministic re-assignment: same fingerprint always gets the same variant.

### Event
`id`, `experiment_id` (FK), `variant_id` (FK), `fingerprint`, `event_type` (enum), `metadata_` (JSON), `device_type`, `country`, `is_new_user`, `session_depth`, `created_at`

### Challenge
`id`, `name`, `description`, `status` (enum), `scoring_config` (JSON), `total_rounds`, `current_round`, `start_date`, `end_date`, `ai_analysis` (JSON), `owner_id`, `created_at`
Relations: `teams`, `round_results` (cascade delete)

### Team
`id`, `challenge_id` (FK), `name`, `url`, `members` (JSON), `experiment_id` (FK → Experiment), `created_at`

### RoundResult
`id`, `challenge_id`, `team_id`, `round_number`, `cvr`, `engagement_score`, `session_count`, `composite_score`, `rank`, `computed_at`

### Role *(RBAC)*
`id`, `name` (unique), `description`, `created_at`
Relations: `permissions` (via RolePermission), `user_roles`

### Permission *(RBAC)*
`id`, `name` (unique), `resource`, `action`, `description`

### RolePermission, UserRole *(RBAC)*
Association tables for the many-to-many Role ↔ Permission and User ↔ Role relationships.

---

## 11. Backend — Schemas & Validation

`backend/schemas.py` — Pydantic v2 schemas.

### Enums
- `ExperimentStatus`: draft | running | paused | concluded
- `GoalMetric`: conversion | click | scroll
- `EventType`: impression | conversion | click | scroll
- `ChallengeStatus`: draft | open | running | concluded

### Experiment
- `ExperimentCreate` — `name` (3–120 chars), `url`, `hypothesis?`, `goal_metric`, `traffic_pct` (0.01–1.0), `min_sessions` (≥ 100), `max_sessions?`, `confidence_threshold` (0.80–0.99)
- `ExperimentUpdate` — `name?`, `status?`, `hypothesis?`
- `ExperimentOut` — all fields + computed `variant_count`, `total_sessions`, `leading_lift`; uses `model_config = ConfigDict(from_attributes=True)`

### Variant
- `VariantChange` — `selector`, `property`, `value`
- `VariantCreate` — `experiment_id`, `key` (pattern `^[a-z0-9_]+$`), `name`, `description?`, `changes[]`
- `VariantOut` — all fields + computed `impressions`, `conversions`, `cvr`

### Event
- `EventIngest` — `experiment_id`, `variant_id`, `fingerprint`, `event_type`, `metadata?`, `device_type?`, `country?`, `is_new_user`, `session_depth`

### Analytics
- `ExperimentAnalytics` — `experiment_id`, `total_sessions`, `overall_confidence`, `leading_variant`, `variant_stats[]`, `segment_breakdown{}`, `days_running`, `estimated_days_remaining`

### Challenge
- `ChallengeCreate` — `name`, `description?`, `scoring_config` (nested object), `total_rounds`, `start_date?`, `end_date?`
- `ChallengeOut` — all fields + computed `team_count`, `top_team`, `top_score`, `ai_analysis?`

---

## 12. Backend — API Routers (Endpoints)

### 12.1 Experiments — `/api/experiments`

| Method | Path | Description |
|---|---|---|
| `POST` | `/` | Create experiment; auto-creates control variant |
| `GET` | `/` | List all experiments (newest first) |
| `GET` | `/{exp_id}` | Get single experiment with enriched fields |
| `PATCH` | `/{exp_id}` | Update name / status / hypothesis; sets `concluded_at` when concluding |
| `DELETE` | `/{exp_id}` | Delete experiment + cascade (variants, events) |
| `GET` | `/{exp_id}/assign?fp={fingerprint}` | Assign visitor to a variant via Bayesian Bandit; returns variant + DOM `changes[]` |

### 12.2 Variants — `/api/variants`

| Method | Path | Description |
|---|---|---|
| `POST` | `/` | Create variant for an experiment |
| `GET` | `/{exp_id}` | List variants for an experiment |
| `PATCH` | `/{variant_id}` | Update variant fields |
| `DELETE` | `/{variant_id}` | Delete variant |

### 12.3 Events — `/api/events`

| Method | Path | Description |
|---|---|---|
| `POST` | `/` | Ingest a single event (HTTP 202) |

**Event processing logic:**
- **impression:** increments `beta` (denominator) on all variants except the one seen — Bayesian update for "missed opportunity"
- **conversion:** increments `alpha` (numerator) on the converting variant — Bayesian update for success

### 12.4 Analytics — `/api/analytics`

| Method | Path | Description |
|---|---|---|
| `GET` | `/{exp_id}` | Full analytics for an experiment |

**Computed fields:**
- CVR per variant: `conversions / impressions`
- Lift vs control: `(variant_cvr − control_cvr) / control_cvr × 100`
- Per-variant confidence: calls `SignificanceEngine.compute_confidence()`
- Segment breakdown: by `device_type` and inferred `user_type`
- Estimated days remaining: `(min_sessions − total_sessions) / daily_rate`

### 12.5 Challenges — `/api/challenges`

| Method | Path | Description |
|---|---|---|
| `POST` | `/` | Create challenge |
| `GET` | `/` | List challenges |
| `GET` | `/{challenge_id}` | Get challenge with computed fields |
| `PATCH` | `/{challenge_id}/status` | Update challenge status |
| `GET` | `/{challenge_id}/bracket` | Build and return bracket pairs from current round results |

### 12.6 Teams — `/api/teams`

| Method | Path | Description |
|---|---|---|
| `POST` | `/` | Create team and attach to challenge |
| `GET` | `/?challenge_id=` | List teams for a challenge |
| `GET` | `/{team_id}` | Get single team |
| `DELETE` | `/{team_id}` | Delete team |

### 12.7 Leaderboard — `/api/leaderboard`

| Method | Path | Description |
|---|---|---|
| `GET` | `/?challenge_id=` | Get ranked leaderboard rows for a challenge |
| `POST` | `/compute` | Trigger score computation for a challenge round |

### 12.8 AI — `/api/ai`

| Method | Path | Description |
|---|---|---|
| `POST` | `/synthesise/{exp_id}` | Generate / refresh AI verdict for an experiment |
| `POST` | `/champion/{challenge_id}/{team_id}` | Generate champion strategy for a team in a challenge |

### 12.9 Security — `/api/security`

**RBAC:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/permissions` | List all permissions |
| `GET` | `/roles` | List all roles |
| `GET` | `/roles/{role_id}` | Get role with its permissions |
| `POST` | `/roles` | Create role with list of permission IDs |
| `DELETE` | `/roles/{role_id}` | Delete role |
| `POST` | `/users/{user_id}/roles` | Assign role to user |
| `DELETE` | `/users/{user_id}/roles/{role_id}` | Remove role from user |
| `GET` | `/users/{user_id}/permissions` | Get effective permissions for user |

**Token Management:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/tokens` | List API tokens (masked) |
| `POST` | `/tokens` | Create token with scopes; returns full token value once |
| `DELETE` | `/tokens/{token_id}` | Revoke token |

**Audit & Rate Limiting:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/audit-logs` | List audit logs (filterable by `resource`, `user_id`) |
| `POST` | `/rate-limit/check` | Check whether a key+action is within limits |
| `GET` | `/rate-limit/status?key=` | Get current rate limit state for a key |

### 12.10 WebSocket — `/api/ws`

| Path | Description |
|---|---|
| `ws/live` | Persistent connection; broadcasts real-time updates for experiment status changes and variant performance |

---

## 13. Backend — Services

### 13.1 AI Synthesis (`backend/services/ai_synthesis.py`) — `AIService`

**`synthesize_experiment(exp_data, variant_stats) → dict`**
- Builds a structured prompt with experiment metadata and variant performance
- Calls Anthropic Claude API (`claude-sonnet-4-5`)
- Parses JSON response into: `hypothesis_confirmed`, `verdict_summary`, `winner_variant`, `key_insights[]`, `key_segments[]`, `next_tests[]`, `confidence_level`, `raw_analysis`
- Falls back to a deterministic mock response if `ANTHROPIC_API_KEY` is not set

**`champion_strategy(challenge_data, team_data, competitor_data) → dict`**
- Builds a competitive analysis prompt
- Returns: `gap_analysis`, `quick_wins[]`, `strategic_tests[]`, `risk_moves[]`, `predicted_outcome`, `confidence`

---

### 13.2 Significance Engine (`backend/services/significance.py`) — `SignificanceEngine`

**`compute_confidence(n_treatment, conv_treatment, n_control, conv_control) → float`**
- Two-proportion z-test for A/B conversion rates
- Requires both groups have n ≥ 30; returns 0.0 otherwise
- Uses `scipy.stats.norm.cdf` if available; otherwise uses the Abramowitz & Stegun normal CDF approximation
- Returns `1 − p_value` (i.e. confidence/credibility, 0.0–1.0)

**`minimum_sample_size(baseline_cvr, mde, alpha=0.05, power=0.80) → int`**
- Computes required sample size per variant using the standard power formula with z-scores

---

### 13.3 Bayesian Bandit (`backend/services/bandit.py`) — `BayesianBandit`

**`assign(variants) → variant_id`**
- Implements Thompson Sampling: treats each variant as a Beta(α, β) distribution
- Draws one sample per variant; selects the variant with the highest draw
- Exploration is implicit (variants with fewer observations have higher variance, so they get selected more often early on)
- Returns the `id` of the selected variant

---

### 13.4 Scoring Engine (`backend/services/scoring.py`) — `ScoringEngine`

**`compute(team, experiment, config, db) → dict`**
- Calculates the composite tournament score for a team in a round
- **CVR component:** `best_variant_cvr × 100 × cvr_weight × 100`
- **Engagement component:** `avg_scroll_depth × engagement_weight`
- **Volume component:** `min(total_sessions / 1000, 100) × session_volume_weight`
- Default weights: CVR 60 %, Engagement 25 %, Volume 15 %
- Returns: `{cvr, engagement_score, session_count, composite_score}`

---

### 13.5 RBAC Service (`backend/services/rbac.py`)

**`check_rate_limit(key, limit, window_seconds, db) → (allowed: bool, remaining: int)`**
- Per-key sliding-window rate limiting stored in the `RateLimit` DB table
- Used internally by the Security router

---

### 13.6 Fingerprinting Service (`backend/services/fingerprint.py`)

- Generates a stable, deterministic visitor fingerprint from: User-Agent, screen resolution, language, timezone, session token
- Hashes components with the **DJB2** algorithm
- Returned as a hex string; used as the `fingerprint` field in event ingestion and assignment

---

## 14. Client-Side Snippet

`snippet/xtest-snippet.js` — drop-in JavaScript tag for customer websites.

**Initialisation:**
- Reads the `data-experiments` attribute of the `<script>` tag (comma-separated experiment IDs)
- Auto-calls `assignAndApply()` for each experiment on load

### Fingerprinting
- Collects: User-Agent, screen resolution, navigator language, timezone offset, `sessionStorage` session token
- Hashes with DJB2 to produce a stable hex fingerprint
- Stored in `sessionStorage._xt_token`

### Variant Assignment
- `assignAndApply(experimentId)`:
  1. Fetches `GET /api/experiments/{expId}/assign?fp={fingerprint}`
  2. Parses `{variant_id, changes[]}` from response
  3. Applies each change to the DOM — supports: `textContent`, `style.*`, `setAttribute`, `src`

### Event Tracking
- `sendEvent(payload)`:
  - Prefers `navigator.sendBeacon()` (fire-and-forget)
  - Falls back to `fetch(..., {keepalive: true})`
- **Automatic goals:**
  - `[data-xtest-goal="conversion"]` — fires a `conversion` event on click (once)
  - `[data-xtest-goal="form"]` — fires a `conversion` event on form submit (once)
  - Scroll depth tracker — fires `scroll` events at 25 %, 50 %, 75 %, 100 % thresholds with `session_depth` metadata

### Public API
```js
window.XTest.assign(experimentId)   // Manually trigger assignment + DOM changes
window.XTest.track(payload)         // Manually fire an event
```

---

## 15. Seeded Demo Data

`backend/seed.py` populates the in-memory SQLite database on every startup.

### Experiments (6)

| ID | Name | Status | Variants | Sessions | Leading Lift |
|---|---|---|---|---|---|
| exp-1 | Hero CTA Button Color | running | 3 (Control/Orange/Green) | 14,820 | +9.4 % |
| exp-2 | Pricing Page Layout | running | 2 (Single/Two-column) | 8,420 | +14.2 % |
| exp-3 | Onboarding Flow Step 1 | concluded | 2 (3-field/7-field form) | 22,100 | +18.3 % |
| exp-4 | Dashboard Widget Order | paused | 2 | 3,100 | +3.2 % |
| exp-5 | Email Subject Line | running | 4 (personalisation variants) | 19,800 | +7.1 % |
| exp-6 | Feature Discovery Banner | draft | 2 | 0 | — |

- `exp-1` Analytics: 87.4 % confidence; device segments: Mobile +22.4 %, Desktop +14.2 %, Tablet −1.2 %
- `exp-2` Analytics: 91.2 % confidence
- `exp-3` AI Verdict: confirmed, +18.3 % lift, high confidence

### Challenges (4)

| ID | Name | Status | Round | Teams |
|---|---|---|---|---|
| ch-1 | Q2 Conversion Sprint | running | 2 / 3 | 8 |
| ch-2 | Mobile UX Championship | running | 1 / 4 | 12 |
| ch-3 | Onboarding Funnel Open | concluded | 3 / 3 | 6 |
| ch-4 | Retention Hackathon | draft | — | 0 |

- ch-1 has `ai_analysis` populated (gap analysis, quick wins, strategy)
- ch-1 scoring weights: CVR 60 %, Engagement 25 %, Volume 15 %

### Teams (10 across ch-1 and ch-2)

| Team | Challenge | Rank | Score | Members |
|---|---|---|---|---|
| Team Falcon | ch-1 | 1 | 94.2 | 3 |
| Team Storm | ch-1 | 2 | 87.4 | 2 |
| Team Nova | ch-1 | 3 | 82.1 | 3 |
| ... 7 more | ch-1 / ch-2 | 4–10 | varies | 2–3 |

### Leaderboard (8 rows)

- Composite scores: 62.9 – 94.2
- CVR range: 9.4 % – 14.8 %
- Session counts: 12.1 k – 28.4 k
- Delta values indicate rank change direction (+/−)

---

## 16. Key End-to-End Workflows

### 16.1 A/B Testing Lifecycle

```
1. Experimenter opens New Experiment modal → fills name, URL, hypothesis, goal metric,
   traffic allocation, confidence threshold
2. POST /api/experiments → backend creates Experiment + control Variant (key: "control")
3. Experimenter adds treatment variants via POST /api/variants
4. Snippet is embedded on the target site; assigns visitors via GET /experiments/{id}/assign
   → Bayesian Bandit selects variant → DOM changes applied
5. Snippet fires impression / conversion events → POST /api/events
   → backend increments Bayesian α/β on each Variant row
6. Experimenter monitors Live Cockpit → GET /api/analytics/{id} returns live CVR,
   lift, confidence, segment breakdown
7. When confidence reaches threshold → Experimenter triggers AI verdict via
   POST /api/ai/synthesise/{id} → AIService calls Claude → verdict stored in experiment
8. Experimenter marks experiment as concluded → PATCH /api/experiments/{id}
   → concluded_at stamped
9. AI Insights page surfaces the verdict and next-test suggestions
```

### 16.2 Challenge / Tournament Lifecycle

```
1. Admin creates challenge via POST /api/challenges (name, rounds, scoring weights)
2. Teams register via POST /api/teams (linked to challenge + optional experiment)
3. Challenge status → running (PATCH /api/challenges/{id}/status)
4. Each round: teams run experiments; ScoringEngine computes composite scores via
   POST /api/leaderboard/compute
5. Bracket updates: GET /api/challenges/{id}/bracket builds BracketPair array
   from current round results
6. Leaderboard: GET /api/leaderboard?challenge_id= returns ranked rows
7. AI Coach: POST /api/ai/champion/{challenge_id}/{team_id} → strategy card data
8. Challenge advances rounds until current_round = total_rounds → status → concluded
```

### 16.3 Real-Time Updates

- `App.tsx` calls `tickLive()` every 3 seconds → increments `liveSessionCount` and `liveEvents` in store → Dashboard counters update
- WebSocket `ws/live` (backend) broadcasts experiment status and performance delta messages; frontend subscribes for push-based updates without polling

### 16.4 RBAC / Token Auth Flow

```
1. Admin creates roles via POST /api/security/roles (with permission IDs)
2. Admin assigns roles to users via POST /api/security/users/{uid}/roles
3. Tokens created via POST /api/security/tokens → full token returned once
4. Token stored in sessionStorage; injected as X-API-Token header by Axios interceptor
5. Backend validates token scopes on protected routes
6. All security actions are recorded in AuditLog (GET /api/security/audit-logs)
7. Rate limiting enforced globally (300 req/min/IP) and per-key via RateLimitService
```
