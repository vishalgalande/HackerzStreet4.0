"""
Unified FastAPI backend — registers routes from all features.
Run from project root: uvicorn src.backend.main:app --reload --port 8000
Or use start-backend.bat
"""

import sys
import os

# Add feature directories to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(backend_dir, "feature-scoring"))
sys.path.insert(0, os.path.join(backend_dir, "feature-auth"))
sys.path.insert(0, os.path.join(backend_dir, "feature-dashboard"))
sys.path.insert(0, os.path.join(backend_dir, "feature-mailing"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers from each feature
from routes import router as scoring_router
from compute_routes import router as compute_router
from chat_routes import router as chat_router
from profile_routes import router as profile_router
from daily_routes import router as daily_router
from history_routes import router as history_router
from email_routes import router as email_router

app = FastAPI(
    title="Alternative Credit Risk Assessment API",
    description=(
        "Behavior-based credit scoring for credit-invisible individuals. "
        "Uses alternative financial data to generate explainable 300-900 credit scores."
    ),
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all feature routes
app.include_router(scoring_router)   # /api/score, /api/simulate, /api/personas
app.include_router(compute_router)   # /api/compute-score (unified)
app.include_router(chat_router)      # /api/chat (AI chatbot)
app.include_router(profile_router)   # /api/profile
app.include_router(daily_router)     # /api/entries
app.include_router(history_router)   # /api/score-history
app.include_router(email_router)     # /api/check-alerts, /api/send-test-email


@app.get("/")
async def root():
    return {
        "name": "Alternative Credit Risk Assessment API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": [
            "POST /api/score",
            "POST /api/simulate",
            "GET  /api/personas",
            "POST /api/profile",
            "GET  /api/profile",
            "POST /api/entries",
            "GET  /api/entries",
            "GET  /api/score-history",
            "POST /api/check-alerts",
            "POST /api/send-test-email",
        ],
    }
