"""
Savings Goals CRUD routes — Supabase-backed with in-memory fallback.
All goals are scoped to the authenticated user via JWT.

GET    /api/savings          — fetch all savings goals for the user
POST   /api/savings          — add a new savings goal
PATCH  /api/savings/{id}     — update a goal (e.g. add deposit)
DELETE /api/savings/{id}     — remove a savings goal
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import json
import base64

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "feature-auth"))
from supabase_client import supabase_request, is_supabase_enabled

router = APIRouter(prefix="/api")

_savings_store: dict[str, list[dict]] = {}


class SavingsGoalCreate(BaseModel):
    type: str = "emergency"
    icon: str = ""
    name: str = ""
    target_amount: float = 0
    current_amount: float = 0
    monthly_contribution: float = 0
    start_date: str = ""
    deposits: str = "[]"


class SavingsGoalUpdate(BaseModel):
    current_amount: float | None = None
    deposits: str | None = None
    name: str | None = None
    target_amount: float | None = None
    monthly_contribution: float | None = None


def _extract_user_id(request: Request) -> tuple[str, str]:
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "") if auth.startswith("Bearer ") else ""
    user_id = "demo-user"
    if token and token.count(".") == 2:
        try:
            payload_b64 = token.split(".")[1]
            padding = 4 - len(payload_b64) % 4
            if padding != 4:
                payload_b64 += "=" * padding
            payload = json.loads(base64.urlsafe_b64decode(payload_b64))
            user_id = payload.get("sub", user_id)
        except Exception:
            pass
    return user_id, token


@router.get("/savings")
async def get_savings(request: Request):
    user_id, token = _extract_user_id(request)

    if is_supabase_enabled() and token:
        result = await supabase_request(
            "GET", "user_savings",
            params={"user_id": f"eq.{user_id}", "select": "*", "order": "created_at.desc"},
            token=token,
        )
        if result is not None:
            for row in result:
                if isinstance(row.get("deposits"), str):
                    try:
                        row["deposits"] = json.loads(row["deposits"])
                    except Exception:
                        row["deposits"] = []
            return {"goals": result, "count": len(result)}

    stored = _savings_store.get(user_id, [])
    return {"goals": stored, "count": len(stored)}


@router.post("/savings")
async def add_savings_goal(goal: SavingsGoalCreate, request: Request):
    user_id, token = _extract_user_id(request)
    import uuid
    goal_id = f"goal_{uuid.uuid4().hex[:12]}"

    goal_data = {
        "id": goal_id,
        "user_id": user_id,
        "type": goal.type,
        "icon": goal.icon,
        "name": goal.name,
        "target_amount": goal.target_amount,
        "current_amount": goal.current_amount,
        "monthly_contribution": goal.monthly_contribution,
        "start_date": goal.start_date or None,
        "deposits": goal.deposits,
    }

    if is_supabase_enabled() and token:
        result = await supabase_request(
            "POST", "user_savings",
            json=goal_data,
            token=token,
            prefer="return=representation",
        )
        if result:
            saved = result[0] if isinstance(result, list) and len(result) > 0 else goal_data
            if isinstance(saved.get("deposits"), str):
                try:
                    saved["deposits"] = json.loads(saved["deposits"])
                except Exception:
                    saved["deposits"] = []
            return {"status": "ok", "goal": saved}

    if user_id not in _savings_store:
        _savings_store[user_id] = []
    _savings_store[user_id].append(goal_data)
    return {"status": "ok", "goal": goal_data}


@router.patch("/savings/{goal_id}")
async def update_savings_goal(goal_id: str, update: SavingsGoalUpdate, request: Request):
    user_id, token = _extract_user_id(request)

    updates = {}
    if update.current_amount is not None:
        updates["current_amount"] = update.current_amount
    if update.deposits is not None:
        updates["deposits"] = update.deposits
    if update.name is not None:
        updates["name"] = update.name
    if update.target_amount is not None:
        updates["target_amount"] = update.target_amount
    if update.monthly_contribution is not None:
        updates["monthly_contribution"] = update.monthly_contribution

    if not updates:
        return {"status": "ok", "message": "nothing to update"}

    if is_supabase_enabled() and token:
        result = await supabase_request(
            "PATCH", "user_savings",
            params={"id": f"eq.{goal_id}", "user_id": f"eq.{user_id}"},
            json=updates,
            token=token,
            prefer="return=representation",
        )
        if result:
            saved = result[0] if isinstance(result, list) and len(result) > 0 else updates
            if isinstance(saved.get("deposits"), str):
                try:
                    saved["deposits"] = json.loads(saved["deposits"])
                except Exception:
                    saved["deposits"] = []
            return {"status": "ok", "goal": saved}

    if user_id in _savings_store:
        _savings_store[user_id] = [
            {**g, **updates} if g.get("id") == goal_id else g
            for g in _savings_store[user_id]
        ]
    return {"status": "ok", "goal": updates}


@router.delete("/savings/{goal_id}")
async def delete_savings_goal(goal_id: str, request: Request):
    user_id, token = _extract_user_id(request)

    if is_supabase_enabled() and token:
        await supabase_request(
            "DELETE", "user_savings",
            params={"id": f"eq.{goal_id}", "user_id": f"eq.{user_id}"},
            token=token,
        )
        return {"status": "ok", "deleted": goal_id}

    if user_id in _savings_store:
        _savings_store[user_id] = [g for g in _savings_store[user_id] if g.get("id") != goal_id]
    return {"status": "ok", "deleted": goal_id}
