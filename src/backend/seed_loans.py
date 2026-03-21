"""
Seed script — creates loans table and inserts test data via Supabase REST API.
Run once: python seed_loans.py
"""
import asyncio
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "feature-auth"))
from supabase_client import supabase_request, is_supabase_enabled, SUPABASE_URL, SUPABASE_KEY
import httpx

async def create_table():
    """Create loans table via Supabase SQL endpoint."""
    sql = """
    CREATE TABLE IF NOT EXISTS loans (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id),
        borrower_name TEXT NOT NULL,
        borrower_email TEXT,
        amount NUMERIC NOT NULL,
        purpose TEXT,
        interest_rate NUMERIC DEFAULT 12.0,
        tenure_months INTEGER DEFAULT 12,
        emi NUMERIC,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue', 'defaulted')),
        disbursed_at TIMESTAMPTZ DEFAULT NOW(),
        next_due_date DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

    -- Allow read access for authenticated users (lender view)
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'loans_read_all') THEN
            CREATE POLICY loans_read_all ON loans FOR SELECT TO authenticated USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'loans_insert_anon') THEN
            CREATE POLICY loans_insert_anon ON loans FOR INSERT TO anon WITH CHECK (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'loans_read_anon') THEN
            CREATE POLICY loans_read_anon ON loans FOR SELECT TO anon USING (true);
        END IF;
    END $$;
    """

    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    # Try the SQL editor endpoint
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    
    # Supabase doesn't expose raw SQL via REST for free tier.
    # Instead, let's try inserting directly — the table may already exist,
    # or we'll create it via the dashboard.
    print("Attempting to insert seed data into loans table...")
    print(f"Supabase URL: {SUPABASE_URL}")
    print(f"Supabase enabled: {is_supabase_enabled()}")

async def seed_loans():
    """Insert test loan records."""
    loans = [
        {
            "borrower_name": "Priya Sharma",
            "borrower_email": "priya.sharma@example.com",
            "amount": 50000,
            "purpose": "Small business expansion - tailoring shop",
            "interest_rate": 11.5,
            "tenure_months": 12,
            "emi": 4425,
            "status": "active",
            "disbursed_at": "2025-11-15T10:00:00Z",
            "next_due_date": "2026-04-15",
        },
        {
            "borrower_name": "Rahul Verma",
            "borrower_email": "rahul.verma@example.com",
            "amount": 25000,
            "purpose": "Education loan - certification course",
            "interest_rate": 10.0,
            "tenure_months": 6,
            "emi": 4291,
            "status": "active",
            "disbursed_at": "2026-01-10T10:00:00Z",
            "next_due_date": "2026-04-10",
        },
        {
            "borrower_name": "Anita Devi",
            "borrower_email": "anita.devi@example.com",
            "amount": 75000,
            "purpose": "Home renovation - kitchen and bathroom",
            "interest_rate": 13.0,
            "tenure_months": 18,
            "emi": 4583,
            "status": "overdue",
            "disbursed_at": "2025-06-01T10:00:00Z",
            "next_due_date": "2026-03-01",
        },
        {
            "borrower_name": "Vikram Singh",
            "borrower_email": "vikram.singh@example.com",
            "amount": 15000,
            "purpose": "Emergency medical expenses",
            "interest_rate": 9.5,
            "tenure_months": 6,
            "emi": 2575,
            "status": "completed",
            "disbursed_at": "2025-09-01T10:00:00Z",
            "next_due_date": None,
        },
    ]

    for loan in loans:
        result = await supabase_request(
            "POST", "loans",
            json=loan,
            prefer="return=representation",
        )
        if result:
            name = loan["borrower_name"]
            print(f"  ✅ Inserted loan for {name}")
        else:
            name = loan["borrower_name"]
            print(f"  ❌ Failed to insert loan for {name} — table may not exist yet")
            return False
    return True

async def main():
    if not is_supabase_enabled():
        print("❌ Supabase not configured. Set SUPABASE_URL and SUPABASE_KEY in .env")
        return

    success = await seed_loans()
    if not success:
        print("\n⚠️  Loans table doesn't exist yet. Please create it in Supabase SQL Editor:")
        print("   Go to: https://supabase.com/dashboard → SQL Editor → Run this:")
        print("""
CREATE TABLE IF NOT EXISTS loans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    borrower_name TEXT NOT NULL,
    borrower_email TEXT,
    amount NUMERIC NOT NULL,
    purpose TEXT,
    interest_rate NUMERIC DEFAULT 12.0,
    tenure_months INTEGER DEFAULT 12,
    emi NUMERIC,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue', 'defaulted')),
    disbursed_at TIMESTAMPTZ DEFAULT NOW(),
    next_due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
CREATE POLICY loans_read_all ON loans FOR SELECT TO authenticated USING (true);
CREATE POLICY loans_insert_anon ON loans FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY loans_read_anon ON loans FOR SELECT TO anon USING (true);
""")
        print("\n   Then re-run: python seed_loans.py")
    else:
        print("\n✅ All seed data inserted successfully!")

if __name__ == "__main__":
    asyncio.run(main())
