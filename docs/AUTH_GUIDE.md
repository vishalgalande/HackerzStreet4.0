# 🔐 Authentication Guide

> **How auth works in this project — for frontend and backend developers.**
> Powered by Supabase Auth. Frontend handles login/signup directly; backend verifies tokens.

---

## Overview

```
┌─────────────┐     sign up / login     ┌─────────────────┐
│   Frontend   │ ──────────────────────→ │  Supabase Auth   │
│   (React)    │ ←────────────────────── │  (hosted)        │
└──────┬───────┘     JWT + user data     └─────────────────┘
       │
       │  API calls with
       │  Authorization: Bearer <JWT>
       ▼
┌─────────────┐     verify JWT           ┌─────────────────┐
│   Backend    │ ──────────────────────→ │  Supabase Auth   │
│   (FastAPI)  │ ←────────────────────── │  (verify)        │
└─────────────┘     user confirmed       └─────────────────┘
```

---

## Frontend Auth (Supabase JS)

### Setup

```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default supabase
```

### Sign Up

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123'
})

// data.user → { id, email, ... }
// data.session → { access_token, refresh_token, ... }
```

### Login

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123'
})

// data.session.access_token → use this for API calls
```

### Logout

```javascript
await supabase.auth.signOut()
```

### Get Current Session

```javascript
const { data: { session } } = await supabase.auth.getSession()

if (session) {
  // User is logged in
  // session.access_token → JWT for API calls
  // session.user → { id, email }
}
```

### Listen for Auth Changes

```javascript
// In your AuthContext or App.jsx
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // User logged in — redirect to dashboard
  } else if (event === 'SIGNED_OUT') {
    // User logged out — redirect to home
  }
})
```

---

## Backend Auth (FastAPI)

### How It Works

1. Frontend sends the JWT in the `Authorization` header
2. Backend extracts the token and verifies it with Supabase
3. If valid, the user's `id` and `email` are available in the route

### Making Authenticated API Calls (Frontend → Backend)

```javascript
// Frontend: include the JWT in API calls
const session = await supabase.auth.getSession()
const token = session.data.session?.access_token

const response = await fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Protected Route Example (Backend)

```python
from fastapi import Depends
from auth_middleware import get_current_user

@router.get("/api/profile")
async def get_profile(user = Depends(get_current_user)):
    # user = { "id": "uuid-here", "email": "user@example.com" }
    user_id = user["id"]
    # ... fetch profile from Supabase using user_id
```

---

## Auth Flow — Step by Step

### New User

```
1. User clicks "Sign Up" on landing page
2. Frontend calls supabase.auth.signUp({ email, password })
3. Supabase creates auth.users record, returns JWT + user data
4. Frontend stores session (Supabase handles this automatically)
5. Frontend redirects to Profile Setup page
6. User fills in income, employment type, etc.
7. Frontend calls POST /api/profile with JWT in header
8. Backend verifies JWT, inserts row in user_profiles table
9. Frontend redirects to Dashboard
```

### Returning User

```
1. User clicks "Login"
2. Frontend calls supabase.auth.signInWithPassword({ email, password })
3. Supabase returns JWT + session
4. Frontend checks if profile exists: GET /api/profile
5. If profile exists → redirect to Dashboard
6. If no profile → redirect to Profile Setup
```

### Session Persistence

```
1. On app load, call supabase.auth.getSession()
2. If session exists and is valid → user is logged in
3. Supabase auto-refreshes expired tokens
4. If no session → show landing page / login
```

---

## Environment Variables

```bash
# .env (local — never commit)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend also needs:
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!CAUTION]
> Never commit `.env`. Only commit `.env.example` with empty placeholder values.

---

## Auth States for Frontend

Use these states in your React context/components:

| State | What to show |
|-------|-------------|
| `loading` | Spinner — checking session on app load |
| `unauthenticated` | Landing page / Login / Sign-up |
| `authenticated_no_profile` | Profile Setup page (first-time user) |
| `authenticated` | Dashboard (returning user with profile) |

---

*Back to [Master Index](./MASTER.md)*
