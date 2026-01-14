-- v35_fix_relationships.sql
-- Purpose: Fix "Status 400" on Social Feed by explicitly defining relationships for Supabase.
-- Supabase needs explicit Foreign Keys to allow nested selects (e.g. post_likes(user_id)).
BEGIN;
-- 1. FIX POST_LIKES RELATIONSHIPS
-- Ensure table exists
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);
-- Drop old constraints to be safe
ALTER TABLE public.post_likes DROP CONSTRAINT IF EXISTS post_likes_post_id_fkey;
ALTER TABLE public.post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;
-- Add Strict FKs pointing to PUBLIC tables
ALTER TABLE public.post_likes
ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
ALTER TABLE public.post_likes
ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- 2. FIX POST_COMMENTS RELATIONSHIPS
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.post_comments DROP CONSTRAINT IF EXISTS post_comments_post_id_fkey;
ALTER TABLE public.post_comments DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;
ALTER TABLE public.post_comments
ADD CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
ALTER TABLE public.post_comments
ADD CONSTRAINT post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- 3. ENSURE RLS FOR LIKES/COMMENTS (Allow Anon/Local Admin)
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon Manage Likes" ON public.post_likes;
CREATE POLICY "Anon Manage Likes" ON public.post_likes FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Anon Manage Comments" ON public.post_comments;
CREATE POLICY "Anon Manage Comments" ON public.post_comments FOR ALL USING (true) WITH CHECK (true);
COMMIT;