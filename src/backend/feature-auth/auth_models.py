"""
Pydantic models for auth and user profiles.
Supports flexible income periods and multiple EMI/loan entries.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class LoanEntry(BaseModel):
    """A single loan/EMI entry."""
    type: str = Field(..., description="Loan type: personal / education / two_wheeler / phone / appliance / gold / microfinance / custom")
    name: str = Field("", description="Display name of the loan")
    emi: float = Field(0, ge=0, description="Monthly EMI amount in INR")


class UserProfile(BaseModel):
    """User financial profile stored in Supabase."""
    income_amount: float = Field(0, ge=0, description="Income in the specified period (INR)")
    income_period: str = Field("monthly", description="monthly / quarterly / half_yearly")
    monthly_income: float = Field(0, ge=0, description="Calculated monthly income (INR)")
    employment_type: str = Field("none", description="salaried / freelance / gig / self_employed / none")
    existing_debt: float = Field(0, ge=0, description="Total monthly EMI obligation (INR)")
    loans: list[LoanEntry] = Field(default_factory=list, description="Individual loan entries")
    rent_history: str = Field("consistent", description="consistent / occasional_gap / irregular")
    bill_payment: str = Field("always_on_time", description="always_on_time / sometimes_late / often_late")
    telecom_regularity: bool = Field(False, description="Regular telecom payments")


class ProfileSetupRequest(BaseModel):
    """Request body for initial profile setup."""
    income_amount: float = Field(..., ge=0)
    income_period: str = Field("monthly")
    employment_type: str
    loans: list[LoanEntry] = Field(default_factory=list)
    rent_history: str = Field("consistent")
    bill_payment: str = Field("always_on_time")
    telecom_regularity: bool = Field(False)

    @property
    def monthly_income(self) -> float:
        """Derive monthly income from amount and period."""
        if self.income_period == "quarterly":
            return round(self.income_amount / 3)
        elif self.income_period == "half_yearly":
            return round(self.income_amount / 6)
        return self.income_amount

    @property
    def existing_debt(self) -> float:
        """Total monthly EMI across all loans."""
        return sum(loan.emi for loan in self.loans)


class ProfileResponse(BaseModel):
    """Response for profile retrieval."""
    id: str
    email: str
    profile: UserProfile
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
