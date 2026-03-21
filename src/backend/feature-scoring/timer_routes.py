"""
Anti-Impulse Timer routes — Backend-persisted multi-timer with email notification.

POST /api/timer/start   — start a new timer (with item description + price)
GET  /api/timers/active  — get ALL active timers
POST /api/timer/cancel   — cancel a specific timer
"""

import asyncio
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Request
from supabase_client import supabase_request, is_supabase_enabled
from email_service import send_email, is_email_enabled
from email_templates import build_timer_complete_email

router = APIRouter(prefix="/api")

# In-memory tracker for background timer tasks
_active_tasks: dict[str, asyncio.Task] = {}
# In-memory fallback for timers (when Supabase is not available)
_in_memory_timers: list[dict] = []


async def _timer_completion_job(
    timer_id: str,
    user_email: str,
    user_name: str,
    delay_seconds: float,
    item_description: str = "",
    item_price: float = 0,
):
    """
    Background job: waits until timer ends, then sends email + updates status.
    """
    try:
        await asyncio.sleep(max(0, delay_seconds))

        # Mark timer as completed in Supabase
        if is_supabase_enabled():
            await supabase_request(
                "PATCH", "timers",
                params={"id": f"eq.{timer_id}"},
                json={"status": "completed"},
                prefer="return=representation",
            )

        # Mark in-memory timer as completed
        for t in _in_memory_timers:
            if t.get("id") == timer_id:
                t["status"] = "completed"

        # Send completion email with item details
        if is_email_enabled() and user_email:
            subject, html = build_timer_complete_email(
                user_name=user_name or "there",
                item_description=item_description,
                item_price=item_price,
            )
            result = await send_email(user_email, subject, html)

            # Log to email_logs
            if is_supabase_enabled():
                preview = f"Timer complete for: {item_description}" if item_description else "Your waiting period is over."
                await supabase_request(
                    "POST", "email_logs",
                    json={
                        "email": user_email,
                        "subject": subject,
                        "type": "timer_complete",
                        "preview": preview,
                    },
                    prefer="return=representation",
                )

            if result["success"]:
                print(f"✅ Timer complete email sent to {user_email} (item: {item_description})")
            else:
                print(f"❌ Timer email failed: {result['error']}")

    except asyncio.CancelledError:
        print(f"Timer {timer_id} was cancelled")
    except Exception as e:
        print(f"Timer job error: {e}")
    finally:
        _active_tasks.pop(timer_id, None)


@router.post("/timer/start")
async def start_timer(request: Request):
    """
    Start a new anti-impulse timer.
    Body: {duration_seconds, email?, name?, item_description?, item_price?}
    """
    body = await request.json()
    duration = body.get("duration_seconds", 43200)
    email = body.get("email", "")
    name = body.get("name", "")
    item_description = body.get("item_description", "")
    item_price = body.get("item_price", 0)

    now = datetime.now(timezone.utc)
    ends_at = now + timedelta(seconds=duration)

    timer_data = {
        "duration_seconds": duration,
        "started_at": now.isoformat(),
        "ends_at": ends_at.isoformat(),
        "status": "active",
        "user_email": email,
        "user_name": name,
        "item_description": item_description,
        "item_price": item_price,
    }

    timer_id = None
    if is_supabase_enabled():
        result = await supabase_request(
            "POST", "timers",
            json=timer_data,
            prefer="return=representation",
        )
        if result and isinstance(result, list) and len(result) > 0:
            timer_id = result[0].get("id")
            timer_data["id"] = timer_id

    # In-memory fallback
    if not timer_id:
        import uuid
        timer_id = str(uuid.uuid4())
        timer_data["id"] = timer_id
        _in_memory_timers.append(timer_data)

    # Start background completion job
    task = asyncio.create_task(
        _timer_completion_job(
            timer_id, email, name, duration,
            item_description, item_price,
        )
    )
    _active_tasks[timer_id] = task

    return {
        "success": True,
        "timer": {
            "id": timer_id,
            "duration_seconds": duration,
            "started_at": now.isoformat(),
            "ends_at": ends_at.isoformat(),
            "status": "active",
            "item_description": item_description,
            "item_price": item_price,
        }
    }


@router.get("/timers/active")
async def get_active_timers(request: Request):
    """Get ALL active timers (multi-timer support)."""
    timers = []
    now = datetime.now(timezone.utc)

    # Try Supabase
    if is_supabase_enabled():
        result = await supabase_request(
            "GET", "timers",
            params={
                "status": "eq.active",
                "order": "started_at.desc",
            },
        )
        if result and isinstance(result, list):
            for timer in result:
                ends_at = datetime.fromisoformat(timer["ends_at"].replace("Z", "+00:00"))
                remaining = max(0, (ends_at - now).total_seconds())

                if remaining <= 0:
                    # Timer expired — mark as completed
                    await supabase_request(
                        "PATCH", "timers",
                        params={"id": f"eq.{timer['id']}"},
                        json={"status": "completed"},
                    )
                    continue

                timers.append({
                    "id": timer["id"],
                    "duration_seconds": timer["duration_seconds"],
                    "started_at": timer["started_at"],
                    "ends_at": timer["ends_at"],
                    "remaining_seconds": int(remaining),
                    "status": "active",
                    "item_description": timer.get("item_description", ""),
                    "item_price": timer.get("item_price", 0),
                })

    # Also check in-memory timers
    for timer in _in_memory_timers:
        if timer["status"] != "active":
            continue
        ends_at = datetime.fromisoformat(timer["ends_at"])
        if ends_at.tzinfo is None:
            ends_at = ends_at.replace(tzinfo=timezone.utc)
        remaining = max(0, (ends_at - now).total_seconds())

        if remaining <= 0:
            timer["status"] = "completed"
            continue

        # Avoid duplicates (if already from Supabase)
        if not any(t["id"] == timer["id"] for t in timers):
            timers.append({
                "id": timer["id"],
                "duration_seconds": timer["duration_seconds"],
                "started_at": timer["started_at"],
                "ends_at": timer["ends_at"],
                "remaining_seconds": int(remaining),
                "status": "active",
                "item_description": timer.get("item_description", ""),
                "item_price": timer.get("item_price", 0),
            })

    return {"timers": timers}


# Keep backward compat — single timer endpoint
@router.get("/timer/active")
async def get_active_timer(request: Request):
    """Get the most recent active timer (backward compat)."""
    result = await get_active_timers(request)
    timers = result.get("timers", [])
    return {"timer": timers[0] if timers else None}


@router.post("/timer/cancel")
async def cancel_timer(request: Request):
    """Cancel a specific timer by ID."""
    body = await request.json()
    timer_id = body.get("timer_id")

    if timer_id and is_supabase_enabled():
        await supabase_request(
            "PATCH", "timers",
            params={"id": f"eq.{timer_id}"},
            json={"status": "cancelled"},
        )

    # Update in-memory
    for t in _in_memory_timers:
        if t.get("id") == timer_id:
            t["status"] = "cancelled"

    # Cancel background task if running
    task = _active_tasks.pop(timer_id, None)
    if task:
        task.cancel()

    return {"success": True}
