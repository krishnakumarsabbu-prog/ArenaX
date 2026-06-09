from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ExperimentStatus(str, Enum):
    draft      = "draft"
    running    = "running"
    paused     = "paused"
    concluded  = "concluded"


class ExecutionMode(str, Enum):
    ab                  = "ab"
    champion_challenger = "champion_challenger"
    shadow              = "shadow"


class HttpMethod(str, Enum):
    GET    = "GET"
    POST   = "POST"
    PUT    = "PUT"
    DELETE = "DELETE"
    PATCH  = "PATCH"


class AuthType(str, Enum):
    none   = "none"
    bearer = "bearer"
    api_key = "api_key"
    oauth2 = "oauth2"
    mtls   = "mtls"


class VariantType(str, Enum):
    service_routing = "service_routing"
    model           = "model"
    feature_flag    = "feature_flag"
    config          = "config"


# ── Experiments ───────────────────────────────────────────────────────────────

class ScoringRules(BaseModel):
    success_status: int = 200
    latency_weight: float = 0.4
    error_weight: float = 0.4
    business_metric_weight: float = 0.2
    business_metric_path: Optional[str] = None


class ExperimentCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=120)
    description: Optional[str] = ""
    execution_mode: ExecutionMode = ExecutionMode.ab
    environment: str = "staging"
    method: HttpMethod = HttpMethod.GET
    base_url: str
    path: str = "/"
    query_params: Dict[str, str] = {}
    body_template: Optional[str] = ""
    request_headers: Dict[str, str] = {}
    auth_type: AuthType = AuthType.none
    auth_value: Optional[str] = ""
    timeout_ms: int = Field(5000, ge=100, le=60000)
    max_retries: int = Field(0, ge=0, le=5)
    scoring_rules: ScoringRules = ScoringRules()


class ExperimentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ExperimentStatus] = None
    execution_mode: Optional[ExecutionMode] = None
    environment: Optional[str] = None
    scoring_rules: Optional[ScoringRules] = None


class ExperimentOut(BaseModel):
    id: str
    name: str
    description: str
    status: ExperimentStatus
    execution_mode: ExecutionMode
    environment: str
    method: HttpMethod
    base_url: str
    path: str
    auth_type: AuthType
    timeout_ms: int
    max_retries: int
    scoring_rules: Dict[str, Any]
    variant_count: int = 0
    total_requests: int = 0
    avg_latency_ms: float = 0.0
    error_rate: float = 0.0
    winner_variant_id: Optional[str] = None
    created_at: datetime
    concluded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Variants ─────────────────────────────────────────────────────────────────

class VariantCreate(BaseModel):
    experiment_id: str
    name: str = Field(..., min_length=1, max_length=80)
    variant_type: VariantType = VariantType.service_routing
    description: Optional[str] = ""
    weight: int = Field(50, ge=0, le=100)
    target_url: str = ""
    feature_flags: Dict[str, Any] = {}
    config_overrides: Dict[str, Any] = {}


class VariantOut(BaseModel):
    id: str
    experiment_id: str
    name: str
    variant_type: VariantType
    description: str
    weight: int
    target_url: str
    feature_flags: Dict[str, Any]
    config_overrides: Dict[str, Any]
    avg_latency_ms: float = 0.0
    error_rate: float = 0.0
    request_count: int = 0
    score: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True


# ── Execution ─────────────────────────────────────────────────────────────────

class ExecuteRequest(BaseModel):
    experiment_id: str
    request_body: Optional[Dict[str, Any]] = None
    request_headers: Optional[Dict[str, str]] = None
    path_params: Optional[Dict[str, str]] = None


class VariantResultOut(BaseModel):
    variant_id: str
    variant_name: str
    status_code: int
    latency_ms: float
    response_body: Dict[str, Any]
    response_headers: Dict[str, str]
    error: Optional[str]
    payload_size_bytes: int


class ExecutionLogOut(BaseModel):
    id: str
    experiment_id: str
    request_id: str
    timestamp: datetime
    request_method: str
    request_url: str
    winner_variant_id: Optional[str]
    variant_results: List[VariantResultOut] = []

    class Config:
        from_attributes = True


# ── Analytics ─────────────────────────────────────────────────────────────────

class VariantMetrics(BaseModel):
    variant_id: str
    variant_name: str
    request_count: int
    avg_latency_ms: float
    p50_latency_ms: float
    p95_latency_ms: float
    p99_latency_ms: float
    error_rate: float
    success_rate: float
    avg_payload_size: float
    score: float


class ExperimentAnalyticsOut(BaseModel):
    experiment_id: str
    total_requests: int
    avg_latency_ms: float
    error_rate: float
    winner_variant_id: Optional[str]
    variant_metrics: List[VariantMetrics]
    latency_trend: List[Dict[str, Any]]


# ── AI ────────────────────────────────────────────────────────────────────────

class AIInsightOut(BaseModel):
    experiment_id: str
    winner_variant: Optional[str]
    winner_reason: str
    risk_warnings: List[str]
    performance_summary: str
    recommendation: str
    suggested_next_experiments: List[str]
    confidence: str


# ── Security (kept for admin panel) ──────────────────────────────────────────

class APITokenCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    scopes: List[str] = []
    expires_at: Optional[datetime] = None


class APITokenOut(BaseModel):
    id: str
    name: str
    prefix: str
    scopes: List[str]
    is_active: bool
    last_used: Optional[datetime]
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class APITokenCreated(APITokenOut):
    token: str


class AuditLogOut(BaseModel):
    id: str
    user_id: Optional[str]
    action: str
    resource: str
    resource_id: Optional[str]
    details: Optional[str]
    ip_address: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
