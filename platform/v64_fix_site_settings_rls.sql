-- Enable RLS (if not already)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
-- 1. Allow Public Read Access (Critical for Home Page / Mission Page to see updates)
DROP POLICY IF EXISTS "Allow Public Read Access on site_settings" ON public.site_settings;
CREATE POLICY "Allow Public Read Access on site_settings" ON public.site_settings FOR
SELECT TO anon,
    authenticated USING (true);
-- 2. Allow Authenticated/Admin Write Access
DROP POLICY IF EXISTS "Allow Admin Full Access on site_settings" ON public.site_settings;
CREATE POLICY "Allow Admin Full Access on site_settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- 3. Ensure mission_content key exists locally to avoid insert errors if missing
INSERT INTO public.site_settings (key, value)
VALUES (
        'mission_content',
        '{
    "headline": "Our Mission",
    "subheadline": "Building Systems for the Future",
    "body": "We believe in empowering the next generation of founders with AI-native tools and education.",
    "values": [],
    "cards": []
  }'::jsonb
    ) ON CONFLICT (key) DO NOTHING;