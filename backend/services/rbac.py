"""RBAC enforcement, API token validation, and rate limiting."""
import hashlib
import secrets
import json
from datetime import datetime, timedelta
from typing import Optional, Tuple

from sqlalchemy.orm import Session
import models


# ── Token utilities ───────────────────────────────────────────────────────────

def generate_token() -> Tuple[str, str, str]:
    """Return (raw_token, prefix, token_hash)."""
    raw = "xt_" + secrets.token_urlsafe(32)
    prefix = raw[:10]
    token_hash = hashlib.sha256(raw.encode()).hexdigest()
    return raw, prefix, token_hash


def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def validate_api_token(raw_token: str, db: Session) -> Optional[models.APIToken]:
    """Return the APIToken record if valid and active, else None."""
    if not raw_token or not raw_token.startswith("xt_"):
        return None
    token_hash = hash_token(raw_token)
    token = db.query(models.APIToken).filter_by(
        token_hash=token_hash, is_active=True
    ).first()
    if not token:
        return None
    if token.expires_at and token.expires_at < datetime.utcnow():
        return None
    token.last_used = datetime.utcnow()
    db.commit()
    return token


# ── RBAC enforcement ──────────────────────────────────────────────────────────

def get_user_permissions(user_id: str, db: Session) -> set[str]:
    """Return set of 'resource:action' strings for the user."""
    user_roles = db.query(models.UserRole).filter_by(user_id=user_id).all()
    perms = set()
    for ur in user_roles:
        role = db.query(models.Role).filter_by(id=ur.role_id).first()
        if not role:
            continue
        for rp in role.permissions:
            p = rp.permission
            perms.add(f"{p.resource}:{p.action}")
    return perms


def user_has_permission(user_id: str, resource: str, action: str, db: Session) -> bool:
    perms = get_user_permissions(user_id, db)
    return f"{resource}:{action}" in perms or f"{resource}:*" in perms or "*:*" in perms


# ── Audit logging ─────────────────────────────────────────────────────────────

def audit(
    db: Session,
    action: str,
    resource: str,
    user_id: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    status: str = "success",
):
    log = models.AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent,
        status=status,
    )
    db.add(log)
    db.commit()


# ── Rate limiting ─────────────────────────────────────────────────────────────

def check_rate_limit(key: str, limit: int, window_seconds: int, db: Session) -> Tuple[bool, int]:
    """Return (allowed, remaining). Increments counter in the DB."""
    now = datetime.utcnow()
    bucket = db.query(models.RateLimitBucket).filter_by(key=key).first()

    if bucket and bucket.window_end > now:
        if bucket.count >= limit:
            return False, 0
        bucket.count += 1
        remaining = limit - bucket.count
        db.commit()
        return True, remaining

    # New window
    if bucket:
        bucket.count = 1
        bucket.window_end = now + timedelta(seconds=window_seconds)
    else:
        bucket = models.RateLimitBucket(
            key=key,
            count=1,
            window_end=now + timedelta(seconds=window_seconds),
        )
        db.add(bucket)
    db.commit()
    return True, limit - 1
