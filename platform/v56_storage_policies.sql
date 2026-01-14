-- Ensure the bucket exists (if script failed)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true) ON CONFLICT (id) DO
UPDATE
SET public = true;
-- Enable RLS on objects (standard practice)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- 1. READ: Allow Public to view files in 'uploads'
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR
SELECT USING (bucket_id = 'uploads');
-- 2. UPLOAD: Allow Authenticated Users to upload
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');
-- 3. UPDATE/DELETE: Allow Owners (or all authed for now) to delete/update
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
CREATE POLICY "Authenticated Update" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'uploads');
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads');