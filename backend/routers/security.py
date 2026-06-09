"""Security router: RBAC, audit logs, API tokens, rate limiting."""
import json
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Header, Request, status, Query
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from services.rbac import (
    generate_token,
    validate_api_token,
    get_user_permissions,
    user_has_permission,
    audit,
    check_rate_limit,
)

router = APIRouter()

DEMO_USER_ID = "demo-user-id"


# ── Helpers ───────────────────────────────────────────────────────────────────

def _resolve_user(
    authorization: Optional[str] = Header(None),
    x_api_token: Optional[str] = Header(None, alias="X-API-Token"),
    db: Session = Depends(get_db),
) -> str:
    """Return user_id from API token header or fall back to demo user."""
    raw = x_api_token or (
        authorization.removeprefix("Bearer ").strip()
        if authorization and authorization.startswith("Bearer xt_")
        else None
    )
    if raw:
        token = validate_api_token(raw, db)
        if token:
            return token.user_id
    return DEMO_USER_ID


def _require_permission(resource: str, action: str, user_id: str, db: Session):
    if not user_has_permission(user_id, resource, action, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Missing permission: {resource}:{action}",
        )


# ── Permissions ───────────────────────────────────────────────────────────────

@router.get("/permissions", response_model=List[schemas.PermissionOut])
def list_permissions(db: Session = Depends(get_db)):
    return db.query(models.Permission).order_by(models.Permission.resource, models.Permission.action).all()


# ── Roles ─────────────────────────────────────────────────────────────────────

@router.post("/roles", response_model=schemas.RoleOut, status_code=status.HTTP_201_CREATED)
def create_role(
    payload: schemas.RoleCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(_resolve_user),
):
    _require_permission("roles", "write", current_user, db)

    if db.query(models.Role).filter_by(name=payload.name).first():
        raise HTTPException(status_code=400, detail="Role name already exists")

    role = models.Role(name=payload.name, description=payload.description)
    db.add(role)
    db.flush()

    for perm_id in payload.permission_ids:
        perm = db.query(models.Permission).filter_by(id=perm_id).first()
        if perm:
            db.add(models.RolePermission(role_id=role.id, permission_id=perm.id))

    db.commit()
    db.refresh(role)
    audit(db, "create", "role", user_id=current_user, resource_id=role.id, details=payload.name)
    return _enrich_role(role, db)


@router.get("/roles", response_model=List[schemas.RoleOut])
def list_roles(db: Session = Depends(get_db)):
    roles = db.query(models.Role).order_by(models.Role.name).all()
    return [_enrich_role(r, db) for r in roles]


@router.get("/roles/{role_id}", response_model=schemas.RoleOut)
def get_role(role_id: str, db: Session = Depends(get_db)):
    role = _get_role_or_404(role_id, db)
    return _enrich_role(role, db)


@router.delete("/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    role_id: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(_resolve_user),
):
    _require_permission("roles", "delete", current_user, db)
    role = _get_role_or_404(role_id, db)
    if role.name in ("admin", "viewer"):
        raise HTTPException(status_code=400, detail="Cannot delete system roles")
    audit(db, "delete", "role", user_id=current_user, resource_id=role_id, details=role.name)
    db.delete(role)
    db.commit()


# ── User ↔ Role assignment ────────────────────────────────────────────────────

