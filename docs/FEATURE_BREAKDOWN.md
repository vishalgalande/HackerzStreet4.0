# 🚀 Feature Breakdown — Conflict-Free Team Assignment

> **3 features, 3 teammates, zero merge conflicts.**
> Each feature has its own isolated directories. Nobody touches another person's files.

---

## How This Works

```
src/
├── frontend/
│   ├── feature-scoring/        ← Teammate 1 ONLY
│   ├── feature-auth/           ← Teammate 2 ONLY
│   └── feature-dashboard/      ← Teammate 3 ONLY
│
├── backend/
│   ├── feature-scoring/        ← Teammate 1 ONLY
│   ├── feature-auth/           ← Teammate 2 ONLY
│   └── feature-dashboard/      ← Teammate 3 ONLY
│
└── shared/                     ← ⚠️ Coordinate before editing
```

---

## Feature 1: Credit Scoring Engine + Score UI

> **Branch:** `feature/scoring`
> **Owner:** Teammate 1

### What You Build
The core scoring logic + the score display screens.

### Backend (`src/backend/feature-scoring/`)
| File | Purpose |
|------|---------|
| `scoring.py` | Weighted scoring engine (5 factors → 300-900 score) |
| `explainability.py` | SHAP-style factor attribution + bilingual explanations |
| `recommendations.py` | Ranked improvement suggestions based on weakest factors |
| `personas.py` | 3 demo personas (Ravi, Priya, Mohan) with pre-filled data |
| `models.py` | Pydantic models for input/output validation |
| `routes.py` | API endpoints: `/api/score`, `/api/simulate`, `/api/personas` |
| `main.py` | FastAPI app entry point, CORS config |
| `requirements.txt` | Python dependencies |

### Frontend (`src/frontend/feature-scoring/`)
| File | Purpose |
|------|---------|
| `ScoreGauge.jsx` | Animated arc visualization (300-900 scale, color-coded bands) |
| `FactorWaterfall.jsx` | Chart.js waterfall chart showing factor contributions |
| `Recommendations.jsx` | Improvement action cards with impact estimates |
| `WhatIfSimulator.jsx` | Interactive sliders + real-time score recalculation |
| `LenderDashboard.jsx` | Lender-view toggle showing structured risk report |
| `LanguageToggle.jsx` | English ↔ Hindi toggle |
| `scorer.js` | Client-side scoring logic (mirrors backend, for <500ms what-if) |
| `translations.js` | English/Hindi text dictionaries |

### Key Deliverables
- [ ] Score computation from user input → 300-900 score
- [ ] SHAP-style factor breakdown (top 3 positive/negative)
- [ ] Animated score gauge + waterfall chart
- [ ] What-if simulator with <500ms recalculation
- [ ] Recommendation cards ranked by impact
- [ ] Hindi language support for explanations
- [ ] Demo personas load and score correctly
- [ ] Lender dashboard view

---

## Feature 2: Authentication + User Onboarding

> **Branch:** `feature/auth`
> **Owner:** Teammate 2

### What You Build
Supabase Auth, sign-up/login pages, profile setup, consent screen, and the landing page.

### Backend (`src/backend/feature-auth/`)
| File | Purpose |
|------|---------|
| `supabase_client.py` | Supabase client initialization from env vars |
| `auth_middleware.py` | JWT verification middleware for protected routes |
| `profile_routes.py` | `POST /api/profile`, `GET /api/profile` — user profile CRUD |
| `auth_models.py` | Pydantic models for profile data |

### Frontend (`src/frontend/feature-auth/`)
| File | Purpose |
|------|---------|
| `supabase.js` | Supabase client init (`@supabase/supabase-js`) |
| `AuthPage.jsx` | Login + Sign-up form with email/password |
| `ProfileSetup.jsx` | First-time onboarding: income, employment type, debt |
| `ConsentScreen.jsx` | DPDP Act 2023 consent dialog with explicit opt-in |
| `HeroSection.jsx` | Landing page hero with CTAs: "Sign Up" / "Try Demo" |
| `PersonaCards.jsx` | Clickable persona cards (Ravi, Priya, Mohan) on landing page |
| `AuthContext.jsx` | React context for auth state (logged in/out, user data) |

