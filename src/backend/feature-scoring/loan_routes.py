"""
Loan routes — Supabase-backed read-only loan listing for lender view.

GET /api/loans         — fetch all loans (lender view)
GET /api/loans/active  — fetch only active/overdue loans
"""

from fastapi import APIRouter, Request
from auth_middleware import get_current_user_optional
from supabase_client import supabase_request, is_supabase_enabled

router = APIRouter(prefix="/api")


@router.get("/loans")
async def get_all_loans(request: Request, status: str = None):
    """
    Fetch all loans. Optionally filter by status (active, completed, overdue, defaulted).
    """
    token = request.headers.get("Authorization", "").replace("Bearer ", "") or None

    if is_supabase_enabled():
        params = {"order": "disbursed_at.desc"}
        if status:
            params["status"] = f"eq.{status}"

        result = await supabase_request("GET", "loans", params=params, token=token)
        if result is not None:
            return {"loans": result, "count": len(result)}

    # Fallback: no Supabase / no data
    return {"loans": [], "count": 0, "message": "Supabase not configured or no loans found"}


@router.get("/loans/active")
async def get_active_loans(request: Request):
    """
    Fetch only active and overdue loans (ongoing).
    """
    token = request.headers.get("Authorization", "").replace("Bearer ", "") or None

    if is_supabase_enabled():
        # PostgREST OR filter: status=active OR status=overdue
        params = {
            "or": "(status.eq.active,status.eq.overdue)",
            "order": "next_due_date.asc.nullslast",
        }
        result = await supabase_request("GET", "loans", params=params, token=token)
        if result is not None:
            # Compute summary stats
            total_outstanding = sum(float(l.get("amount", 0)) for l in result)
            total_emi = sum(float(l.get("emi", 0)) for l in result)
            overdue_count = sum(1 for l in result if l.get("status") == "overdue")

            return {
                "loans": result,
                "count": len(result),
                "summary": {
                    "total_outstanding": total_outstanding,
                    "total_monthly_emi": total_emi,
                    "overdue_count": overdue_count,
                    "active_count": len(result) - overdue_count,
                }
            }

    return {"loans": [], "count": 0, "summary": {}}


@router.get("/loans/stats")
async def get_loan_stats(request: Request):
    """
    Aggregate loan portfolio statistics for lender dashboard.
    """
    token = request.headers.get("Authorization", "").replace("Bearer ", "") or None

    if is_supabase_enabled():
        all_loans = await supabase_request("GET", "loans", token=token)
        if all_loans is not None:
            total = len(all_loans)
            active = sum(1 for l in all_loans if l.get("status") == "active")
            overdue = sum(1 for l in all_loans if l.get("status") == "overdue")
            completed = sum(1 for l in all_loans if l.get("status") == "completed")
            total_disbursed = sum(float(l.get("amount", 0)) for l in all_loans)
            total_emi = sum(float(l.get("emi", 0)) for l in all_loans if l.get("status") in ("active", "overdue"))

            return {
                "total_loans": total,
                "active": active,
                "overdue": overdue,
                "completed": completed,
                "total_disbursed": total_disbursed,
                "monthly_emi_collection": total_emi,
                "default_rate": round(overdue / total * 100, 1) if total else 0,
            }

    return {"total_loans": 0}
