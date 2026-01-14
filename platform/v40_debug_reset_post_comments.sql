-- v40_debug_reset_post_comments.sql
-- Purpose: Nuke and pave 'post_comments' to eliminate hidden schema corruption forcing 400 errors.
-- Binary search identified 'post_comments' join as the cause.
BEGIN;
-- 1. DROP TABLE (Scorched Earth)
DROP TABLE IF EXISTS public.post_comments CASCADE;
-- 2. RECREATE TABLE (Clean Slate)
CREATE TABLE public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- 3. RE-ADD CONSTRAINTS (Explicit Naming)
ALTER TABLE public.post_comments
ADD CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
ALTER TABLE public.post_comments
ADD CONSTRAINT post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- 4. RLS POLICIES
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read/write for all" ON public.post_comments FOR ALL USING (true) WITH CHECK (true);
-- 5. RELOAD CACHE
NOTIFY pgrst,
'reload config';
COMMIT;