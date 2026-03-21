# 🔗 Auth + Data Integration Guide

> **How auth connects to data — the complete picture for frontend developers.**
> Use this to build UI screens while the backend is still in progress.

---

## The Big Picture

```
┌─────────────────────────────────────────────────────┐
│                     SUPABASE                        │
│                                                     │
│  ┌───────────┐    ┌──────────────┐                  │
│  │ auth.users │───→│ user_profiles │  (1:1, same ID) │
│  │            │    └──────┬───────┘                  │
│  │  id (UUID) │           │                          │
│  │  email     │    ┌──────┴───────┐                  │
│  │  password  │    │daily_entries  │  (1:many)       │
│  └───────────┘    └──────┬───────┘                  │
│                          │                          │
│                   ┌──────┴───────┐                  │
│                   │score_history │  (1:many)        │
│                   └──────────────┘                  │
└─────────────────────────────────────────────────────┘
```

**Key relationship:** The `auth.users.id` (UUID) is the foreign key that links EVERYTHING together. When a user signs up, Supabase generates this UUID. All other tables reference it.

---

## API Contract — What Frontend Sends & Receives

> Use these contracts to build frontend screens now, even if the backend endpoints aren't deployed yet. You can mock the responses.

### 1. `POST /api/profile` — Save User Profile

**When:** After first sign-up (onboarding) or when editing profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request body:**
```json
{
  "monthly_income": 22000,
  "employment_type": "gig",
  "existing_debt": 0,
  "rent_history": "consistent",
  "bill_payment": "sometimes_late",
  "telecom_regularity": true
}
```

**Response (200):**
```json
{
  "status": "ok",
  "message": "Profile saved successfully"
}
```

**Validation rules:**
- `monthly_income`: number ≥ 0
- `employment_type`: one of `salaried`, `freelance`, `gig`, `self_employed`, `none`
- `existing_debt`: number ≥ 0
- `rent_history`: one of `consistent`, `occasional_gap`, `irregular`
- `bill_payment`: one of `always_on_time`, `sometimes_late`, `often_late`
- `telecom_regularity`: boolean

---

### 2. `GET /api/profile` — Get User Profile

