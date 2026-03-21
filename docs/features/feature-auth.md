# Feature: Authentication + User Onboarding

> **Owner:** Teammate 2
> **Branch:** `feature/auth`
> **Status:** 🟡 Not Started

---

## Overview

Supabase Auth integration (email/password), sign-up/login pages, first-time profile setup, consent screen, and the landing page hero with persona quick-launch.

---

## Requirements

- [ ] Supabase project created with `user_profiles` table
- [ ] Email + password sign-up / login
- [ ] Auth state persists across page refreshes
- [ ] First-time profile setup (income, employment type, debt, rent history, bill payment, telecom)
- [ ] DPDP Act 2023 consent screen with explicit opt-in
- [ ] Landing page hero with value prop + CTAs ("Sign Up" / "Try Demo")
- [ ] Persona cards on landing page (clickable, loads demo without login)
- [ ] Protected routes (dashboard requires login, personas don't)
- [ ] Auth context (React context for logged-in state)
- [ ] RLS policies (users can only access their own data)

---

## Technical Approach

- **Auth:** Supabase Auth with `@supabase/supabase-js`. Email/password provider.
- **Database:** `user_profiles` table linked to `auth.users` via FK on `id`.
- **Frontend:** React context for auth state. Supabase `onAuthStateChange` listener.
- **Backend:** Supabase Python client for profile CRUD. JWT middleware for protected endpoints.

---

## Files & Directories

| File | Purpose |
|------|---------|
| `src/backend/feature-auth/supabase_client.py` | Supabase client init |
| `src/backend/feature-auth/auth_middleware.py` | JWT verification |
| `src/backend/feature-auth/profile_routes.py` | Profile CRUD endpoints |
| `src/backend/feature-auth/auth_models.py` | Pydantic models |
| `src/frontend/feature-auth/supabase.js` | Supabase JS client init |
| `src/frontend/feature-auth/AuthPage.jsx` | Login / Sign-up form |
| `src/frontend/feature-auth/ProfileSetup.jsx` | First-time onboarding form |
| `src/frontend/feature-auth/ConsentScreen.jsx` | DPDP consent dialog |
| `src/frontend/feature-auth/HeroSection.jsx` | Landing page hero |
| `src/frontend/feature-auth/PersonaCards.jsx` | Clickable persona cards |
| `src/frontend/feature-auth/AuthContext.jsx` | React auth context |

---

## Dependencies

- Supabase project (URL + anon key → `.env`)
- Teammate 1's persona data (for persona cards — can use mock initially)

---

## Notes

- **Env vars needed:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Add these to `.env.example` (coordinate with team before editing)

---

## Changelog

| Date | Change | Commit |
|------|--------|--------|
| 2026-03-21 | Initial feature doc | — |

---

*Back to [Master Index](../MASTER.md)*
