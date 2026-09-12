-- =====================================================
-- THE CAKES FLOOR - DIGITAL LOYALTY STAMP DATABASE SCHEMA
-- Execute this SQL script in Supabase SQL Editor
-- =====================================================

-- 1. Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_visit_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Loyalty Cards Table (4-Slot Pastry Card)
CREATE TABLE IF NOT EXISTS public.loyalty_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE UNIQUE,
    current_stamps INT DEFAULT 1 CHECK (current_stamps >= 0 AND current_stamps <= 4),
    total_rewards_earned INT DEFAULT 0,
    total_stamps_all_time INT DEFAULT 1,
    review_prompted BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Stamp Audit Logs Table
CREATE TABLE IF NOT EXISTS public.stamp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    stamps_added INT DEFAULT 1,
    staff_pin_used TEXT DEFAULT '1201',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Reward Redemptions Table
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    reward_item TEXT DEFAULT '1 Free ₹50 Pastry',
    staff_pin_used TEXT DEFAULT '1201',
    redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stamp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Add Public Access RLS Policies
DROP POLICY IF EXISTS "Public Select Customers" ON public.customers;
CREATE POLICY "Public Select Customers" ON public.customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Customers" ON public.customers;
CREATE POLICY "Public Insert Customers" ON public.customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Customers" ON public.customers;
CREATE POLICY "Public Update Customers" ON public.customers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Select Loyalty Cards" ON public.loyalty_cards;
CREATE POLICY "Public Select Loyalty Cards" ON public.loyalty_cards FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Loyalty Cards" ON public.loyalty_cards;
CREATE POLICY "Public Insert Loyalty Cards" ON public.loyalty_cards FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Update Loyalty Cards" ON public.loyalty_cards;
CREATE POLICY "Public Update Loyalty Cards" ON public.loyalty_cards FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public Select Stamp Logs" ON public.stamp_logs;
CREATE POLICY "Public Select Stamp Logs" ON public.stamp_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Stamp Logs" ON public.stamp_logs;
CREATE POLICY "Public Insert Stamp Logs" ON public.stamp_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Select Reward Redemptions" ON public.reward_redemptions;
CREATE POLICY "Public Select Reward Redemptions" ON public.reward_redemptions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Reward Redemptions" ON public.reward_redemptions;
CREATE POLICY "Public Insert Reward Redemptions" ON public.reward_redemptions FOR INSERT WITH CHECK (true);
