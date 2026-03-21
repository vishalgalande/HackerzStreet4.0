"""
Daily entry CRUD routes.
Users log daily expenses, savings, and bill payment status.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import date, datetime
from typing import Optional
from dashboard_models import DailyEntry, DailyEntryResponse

# Import auth middleware from feature-auth
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "feature-auth"))
from auth_middleware import get_current_user

router = APIRouter(prefix="/api")


@router.post("/entries")
async def create_daily_entry(
    entry: DailyEntry,
    user: dict = Depends(get_current_user),
):
    """
    Log a daily expense/savings entry.
    """
    from supabase_client import supabase

    data = {
        "user_id": user["id"],
        "date": str(entry.date or date.today()),
        "rent": entry.rent,
        "food": entry.food,
        "transport": entry.transport,
        "discretionary": entry.discretionary,
        "savings": entry.savings,
        "bill_paid_on_time": entry.bill_paid_on_time,
        "notes": entry.notes,
    }

    try:
        result = supabase.table("daily_entries").insert(data).execute()
        return {"status": "ok", "message": "Entry saved", "id": result.data[0]["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save entry: {str(e)}")


@router.get("/entries", response_model=list[DailyEntryResponse])
async def get_entries(
    user: dict = Depends(get_current_user),
    days: int = Query(30, ge=1, le=365, description="Number of days of history"),
):
    """
    Retrieve the user's daily entries for the last N days.
    """
    from supabase_client import supabase

    try:
        result = (
            supabase.table("daily_entries")
            .select("*")
            .eq("user_id", user["id"])
            .order("date", desc=True)
            .limit(days)
            .execute()
        )
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch entries: {str(e)}")


@router.delete("/entries/{entry_id}")
async def delete_entry(
    entry_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete a daily entry (user can only delete their own)."""
    from supabase_client import supabase

    try:
        result = (
            supabase.table("daily_entries")
            .delete()
            .eq("id", entry_id)
            .eq("user_id", user["id"])
            .execute()
        )
        return {"status": "ok", "message": "Entry deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete entry: {str(e)}")
