"""
main.py — MindMate FastAPI Application Entry Point
===================================================
Wires up:
  - CORS middleware
  - SlowAPI rate limiter
  - All routers
  - Auto table creation on startup
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.database import Base, engine
from app.models import ChatHistory, MoodLog, User  # noqa: F401 — ensures tables register
from app.routers import auth, chat, mood
from app.routers import settings

# ---------------------------------------------------------------------------
# Rate limiter — shared instance used by all routers
# Disable in test environments to prevent rate limit test failures.
# ---------------------------------------------------------------------------
TESTING = os.getenv("TESTING", "false").lower() == "true"

if TESTING:
    limiter = Limiter(key_func=get_remote_address, enabled=False)
else:
    limiter = Limiter(key_func=get_remote_address, default_limits=["200/day"])

# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title="MindMate API",
    description=(
        "AI-powered mental health companion backend. "
        "All endpoints (except /auth/*) require a valid JWT Bearer token."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# ---------------------------------------------------------------------------
# CORS — adjust origins for production
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Tighten this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(mood.router)
app.include_router(settings.router)


# ---------------------------------------------------------------------------
# Startup event — create all tables (runs in test and production)
# ---------------------------------------------------------------------------
@app.on_event("startup")  # noqa: deprecation — works fine in FastAPI 0.111
def create_tables():
    Base.metadata.create_all(bind=engine)



# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "MindMate API"}
