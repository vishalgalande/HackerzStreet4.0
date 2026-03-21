"""
FastAPI routes for the credit scoring API.
"""

from fastapi import APIRouter, HTTPException
from models import (
    UserInput,
    ScoreResponse,
    SimulateRequest,
    SimulateResponse,
    PersonaSummary,
    PersonaDetail,
)
from scoring import (
    compute_score,
    get_band,
    compute_confidence_margin,
    compute_benchmark_percentile,
    compute_all_factors,
)
from explainability import (
    compute_factor_contributions,
    get_positive_factors,
    get_negative_factors,
    generate_summary,
)
from recommendations import generate_recommendations
from personas import get_personas_list, get_persona_by_id


router = APIRouter(prefix="/api")


def _build_score_response(user: UserInput) -> ScoreResponse:
    """Internal helper to compute full score response from user input."""
    # Compute score
    score, factor_scores = compute_score(user)
    band, band_color = get_band(score)
    confidence = compute_confidence_margin(user)
    percentile = compute_benchmark_percentile(score)

    # Compute explainability
    contributions = compute_factor_contributions(user, factor_scores, score)
    positive = get_positive_factors(contributions)
    negative = get_negative_factors(contributions)
    summary_en, summary_hi = generate_summary(score, band, contributions)

    # Compute recommendations
    recs = generate_recommendations(user, factor_scores)

    return ScoreResponse(
        score=score,
        band=band,
        band_color=band_color,
        confidence_margin=confidence,
        benchmark_percentile=percentile,
        factors=contributions,
        positive_factors=positive,
        negative_factors=negative,
        recommendations=recs,
        summary=summary_en,
        summary_hi=summary_hi,
    )


@router.post("/score", response_model=ScoreResponse)
async def calculate_score(user: UserInput):
    """
    Calculate credit score from user input.
    Returns score, band, confidence, factor breakdown, and recommendations.
    """
    return _build_score_response(user)


@router.post("/simulate", response_model=SimulateResponse)
async def simulate_score(request: SimulateRequest):
    """
    Simulate score change by comparing original and modified inputs.
    Returns delta score and changed factors.
    """
    original_score, original_factors = compute_score(request.original)
    new_score, new_factors = compute_score(request.modified)
    original_band, _ = get_band(original_score)
    new_band, _ = get_band(new_score)

    # Identify changed factors
    changed = []
    for factor in original_factors:
        if original_factors[factor] != new_factors[factor]:
            changed.append({
                "factor": factor,
                "original_sub_score": round(original_factors[factor], 1),
                "new_sub_score": round(new_factors[factor], 1),
                "delta": round(new_factors[factor] - original_factors[factor], 1),
            })

    return SimulateResponse(
        original_score=original_score,
        new_score=new_score,
        delta=new_score - original_score,
        original_band=original_band,
        new_band=new_band,
        changed_factors=changed,
    )


@router.get("/personas", response_model=list[PersonaSummary])
async def list_personas():
    """Return list of demo personas."""
    return get_personas_list()


@router.get("/persona/{persona_id}", response_model=PersonaDetail)
async def get_persona(persona_id: str):
    """Return full data for a specific persona."""
    persona = get_persona_by_id(persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail=f"Persona '{persona_id}' not found")
    return persona
