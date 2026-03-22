-- user_payments table for Active Payments
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_payments (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'loan',
  name TEXT NOT NULL DEFAULT '',
  icon TEXT DEFAULT '',
  amount NUMERIC DEFAULT 0,
  emi NUMERIC DEFAULT 0,
  interest_rate NUMERIC DEFAULT 0,
  tenure_months INTEGER DEFAULT 0,
  start_date TEXT,
  bank_name TEXT DEFAULT '',
  credit_limit NUMERIC DEFAULT 0,
  current_balance NUMERIC DEFAULT 0,
  min_payment NUMERIC DEFAULT 0,
  due_date TEXT DEFAULT '',
  statement_date TEXT DEFAULT '',
  category TEXT DEFAULT '',
  avg_amount NUMERIC DEFAULT 0,
  auto_pay BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;

-- Policy: users can only access their own payments
CREATE POLICY "Users can manage their own payments"
  ON user_payments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_payments_user_id ON user_payments(user_id);
