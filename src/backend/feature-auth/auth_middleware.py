"""
Auth middleware — validates Supabase JWT tokens on protected endpoints.
"""

from fastapi import Request, HTTPException
from functools import wraps


async def get_current_user(request: Request) -> dict:
    """
    Extract and validate the user from the Authorization header.
    Returns the user dict from Supabase auth.

    Usage in route:
        @router.get("/api/profile")
        async def get_profile(user = Depends(get_current_user)):
            user_id = user["id"]
            ...
    """
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = auth_header.replace("Bearer ", "")

    try:
        from supabase_client import supabase
        # Verify the JWT token with Supabase
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {
            "id": str(user_response.user.id),
            "email": user_response.user.email,
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