@router.post("/users/{user_id}/roles", status_code=status.HTTP_201_CREATED)
def assign_role_to_user(
    user_id: str,
    payload: schemas.UserRoleAssign,
    db: Session = Depends(get_db),
    current_user: str = Depends(_resolve_user),
):
    _require_permission("users", "write", current_user, db)

    user = db.query(models.User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    role = _get_role_or_404(payload.role_id, db)

    existing = db.query(models.UserRole).filter_by(user_id=user_id, role_id=role.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Role already assigned")

    db.add(models.UserRole(user_id=user_id, role_id=role.id, granted_by=current_user))
    db.commit()
    audit(db, "assign_role", "user", user_id=current_user, resource_id=user_id, details=role.name)
    return {"user_id": user_id, "role": role.name, "granted": True}


@router.delete("/users/{user_id}/roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_role_from_user(
    user_id: str,
    role_id: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(_resolve_user),
):
    _require_permission("users", "write", current_user, db)
    ur = db.query(models.UserRole).filter_by(user_id=user_id, role_id=role_id).first()
    if not ur:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(ur)
    db.commit()
    audit(db, "remove_role", "user", user_id=current_user, resource_id=user_id)


@router.get("/users/{user_id}/permissions")
def get_user_permissions_endpoint(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    perms = get_user_permissions(user_id, db)
    return {"user_id": user_id, "permissions": sorted(perms)}


# ── API Tokens ────────────────────────────────────────────────────────────────

@router.post("/tokens", response_model=schemas.APITokenCreated, status_code=status.HTTP_201_CREATED)
def create_api_token(
    payload: schemas.APITokenCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(_resolve_user),
):
    raw, prefix, token_hash = generate_token()
    token = models.APIToken(
        user_id=current_user,
        name=payload.name,
        token_hash=token_hash,
        prefix=prefix,
        scopes=json.dumps(payload.scopes),
        expires_at=payload.expires_at,
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    audit(db, "create_token", "api_token", user_id=current_user, resource_id=token.id, details=payload.name)

    return {
        "id": token.id,
        "name": token.name,
        "prefix": token.prefix,
        "scopes": json.loads(token.scopes or "[]"),
        "is_active": token.is_active,
        "last_used": token.last_used,
        "expires_at": token.expires_at,
        "created_at": token.created_at,
        "token": raw,
    }


@router.get("/tokens", response_model=List[schemas.APITokenOut])
def list_api_tokens(
    db: Session = Depends(get_db),
    current_user: str = Depends(_resolve_user),
):
    tokens = db.query(models.APIToken).filter_by(user_id=current_user).order_by(
        models.APIToken.created_at.desc()
    ).all()
    return [_enrich_token(t) for t in tokens]


@router.delete("/tokens/{token_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_api_token(
    token_id: str,
    db: Session = Depends(get_db),
    current_user: str = Depends(_resolve_user),
):
    token = db.query(models.APIToken).filter_by(id=token_id, user_id=current_user).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    token.is_active = False
    db.commit()
    audit(db, "revoke_token", "api_token", user_id=current_user, resource_id=token_id)


# ── Audit Logs ────────────────────────────────────────────────────────────────

@router.get("/audit-logs", response_model=List[schemas.AuditLogOut])
def list_audit_logs(
    resource: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: str = Depends(_resolve_user),
):
    _require_permission("audit_logs", "read", current_user, db)
    q = db.query(models.AuditLog)
    if resource:
        q = q.filter_by(resource=resource)
    if user_id:
        q = q.filter_by(user_id=user_id)
    q = q.order_by(models.AuditLog.created_at.desc()).offset(offset).limit(limit)
    return q.all()


# ── Rate Limiting ─────────────────────────────────────────────────────────────

@router.post("/rate-limit/check")
def check_rate_limit_endpoint(
    payload: schemas.RateLimitConfig,
    db: Session = Depends(get_db),
):
    allowed, remaining = check_rate_limit(payload.key, payload.limit, payload.window_seconds, db)
    return {"allowed": allowed, "remaining": remaining, "key": payload.key}


@router.get("/rate-limit/status")
def rate_limit_status(
    key: str = Query(...),
    db: Session = Depends(get_db),
):
    bucket = db.query(models.RateLimitBucket).filter_by(key=key).first()
    now = datetime.utcnow()
    if not bucket or bucket.window_end <= now:
        return {"key": key, "count": 0, "active_window": False}
    return {
        "key": key,
        "count": bucket.count,
        "window_end": bucket.window_end,
        "active_window": True,
    }


# ── Private helpers ───────────────────────────────────────────────────────────

def _get_role_or_404(role_id: str, db: Session) -> models.Role:
    role = db.query(models.Role).filter_by(id=role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


def _enrich_role(role: models.Role, db: Session) -> dict:
    perms = []
    for rp in db.query(models.RolePermission).filter_by(role_id=role.id).all():
        p = db.query(models.Permission).filter_by(id=rp.permission_id).first()
        if p:
            perms.append({"id": p.id, "name": p.name, "resource": p.resource, "action": p.action, "description": p.description})
    return {
        "id": role.id,
        "name": role.name,
        "description": role.description,
        "permissions": perms,
    }


def _enrich_token(t: models.APIToken) -> dict:
    return {
        "id": t.id,
        "name": t.name,
        "prefix": t.prefix,
        "scopes": json.loads(t.scopes or "[]"),
        "is_active": t.is_active,
        "last_used": t.last_used,
        "expires_at": t.expires_at,
        "created_at": t.created_at,
    }
