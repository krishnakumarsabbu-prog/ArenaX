"""Pydantic schemas for XTest API Lab 2.0."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


# ── Enums (as string literals) ────────────────────────────────────────────────

# mode: "AB" | "CC"
# status: "draft" | "running" | "paused" | "concluded"
# method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
# auth_type: "none" | "bearer" | "api_key"


# ── Shared ────────────────────────────────────────────────────────────────────

class ScoringRules(BaseModel):
    priority: str = "latency"                     # latency | error_rate | business
    success_status_required: bool = True
    latency_weight: float = 0.6
    error_weight: float = 0.3
    business_metric_weight: float = 0.1
    business_metric_path: Optional[str] = None


# ── A/B Experiment ────────────────────────────────────────────────────────────

class ABVariantCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    weight: int = Field(50, ge=0, le=100)
    url_override: Optional[str] = ""
    header_overrides: Dict[str, str] = {}
    body_override: Optional[str] = None
    description: Optional[str] = ""


class ABExperimentCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=120)
    description: Optional[str] = ""
    environment: str = "staging"
    method: str = "GET"
    base_url: str
    path: str = "/"
    query_params: Dict[str, str] = {}
    body_template: Optional[str] = ""
    request_headers: Dict[str, str] = {}
    auth_type: str = "none"
    auth_value: Optional[str] = ""
    timeout_ms: int = Field(5000, ge=100, le=60000)
    variants: List[ABVariantCreate] = []


class ABExperimentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    environment: Optional[str] = None


# ── CC Experiment ─────────────────────────────────────────────────────────────

class CCExperimentCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=120)
    description: Optional[str] = ""
    environment: str = "staging"
    method: str = "GET"
    champion_url: str
    challenger_url: str
    path: str = "/"
    query_params: Dict[str, str] = {}
    body_template: Optional[str] = ""
    request_headers: Dict[str, str] = {}
    auth_type: str = "none"
    auth_value: Optional[str] = ""
    timeout_ms: int = Field(5000, ge=100, le=60000)
    scoring_rules: ScoringRules = ScoringRules()


class CCExperimentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    environment: Optional[str] = None
    scoring_rules: Optional[ScoringRules] = None


# ── Execution ─────────────────────────────────────────────────────────────────

class ABExecuteRequest(BaseModel):
    experiment_id: str
    n: int = Field(1, ge=1, le=100)
    request_body: Optional[Dict[str, Any]] = None
    request_headers: Optional[Dict[str, str]] = None


class CCExecuteRequest(BaseModel):
    experiment_id: str
    request_body: Optional[Dict[str, Any]] = None
    request_headers: Optional[Dict[str, str]] = None


# ── Session create ────────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    experiment_id: str
    mode: str  # "AB" | "CC"
