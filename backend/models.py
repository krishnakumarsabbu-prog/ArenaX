import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base


def gen_id():
    return str(uuid.uuid4())


class ApiExperiment(Base):
    __tablename__ = "api_experiments"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    status = Column(String, default="draft")          # draft | running | paused | concluded
    execution_mode = Column(String, default="ab")     # ab | champion_challenger | shadow
    environment = Column(String, default="staging")   # dev | staging | prod
    method = Column(String, default="GET")
    base_url = Column(String, default="")
    path = Column(String, default="/")
    query_params = Column(Text, default="{}")
    body_template = Column(Text, default="")
    request_headers = Column(Text, default="{}")
    auth_type = Column(String, default="none")
    auth_value = Column(Text, default="")
    timeout_ms = Column(Integer, default=5000)
    max_retries = Column(Integer, default=0)
    scoring_rules = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)
    concluded_at = Column(DateTime, nullable=True)

    variants = relationship("ApiVariant", back_populates="experiment", cascade="all, delete-orphan")
    execution_logs = relationship("ExecutionLog", back_populates="experiment", cascade="all, delete-orphan")


class ApiVariant(Base):
    __tablename__ = "api_variants"

    id = Column(String, primary_key=True, default=gen_id)
    experiment_id = Column(String, ForeignKey("api_experiments.id"), nullable=False)
    name = Column(String, nullable=False)
    variant_type = Column(String, default="service_routing")
    description = Column(Text, default="")
    weight = Column(Integer, default=50)
    target_url = Column(String, default="")
    feature_flags = Column(Text, default="{}")
    config_overrides = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("ApiExperiment", back_populates="variants")
    results = relationship("VariantResult", back_populates="variant", cascade="all, delete-orphan")


class ExecutionLog(Base):
    __tablename__ = "execution_logs"

    id = Column(String, primary_key=True, default=gen_id)
    experiment_id = Column(String, ForeignKey("api_experiments.id"), nullable=False)
    request_id = Column(String, default=gen_id)
    timestamp = Column(DateTime, default=datetime.utcnow)
    request_method = Column(String, default="GET")
    request_url = Column(String, default="")
    request_headers = Column(Text, default="{}")
    request_body = Column(Text, default="")
    winner_variant_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("ApiExperiment", back_populates="execution_logs")
    variant_results = relationship("VariantResult", back_populates="execution_log", cascade="all, delete-orphan")


class VariantResult(Base):
    __tablename__ = "variant_results"

    id = Column(String, primary_key=True, default=gen_id)
    execution_log_id = Column(String, ForeignKey("execution_logs.id"), nullable=False)
    variant_id = Column(String, ForeignKey("api_variants.id"), nullable=False)
    status_code = Column(Integer, default=200)
    latency_ms = Column(Float, default=0.0)
    response_body = Column(Text, default="{}")
    response_headers = Column(Text, default="{}")
    error_message = Column(Text, nullable=True)
    payload_size_bytes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    execution_log = relationship("ExecutionLog", back_populates="variant_results")
    variant = relationship("ApiVariant", back_populates="results")


# ── Security / Users (kept for admin panel) ──────────────────────────────────

class User(Base):
    __tablename__ = "users"
    id         = Column(String, primary_key=True, default=gen_id)
    name       = Column(String, nullable=False)
    email      = Column(String, unique=True, nullable=False)
    initials   = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Role(Base):
    __tablename__ = "roles"
    id          = Column(String, primary_key=True, default=gen_id)
    name        = Column(String, unique=True, nullable=False)
    description = Column(Text)
    created_at  = Column(DateTime, default=datetime.utcnow)


class Permission(Base):
    __tablename__ = "permissions"
    id          = Column(String, primary_key=True, default=gen_id)
    name        = Column(String, unique=True, nullable=False)
    resource    = Column(String, nullable=False)
    action      = Column(String, nullable=False)
    description = Column(Text)
    created_at  = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("resource", "action", name="uq_resource_action"),)


class RolePermission(Base):
    __tablename__ = "role_permissions"
    role_id       = Column(String, ForeignKey("roles.id"), primary_key=True)
    permission_id = Column(String, ForeignKey("permissions.id"), primary_key=True)


class UserRole(Base):
    __tablename__ = "user_roles"
    user_id    = Column(String, ForeignKey("users.id"), primary_key=True)
    role_id    = Column(String, ForeignKey("roles.id"), primary_key=True)
    granted_at = Column(DateTime, default=datetime.utcnow)


class APIToken(Base):
    __tablename__ = "api_tokens"
    id         = Column(String, primary_key=True, default=gen_id)
    user_id    = Column(String, ForeignKey("users.id"), nullable=False)
    name       = Column(String, nullable=False)
    token_hash = Column(String, unique=True, nullable=False)
    prefix     = Column(String, nullable=False)
    scopes     = Column(Text, default="[]")
    is_active  = Column(Boolean, default=True)
    last_used  = Column(DateTime)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id          = Column(String, primary_key=True, default=gen_id)
    user_id     = Column(String, ForeignKey("users.id"))
    action      = Column(String, nullable=False)
    resource    = Column(String, nullable=False)
    resource_id = Column(String)
    details     = Column(Text)
    ip_address  = Column(String)
    status      = Column(String, default="success")
    created_at  = Column(DateTime, default=datetime.utcnow)


class RateLimitBucket(Base):
    __tablename__ = "rate_limit_buckets"
    id         = Column(String, primary_key=True, default=gen_id)
    key        = Column(String, unique=True, nullable=False)
    count      = Column(Integer, default=0)
    window_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
