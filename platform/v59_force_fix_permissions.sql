-- "Nuclear Option" to fix permissions for Local Admin (anon user)
-- CORRECTED VERSION: Grants access to ALL sequences to avoid "relation does not exist" errors.
-- 1. Enable RLS (Ensuring it is on, so policies apply)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
-- 2. Clean up ALL previous conflicting policies
DROP POLICY IF EXISTS "Anon Update Settings" ON public.site_settings;
DROP POLICY IF EXISTS "Anon Insert Settings" ON public.site_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.site_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.site_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.site_settings;
DROP POLICY IF EXISTS "Allow Anonymous Admin Full Access" ON public.site_settings;
-- 3. Create a single, simple FULL ACCESS policy for the anonymous user (Local Admin)
CREATE POLICY "Allow Anonymous Admin Full Access" ON public.site_settings FOR ALL TO anon USING (true) WITH CHECK (true);
-- 4. Grant necessary privileges to the 'anon' role
GRANT ALL ON public.site_settings TO anon;
-- Fix: Grant usage on ALL sequences instead of guessing the name
GRANT USAGE,
    SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
-- 5. Touch all rows to ensure they are visible/active
UPDATE public.site_settings
SET key = key
WHERE true;
-- 6. Also fix Storage permissions just in case
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO anon;