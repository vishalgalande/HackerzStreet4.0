"""
Pydantic models for daily entries, aggregation, and score history.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class DailyEntry(BaseModel):
    """A single daily expense/savings entry logged by the user."""
    date: Optional[date] = Field(None, description="Entry date (defaults to today)")
    rent: float = Field(0, ge=0, description="Rent paid today (INR)")
    food: float = Field(0, ge=0, description="Food expenses (INR)")
    transport: float = Field(0, ge=0, description="Transport costs (INR)")
    discretionary: float = Field(0, ge=0, description="Non-essential spending (INR)")
    savings: float = Field(0, ge=0, description="Amount saved today (INR)")
    bill_paid_on_time: bool = Field(True, description="Did you pay a bill on time today?")
    notes: Optional[str] = Field(None, description="Free-form notes")


class DailyEntryResponse(BaseModel):
    """Response for a stored daily entry."""
    id: str
    user_id: str
    date: str
    rent: float
    food: float
    transport: float
    discretionary: float
    savings: float
    bill_paid_on_time: bool
    notes: Optional[str]
    created_at: str


class MonthlyAggregation(BaseModel):
    """Aggregated monthly data computed from daily entries."""
    month: str  # "2026-03"
    total_rent: float
    total_food: float
    total_transport: float
    total_discretionary: float
    total_savings: float
    total_expenses: float
    bills_on_time_pct: float  # 0.0 to 1.0
    entry_count: int


class ScoreHistoryEntry(BaseModel):
    """A historical score record."""
    score: int
    band: str
    computed_at: str
    factors: Optional[dict] = None
