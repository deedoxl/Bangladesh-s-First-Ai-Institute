-- v61_fix_storage_and_upload.sql
-- Fixes "Upload failed" and "Image not visible" issues by setting up correct Storage Policies.
-- 1. Create 'images' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('images', 'images', true) on conflict (id) do
update
set public = true;
-- 2. Enable RLS on objects (standard procedure, though buckets have their own)
alter table storage.objects enable row level security;
-- 3. DROP existing policies to avoid conflicts/duplicates
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Public Upload" on storage.objects;
drop policy if exists "Public Update" on storage.objects;
drop policy if exists "Public Delete" on storage.objects;
drop policy if exists "Give me access to own files" on storage.objects;
-- 4. CREATE PERMISSIVE POLICIES (Since this is a demo/cms app, we allow public uploads for simplicity for the 'admin' user who might be anon)
-- Allow PUBLIC Read (View Images)
create policy "Public Access" on storage.objects for
select using (bucket_id = 'images');
-- Allow PUBLIC Insert (Upload Images)
-- WE DO THIS because your 'admin' login locally might not be authenticated as a Supabase user, 
-- or you want public uploads for Profile Pictures / News Images without hassle.
create policy "Public Upload" on storage.objects for
insert with check (bucket_id = 'images');
-- Allow PUBLIC Update
create policy "Public Update" on storage.objects for
update using (bucket_id = 'images');
-- Allow PUBLIC Delete
create policy "Public Delete" on storage.objects for delete using (bucket_id = 'images');
-- 5. Grant usage permissions to specific roles just in case
grant all on table storage.objects to postgres,
    anon,
    authenticated,
    service_role;
grant all on table storage.buckets to postgres,
    anon,
    authenticated,
    service_role;