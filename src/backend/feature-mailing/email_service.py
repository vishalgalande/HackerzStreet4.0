"""
Email service — Resend API integration using httpx.
Sends transactional emails for credit score alerts and spending pattern warnings.
"""

import os
import httpx
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend root — try multiple paths for robustness
_env_path = Path(__file__).resolve().parent.parent / ".env"
if not _env_path.exists():
    # Fallback: look relative to cwd
    _env_path = Path("src/backend/.env")
load_dotenv(_env_path, override=True)

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_API_URL = "https://api.resend.com/emails"
SENDER_EMAIL = "FinFix Alerts <noreply@finfix.strawhats.co.in>"

if not RESEND_API_KEY:
    print("⚠️  RESEND_API_KEY not set in src/backend/.env — email alerts disabled")


def is_email_enabled() -> bool:
    """Check if Resend API key is configured."""
    return bool(RESEND_API_KEY)


async def send_email(to: str, subject: str, html_body: str) -> dict:
    """
    Send an email via the Resend REST API.

    Args:
        to: Recipient email address.
        subject: Email subject line.
        html_body: Full HTML body of the email.

    Returns:
        dict with 'success' (bool), 'id' (str or None), 'error' (str or None).
    """
    if not RESEND_API_KEY:
        return {"success": False, "id": None, "error": "RESEND_API_KEY not configured"}

    payload = {
        "from": SENDER_EMAIL,
        "to": [to],
        "subject": subject,
        "html": html_body,
    }

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                RESEND_API_URL,
                json=payload,
                headers=headers,
                timeout=15,
            )

            if response.status_code in (200, 201):
                data = response.json()
                return {"success": True, "id": data.get("id"), "error": None}
            else:
                error_msg = f"Resend API error: {response.status_code} — {response.text}"
                print(f"❌ {error_msg}")
                return {"success": False, "id": None, "error": error_msg}

    except Exception as e:
        error_msg = f"Email send failed: {str(e)}"
        print(f"❌ {error_msg}")
        return {"success": False, "id": None, "error": error_msg}
