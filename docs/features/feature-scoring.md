# Feature: Credit Scoring Engine + Score UI

> **Owner:** Teammate 1
> **Branch:** `feature/scoring`
> **Status:** 🟡 Not Started

---

## Overview

Core scoring logic (rule-based weighted engine) and all score-related UI screens: animated gauge, factor waterfall chart, what-if simulator, recommendations, lender dashboard, and Hindi language support.

---

## Requirements

- [ ] Score computation from user input → 300-900 score with 5 weighted factors
- [ ] SHAP-style factor breakdown (top 3 positive/negative contributors)
- [ ] Animated score gauge with band colors + confidence interval
- [ ] Factor waterfall chart (Chart.js)
- [ ] What-if simulator with interactive sliders (<500ms recalculation)
- [ ] Recommendation cards ranked by score impact
- [ ] Lender dashboard toggle (structured risk report view)
- [ ] English ↔ Hindi language support for explanations
- [ ] 3 demo personas (Ravi, Priya, Mohan) with correct expected scores
- [ ] FastAPI endpoints: `POST /api/score`, `POST /api/simulate`, `GET /api/personas`, `GET /api/persona/{id}`

---

## Technical Approach

- **Backend:** FastAPI + Pydantic. Rule-based weighted scorer with 5 factors (payment 30%, savings 25%, income 20%, spending 15%, debt 10%).
- **Frontend:** React + Chart.js. Client-side scorer mirrors backend for instant what-if.
- **Libraries:** `chart.js`, `react-chartjs-2` (frontend); `fastapi`, `pydantic`, `numpy` (backend).

---

## Files & Directories

| File | Purpose |
|------|---------|
| `src/backend/feature-scoring/scoring.py` | Weighted scoring engine |
| `src/backend/feature-scoring/explainability.py` | Factor attribution + bilingual explanations |
| `src/backend/feature-scoring/recommendations.py` | Improvement suggestions |
| `src/backend/feature-scoring/personas.py` | Demo personas data |
| `src/backend/feature-scoring/models.py` | Pydantic models |
| `src/backend/feature-scoring/routes.py` | API endpoints |
| `src/backend/feature-scoring/main.py` | FastAPI app |
| `src/frontend/feature-scoring/ScoreGauge.jsx` | Score arc visualization |
| `src/frontend/feature-scoring/FactorWaterfall.jsx` | Waterfall chart |
| `src/frontend/feature-scoring/WhatIfSimulator.jsx` | Interactive simulator |
| `src/frontend/feature-scoring/Recommendations.jsx` | Action cards |
| `src/frontend/feature-scoring/LenderDashboard.jsx` | Lender report view |
| `src/frontend/feature-scoring/LanguageToggle.jsx` | EN/HI toggle |
| `src/frontend/feature-scoring/scorer.js` | Client-side scoring logic |
| `src/frontend/feature-scoring/translations.js` | Text dictionaries |

---

## Dependencies

- None (standalone — can be built and tested independently)

---

## Changelog

| Date | Change | Commit |
|------|--------|--------|
| 2026-03-21 | Initial feature doc | — |

---

*Back to [Master Index](../MASTER.md)*
