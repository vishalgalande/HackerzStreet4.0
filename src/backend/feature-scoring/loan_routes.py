"""
Loan routes — Supabase-backed loan listing + AI insights via Gemini.

GET  /api/loans          — fetch all loans (lender view)
GET  /api/loans/active   — fetch only active/overdue loans
GET  /api/loans/stats    — portfolio statistics
POST /api/loans/insights — AI-powered loan portfolio analysis (Gemini)
"""

import os
import httpx
from pathlib import Path
from dotenv import load_dotenv
from fastapi import APIRouter, Request
from pydantic import BaseModel
from supabase_client import supabase_request, is_supabase_enabled

# Load env for Gemini key
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.5-flash-lite"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

router = APIRouter(prefix="/api")


# ── AI Insights endpoint ──

class LoanInsightItem(BaseModel):
    name: str = ""
    amount: float = 0
    emi: float = 0
    interest_rate: float = 0
    tenure_months: int = 0
    completed_months: int = 0
    status: str = "active"

class LoanInsightsRequest(BaseModel):
    loans: list[LoanInsightItem] = []
    monthly_income: float = 0


LOAN_SYSTEM_PROMPT = """You are a senior financial advisor AI built into a credit assessment tool. Analyze the user's loan portfolio and give brief, actionable insights.

Rules:
- Be concise: 3-5 bullet points max, each 1-2 sentences.
- Use ₹ for currency. Reference Indian financial context.
- Focus on: prepayment strategy, risk factors, timeline optimization, and credit score impact.
- If loans are nearly complete, congratulate. If debt-to-income is high, warn kindly.
- Format as clean bullet points using • symbol. No headers or markdown.
- Keep the total response under 200 words.
"""


@router.post("/loans/insights")
async def get_loan_insights(req: LoanInsightsRequest):
    """AI-powered loan portfolio insights using Gemini."""
    if not GEMINI_API_KEY:
        return {"insight": "AI insights unavailable — GEMINI_API_KEY not set.", "error": "no_api_key"}

    if not req.loans:
        return {"insight": "Add loans to your portfolio to get AI insights.", "error": None}

    # Build context from loans
    loan_lines = []
    total_emi = 0
    for i, loan in enumerate(req.loans, 1):
        remaining = loan.tenure_months - loan.completed_months
        progress = round((loan.completed_months / loan.tenure_months * 100) if loan.tenure_months > 0 else 0)
        loan_lines.append(
            f"  {i}. {loan.name or 'Unnamed Loan'}: ₹{loan.amount:,.0f} at {loan.interest_rate}% "
            f"| EMI: ₹{loan.emi:,.0f}/mo | {loan.completed_months}/{loan.tenure_months} months done ({progress}%) "
            f"| {remaining} months remaining | Status: {loan.status}"
        )
        total_emi += loan.emi

    dti = round((total_emi / req.monthly_income * 100) if req.monthly_income > 0 else 0)

    context = f"""LOAN PORTFOLIO:
{chr(10).join(loan_lines)}

SUMMARY:
- Total monthly EMI: ₹{total_emi:,.0f}
- Monthly income: ₹{req.monthly_income:,.0f}
- Debt-to-income ratio: {dti}%
- Number of active loans: {len(req.loans)}

Provide concise, actionable insights for this borrower."""

    payload = {
        "system_instruction": {"parts": [{"text": LOAN_SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": context}]}],
        "generationConfig": {"temperature": 0.6, "maxOutputTokens": 400, "topP": 0.9},
    }

    try:
        async with httpx.AsyncClient() as client:
            # Retry up to 3 times for rate limits (429)
            last_error = ""
            for attempt in range(3):
                response = await client.post(
                    f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                    json=payload,
                    timeout=25,
                )
                if response.status_code == 200:
                    data = response.json()
                    reply = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {"insight": reply, "error": None}

                last_error = response.text[:300]
                print(f"Gemini attempt {attempt+1} failed: {response.status_code} — {last_error}")

                if response.status_code == 429:
                    # Rate limited — wait and retry
                    import asyncio
                    await asyncio.sleep(2 * (attempt + 1))
                    continue
                else:
                    break

            # All retries failed
            # Try to extract a human-readable error
            try:
                err_data = response.json()
                err_msg = err_data.get("error", {}).get("message", last_error[:100])
            except Exception:
                err_msg = f"Gemini API error {response.status_code}"

            return {"insight": f"⚠️ {err_msg}", "error": f"gemini_{response.status_code}"}

    except httpx.TimeoutException:
        return {"insight": "Request timed out. Please try again.", "error": "timeout"}
    except Exception as e:
        print(f"Loan insights error: {e}")
        return {"insight": "Something went wrong generating insights.", "error": str(e)}


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
