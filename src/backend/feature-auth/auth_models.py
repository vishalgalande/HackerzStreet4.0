"""
Pydantic models for auth and user profiles.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserProfile(BaseModel):
    """User financial profile stored in Supabase."""
    monthly_income: float = Field(0, ge=0, description="Monthly net income in INR")
    employment_type: str = Field("none", description="salaried / freelance / gig / self_employed / none")
    existing_debt: float = Field(0, ge=0, description="Monthly EMI/debt obligation in INR")
    rent_history: str = Field("consistent", description="consistent / occasional_gap / irregular")
    bill_payment: str = Field("always_on_time", description="always_on_time / sometimes_late / often_late")
    telecom_regularity: bool = Field(False, description="Regular telecom payments")


class ProfileSetupRequest(BaseModel):
    """Request body for initial profile setup."""
    monthly_income: float = Field(..., ge=0)
    employment_type: str
    existing_debt: float = Field(0, ge=0)
    rent_history: str = Field("consistent")
    bill_payment: str = Field("always_on_time")
    telecom_regularity: bool = Field(False)


class ProfileResponse(BaseModel):
    """Response for profile retrieval."""
    id: str
    email: str
    profile: UserProfile
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
