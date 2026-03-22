import os
import calendar
from datetime import datetime, timedelta
from fastapi import APIRouter, Request
from email_service import send_email
from email_templates import build_payment_reminder_email

router = APIRouter(prefix="/api/cron")

CRON_SECRET = os.getenv("CRON_SECRET", "")


async def send_payment_reminder_email(user: dict, payment: dict, reminder_type: str):
    user_name = user.get("name") or user.get("full_name") or "User"
    user_email = user.get("email", "")
    if not user_email:
        return None

    payment_name = payment.get("name", "Payment")
    payment_amount = float(payment.get("emi") or payment.get("min_payment") or payment.get("avg_amount") or 0)
    payment_type = payment.get("type", "bill")
    due_day = payment.get("due_day_of_month", 1)

    now = datetime.now()
    if reminder_type == "upcoming":
        due_date = now + timedelta(days=3)
    else:
        due_date = now.replace(day=due_day) if due_day <= calendar.monthrange(now.year, now.month)[1] else now

    due_date_str = due_date.strftime("%b %d, %Y")

    subject, html = build_payment_reminder_email(
        user_name=user_name,
        payment_name=payment_name,
        payment_amount=payment_amount,
        payment_type=payment_type,
        due_date_str=due_date_str,
        reminder_type=reminder_type,
    )

    result = await send_email(user_email, subject, html)

    if result and result.get("success"):
        try:
            from supabase_client import supabase_request, is_supabase_enabled
            if is_supabase_enabled():
                log_type = "payment_due_today" if reminder_type == "due_today" else "payment_reminder"
                await supabase_request(
                    "PATCH", "email_logs",
                    params={"email": f"eq.{user_email}", "subject": f"eq.{subject}"},
                    json={"type": log_type},
                )
        except Exception:
            pass

    return result


@router.post("/payment-reminders")
async def payment_reminders(request: Request):
    auth_header = request.headers.get("authorization", "")
    if not CRON_SECRET or auth_header != f"Bearer {CRON_SECRET}":
        return {"error": "Unauthorized"}, 401

    from supabase_client import supabase_request, is_supabase_enabled
    if not is_supabase_enabled():
        return {"error": "Supabase not configured", "sent": 0}

    now = datetime.now()
    today = now.day
    target_date = now + timedelta(days=3)
    target_day = target_date.day

    last_day_of_month = calendar.monthrange(now.year, now.month)[1]
    is_last_day = today == last_day_of_month

    today_iso = now.strftime("%Y-%m-%dT00:00:00")

    upcoming_payments = await supabase_request(
        "GET", "recurring_payments",
        params={
            "select": "*,profiles(email,full_name)",
            "due_day_of_month": f"eq.{target_day}",
            "or": f"(last_notified_at.is.null,last_notified_at.lt.{today_iso})",
        },
    )

    if is_last_day:
        due_today_payments = await supabase_request(
            "GET", "recurring_payments",
            params={
                "select": "*,profiles(email,full_name)",
                "due_day_of_month": f"gte.{today}",
                "or": f"(last_notified_at.is.null,last_notified_at.lt.{today_iso})",
            },
        )
    else:
        due_today_payments = await supabase_request(
            "GET", "recurring_payments",
            params={
                "select": "*,profiles(email,full_name)",
                "due_day_of_month": f"eq.{today}",
                "or": f"(last_notified_at.is.null,last_notified_at.lt.{today_iso})",
            },
        )

    sent_count = 0
    errors = []

    for payment in (upcoming_payments or []):
        user = payment.get("profiles", {}) or {}
        user["email"] = user.get("email") or payment.get("user_email", "")
        try:
            result = await send_payment_reminder_email(user, payment, "upcoming")
            if result and result.get("success"):
                sent_count += 1
                await supabase_request(
                    "PATCH", f"recurring_payments?id=eq.{payment['id']}",
                    json={"last_notified_at": datetime.now().isoformat()},
                )
        except Exception as e:
            errors.append(f"upcoming:{payment.get('name')}:{str(e)}")

    for payment in (due_today_payments or []):
        user = payment.get("profiles", {}) or {}
        user["email"] = user.get("email") or payment.get("user_email", "")
        try:
            result = await send_payment_reminder_email(user, payment, "due_today")
            if result and result.get("success"):
                sent_count += 1
                await supabase_request(
                    "PATCH", f"recurring_payments?id=eq.{payment['id']}",
                    json={"last_notified_at": datetime.now().isoformat()},
                )
        except Exception as e:
            errors.append(f"due_today:{payment.get('name')}:{str(e)}")

    return {
        "success": True,
        "date": now.isoformat(),
        "is_last_day_of_month": is_last_day,
        "upcoming_checked": len(upcoming_payments or []),
        "due_today_checked": len(due_today_payments or []),
        "emails_sent": sent_count,
        "errors": errors if errors else None,
    }
