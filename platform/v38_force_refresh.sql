-- v38_force_refresh.sql
-- Purpose: Force Supabase to refresh its API schema cache.
-- This is often needed after renaming columns (like sent_at -> created_at) to avoid 400 errors.
BEGIN;
-- 1. RE-VERIFY POSTS COLUMN (Just to be 100% sure)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'posts'
        AND column_name = 'created_at'
) THEN
ALTER TABLE public.posts
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
END IF;
END $$;
-- 2. GRANT PERMISSIONS (Double Check)
GRANT ALL ON public.posts TO postgres,
    anon,
    authenticated,
    service_role;
GRANT ALL ON public.post_likes TO postgres,
    anon,
    authenticated,
    service_role;
GRANT ALL ON public.post_comments TO postgres,
    anon,
    authenticated,
    service_role;
-- 3. RELOAD SCHEMA CACHE (Critical Step)
NOTIFY pgrst,
'reload config';
COMMIT;