### Supabase Setup
| Task | Details |
|------|---------|
| Create Supabase project | Free tier at supabase.com |
| SQL: `user_profiles` table | `id (UUID FK auth.users), monthly_income, employment_type, existing_debt, rent_history, bill_payment, telecom_regularity, timestamps` |
| Enable email auth | Supabase dashboard → Auth → Providers → Email |
| Add RLS policies | Users can only read/write their own profile |
| Add env vars to `.env.example` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

### Key Deliverables
- [ ] Supabase project created with schema
- [ ] Sign-up / login working with email + password
- [ ] First-time profile setup flow
- [ ] Consent screen before data processing
- [ ] Landing page with hero + persona quick-launch
- [ ] Auth state persists across page refreshes
- [ ] Protected routes (dashboard requires login, personas don't)

---

## Feature 3: Dashboard + Daily Tracking

> **Branch:** `feature/dashboard`
> **Owner:** Teammate 3

### What You Build
User dashboard, daily expense logger, score history/trends, and the main app shell.

### Backend (`src/backend/feature-dashboard/`)
| File | Purpose |
|------|---------|
| `daily_routes.py` | `POST /api/entries`, `GET /api/entries` — daily entry CRUD |
| `history_routes.py` | `GET /api/score-history` — score trend data |
| `aggregation.py` | Aggregate daily entries → monthly summaries for scoring |
| `dashboard_models.py` | Pydantic models for daily entries, aggregation, history |

### Frontend (`src/frontend/feature-dashboard/`)
| File | Purpose |
|------|---------|
| `Dashboard.jsx` | Main view: score summary, recent entries, trends |
| `DailyEntryForm.jsx` | Form to log daily expenses, savings, bill payment |
| `EntryHistory.jsx` | List/table of recent daily entries (last 7-30 days) |
| `ScoreTrend.jsx` | Chart.js line chart: score over time |
| `MonthlyOverview.jsx` | Aggregated monthly spending breakdown (pie/bar chart) |
| `QuickStats.jsx` | Cards: today's spend, savings rate, streak counter |

### Supabase Tables (coordinate with Teammate 2)
| Table | Columns |
|-------|---------|
| `daily_entries` | `id, user_id (FK), date, rent, food, transport, discretionary, savings, bill_paid_on_time, notes, created_at` |
| `score_history` | `id, user_id (FK), score, band, factors (JSONB), computed_at` |

### Key Deliverables
- [ ] Daily entry form — log expenses, savings, bill payments
- [ ] Entry history view (last 7-30 days)
- [ ] Aggregate daily data → monthly metrics for scoring
- [ ] Score history trend chart
- [ ] Monthly spending breakdown visualization
- [ ] Quick stats cards on dashboard
- [ ] Dashboard layout responsive on mobile

---

## Shared / Coordination Points

> [!CAUTION]
> These items require **team coordination**. Announce in team chat before editing.

| Shared Item | Who Leads | Others |
|-------------|-----------|--------|
| `package.json` (frontend deps) | Teammate 1 (initial setup) | Others add deps to their section at the end |
| `src/shared/` utilities | Coordinate in chat | One person at a time |
| Supabase project setup | Teammate 2 | Shares URL + key with team |
| `App.jsx` (main router) | Teammate 3 | Others provide their routes/components |
| `.env.example` | Teammate 2 (adds Supabase vars) | Others add their own vars at the end |
| `docs/MASTER.md` | Each person adds their own feature row | Don't restructure |

---

## Integration Order

```
1. Teammate 1 → Build scoring engine + score UI (standalone, no auth needed)
2. Teammate 2 → Build auth + landing page + Supabase setup
3. Teammate 3 → Build dashboard + daily tracking (needs Supabase tables from T2)

Integration (after all features work independently):
4. Connect scoring engine to dashboard "Compute Score" button
5. Wire auth context into App.jsx routing
6. Deploy to Railway / Vercel
```

---

*Back to [Master Index](./MASTER.md)*
