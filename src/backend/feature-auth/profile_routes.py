"""
Profile CRUD routes — create/read/update user financial profiles.
All routes require authentication via Supabase JWT.
"""

from fastapi import APIRouter, Depends, HTTPException
from auth_middleware import get_current_user
from auth_models import ProfileSetupRequest, ProfileResponse, UserProfile

router = APIRouter(prefix="/api")


@router.post("/profile")
async def create_or_update_profile(
    profile_data: ProfileSetupRequest,
    user: dict = Depends(get_current_user),
):
    """
    Create or update the user's financial profile.
    Called during first-time onboarding and profile edits.
    """
    from supabase_client import supabase

    data = {
        "id": user["id"],
        "monthly_income": profile_data.monthly_income,
        "employment_type": profile_data.employment_type,
        "existing_debt": profile_data.existing_debt,
        "rent_history": profile_data.rent_history,
        "bill_payment": profile_data.bill_payment,
        "telecom_regularity": profile_data.telecom_regularity,
        "updated_at": "now()",
    }

    try:
        # Upsert — create if new, update if exists
        result = supabase.table("user_profiles").upsert(data).execute()
        return {"status": "ok", "message": "Profile saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")


@router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    """
    Retrieve the user's financial profile.
    Returns 404 if profile hasn't been set up yet.
    """
    from supabase_client import supabase

    try:
        result = (
            supabase.table("user_profiles")
            .select("*")
            .eq("id", user["id"])
            .single()
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found. Complete setup first.")

        return ProfileResponse(
            id=user["id"],
            email=user["email"],
            profile=UserProfile(
                monthly_income=result.data.get("monthly_income", 0),
                employment_type=result.data.get("employment_type", "none"),
                existing_debt=result.data.get("existing_debt", 0),
                rent_history=result.data.get("rent_history", "consistent"),
                bill_payment=result.data.get("bill_payment", "always_on_time"),
                telecom_regularity=result.data.get("telecom_regularity", False),
            ),
            created_at=result.data.get("created_at"),
            updated_at=result.data.get("updated_at"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")
