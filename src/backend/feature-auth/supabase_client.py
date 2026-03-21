"""
Supabase REST client using httpx.
Bypasses the Python SDK (which has C++ build issues) by calling the PostgREST API directly.

Usage:
    from supabase_client import supabase_request

    # Read
    data = await supabase_request("GET", "user_profiles", params={"id": f"eq.{user_id}"}, token=jwt)

    # Insert
    data = await supabase_request("POST", "user_profiles", json=row, token=jwt)

    # Update
    data = await supabase_request("PATCH", "user_profiles", params={"id": f"eq.{user_id}"}, json=updates, token=jwt)
"""

import os
import httpx
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend root
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("⚠️  SUPABASE_URL / SUPABASE_KEY not set in src/backend/.env — Supabase disabled, using fallback")


async def supabase_request(
    method: str,
    table: str,
    *,
    params: dict = None,
    json: dict | list = None,
    token: str = None,
    prefer: str = None,
) -> dict | list | None:
    """
    Make a request to the Supabase PostgREST API.

    Args:
        method: HTTP method (GET, POST, PATCH, DELETE)
        table: Table name (e.g. "user_profiles")
        params: Query parameters for filtering (e.g. {"id": "eq.abc-123"})
        json: Request body for POST/PATCH
        token: User JWT for RLS (row-level security). If None, uses anon key.
        prefer: PostgREST Prefer header (e.g. "return=representation")

    Returns:
        Response data as dict/list, or None on error.
    """
    if not SUPABASE_URL:
        return None

    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {token or SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer

    async with httpx.AsyncClient() as client:
        response = await client.request(
            method,
            url,
            params=params,
            json=json,
            headers=headers,
            timeout=10,
        )

        if response.status_code >= 400:
            print(f"Supabase error [{method} {table}]: {response.status_code} {response.text}")
            return None

        if response.status_code == 204:
            return {}

        try:
            return response.json()
        except Exception:
            return {}


def is_supabase_enabled() -> bool:
    """Check if Supabase credentials are configured."""
    return bool(SUPABASE_URL and SUPABASE_KEY)
