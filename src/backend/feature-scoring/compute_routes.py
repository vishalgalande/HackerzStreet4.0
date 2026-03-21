"""
Unified score computation — the core endpoint.

POST /api/compute-score
  Reads user profile + daily entries → aggregates → scores → returns full result.

This is the single endpoint the frontend calls to get a score.
It combines data from profile + entries, runs the 5-factor scoring engine,
and returns score, band, factors, recommendations, and summary.
"""

import sys
import os

# Ensure scoring modules are importable
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(backend_dir, "feature-scoring"))
sys.path.insert(0, os.path.join(backend_dir, "feature-dashboard"))

from fastapi import APIRouter, Request
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from models import UserInput, BillPaymentBehavior, EmploymentType, RentHistory
from scoring import compute_score, get_band, compute_confidence_margin, compute_benchmark_percentile
from explainability import compute_factor_contributions, get_positive_factors, get_negative_factors, generate_summary
from recommendations import generate_recommendations

router = APIRouter(prefix="/api")


# ── Request / Response Models ──

class LoanEntry(BaseModel):
    type: str = ""
    name: str = ""
    emi: float = 0


class DailyEntryInput(BaseModel):
    date: str = ""
    rent: float = 0
    food: float = 0
    transport: float = 0
    discretionary: float = 0
    savings: float = 0
    bill_paid_on_time: bool = True


class ComputeScoreRequest(BaseModel):
    """Everything needed to compute a score — profile + recent entries."""
    # Profile fields
    monthly_income: float = Field(0, ge=0)
    income_amount: float = Field(0, ge=0)
    income_period: str = "monthly"
    employment_type: str = "none"
    existing_debt: float = Field(0, ge=0)
    loans: list[LoanEntry] = []
    rent_history: str = "consistent"
    bill_payment: str = "always_on_time"
    telecom_regularity: bool = False

    # Daily entries (last 30 days)
    entries: list[DailyEntryInput] = []


class FactorResult(BaseModel):
    factor: str
    label: str
    label_hi: str
    points: float
    is_positive: bool
    description: str
    description_hi: str


class RecommendationResult(BaseModel):
    action: str
    action_hi: str
    impact_min: int
    impact_max: int
    effort: str
    timeframe: str
    explanation: str
    explanation_hi: str


class ComputeScoreResponse(BaseModel):
    score: int
    band: str
    band_color: str
    confidence_margin: int
    benchmark_percentile: int
    factors: list[FactorResult]
    positive_factors: list[FactorResult]
    negative_factors: list[FactorResult]
    recommendations: list[RecommendationResult]
    summary: str
    summary_hi: str
    data_quality: dict


# ── Aggregation helpers ──

def _aggregate_entries(entries: list[DailyEntryInput]) -> dict:
    """Aggregate daily entries into monthly totals."""
    if not entries:
        return {
            "total_rent": 0,
            "total_food": 0,
            "total_transport": 0,
            "total_discretionary": 0,
            "total_savings": 0,
            "total_expenses": 0,
            "bills_on_time_pct": 1.0,
            "entry_count": 0,
        }

    total_rent = sum(e.rent for e in entries)
    total_food = sum(e.food for e in entries)
    total_transport = sum(e.transport for e in entries)
    total_discretionary = sum(e.discretionary for e in entries)
    total_savings = sum(e.savings for e in entries)
    total_expenses = total_rent + total_food + total_transport + total_discretionary

    bills_on_time = sum(1 for e in entries if e.bill_paid_on_time)
    bills_on_time_pct = bills_on_time / len(entries) if entries else 1.0

    return {
        "total_rent": total_rent,
        "total_food": total_food,
        "total_transport": total_transport,
        "total_discretionary": total_discretionary,
        "total_savings": total_savings,
        "total_expenses": total_expenses,
        "bills_on_time_pct": round(bills_on_time_pct, 2),
        "entry_count": len(entries),
    }


def _resolve_monthly_income(req: ComputeScoreRequest) -> float:
    """Get monthly income, computing from period if needed."""
    if req.monthly_income > 0:
        return req.monthly_income
    if req.income_amount > 0:
        if req.income_period == "quarterly":
            return round(req.income_amount / 3)
        elif req.income_period == "half_yearly":
            return round(req.income_amount / 6)
        return req.income_amount
    return 0


