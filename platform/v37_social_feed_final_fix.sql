-- v37_social_feed_final_fix.sql
-- Purpose:
-- 1. Standardise table timestamps to 'created_at'.
-- 2. Fix Social Feed 400 Error (Missing FKs for post_likes, post_comments).
-- 3. Fix Community Chat Sort (Ensure created_at exists).
BEGIN;
-- =================================================================
-- 1. POSTS TABLE FIXES
-- =================================================================
-- Ensure created_at exists. If sent_at exists, rename it.
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'posts'
        AND column_name = 'sent_at'
) THEN
ALTER TABLE public.posts
    RENAME COLUMN sent_at TO created_at;
END IF;
END $$;
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
-- Ensure FK to users (If missing)
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE public.posts
ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- =================================================================
-- 2. SOCIAL FEED RELATIONSHIPS (The 400 Error Fix)
-- =================================================================
-- POST_LIKES
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);
ALTER TABLE public.post_likes DROP CONSTRAINT IF EXISTS post_likes_post_id_fkey;
ALTER TABLE public.post_likes
ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
ALTER TABLE public.post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;
ALTER TABLE public.post_likes
ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- POST_COMMENTS
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.post_comments DROP CONSTRAINT IF EXISTS post_comments_post_id_fkey;
ALTER TABLE public.post_comments
ADD CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
ALTER TABLE public.post_comments DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;
ALTER TABLE public.post_comments
ADD CONSTRAINT post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- =================================================================
-- 3. COMMUNITY MESSAGES FIXES
-- =================================================================
-- Ensure created_at
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'community_messages'
        AND column_name = 'sent_at'
) THEN
ALTER TABLE public.community_messages
    RENAME COLUMN sent_at TO created_at;
END IF;
END $$;
ALTER TABLE public.community_messages
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
-- Ensure Sender FK (Fixes Profile Join)
ALTER TABLE public.community_messages DROP CONSTRAINT IF EXISTS community_messages_sender_id_fkey;
ALTER TABLE public.community_messages
ADD CONSTRAINT community_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;
COMMIT;