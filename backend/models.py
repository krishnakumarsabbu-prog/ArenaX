import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base


def gen_id():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    id         = Column(String, primary_key=True, default=gen_id)
    name       = Column(String, nullable=False)
    email      = Column(String, unique=True, nullable=False)
    initials   = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Experiment(Base):
    __tablename__ = "experiments"
    id                   = Column(String, primary_key=True, default=gen_id)
    name                 = Column(String, nullable=False)
    url                  = Column(String, nullable=False)
    status               = Column(String, default="draft")
    hypothesis           = Column(Text)
    goal_metric          = Column(String, default="conversion")
    traffic_pct          = Column(Float, default=1.0)
    min_sessions         = Column(Integer, default=1000)
    max_sessions         = Column(Integer)
    confidence_threshold = Column(Float, default=0.95)
    created_at           = Column(DateTime, default=datetime.utcnow)
    concluded_at         = Column(DateTime)
    ai_verdict           = Column(Text)
    owner_id             = Column(String, ForeignKey("users.id"), nullable=False)

    variants = relationship("Variant", back_populates="experiment", cascade="all, delete-orphan")
    events   = relationship("Event", back_populates="experiment")


class Variant(Base):
    __tablename__ = "variants"
    id             = Column(String, primary_key=True, default=gen_id)
    experiment_id  = Column(String, ForeignKey("experiments.id"), nullable=False)
    key            = Column(String, nullable=False)
    name           = Column(String, nullable=False)
    description    = Column(Text)
    traffic_weight = Column(Float, default=0.5)
    alpha          = Column(Float, default=1.0)
    beta           = Column(Float, default=1.0)
    changes        = Column(Text)
    created_at     = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="variants")


class SessionAssignment(Base):
    __tablename__ = "session_assignments"
    fingerprint   = Column(String, primary_key=True)
    experiment_id = Column(String, ForeignKey("experiments.id"), primary_key=True)
    variant_id    = Column(String, ForeignKey("variants.id"), nullable=False)
    assigned_at   = Column(DateTime, default=datetime.utcnow)


class Event(Base):
    __tablename__ = "events"
    id            = Column(String, primary_key=True, default=gen_id)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)
    variant_id    = Column(String, ForeignKey("variants.id"), nullable=False)
    fingerprint   = Column(String, nullable=False)
    event_type    = Column(String, nullable=False)
    metadata_     = Column("metadata", Text)
    device_type   = Column(String)
    country       = Column(String)
    is_new_user   = Column(Integer, default=0)
    session_depth = Column(Integer, default=1)
    created_at    = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="events")


class Challenge(Base):
    __tablename__ = "challenges"
    id             = Column(String, primary_key=True, default=gen_id)
    name           = Column(String, nullable=False)
    description    = Column(Text)
    status         = Column(String, default="draft")
    scoring_config = Column(Text, nullable=False)
    total_rounds   = Column(Integer, default=3)
    current_round  = Column(Integer, default=1)
    start_date     = Column(DateTime)
    end_date       = Column(DateTime)
    created_at     = Column(DateTime, default=datetime.utcnow)
    ai_analysis    = Column(Text)
    owner_id       = Column(String, ForeignKey("users.id"), nullable=False)

    teams         = relationship("Team", back_populates="challenge", cascade="all, delete-orphan")
    round_results = relationship("RoundResult", back_populates="challenge")


class Team(Base):
    __tablename__ = "teams"
    id            = Column(String, primary_key=True, default=gen_id)
    challenge_id  = Column(String, ForeignKey("challenges.id"), nullable=False)
    name          = Column(String, nullable=False)
    url           = Column(String, nullable=False)
    members       = Column(Text)
    experiment_id = Column(String, ForeignKey("experiments.id"))
    created_at    = Column(DateTime, default=datetime.utcnow)

    challenge = relationship("Challenge", back_populates="teams")


class RoundResult(Base):
    __tablename__ = "round_results"
    id               = Column(String, primary_key=True, default=gen_id)
    challenge_id     = Column(String, ForeignKey("challenges.id"), nullable=False)
    team_id          = Column(String, ForeignKey("teams.id"), nullable=False)
    round_number     = Column(Integer, nullable=False)
    cvr              = Column(Float)
    engagement_score = Column(Float)
    session_count    = Column(Integer)
    composite_score  = Column(Float)
    rank             = Column(Integer)
    computed_at      = Column(DateTime, default=datetime.utcnow)

    challenge = relationship("Challenge", back_populates="round_results")


# ── Security / RBAC ───────────────────────────────────────────────────────────

class Role(Base):
    __tablename__ = "roles"
    id          = Column(String, primary_key=True, default=gen_id)
    name        = Column(String, unique=True, nullable=False)
    description = Column(Text)
    created_at  = Column(DateTime, default=datetime.utcnow)

    permissions = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")
    user_roles  = relationship("UserRole", back_populates="role", cascade="all, delete-orphan")


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

    role       = relationship("Role", back_populates="permissions")
    permission = relationship("Permission")


class UserRole(Base):
    __tablename__ = "user_roles"
    user_id    = Column(String, ForeignKey("users.id"), primary_key=True)
    role_id    = Column(String, ForeignKey("roles.id"), primary_key=True)
    granted_by = Column(String, ForeignKey("users.id"))
    granted_at = Column(DateTime, default=datetime.utcnow)

    role = relationship("Role", back_populates="user_roles")


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
    user_agent  = Column(String)
    status      = Column(String, default="success")
    created_at  = Column(DateTime, default=datetime.utcnow)


class RateLimitBucket(Base):
    __tablename__ = "rate_limit_buckets"
    id         = Column(String, primary_key=True, default=gen_id)
    key        = Column(String, unique=True, nullable=False)
    count      = Column(Integer, default=0)
    window_end = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
