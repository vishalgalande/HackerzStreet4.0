"""
Profile CRUD routes — Supabase-backed with in-memory fallback.
Profiles are stored per-user so data persists across sessions.
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
import json
import base64

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
    email: str = ""
    full_name: str = ""


def _extract_user_id(request: Request) -> tuple[str, str]:
    """Extract user ID from JWT and raw token from auth header."""
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "") if auth.startswith("Bearer ") else ""

    # Decode JWT payload to get the actual Supabase user ID
    user_id = "demo-user"
    if token and token.count(".") == 2:
        try:
            payload_b64 = token.split(".")[1]
            # Add padding if needed
            padding = 4 - len(payload_b64) % 4
            if padding != 4:
                payload_b64 += "=" * padding
            payload = json.loads(base64.urlsafe_b64decode(payload_b64))
            user_id = payload.get("sub", user_id)
        except Exception:
            pass

    return user_id, token


@router.post("/profile")
async def create_or_update_profile(profile: ProfileSetupRequest, request: Request):
    user_id, token = _extract_user_id(request)

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
        "email": profile.email,
        "full_name": profile.full_name,
    }

    # Try Supabase
    if is_supabase_enabled() and token:
        sb_data = {**profile_data, "loans": json.dumps(profile_data["loans"]), "user_id": user_id}
        # Upsert on user_id
        result = await supabase_request(
            "POST", "user_profiles",
            json=sb_data,
            token=token,
            prefer="resolution=merge-duplicates,return=representation",
        )
        if result:
            print(f"✅ Profile saved to Supabase for user {user_id}")
            return {"status": "ok", "message": "Profile saved to Supabase", "profile": profile_data}

    # Fallback: in-memory
    _profiles[user_id] = profile_data
    print(f"✅ Profile saved in-memory for user {user_id}")
    return {"status": "ok", "message": "Profile saved (local)", "profile": profile_data}


@router.get("/profile")
async def get_profile(request: Request):
    user_id, token = _extract_user_id(request)

    # Try Supabase
    if is_supabase_enabled() and token:
        result = await supabase_request(
            "GET", "user_profiles",
            params={"user_id": f"eq.{user_id}", "select": "*", "limit": "1"},
            token=token,
        )
        if result and len(result) > 0:
            row = result[0]
            if isinstance(row.get("loans"), str):
                try:
                    row["loans"] = json.loads(row["loans"])
                except Exception:
                    row["loans"] = []
            return {
                "id": user_id,
                "email": row.get("email", ""),
                "profile": row,
            }

    # Fallback: in-memory
    profile = _profiles.get(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"id": user_id, "email": profile.get("email", ""), "profile": profile}
