-- v60_fix_news_and_images.sql
-- FIXES: AI News Upload failures and Image Permission issues
-- CONTEXT: The Admin Panel uses 'admin' login which is ANONYMOUS in Supabase.
--          We must grant ANONYMOUS (public) access to 'news' and 'images' bucket.
-- 1. Create 'images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true) ON CONFLICT (id) DO
UPDATE
SET public = true;
-- 2. Fix 'news' table permissions (Allow Anon/Local Admin to Edit)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable full access for all users" ON public.news;
CREATE POLICY "Enable full access for all users" ON public.news FOR ALL TO public USING (true) WITH CHECK (true);
-- 3. Fix 'images' bucket permissions in storage.objects
-- Allow public read access
DROP POLICY IF EXISTS "Public View Images" ON storage.objects;
CREATE POLICY "Public View Images" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'images');
-- Allow Anon/Auth upload to images
DROP POLICY IF EXISTS "Public Upload Images" ON storage.objects;
CREATE POLICY "Public Upload Images" ON storage.objects FOR
INSERT TO public WITH CHECK (bucket_id = 'images');
-- Allow Update/Delete for ease of management
DROP POLICY IF EXISTS "Public Manage Images" ON storage.objects;
CREATE POLICY "Public Manage Images" ON storage.objects FOR
UPDATE TO public USING (bucket_id = 'images');
DROP POLICY IF EXISTS "Public Delete Images" ON storage.objects;
CREATE POLICY "Public Delete Images" ON storage.objects FOR DELETE TO public USING (bucket_id = 'images');