"""
Score history routes — retrieve past score computations for trend analysis.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from dashboard_models import ScoreHistoryEntry

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "feature-auth"))
from auth_middleware import get_current_user

router = APIRouter(prefix="/api")


@router.get("/score-history", response_model=list[ScoreHistoryEntry])
async def get_score_history(
    user: dict = Depends(get_current_user),
    limit: int = Query(30, ge=1, le=100, description="Number of records to return"),
):
    """
    Retrieve the user's score history for trend visualization.
    Returns most recent scores first.
    """
    from supabase_client import supabase

    try:
        result = (
            supabase.table("score_history")
            .select("*")
            .eq("user_id", user["id"])
            .order("computed_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch score history: {str(e)}")


@router.post("/score-history")
async def save_score(
    score: int,
    band: str,
    factors: dict,
    user: dict = Depends(get_current_user),
):
    """Save a computed score to history for trend tracking."""
    from supabase_client import supabase

    try:
        data = {
            "user_id": user["id"],
            "score": score,
            "band": band,
            "factors": factors,
        }
        result = supabase.table("score_history").insert(data).execute()
        return {"status": "ok", "message": "Score saved to history"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save score: {str(e)}")
