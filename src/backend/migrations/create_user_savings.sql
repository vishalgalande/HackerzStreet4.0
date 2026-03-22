-- user_savings table for Savings Goals
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_savings (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'emergency',
  icon TEXT DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  target_amount NUMERIC DEFAULT 0,
  current_amount NUMERIC DEFAULT 0,
  monthly_contribution NUMERIC DEFAULT 0,
  start_date TEXT,
  deposits TEXT DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_savings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own savings"
  ON user_savings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_savings_user_id ON user_savings(user_id);
