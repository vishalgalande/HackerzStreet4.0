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


class LoanInsightItem(BaseModel):
    name: str = ""
    amount: float = 0
    emi: float = 0
    interest_rate: float = 0
    tenure_months: int = 0
    completed_months: int = 0
    status: str = "active"

class CCInsightItem(BaseModel):
    name: str = ""
    credit_limit: float = 0
    current_balance: float = 0
    min_payment: float = 0
    due_date: str = ""

class BillInsightItem(BaseModel):
    name: str = ""
    category: str = ""
    avg_amount: float = 0
    auto_pay: bool = False

class LoanInsightsRequest(BaseModel):
    loans: list[LoanInsightItem] = []
    credit_cards: list[CCInsightItem] = []
    bills: list[BillInsightItem] = []
    monthly_income: float = 0


LOAN_SYSTEM_PROMPT = """You are a senior financial advisor AI built into an alternative credit scoring tool called FinFix. Analyze the user's complete payment portfolio (loans, credit cards, and recurring bills) and give brief, actionable insights.

CRITICAL FORMATTING RULE — you MUST prefix EVERY line with exactly one of these tags:
[POSITIVE] — for things the user is doing well (low risk, good ratios, on track)
[WARNING] — for risks and concerns (high utilization, missed payments, high DTI)
[ACTION] — for specific next steps (prepay X, reduce Y, set up auto-pay)

Rules:
- Exactly 4-6 tagged lines. Each line is 1-2 sentences.
- Use ₹ for currency. Reference Indian financial context.
- Cover: debt health, CC utilization, bill automation, prepayment strategy, and credit score impact.
- If debt-to-income is below 30%, praise it. If CC utilization is above 30%, warn.
- If bills lack auto-pay, recommend setting it up.
- Keep the total response under 250 words.
- Do NOT use bullet symbols, headers, or markdown. Just the tagged lines, one per line.
"""


@router.post("/loans/insights")
async def get_loan_insights(req: LoanInsightsRequest):
    if not GEMINI_API_KEY:
        return {"insight": "AI insights unavailable — GEMINI_API_KEY not set.", "error": "no_api_key"}

    if not req.loans and not req.credit_cards and not req.bills:
        return {"insight": "Add payments to your portfolio to get AI insights.", "error": None}

    sections = []
    total_emi = 0

    if req.loans:
        loan_lines = []
        for i, loan in enumerate(req.loans, 1):
            remaining = loan.tenure_months - loan.completed_months
            progress = round((loan.completed_months / loan.tenure_months * 100) if loan.tenure_months > 0 else 0)
            loan_lines.append(
                f"  {i}. {loan.name or 'Unnamed Loan'}: ₹{loan.amount:,.0f} at {loan.interest_rate}% "
                f"| EMI: ₹{loan.emi:,.0f}/mo | {loan.completed_months}/{loan.tenure_months} months ({progress}%) "
                f"| {remaining} remaining | Status: {loan.status}"
            )
            total_emi += loan.emi
        sections.append(f"LOANS:\n{chr(10).join(loan_lines)}")

    if req.credit_cards:
        cc_lines = []
        for i, cc in enumerate(req.credit_cards, 1):
            util = round(cc.current_balance / cc.credit_limit * 100) if cc.credit_limit > 0 else 0
            cc_lines.append(
                f"  {i}. {cc.name}: Limit ₹{cc.credit_limit:,.0f} | Balance ₹{cc.current_balance:,.0f} "
                f"| Utilization {util}% | Min Payment ₹{cc.min_payment:,.0f}"
            )
            total_emi += cc.min_payment
        sections.append(f"CREDIT CARDS:\n{chr(10).join(cc_lines)}")

    if req.bills:
        bill_lines = []
        for i, bill in enumerate(req.bills, 1):
            bill_lines.append(
                f"  {i}. {bill.name} ({bill.category}): ₹{bill.avg_amount:,.0f}/mo | Auto-pay: {'Yes' if bill.auto_pay else 'No'}"
            )
            total_emi += bill.avg_amount
        sections.append(f"RECURRING BILLS:\n{chr(10).join(bill_lines)}")

    dti = round((total_emi / req.monthly_income * 100) if req.monthly_income > 0 else 0)

    context = f"""{chr(10).join(sections)}

SUMMARY:
- Total monthly outflow: ₹{total_emi:,.0f}
- Monthly income: ₹{req.monthly_income:,.0f}
- Debt-to-income ratio: {dti}%
- Active loans: {len(req.loans)} | Credit cards: {len(req.credit_cards)} | Bills: {len(req.bills)}

Analyze this portfolio and provide tagged insights."""

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
