# 🗄️ Data Storage Guide

> **How and where data is stored in the Alternative Credit Risk Assessment Tool.**
> Use this as a reference while building frontend — even if backend isn't ready yet.

---

## Database: Supabase (PostgreSQL)

We use **Supabase** — a hosted PostgreSQL database with built-in auth. All tables live in a single Supabase project.

**Connection:** Frontend talks to Supabase directly for auth. Backend reads/writes data via the Supabase Python SDK.

---

## Tables

### 1. `user_profiles`

> Stores the user's long-term financial profile. Created once during onboarding, editable later.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID (PK) | — | Same as `auth.users.id` (FK) |
| `income_amount` | NUMERIC | 0 | Income in the specified period (₹) |
| `income_period` | TEXT | `'monthly'` | One of: `monthly`, `quarterly`, `half_yearly` |
| `monthly_income` | NUMERIC | 0 | Computed monthly income (₹) |
| `employment_type` | TEXT | `'none'` | One of: `salaried`, `freelance`, `gig`, `self_employed`, `none` |
| `existing_debt` | NUMERIC | 0 | Total monthly EMI/debt in ₹ |
| `loans` | JSONB | `'[]'` | Array of loan objects: `[{type, name, emi}]` |
| `rent_history` | TEXT | `'consistent'` | One of: `consistent`, `occasional_gap`, `irregular` |
| `bill_payment` | TEXT | `'always_on_time'` | One of: `always_on_time`, `sometimes_late`, `often_late` |
| `telecom_regularity` | BOOLEAN | `false` | Regular mobile/telecom payments |
| `created_at` | TIMESTAMPTZ | `NOW()` | When profile was created |
| `updated_at` | TIMESTAMPTZ | `NOW()` | Last profile update |

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  income_amount NUMERIC DEFAULT 0,
  income_period TEXT DEFAULT 'monthly',
  monthly_income NUMERIC DEFAULT 0,
  employment_type TEXT DEFAULT 'none',
  existing_debt NUMERIC DEFAULT 0,
  loans JSONB DEFAULT '[]',
  rent_history TEXT DEFAULT 'consistent',
  bill_payment TEXT DEFAULT 'always_on_time',
  telecom_regularity BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only access their own profile
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
```

#### `loans` JSONB format

```json
[
  { "type": "personal", "name": "Personal Loan", "emi": 3000 },
  { "type": "phone", "name": "Phone EMI", "emi": 1500 },
  { "type": "education", "name": "Education Loan", "emi": 5000 }
]
```

**Loan types:** `personal`, `education`, `two_wheeler`, `phone`, `appliance`, `gold`, `microfinance`, `custom`

---

### 2. `daily_entries`

> Daily expense/savings log. Users add entries each day. These aggregate into monthly data for scoring.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID (PK) | `gen_random_uuid()` | Unique entry ID |
| `user_id` | UUID (FK) | — | References `auth.users.id` |
| `date` | DATE | `CURRENT_DATE` | Entry date |
| `rent` | NUMERIC | 0 | Rent paid that day (₹) |
| `food` | NUMERIC | 0 | Food expenses (₹) |
| `transport` | NUMERIC | 0 | Transport costs (₹) |
| `discretionary` | NUMERIC | 0 | Non-essential spending (₹) |
| `savings` | NUMERIC | 0 | Amount saved (₹) |
| `bill_paid_on_time` | BOOLEAN | `true` | Was a bill paid on time today? |
| `notes` | TEXT | `null` | Optional free-form notes |
| `created_at` | TIMESTAMPTZ | `NOW()` | When entry was logged |

```sql
CREATE TABLE daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  rent NUMERIC DEFAULT 0,
  food NUMERIC DEFAULT 0,
  transport NUMERIC DEFAULT 0,
  discretionary NUMERIC DEFAULT 0,
  savings NUMERIC DEFAULT 0,
  bill_paid_on_time BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only access their own entries
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own entries" ON daily_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON daily_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON daily_entries FOR DELETE USING (auth.uid() = user_id);
```

---

### 3. `score_history`

> Stores every score computation for trend analysis. New row added each time a user computes their score.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | UUID (PK) | `gen_random_uuid()` | Unique record ID |
| `user_id` | UUID (FK) | — | References `auth.users.id` |
| `score` | INT | — | Credit score (300-900) |
| `band` | TEXT | — | Score band: `Excellent`, `Good`, `Fair`, `Poor` |
| `factors` | JSONB | — | Factor breakdown (for history detail view) |
| `computed_at` | TIMESTAMPTZ | `NOW()` | When score was computed |

```sql
CREATE TABLE score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INT NOT NULL,
  band TEXT NOT NULL,
  factors JSONB,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only access their own history
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own history" ON score_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON score_history FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## `factors` JSONB Format

The `factors` column in `score_history` stores the full factor breakdown:

```json
{
  "payment_consistency": { "sub_score": 75, "points": 45, "is_positive": true },
  "savings_ratio": { "sub_score": 60, "points": 15, "is_positive": true },
  "income_stability": { "sub_score": 45, "points": -10, "is_positive": false },
  "spending_discipline": { "sub_score": 55, "points": 4.5, "is_positive": true },
  "debt_to_income": { "sub_score": 100, "points": 30, "is_positive": true }
}
```

---

## How Daily Entries Become a Score

```
Daily entries (last 30 days)
        ↓ aggregate
Monthly summary (totals + averages)
        ↓ combine with
User profile (income, employment, etc.)
        ↓ feed into
Scoring engine (5 weighted factors)
        ↓ produce
Credit score (300-900) + factors + recommendations
        ↓ save to
score_history table
```

---

*Back to [Master Index](./MASTER.md)*
