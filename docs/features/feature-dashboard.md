# Feature: Dashboard + Daily Tracking

> **Owner:** Teammate 3
> **Branch:** `feature/dashboard`
> **Status:** 🟡 Not Started

---

## Overview

User dashboard (main view after login), daily expense logging form, entry history, score trend chart, monthly spending breakdown, and the main app shell/router.

---

## Requirements

- [ ] Dashboard layout: score summary card, recent entries, trend chart, quick stats
- [ ] Daily entry form: food, transport, discretionary, rent, savings, bill_paid_on_time, notes
- [ ] Entry history (last 7-30 days) with date grouping
- [ ] Aggregate daily entries → monthly metrics for scoring engine
- [ ] Score history trend chart (Chart.js line chart)
- [ ] Monthly spending breakdown (pie/bar chart)
- [ ] Quick stats cards: today's spend, savings rate, payment streak
- [ ] App.jsx main router (coordinate with team for route integration)
- [ ] Responsive on mobile (375px viewport)

---

## Technical Approach

- **Backend:** FastAPI routes for daily entries CRUD + aggregation logic.
- **Database:** `daily_entries` + `score_history` tables in Supabase (coordinate with Teammate 2).
- **Frontend:** React + Chart.js for visualizations. Fetch aggregated data from backend.
- **Aggregation:** Sum daily entries per month → compute averages → feed to scoring engine.

---

## Files & Directories

| File | Purpose |
|------|---------|
| `src/backend/feature-dashboard/daily_routes.py` | Daily entry CRUD endpoints |
| `src/backend/feature-dashboard/history_routes.py` | Score history endpoint |
| `src/backend/feature-dashboard/aggregation.py` | Daily → monthly aggregation |
| `src/backend/feature-dashboard/dashboard_models.py` | Pydantic models |
| `src/frontend/feature-dashboard/Dashboard.jsx` | Main dashboard view |
| `src/frontend/feature-dashboard/DailyEntryForm.jsx` | Daily expense logger |
| `src/frontend/feature-dashboard/EntryHistory.jsx` | Recent entries list |
| `src/frontend/feature-dashboard/ScoreTrend.jsx` | Score trend line chart |
| `src/frontend/feature-dashboard/MonthlyOverview.jsx` | Spending breakdown chart |
| `src/frontend/feature-dashboard/QuickStats.jsx` | Stats cards |

---

## Dependencies

- Teammate 2's Supabase setup (needs `daily_entries` + `score_history` tables)
- Teammate 1's scoring engine (calls `/api/score` to compute from aggregated data)

---

## Notes

- **App.jsx routing:** This feature owns the main `App.jsx` router. Coordinate with Teammates 1 and 2 for their routes/components.
- **Supabase tables:** `daily_entries` and `score_history` — coordinate SQL with Teammate 2.

---

## Changelog

| Date | Change | Commit |
|------|--------|--------|
| 2026-03-21 | Initial feature doc | — |

---

*Back to [Master Index](../MASTER.md)*