def _resolve_bill_payment(profile_behavior: str, entries_pct: float) -> str:
    """
    Combine profile self-report with actual entry data.
    Entries data takes priority if enough entries exist.
    """
    if entries_pct >= 0.9:
        return "always_on_time"
    elif entries_pct >= 0.6:
        return "sometimes_late"
    elif entries_pct < 0.6:
        return "often_late"
    return profile_behavior


def _resolve_debt(req: ComputeScoreRequest) -> float:
    """Total debt from individual loans or flat amount."""
    loan_total = sum(l.emi for l in req.loans)
    return loan_total if loan_total > 0 else req.existing_debt


# ── Main endpoint ──

@router.post("/compute-score", response_model=ComputeScoreResponse)
async def compute_unified_score(req: ComputeScoreRequest):
    """
    Unified score computation.
    Combines profile data + daily entries → scoring engine → full result.
    """
    # Step 1: Aggregate daily entries
    agg = _aggregate_entries(req.entries)

    # Step 2: Resolve final values
    monthly_income = _resolve_monthly_income(req)
    total_debt = _resolve_debt(req)

    # Use entry-based data if available, otherwise fall back to profile
    has_entries = agg["entry_count"] > 0

    if has_entries:
        monthly_expenses = agg["total_expenses"]
        monthly_savings = agg["total_savings"]
        discretionary = agg["total_discretionary"]
        rent = agg["total_rent"]
        bill_behavior = _resolve_bill_payment(req.bill_payment, agg["bills_on_time_pct"])
    else:
        # No entries — use profile data only
        monthly_expenses = total_debt  # Rough estimate
        monthly_savings = max(0, monthly_income - monthly_expenses) * 0.1
        discretionary = 0
        rent = 0
        bill_behavior = req.bill_payment

    # Step 3: Build UserInput for scoring engine
    user_input = UserInput(
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses,
        rent=rent,
        food=agg["total_food"] if has_entries else 0,
        transport=agg["total_transport"] if has_entries else 0,
        discretionary=discretionary,
        savings_amount=monthly_savings,
        bill_payment=BillPaymentBehavior(bill_behavior),
        employment_type=EmploymentType(req.employment_type),
        existing_debt=total_debt,
        rent_history=RentHistory(req.rent_history),
        telecom_regularity=req.telecom_regularity,
    )

    # Step 4: Run scoring engine
    score, factor_scores = compute_score(user_input)
    band, band_color = get_band(score)
    confidence = compute_confidence_margin(user_input)
    percentile = compute_benchmark_percentile(score)

    # Step 5: Explainability
    contributions = compute_factor_contributions(user_input, factor_scores, score)
    positive = get_positive_factors(contributions)
    negative = get_negative_factors(contributions)
    summary_en, summary_hi = generate_summary(score, band, contributions)

    # Step 6: Recommendations
    recs = generate_recommendations(user_input, factor_scores)

    # Step 7: Data quality indicator
    data_quality = {
        "entry_count": agg["entry_count"],
        "has_profile": monthly_income > 0,
        "has_entries": has_entries,
        "data_source": "entries+profile" if has_entries else "profile_only",
        "confidence_note": (
            "Score based on daily tracking data — high confidence"
            if agg["entry_count"] >= 14
            else "Score based on profile data only — log daily entries for better accuracy"
            if not has_entries
            else f"Score based on {agg['entry_count']} entries — keep logging for better accuracy"
        ),
    }

    return ComputeScoreResponse(
        score=score,
        band=band,
        band_color=band_color,
        confidence_margin=confidence,
        benchmark_percentile=percentile,
        factors=[FactorResult(**f.model_dump() if hasattr(f, 'model_dump') else f.dict()) for f in contributions],
        positive_factors=[FactorResult(**f.model_dump() if hasattr(f, 'model_dump') else f.dict()) for f in positive],
        negative_factors=[FactorResult(**f.model_dump() if hasattr(f, 'model_dump') else f.dict()) for f in negative],
        recommendations=[RecommendationResult(**r.model_dump() if hasattr(r, 'model_dump') else r.dict()) for r in recs],
        summary=summary_en,
        summary_hi=summary_hi,
        data_quality=data_quality,
    )
