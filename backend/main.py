from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from database import engine, Base, SessionLocal
from routers import api_experiments, api_execution, api_analytics, api_ai
from seed import seed_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_demo_data()
    yield


app = FastAPI(
    title="XTest API Lab",
    version="2.0.0",
    description="Real-time API Experimentation, Traffic Splitting & Response Comparison Platform",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_experiments.router, prefix="/api/experiments",  tags=["Experiments"])
app.include_router(api_execution.router,   prefix="/api/executions",   tags=["Execution Logs"])
app.include_router(api_analytics.router,   prefix="/api/analytics",    tags=["Analytics"])
app.include_router(api_ai.router,          prefix="/api/ai",           tags=["AI Insights"])


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "XTest API Lab", "version": "2.0.0"}
