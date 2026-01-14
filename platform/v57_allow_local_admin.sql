-- WARNING: Enabling Anonymous Writes for 'admin/admin' login support.
-- 1. Unblock STORAGE for Anonymous (Local Admin)
DROP POLICY IF EXISTS "Anon Upload" ON storage.objects;
CREATE POLICY "Anon Upload" ON storage.objects FOR
INSERT TO anon WITH CHECK (bucket_id = 'uploads');
DROP POLICY IF EXISTS "Anon Update" ON storage.objects;
CREATE POLICY "Anon Update" ON storage.objects FOR
UPDATE TO anon USING (bucket_id = 'uploads');
-- 2. Unblock DATABASE TABLES for Anonymous (Local Admin)
-- Site Settings (Mission Content, Brand, etc.)
DROP POLICY IF EXISTS "Anon Update Settings" ON public.site_settings;
CREATE POLICY "Anon Update Settings" ON public.site_settings FOR
UPDATE TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Anon Insert Settings" ON public.site_settings;
CREATE POLICY "Anon Insert Settings" ON public.site_settings FOR
INSERT TO anon WITH CHECK (true);
-- Mission Content specifically might need explicit grant if not covered
GRANT ALL ON public.site_settings TO anon;
-- Apply to other content tables just in case
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.courses TO anon;
CREATE POLICY "Anon Manage Courses" ON public.courses FOR ALL TO anon USING (true) WITH CHECK (true);
ALTER TABLE public.homepage_slider_cards ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.homepage_slider_cards TO anon;
CREATE POLICY "Anon Manage Sliders" ON public.homepage_slider_cards FOR ALL TO anon USING (true) WITH CHECK (true);