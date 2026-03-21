# Alternative Credit Risk Assessment Tool
### Product Requirements Document · v2.0

---

## 1. Executive Summary

Traditional credit bureaus rely on formal credit history — loans, credit cards, and EMI repayment records — to assess creditworthiness. This excludes an estimated 190 million adults in India alone who are credit-invisible: gig workers, students, rural residents, and informal business owners who are financially capable but denied access due to system gaps, not personal failure.

This platform uses behavioral and financial data — spending habits, bill payment regularity, savings discipline, and income patterns — to generate a fair, explainable, and actionable credit score for underserved individuals.

- **Problem:** 190M+ credit-invisible adults in India cannot access formal credit despite being financially capable.
- **Solution:** Behavior-based credit scoring using alternative data, with full explainability and improvement guidance.
- **Differentiator:** Not just a score — a financial improvement engine with what-if simulation, daily usage tracking, and persona-based demo mode.

---

## 2. Objectives

- Enable credit scoring for individuals with no formal credit history — targeting gig workers, students, and rural populations.
- Deliver accurate, fair risk evaluation by grounding scoring weights in documented financial research rather than arbitrary assignment.
- Build trust through transparent, plain-language explanations of every score — users must understand why they scored as they did.
- Provide a working prototype demonstrating the full loop: user registration → daily tracking → risk evaluation → score output → improvement path.

---

## 3. Target Users

| User type | Profile & needs |
|---|---|
| Gig / freelance worker | Irregular income, no payslips, consistent UPI usage. Needs to demonstrate income stability through transaction patterns. |
| Student / first-time borrower | No credit history at all. Psychometric and behavioral data become primary scoring inputs. |
| Informal business owner | Kirana shop, vegetable vendor. Cash-heavy but regular in payment behavior. |
| Rural individual | Limited banking access. Mobile usage and utility payment regularity are primary data points. |
| Lender (secondary) | Microfinance institution or NBFC. Needs a structured, lender-ready risk report via API or dashboard. |

---

## 4. Feature Requirements

### 4.1 Authentication & User Management

Users create accounts to store their financial data and track daily usage over time. Powered by **Supabase Auth**.

- Email + password sign-up / login
- Persistent user sessions
- First-time profile setup (income, employment type)
- Demo persona mode available without login for judges

### 4.2 Daily Usage Tracking

Users log daily financial entries that aggregate into monthly data for scoring.

| Input field | Type | Notes |
|---|---|---|
| Rent | Number (INR) | Monthly or daily allocation |
| Food expenses | Number (INR) | Daily food spending |
| Transport | Number (INR) | Daily commute/travel |
| Discretionary spending | Number (INR) | Non-essential purchases |
| Savings | Number (INR) | Amount saved today |
| Bill paid on time | Toggle | Did you pay any bill on time today? |
| Notes | Text (optional) | Free-form notes |

### 4.3 Data Input Module (Profile Setup)

Initial profile setup and editable user profile.

| Input field | Type | Notes |
|---|---|---|
| Monthly income (net) | Number (INR) | Accepts range estimate for irregular earners |
| Employment type | Dropdown | Salaried / Freelance / Gig / Self-employed / None |
| Existing debt / EMI | Number (INR) | Monthly obligation total |
| Rent payment history | Dropdown | Consistent / Occasional gap / Irregular |
| Bill payment behaviour | Dropdown | Always on-time / Sometimes late / Often late |
| Mobile / telecom regularity | Toggle | Optional: flags consistent plan payments |

### 4.4 Risk Assessment Engine

Processes weighted financial signals to produce a default-risk probability, then maps this to a 300–900 score. Weights are grounded in CIBIL/FICO factor research.

| Factor | Weight | Rationale |
|---|---|---|
| Payment consistency | 30% | Most predictive of default risk; aligns with CIBIL methodology |
| Savings ratio | 25% | Buffer against income shocks; key for informal workers |
| Income stability | 20% | Variance matters more than amount; irregular income treated differently |
| Spending discipline | 15% | Discretionary vs essential spend ratio signals financial maturity |
| Debt-to-income ratio | 10% | Existing obligations constrain capacity for new credit |

Score computed from **aggregated stored data** — daily entries auto-summarised into monthly metrics for scoring.

### 4.5 Credit Score Generation

Score presented on a 300–900 scale matching Indian credit bureau conventions.

| Score range | Band | Lender interpretation |
|---|---|---|
| 750 – 900 | Excellent | Very low risk. Eligible for premium loan products. |
| 650 – 749 | Good | Low risk. Standard loan eligibility. |
| 500 – 649 | Fair | Moderate risk. Microfinance eligibility with conditions. |
| 300 – 499 | Poor | High risk. Requires guarantor or collateral. |

Each score includes a confidence interval (e.g. 620 ± 35) that narrows as more data is provided.

### 4.6 Explainability Module

Every score includes a factor breakdown using SHAP contribution values, presented in plain language.

- Top 3 positive contributors — e.g. "Consistent rent payments added +42 points"
- Top 3 negative contributors — e.g. "High discretionary spending reduced score by −28 points"
- Factor waterfall chart showing cumulative score build from base to final value
- Plain-language summary in English and Hindi

