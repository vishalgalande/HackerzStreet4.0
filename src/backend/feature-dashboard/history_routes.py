"""
Score history routes — Supabase-backed with in-memory fallback.
"""

from fastapi import APIRouter, Request, Query
from datetime import datetime
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "feature-auth"))
from supabase_client import supabase_request, is_supabase_enabled

router = APIRouter(prefix="/api")

# ── In-memory fallback ──
_history: dict[str, list[dict]] = {}


def _extract_user_token(request: Request) -> tuple[str, str]:
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "") if auth.startswith("Bearer ") else ""
    user_id = str(hash(token)) if len(token) > 20 else "demo-user"
    return user_id, token


@router.get("/score-history")
async def get_score_history(request: Request, limit: int = Query(30, ge=1, le=100)):
    user_id, token = _extract_user_token(request)

    # Try Supabase
    if is_supabase_enabled() and token:
        result = await supabase_request(
            "GET", "score_history",
            params={"select": "*", "order": "computed_at.desc", "limit": str(limit)},
            token=token,
        )
        if result is not None:
            return result

    # Fallback: in-memory
    history = _history.get(user_id, [])
    return sorted(history, key=lambda h: h["computed_at"], reverse=True)[:limit]


@router.post("/score-history")
async def save_score(request: Request):
    body = await request.json()
    user_id, token = _extract_user_token(request)

    entry = {
        "score": body.get("score", 0),
        "band": body.get("band", ""),
        "factors": body.get("factors"),
        "computed_at": datetime.now().isoformat(),
    }

    # Try Supabase
    if is_supabase_enabled() and token:
        result = await supabase_request(
            "POST", "score_history",
            json=entry,
            token=token,
            prefer="return=representation",
        )
        if result:
            return {"status": "ok", "message": "Score saved to Supabase"}

    # Fallback: in-memory
    if user_id not in _history:
        _history[user_id] = []
    _history[user_id].append(entry)
    return {"status": "ok", "message": "Score saved (local)"}
