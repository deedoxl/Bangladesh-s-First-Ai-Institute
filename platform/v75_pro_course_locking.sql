-- ==========================================
-- DEEDOX 2.9 - PRO COURSE ACCESS & LEAD MANAGEMENT
-- Migration: v75_pro_course_locking.sql
-- ==========================================

-- 1. Ensure `is_locked` column exists on `courses` table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'courses' 
        AND column_name = 'is_locked'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN is_locked boolean DEFAULT false;
    END IF;
END $$;

-- 2. Create `pro_requests` table for lead generation and admin review
CREATE TABLE IF NOT EXISTS public.pro_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    course_id TEXT,
    course_title TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT
);

-- 3. Enable RLS on `pro_requests`
ALTER TABLE public.pro_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone (authenticated & anon) can submit a pro request
DROP POLICY IF EXISTS "Anyone can insert pro requests" ON public.pro_requests;
CREATE POLICY "Anyone can insert pro requests" ON public.pro_requests
    FOR INSERT 
    WITH CHECK (true);

-- Policy: Admins & Users can view pro requests
DROP POLICY IF EXISTS "Users and Admins can view pro requests" ON public.pro_requests;
CREATE POLICY "Users and Admins can view pro requests" ON public.pro_requests
    FOR SELECT 
    USING (true);

-- Policy: Admins can update pro requests
DROP POLICY IF EXISTS "Admins can update pro requests" ON public.pro_requests;
CREATE POLICY "Admins can update pro requests" ON public.pro_requests
    FOR UPDATE 
    USING (true);

-- 4. Enable Supabase Realtime for instant synchronization (safely check if already member)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'pro_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pro_requests;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'courses'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'users'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
    END IF;
END $$;