### 4.7 What-If Simulator

Users adjust input sliders to see projected score impact in real time (<500ms recalculation).

- Increase savings rate → instant score preview
- Clear existing debt → delta shown with timeline estimate
- Improve payment consistency over 3 months → projected trajectory
- Score trajectory chart: current → 3 months → 6 months

### 4.8 Recommendation Engine

Personalised, time-bound suggestions ranked by score impact.

| Recommendation | Expected impact |
|---|---|
| Pay electricity and mobile bills on time for 3 consecutive months | +12 to +18 pts in 90 days |
| Reduce discretionary spending to below 20% of income | +10 to +15 pts in 60 days |
| Build an emergency savings buffer of 1 month's income | +20 to +30 pts over 6 months |
| Clear smallest existing debt first (snowball method) | +8 to +12 pts per debt cleared |

### 4.9 Persona Demo Mode

Pre-built user personas for judges/lenders — no login required.

| Persona | Profile |
|---|---|
| Ravi — Delivery partner | Zomato rider, ₹22k/month irregular income, consistent UPI usage. Score: ~540. |
| Priya — College student | Final year student, part-time tutor income ₹8k/month, high savings discipline. Score: ~480. |
| Mohan — Kirana owner | Small shop, ₹35k/month cash income, pays bills on time, one small loan. Score: ~620. |

### 4.10 Lender API & Dashboard

A lender view toggle transforms the user-facing dashboard into a structured risk report.

- `POST /api/score` — accepts user payload, returns score, band, confidence, SHAP factors, recommendations
- `POST /api/simulate` — accepts modified payload, returns delta score
- `GET /api/personas` — returns list of demo personas
- Benchmark: "This applicant scores higher than 67% of profiles in their income range"

---

## 5. User Flow

| Step | Description |
|---|---|
| 1. Landing | User lands on home. Chooses: sign up, login, or try a demo persona. |
| 2. Auth | Sign up / login via Supabase Auth (email + password). |
| 3. Profile setup | First-time users enter income, employment type, existing debt. |
| 4. Dashboard | Main view: daily entries, score overview, trends over time. |
| 5. Daily tracking | User logs daily expenses, savings, bill payments. |
| 6. Score computation | Score calculated from stored profile + aggregated daily data. |
| 7. Score reveal | Animated score display with band, confidence interval, and benchmark. |
| 8. Explanation | Factor waterfall chart + top contributors in plain language. |
| 9. Recommendations | Ranked improvement actions with score impact estimates. |
| 10. What-if | User adjusts sliders. Score updates in real time. |

---

## 6. Technical Architecture

### 6.1 Stack

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS. Chart.js for score waterfall and trajectory. |
| Backend | FastAPI (Python). Async endpoints. Pydantic models. |
| Auth & Database | **Supabase** — Auth (email/password) + PostgreSQL. |
| Scoring engine | Rule-based weighted scorer (v1). SHAP-style factor attribution. |
| Database tables | `user_profiles`, `daily_entries`, `score_history` |

### 6.2 Database Schema

```
user_profiles: id (UUID, FK auth.users), monthly_income, employment_type, timestamps
daily_entries: id, user_id (FK), date, rent, food, transport, discretionary, savings, bill_paid_on_time, notes
score_history: id, user_id (FK), score, band, factors (JSONB), computed_at
```

### 6.3 API Endpoints

| Endpoint | Function |
|---|---|
| `POST /api/score` | Compute score from stored user data. Returns full score response. |
| `POST /api/simulate` | What-if simulation. Returns delta score. |
| `GET /api/personas` | List demo personas. |
| `GET /api/persona/{id}` | Full data for a specific persona. |

---

## 7. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Score computation time | < 2 seconds end-to-end |
| What-if recalculation | < 500ms (client-side) |
| Mobile responsiveness | Full functionality on 375px viewport |
| Language support | English + Hindi for score explanations |
| Consent compliance | DPDP Act 2023 — explicit opt-in |
| Auth | Supabase Auth — email/password |
| Data storage | Supabase PostgreSQL — user profiles, daily entries, score history |

---

## 8. Success Metrics

| Metric | Target for hackathon demo |
|---|---|
| Score consistency | Same profile ±5% variation across 10 runs |
| Explanation clarity | 3 of 3 judges can identify top score driver from UI |
| Demo fluency | Persona load to score reveal < 60 seconds |
| What-if responsiveness | Slider to score update < 500ms |
| Auth flow | Signup → dashboard < 30 seconds |

---

## 9. Unique Value Propositions

- **Credit scoring for the credit-invisible** — no formal history required
- **Explainable by design** — SHAP-based factor attribution in plain language
- **Actionable improvement path** — ranked recommendations with score impact estimates
- **Daily tracking** — users build their credit profile over time through daily logging
- **What-if simulator** — see score change before you act
- **Confidence-aware scoring** — more data = narrower confidence band = higher lender trust
- **Persona-based demo mode** — judges see real stories in one click

---

*This system provides an inclusive and transparent alternative to traditional credit scoring by analysing behavioral financial data, enabling credit access for underserved individuals who the existing system has failed.*
