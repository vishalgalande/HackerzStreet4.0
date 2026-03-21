"""
Profile CRUD routes — Supabase-backed with in-memory fallback.
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
import json

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "feature-auth"))
from supabase_client import supabase_request, is_supabase_enabled

router = APIRouter(prefix="/api")

# ── In-memory fallback ──
_profiles: dict[str, dict] = {}


class LoanEntry(BaseModel):
    type: str = ""
    name: str = ""
    emi: float = 0


class ProfileSetupRequest(BaseModel):
    income_amount: float = Field(0, ge=0)
    income_period: str = "monthly"
    monthly_income: float = 0
    employment_type: str = "none"
    existing_debt: float = 0
    loans: list[LoanEntry] = []
    rent_history: str = "consistent"
    bill_payment: str = "always_on_time"
    telecom_regularity: bool = False


def _extract_user_token(request: Request) -> tuple[str, str]:
    """Extract user ID and token from auth header."""
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "") if auth.startswith("Bearer ") else ""
    # For demo: use hash of token as user ID
    user_id = str(hash(token)) if len(token) > 20 else "demo-user"
    return user_id, token


@router.post("/profile")
async def create_or_update_profile(profile: ProfileSetupRequest, request: Request):
    user_id, token = _extract_user_token(request)

    monthly = profile.income_amount
    if profile.income_period == "quarterly":
        monthly = round(profile.income_amount / 3)
    elif profile.income_period == "half_yearly":
        monthly = round(profile.income_amount / 6)
    total_emi = sum(l.emi for l in profile.loans)

    profile_data = {
        "income_amount": profile.income_amount,
        "income_period": profile.income_period,
        "monthly_income": monthly,
        "employment_type": profile.employment_type,
        "existing_debt": total_emi,
        "loans": [l.model_dump() for l in profile.loans],
        "rent_history": profile.rent_history,
        "bill_payment": profile.bill_payment,
        "telecom_regularity": profile.telecom_regularity,
    }

    # Try Supabase
    if is_supabase_enabled() and token:
        sb_data = {**profile_data, "loans": json.dumps(profile_data["loans"])}
        # Try upsert
        result = await supabase_request(
            "POST", "user_profiles",
            json={**sb_data, "id": user_id} if user_id != "demo-user" else sb_data,
            token=token,
            prefer="resolution=merge-duplicates,return=representation",
        )
        if result:
            return {"status": "ok", "message": "Profile saved to Supabase"}

    # Fallback: in-memory
    _profiles[user_id] = profile_data
    return {"status": "ok", "message": "Profile saved (local)"}


@router.get("/profile")
async def get_profile(request: Request):
    user_id, token = _extract_user_token(request)

    # Try Supabase
    if is_supabase_enabled() and token:
        result = await supabase_request(
            "GET", "user_profiles",
            params={"select": "*", "limit": "1"},
            token=token,
        )
        if result and len(result) > 0:
            row = result[0]
            if isinstance(row.get("loans"), str):
                row["loans"] = json.loads(row["loans"])
            return {"id": row.get("id", user_id), "email": "", "profile": row}

    # Fallback: in-memory
    profile = _profiles.get(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"id": user_id, "email": "", "profile": profile}
