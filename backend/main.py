from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from seed import seed_demo_data
from routers import ab_experiments, cc_experiments, execution, analytics_v2


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_demo_data()
    yield


app = FastAPI(
    title="XTest API Lab 2.0",
    version="2.0.0",
    description="Dual-mode API experimentation — A/B Traffic Split + Champion vs Challenger",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ab_experiments.router, prefix="/api/ab",         tags=["A/B Experiments"])
app.include_router(cc_experiments.router, prefix="/api/cc",         tags=["CC Experiments"])
app.include_router(execution.router,      prefix="/api/exec",       tags=["Execution"])
app.include_router(analytics_v2.router,   prefix="/api/analytics",  tags=["Analytics"])


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "XTest API Lab", "version": "2.0.0"}
