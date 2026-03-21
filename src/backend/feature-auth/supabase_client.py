"""
Supabase client initialization.
Reads SUPABASE_URL and SUPABASE_KEY from environment variables.
"""

import os
from supabase import create_client, Client


def get_supabase_client() -> Client:
    """Initialize and return the Supabase client."""
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY", "")

    if not url or not key:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_KEY must be set. "
            "Copy .env.example to .env and fill in your Supabase credentials."
        )

    return create_client(url, key)


# Singleton client — import this in other modules
supabase: Client = None


def init_supabase():
    """Initialize the global Supabase client. Call once at app startup."""
    global supabase
    supabase = get_supabase_client()
    return supabase
