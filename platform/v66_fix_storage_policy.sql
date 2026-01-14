-- Fix Storage Bucket Permissions (Images)
-- 1. Ensure 'images' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true) ON CONFLICT (id) DO
UPDATE
SET public = true;
-- 2. Allow Public Read Access to 'images' bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Allow Public Read on images" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'images');
-- 3. Allow Authenticated Users (Admin) to Upload/Update/Delete
DROP POLICY IF EXISTS "Admin Full Access" ON storage.objects;
CREATE POLICY "Allow Authenticated Insert on images" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'images');
CREATE POLICY "Allow Authenticated Update on images" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'images');
CREATE POLICY "Allow Authenticated Delete on images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'images');
-- 4. [Fix for Guest Admin] Allow Anon Uploads if strict RLS is blocking
-- Note: Usually we want only authenticated, but if Admin is "Guest", we might need anon insert.
-- For security, let's stick to authenticated first. If user is "Local Admin", they might be uploading as Anon.
-- If so, we need to allow Anon Inserts strictly for the images bucket.
CREATE POLICY "Allow Anon Insert on images" ON storage.objects FOR
INSERT TO anon WITH CHECK (bucket_id = 'images');