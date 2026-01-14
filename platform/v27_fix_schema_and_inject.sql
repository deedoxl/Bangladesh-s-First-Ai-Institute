-- V27: FIX SCHEMA & INJECT KEY
-- The previous error happened because 'ai_system_settings' already existed with old column names.
-- This script WIPES that specific table and recreates it with the strict schema our code needs.

BEGIN;

-- 1. DROP Table to ensure fresh schema
DROP TABLE IF EXISTS public.ai_system_settings CASCADE;

-- 2. CREATE Table (Strict Schema: key, value)
CREATE TABLE public.ai_system_settings (
    key text PRIMARY KEY,
    value text NOT NULL,
    updated_at timestamptz DEFAULT now()
);

-- 3. Security (RLS)
ALTER TABLE public.ai_system_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admin Manage Settings" ON public.ai_system_settings;
    CREATE POLICY "Admin Manage Settings" ON public.ai_system_settings
    FOR ALL
    USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' )
    WITH CHECK ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' );
END $$;

-- 4. INJECT USER KEY
INSERT INTO public.ai_system_settings (key, value)
VALUES ('openrouter_api_key', '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');

COMMIT;

-- Verify
SELECT * FROM public.ai_system_settings;