**When:** On dashboard load, to check if onboarding is complete.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "id": "uuid-here",
  "email": "ravi@example.com",
  "profile": {
    "monthly_income": 22000,
    "employment_type": "gig",
    "existing_debt": 0,
    "rent_history": "consistent",
    "bill_payment": "sometimes_late",
    "telecom_regularity": true
  },
  "created_at": "2026-03-21T14:00:00Z",
  "updated_at": "2026-03-21T14:00:00Z"
}
```

**Response (404):** Profile not set up yet → redirect to onboarding.

---

### 3. `POST /api/entries` — Log Daily Entry

**When:** User submits daily expense form.

**Request body:**
```json
{
  "date": "2026-03-21",
  "rent": 0,
  "food": 250,
  "transport": 150,
  "discretionary": 100,
  "savings": 500,
  "bill_paid_on_time": true,
  "notes": "Paid electricity bill"
}
```

**Response (200):**
```json
{
  "status": "ok",
  "message": "Entry saved",
  "id": "entry-uuid"
}
```

**Notes:**
- `date` is optional — defaults to today
- All number fields default to 0
- `notes` is optional

---

### 4. `GET /api/entries?days=30` — Get Recent Entries

**When:** Dashboard loads, entry history view.

**Response (200):**
```json
[
  {
    "id": "entry-uuid-1",
    "user_id": "user-uuid",
    "date": "2026-03-21",
    "rent": 0,
    "food": 250,
    "transport": 150,
    "discretionary": 100,
    "savings": 500,
    "bill_paid_on_time": true,
    "notes": "Paid electricity bill",
    "created_at": "2026-03-21T18:30:00Z"
  },
  {
    "id": "entry-uuid-2",
    "user_id": "user-uuid",
    "date": "2026-03-20",
    "rent": 0,
    "food": 300,
    "transport": 100,
    "discretionary": 0,
    "savings": 200,
    "bill_paid_on_time": false,
    "notes": null,
    "created_at": "2026-03-20T19:00:00Z"
  }
]
```

---

### 5. `POST /api/score` — Compute Credit Score

**When:** User clicks "Compute My Score" on dashboard.

**Request body:**
```json
{
  "monthly_income": 22000,
  "monthly_expenses": 18000,
  "rent": 6000,
  "food": 5000,
  "transport": 4000,
  "discretionary": 3000,
  "savings_amount": 2000,
  "bill_payment": "sometimes_late",
  "employment_type": "gig",
  "existing_debt": 0,
  "rent_history": "consistent",
  "telecom_regularity": true
}
```

> **Note:** The frontend should auto-fill this from the user's profile + aggregated daily entries. See "How to build the score request from stored data" below.

**Response (200):**
```json
{
  "score": 548,
  "band": "Fair",
  "band_color": "#F59E0B",
  "confidence_margin": 28,
  "benchmark_percentile": 40,
  "factors": [
    {
      "factor": "payment_consistency",
      "label": "Payment Consistency",
      "label_hi": "भुगतान नियमितता",
      "points": 15.0,
      "is_positive": true,
      "description": "Some late payments detected...",
      "description_hi": "कुछ देर से भुगतान पाए गए..."
    }
  ],
  "positive_factors": [ ... ],
  "negative_factors": [ ... ],
  "recommendations": [
    {
      "action": "Pay all bills on time for 3 months",
      "action_hi": "3 महीने तक सभी बिल समय पर भुगतान करें",
      "impact_min": 15,
      "impact_max": 25,
      "effort": "medium",
      "timeframe": "90 days",
      "explanation": "Payment history is the strongest predictor...",
      "explanation_hi": "भुगतान इतिहास सबसे मजबूत भविष्यवक्ता..."
    }
  ],
  "summary": "Your alternative credit score is 548 (Fair)...",
  "summary_hi": "आपका वैकल्पिक क्रेडिट स्कोर 548 (Fair) है..."
}
```

---

### 6. `POST /api/simulate` — What-If Simulation

**Request body:**
```json
{
  "original": { /* same as /api/score input */ },
  "modified": { /* same shape, with changed values */ }
}
```

**Response (200):**
```json
{
  "original_score": 548,
  "new_score": 592,
  "delta": 44,
  "original_band": "Fair",
  "new_band": "Fair",
  "changed_factors": [
    {
      "factor": "savings_ratio",
      "original_sub_score": 40,
      "new_sub_score": 70,
      "delta": 30
    }
  ]
}
```

---

### 7. `GET /api/personas` — List Demo Personas

**No auth required.** For judges and demo mode.

**Response:**
```json
[
  {
    "id": "ravi",
    "name": "Ravi Kumar",
    "title": "Delivery Partner",
    "description": "Zomato rider, ₹22k/month...",
    "expected_score": 540,
    "avatar_emoji": "🛵"
  },
  {
    "id": "priya",
    "name": "Priya Sharma",
    "title": "College Student",
    "description": "Final year student...",
    "expected_score": 480,
    "avatar_emoji": "📚"
  },
  {
    "id": "mohan",
    "name": "Mohan Patel",
    "title": "Kirana Shop Owner",
    "description": "Small shop...",
    "expected_score": 620,
    "avatar_emoji": "🏪"
  }
]
```

---

## How to Build Score Request from Stored Data

Frontend should combine **profile data** + **aggregated daily entries** into the score request:

```javascript
async function buildScoreRequest(supabase, token) {
  // 1. Get profile
  const profileRes = await fetch('/api/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const { profile } = await profileRes.json()

  // 2. Get last 30 days of entries
  const entriesRes = await fetch('/api/entries?days=30', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const entries = await entriesRes.json()

  // 3. Aggregate entries into monthly totals
  const totalFood = entries.reduce((sum, e) => sum + e.food, 0)
  const totalTransport = entries.reduce((sum, e) => sum + e.transport, 0)
  const totalDiscretionary = entries.reduce((sum, e) => sum + e.discretionary, 0)
  const totalRent = entries.reduce((sum, e) => sum + e.rent, 0)
  const totalSavings = entries.reduce((sum, e) => sum + e.savings, 0)
  const totalExpenses = totalFood + totalTransport + totalDiscretionary + totalRent

  // 4. Build score request
  return {
    monthly_income: profile.monthly_income,
    monthly_expenses: totalExpenses,
    rent: totalRent,
    food: totalFood,
    transport: totalTransport,
    discretionary: totalDiscretionary,
    savings_amount: totalSavings,
    bill_payment: profile.bill_payment,
    employment_type: profile.employment_type,
    existing_debt: profile.existing_debt,
    rent_history: profile.rent_history,
    telecom_regularity: profile.telecom_regularity,
  }
}
```

---

## Mock Data for Frontend Development

While backend is in progress, use this mock data to build and test screens:

```javascript
// Mock profile
const mockProfile = {
  monthly_income: 22000,
  employment_type: "gig",
  existing_debt: 0,
  rent_history: "consistent",
  bill_payment: "sometimes_late",
  telecom_regularity: true,
}

// Mock score response
const mockScore = {
  score: 548,
  band: "Fair",
  band_color: "#F59E0B",
  confidence_margin: 28,
  benchmark_percentile: 40,
  positive_factors: [
    { label: "Payment Consistency", points: 15, description: "Consistent rent payments" },
    { label: "Debt-to-Income", points: 30, description: "No existing debt" },
  ],
  negative_factors: [
    { label: "Income Stability", points: -10, description: "Irregular income pattern (Gig)" },
    { label: "Savings Discipline", points: -7.5, description: "Low savings ratio" },
  ],
  recommendations: [
    { action: "Pay bills on time for 3 months", impact_max: 25, effort: "medium", timeframe: "90 days" },
    { action: "Increase savings to 20% of income", impact_max: 18, effort: "medium", timeframe: "3 months" },
  ],
}
```

---

*Back to [Master Index](./MASTER.md)*
