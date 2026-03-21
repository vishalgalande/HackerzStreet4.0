"""
FastAPI application entry point for the Alternative Credit Risk Assessment Tool.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router

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

# Register routes
app.include_router(router)


@app.get("/")
async def root():
    return {
        "name": "Alternative Credit Risk Assessment API",
        "version": "1.0.0",
        "docs": "/docs",
    }
