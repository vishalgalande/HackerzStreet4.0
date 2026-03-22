"""
Payment CRUD routes — Supabase-backed with in-memory fallback.
All payments are scoped to the authenticated user via JWT.

GET    /api/payments          — fetch all payments for the user
POST   /api/payments          — add a new payment
DELETE /api/payments/{id}     — remove a payment
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import json
import base64

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "feature-auth"))
from supabase_client import supabase_request, is_supabase_enabled

router = APIRouter(prefix="/api")

_payments_store: dict[str, list[dict]] = {}


class PaymentCreate(BaseModel):
    type: str = "loan"
    name: str = ""
    icon: str = ""
    amount: float = 0
    emi: float = 0
    interest_rate: float = 0
    tenure_months: int = 0
    start_date: str = ""
    bank_name: str = ""
    credit_limit: float = 0
    current_balance: float = 0
    min_payment: float = 0
    due_date: str = ""
    statement_date: str = ""
    category: str = ""
    avg_amount: float = 0
    auto_pay: bool = False


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


@router.get("/payments")
async def get_payments(request: Request):
    user_id, token = _extract_user_id(request)

    if is_supabase_enabled() and token:
        result = await supabase_request(
            "GET", "user_payments",
            params={"user_id": f"eq.{user_id}", "select": "*", "order": "created_at.desc"},
            token=token,
        )
        if result is not None:
            return {"payments": result, "count": len(result)}

    stored = _payments_store.get(user_id, [])
    return {"payments": stored, "count": len(stored)}


@router.post("/payments")
async def add_payment(payment: PaymentCreate, request: Request):
    user_id, token = _extract_user_id(request)
    import uuid
    payment_id = f"{payment.type}_{uuid.uuid4().hex[:12]}"

    payment_data = {
        "id": payment_id,
        "user_id": user_id,
        "type": payment.type,
        "name": payment.name,
        "icon": payment.icon,
        "amount": payment.amount,
        "emi": payment.emi,
        "interest_rate": payment.interest_rate,
        "tenure_months": payment.tenure_months,
        "start_date": payment.start_date or None,
        "bank_name": payment.bank_name,
        "credit_limit": payment.credit_limit,
        "current_balance": payment.current_balance,
        "min_payment": payment.min_payment,
        "due_date": payment.due_date,
        "statement_date": payment.statement_date,
        "category": payment.category,
        "avg_amount": payment.avg_amount,
        "auto_pay": payment.auto_pay,
    }

    if is_supabase_enabled() and token:
        result = await supabase_request(
            "POST", "user_payments",
            json=payment_data,
            token=token,
            prefer="return=representation",
        )
        if result:
            saved = result[0] if isinstance(result, list) and len(result) > 0 else payment_data
            return {"status": "ok", "payment": saved}

    if user_id not in _payments_store:
        _payments_store[user_id] = []
    _payments_store[user_id].append(payment_data)
    return {"status": "ok", "payment": payment_data}


@router.delete("/payments/{payment_id}")
async def delete_payment(payment_id: str, request: Request):
    user_id, token = _extract_user_id(request)

    if is_supabase_enabled() and token:
        result = await supabase_request(
            "DELETE", "user_payments",
            params={"id": f"eq.{payment_id}", "user_id": f"eq.{user_id}"},
            token=token,
        )
        return {"status": "ok", "deleted": payment_id}

    if user_id in _payments_store:
        _payments_store[user_id] = [p for p in _payments_store[user_id] if p.get("id") != payment_id]
    return {"status": "ok", "deleted": payment_id}
