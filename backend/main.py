from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from database import engine, Base, SessionLocal
from routers import experiments, variants, events, analytics
from routers import challenges, teams, leaderboard, ai, websocket
from routers import security
from seed import seed_demo_data
from services.rbac import check_rate_limit


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_demo_data()
    yield


app = FastAPI(
    title="XTest Portal API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Global per-IP rate limiter: 300 req / 60 s."""
    client_ip = request.client.host if request.client else "unknown"
    key = f"ip:{client_ip}"

    db = SessionLocal()
    try:
        allowed, remaining = check_rate_limit(key, limit=300, window_seconds=60, db=db)
    finally:
        db.close()

    if not allowed:
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Try again in a minute."},
            headers={"Retry-After": "60", "X-RateLimit-Remaining": "0"},
        )

    response = await call_next(request)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    return response


app.include_router(experiments.router,  prefix="/api/experiments",  tags=["A/B Experiments"])
app.include_router(variants.router,     prefix="/api/variants",     tags=["Variants"])
app.include_router(events.router,       prefix="/api/events",       tags=["Events"])
app.include_router(analytics.router,    prefix="/api/analytics",    tags=["Analytics"])
app.include_router(challenges.router,   prefix="/api/challenges",   tags=["Challenges"])
app.include_router(teams.router,        prefix="/api/teams",        tags=["Teams"])
app.include_router(leaderboard.router,  prefix="/api/leaderboard",  tags=["Leaderboard"])
app.include_router(ai.router,           prefix="/api/ai",           tags=["AI"])
app.include_router(security.router,     prefix="/api/security",     tags=["Security"])
app.include_router(websocket.router,    tags=["WebSocket"])


@app.get("/api/health")
def health():
    return {"status": "ok", "db": "sqlite::memory:"}
