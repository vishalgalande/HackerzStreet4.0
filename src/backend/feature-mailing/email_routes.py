"""
FastAPI routes for the email notification system.
Provides endpoints to check/send alerts and test the email connection.
"""

from fastapi import APIRouter, Request
from email_models import AlertCheckRequest, AlertCheckResponse, TestEmailRequest
from email_triggers import check_and_send_alerts
from email_service import send_email, is_email_enabled
from email_templates import build_test_email

router = APIRouter(prefix="/api")


@router.post("/check-alerts", response_model=AlertCheckResponse)
async def check_alerts(req: AlertCheckRequest):
    """
    Check credit score and spending patterns, send alert emails if thresholds
    are breached.

    Triggers:
    - Score < 450 → sends low-score warning email
    - Weekly spending 20%+ above average → sends spending spike email
    """
    entries_data = [e.model_dump() for e in req.entries]

    result = await check_and_send_alerts(
        user_email=req.email,
        user_name=req.name,
        score=req.score,
        factor_scores=req.factor_scores,
        recommendations=req.recommendations,
        entries=entries_data,
    )

    return AlertCheckResponse(**result)


@router.post("/send-test-email")
async def send_test_email(req: TestEmailRequest):
    """
    Send a test email to verify the Resend API connection is working.
    """
    if not is_email_enabled():
        return {
            "success": False,
            "error": "RESEND_API_KEY not configured in .env",
        }

    subject, html = build_test_email(req.name)
    result = await send_email(req.email, subject, html)

    return {
        "success": result["success"],
        "email_id": result["id"],
        "error": result["error"],
        "message": (
            f"Test email sent to {req.email}!"
            if result["success"]
            else f"Failed to send: {result['error']}"
        ),
    }


@router.get("/alerts")
async def get_alerts(request: Request):
    """
    Fetch all email logs (sent alerts) for the notifications page.
    Returns most recent first.
    """
    from supabase_client import supabase_request, is_supabase_enabled

    if is_supabase_enabled():
        result = await supabase_request(
            "GET", "email_logs",
            params={
                "order": "sent_at.desc",
                "limit": "50",
            },
        )
        if result is not None:
            return {"alerts": result, "count": len(result)}

    return {"alerts": [], "count": 0}
