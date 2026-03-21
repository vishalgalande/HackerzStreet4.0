"""
Daily entry CRUD routes — Supabase-backed with in-memory fallback.
"""

from fastapi import APIRouter, Request, Query
from pydantic import BaseModel
from typing import Optional
from datetime import date
import uuid, sys, os

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "feature-auth"))
from supabase_client import supabase_request, is_supabase_enabled

router = APIRouter(prefix="/api")

# ── In-memory fallback ──
_entries: dict[str, list[dict]] = {}


class DailyEntry(BaseModel):
    date: Optional[str] = None
    rent: float = 0
    food: float = 0
    transport: float = 0
    discretionary: float = 0
    savings: float = 0
    bill_paid_on_time: bool = True
    notes: Optional[str] = None


def _extract_user_token(request: Request) -> tuple[str, str]:
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "") if auth.startswith("Bearer ") else ""
    user_id = str(hash(token)) if len(token) > 20 else "demo-user"
    return user_id, token


@router.post("/entries")
async def create_entry(entry: DailyEntry, request: Request):
    user_id, token = _extract_user_token(request)
    entry_id = str(uuid.uuid4())

    entry_data = {
        "id": entry_id,
        "date": entry.date or str(date.today()),
        "rent": entry.rent,
        "food": entry.food,
        "transport": entry.transport,
        "discretionary": entry.discretionary,
        "savings": entry.savings,
        "bill_paid_on_time": entry.bill_paid_on_time,
        "notes": entry.notes,
    }

    # Try Supabase
    if is_supabase_enabled() and token:
        result = await supabase_request(
            "POST", "daily_entries",
            json=entry_data,
            token=token,
            prefer="return=representation",
        )
        if result:
            return {"status": "ok", "id": entry_id, "message": "Entry saved to Supabase"}

    # Fallback: in-memory
    if user_id not in _entries:
        _entries[user_id] = []
    _entries[user_id].append({**entry_data, "user_id": user_id, "created_at": str(date.today())})
    return {"status": "ok", "id": entry_id, "message": "Entry saved (local)"}


@router.get("/entries")
async def get_entries(request: Request, days: int = Query(30, ge=1, le=365)):
    user_id, token = _extract_user_token(request)

    # Try Supabase
    if is_supabase_enabled() and token:
        result = await supabase_request(
            "GET", "daily_entries",
            params={"select": "*", "order": "date.desc", "limit": str(days)},
            token=token,
        )
        if result is not None:
            return result

    # Fallback: in-memory
    entries = _entries.get(user_id, [])
    return sorted(entries, key=lambda e: e["date"], reverse=True)[:days]


@router.delete("/entries/{entry_id}")
async def delete_entry(entry_id: str, request: Request):
    user_id, token = _extract_user_token(request)

    # Try Supabase
    if is_supabase_enabled() and token:
        result = await supabase_request(
            "DELETE", "daily_entries",
            params={"id": f"eq.{entry_id}"},
            token=token,
        )
        if result is not None:
            return {"status": "ok", "message": "Entry deleted from Supabase"}

    # Fallback: in-memory
    entries = _entries.get(user_id, [])
    _entries[user_id] = [e for e in entries if e["id"] != entry_id]
    return {"status": "ok", "message": "Entry deleted (local)"}
