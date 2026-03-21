"""
Pydantic models for the email notification system.
"""

from pydantic import BaseModel, Field
from typing import Optional


class DailyEntryData(BaseModel):
    """Daily entry for spending analysis."""
    date: str = ""
    rent: float = 0
    food: float = 0
    transport: float = 0
    discretionary: float = 0
    savings: float = 0
    bill_paid_on_time: bool = True


class AlertCheckRequest(BaseModel):
    """Request to check and send email alerts for a user."""
    email: str = Field(..., description="Recipient email address")
    name: str = Field("User", description="User's display name")
    score: int = Field(..., ge=300, le=900, description="Credit score")
    factor_scores: dict = Field(
        default_factory=dict,
        description="Factor sub-scores (0-100 each)",
    )
    recommendations: list[str] = Field(
        default_factory=list,
        description="List of recommendation strings",
    )
    entries: list[DailyEntryData] = Field(
        default_factory=list,
        description="Daily entries for spending analysis",
    )


class AlertCheckResponse(BaseModel):
    """Response from alert check."""
    alerts_checked: bool
    email_enabled: bool
    score_below_threshold: Optional[bool] = None
    spending_spike_detected: Optional[bool] = None
    alerts_sent: list[dict] = []
    errors: Optional[list[str]] = None


class TestEmailRequest(BaseModel):
    """Request to send a test email."""
    email: str = Field(..., description="Recipient email address")
    name: str = Field("Test User", description="Display name for the test email")
