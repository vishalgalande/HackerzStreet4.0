"""
Pydantic models for the Alternative Credit Risk Assessment Tool.
Defines input validation schemas and response structures.
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class BillPaymentBehavior(str, Enum):
    ALWAYS_ON_TIME = "always_on_time"
    SOMETIMES_LATE = "sometimes_late"
    OFTEN_LATE = "often_late"


class EmploymentType(str, Enum):
    SALARIED = "salaried"
    FREELANCE = "freelance"
    GIG = "gig"
    SELF_EMPLOYED = "self_employed"
    NONE = "none"


class RentHistory(str, Enum):
    CONSISTENT = "consistent"
    OCCASIONAL_GAP = "occasional_gap"
    IRREGULAR = "irregular"


class UserInput(BaseModel):
    """8-field user input matching the PRD specification."""
    monthly_income: float = Field(..., ge=0, description="Monthly net income in INR")
    monthly_expenses: float = Field(..., ge=0, description="Total monthly expenses in INR")
    rent: float = Field(0, ge=0, description="Monthly rent in INR")
    food: float = Field(0, ge=0, description="Monthly food expenses in INR")
    transport: float = Field(0, ge=0, description="Monthly transport expenses in INR")
    discretionary: float = Field(0, ge=0, description="Monthly discretionary spending in INR")
    savings_amount: float = Field(..., ge=0, description="Monthly average savings in INR")
    bill_payment: BillPaymentBehavior = Field(..., description="Bill payment behavior")
    employment_type: EmploymentType = Field(..., description="Type of employment")
    existing_debt: float = Field(0, ge=0, description="Monthly EMI/debt obligation in INR")
    rent_history: RentHistory = Field(RentHistory.CONSISTENT, description="Rent payment history")
    telecom_regularity: bool = Field(False, description="Whether telecom/mobile bills are paid regularly")


class FactorContribution(BaseModel):
    """A single factor's contribution to the credit score."""
    factor: str
    label: str
    label_hi: str
    points: float
    is_positive: bool
    description: str
    description_hi: str


class Recommendation(BaseModel):
    """A single actionable recommendation for score improvement."""
    action: str
    action_hi: str
    impact_min: int
    impact_max: int
    effort: str  # "low", "medium", "high"
    timeframe: str
    explanation: str
    explanation_hi: str


class ScoreResponse(BaseModel):
    """Full score response with explainability and recommendations."""
    score: int
    band: str
    band_color: str
    confidence_margin: int
    benchmark_percentile: int
    factors: list[FactorContribution]
    positive_factors: list[FactorContribution]
    negative_factors: list[FactorContribution]
    recommendations: list[Recommendation]
    summary: str
    summary_hi: str


class SimulateRequest(BaseModel):
    """Request for what-if simulation."""
    original: UserInput
    modified: UserInput


class SimulateResponse(BaseModel):
    """Response from what-if simulation showing score delta."""
    original_score: int
    new_score: int
    delta: int
    original_band: str
    new_band: str
    changed_factors: list[dict]


class PersonaSummary(BaseModel):
    """Summary of a demo persona for listing."""
    id: str
    name: str
    title: str
    description: str
    expected_score: int
    avatar_emoji: str


class PersonaDetail(BaseModel):
    """Full persona data including pre-filled input."""
    id: str
    name: str
    title: str
    description: str
    expected_score: int
    avatar_emoji: str
    data: UserInput
