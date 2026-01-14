-- Enable Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public)
VALUES ('post_images', 'post_images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_images', 'chat_images', true) ON CONFLICT (id) DO NOTHING;
-- Storage Policies (Drop first to avoid conflicts)
DROP POLICY IF EXISTS "Avatar Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Owner Update" ON storage.objects;
DROP POLICY IF EXISTS "Post Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Post Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Chat Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Chat Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Anon Avatar Upload" ON storage.objects;
DROP POLICY IF EXISTS "Anon Post Upload" ON storage.objects;
-- Create Policies (OPEN for Anon/Local Admin support)
CREATE POLICY "Avatar Public Read" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar Auth Upload" ON storage.objects FOR
INSERT WITH CHECK (bucket_id = 'avatars');
-- Allow All for Dev/Local Admin
CREATE POLICY "Avatar Owner Update" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'avatars'
        AND auth.uid() = owner
    );
CREATE POLICY "Post Public Read" ON storage.objects FOR
SELECT USING (bucket_id = 'post_images');
CREATE POLICY "Post Auth Upload" ON storage.objects FOR
INSERT WITH CHECK (bucket_id = 'post_images');
-- Allow All for Dev
CREATE POLICY "Chat Public Read" ON storage.objects FOR
SELECT USING (bucket_id = 'chat_images');
CREATE POLICY "Chat Auth Upload" ON storage.objects FOR
INSERT WITH CHECK (bucket_id = 'chat_images');
-- Allow All for Dev
-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System/Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System insert notifications" ON public.notifications;
-- We rely on v34 for strict RLS override, but these defaults should exist
CREATE POLICY "Users see own notifications" ON public.notifications FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "System/Users can insert notifications" ON public.notifications FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR
UPDATE USING (auth.uid() = user_id);