from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine, Base
from routers import experiments, variants, events, analytics
from routers import challenges, teams, leaderboard, ai, websocket
from seed import seed_demo_data


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

app.include_router(experiments.router,  prefix="/api/experiments",  tags=["A/B Experiments"])
app.include_router(variants.router,     prefix="/api/variants",     tags=["Variants"])
app.include_router(events.router,       prefix="/api/events",       tags=["Events"])
app.include_router(analytics.router,    prefix="/api/analytics",    tags=["Analytics"])
app.include_router(challenges.router,   prefix="/api/challenges",   tags=["Challenges"])
app.include_router(teams.router,        prefix="/api/teams",        tags=["Teams"])
app.include_router(leaderboard.router,  prefix="/api/leaderboard",  tags=["Leaderboard"])
app.include_router(ai.router,           prefix="/api/ai",           tags=["AI"])
app.include_router(websocket.router,    tags=["WebSocket"])


@app.get("/api/health")
def health():
    return {"status": "ok", "db": "sqlite::memory:"}
