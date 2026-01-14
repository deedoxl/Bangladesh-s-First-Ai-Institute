-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
-- Policy for Public Read Access (Everyone can see settings)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.site_settings;
CREATE POLICY "Enable read access for all users" ON public.site_settings FOR
SELECT USING (true);
-- Policy for Admin Write Access (Only authenticated users/admins can update)
-- Assuming 'authenticated' role is enough for now, or specifically check for admin role if complex
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.site_settings;
CREATE POLICY "Enable insert for authenticated users only" ON public.site_settings FOR
INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.site_settings;
CREATE POLICY "Enable update for authenticated users only" ON public.site_settings FOR
UPDATE TO authenticated USING (true) WITH CHECK (true);
-- Grant usage to anon just in case
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;