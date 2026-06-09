from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ExperimentStatus(str, Enum):
    draft     = "draft"
    running   = "running"
    paused    = "paused"
    concluded = "concluded"


class GoalMetric(str, Enum):
    conversion = "conversion"
    click      = "click"
    scroll     = "scroll"


# ── Experiments ───────────────────────────────────────────────────────────────

class ExperimentCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=120)
    url: str
    hypothesis: Optional[str] = None
    goal_metric: GoalMetric = GoalMetric.conversion
    traffic_pct: float = Field(1.0, ge=0.01, le=1.0)
    min_sessions: int = Field(1000, ge=100)
    max_sessions: Optional[int] = None
    confidence_threshold: float = Field(0.95, ge=0.80, le=0.99)


class ExperimentUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[ExperimentStatus] = None
    hypothesis: Optional[str] = None


class ExperimentOut(BaseModel):
    id: str
    name: str
    url: str
    status: ExperimentStatus
    hypothesis: Optional[str]
    goal_metric: GoalMetric
    traffic_pct: float
    min_sessions: int
    confidence_threshold: float
    created_at: datetime
    concluded_at: Optional[datetime]
    ai_verdict: Optional[Dict[str, Any]] = None
    variant_count: int = 0
    total_sessions: int = 0
    leading_lift: Optional[float] = None

    class Config:
        from_attributes = True


# ── Variants ─────────────────────────────────────────────────────────────────

class VariantChange(BaseModel):
    selector: str
    property: str
    value: str


class VariantCreate(BaseModel):
    experiment_id: str
    key: str = Field(..., pattern="^[a-z0-9_]+$")
    name: str
    description: Optional[str] = None
    changes: List[VariantChange] = []


class VariantOut(BaseModel):
    id: str
    experiment_id: str
    key: str
    name: str
    description: Optional[str]
    traffic_weight: float
    alpha: float
    beta: float
    changes: List[VariantChange]
    impressions: int = 0
    conversions: int = 0
    cvr: float = 0.0

    class Config:
        from_attributes = True


# ── Events ────────────────────────────────────────────────────────────────────

class EventType(str, Enum):
    impression = "impression"
    conversion = "conversion"
    click      = "click"
    scroll     = "scroll"


class EventIngest(BaseModel):
    experiment_id: str
    variant_id: str
    fingerprint: str
    event_type: EventType
    metadata: Optional[Dict[str, Any]] = None
    device_type: Optional[str] = None
    country: Optional[str] = None
    is_new_user: bool = False
    session_depth: int = 1


# ── Analytics ─────────────────────────────────────────────────────────────────

class VariantStats(BaseModel):
    variant_id: str
    variant_key: str
    variant_name: str
    impressions: int
    conversions: int
    cvr: float
    traffic_weight: float
    lift_vs_control: Optional[float]
    confidence: float


class SegmentStats(BaseModel):
    segment: str
    value: str
    winner_variant: str
    lift: float


class ExperimentAnalytics(BaseModel):
    experiment_id: str
    total_sessions: int
    overall_confidence: float
    leading_variant: Optional[str]
    variant_stats: List[VariantStats]
    segment_breakdown: Dict[str, List[SegmentStats]]
    days_running: int
    estimated_days_remaining: Optional[int]


# ── Challenges ────────────────────────────────────────────────────────────────

class ScoringConfig(BaseModel):
    cvr_weight: float = Field(0.6, ge=0.0, le=1.0)
    engagement_weight: float = Field(0.25, ge=0.0, le=1.0)
    session_volume_weight: float = Field(0.15, ge=0.0, le=1.0)


class ChallengeCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=120)
    description: Optional[str] = None
    scoring_config: ScoringConfig
    total_rounds: int = Field(3, ge=1, le=10)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class ChallengeOut(BaseModel):
    id: str
    name: str
    status: str
    current_round: int
    total_rounds: int
    team_count: int = 0
    top_team: Optional[str] = None
    top_score: Optional[float] = None

    class Config:
        from_attributes = True


# ── Teams ─────────────────────────────────────────────────────────────────────

class TeamCreate(BaseModel):
    challenge_id: str
    name: str
    url: str
    members: List[str] = []


class TeamOut(BaseModel):
    id: str
    challenge_id: str
    name: str
    url: str
    members: List[str]
    latest_score: Optional[float] = None
    rank: Optional[int] = None

    class Config:
        from_attributes = True


# ── AI ────────────────────────────────────────────────────────────────────────

class AISynthesisRequest(BaseModel):
    experiment_id: str


class AIChampionRequest(BaseModel):
    challenge_id: str
    team_id: str


class AIVerdictOut(BaseModel):
    hypothesis_confirmed: bool
    verdict_summary: str
    winner_variant: Optional[str]
    key_segments: List[str]
    next_tests: List[str]
    raw_analysis: str
