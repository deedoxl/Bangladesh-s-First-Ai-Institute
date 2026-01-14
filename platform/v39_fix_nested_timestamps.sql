-- v39_fix_nested_timestamps.sql
-- Purpose: Fix "400 Bad Request" on Social Feed caused by "created_at" missing in NESTED tables (post_comments, post_likes).
-- We previously only fixed 'posts' and 'messages', but the query selects comments too.
BEGIN;
-- 1. FIX POST_COMMENTS
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'post_comments'
        AND column_name = 'sent_at'
) THEN
ALTER TABLE public.post_comments
    RENAME COLUMN sent_at TO created_at;
END IF;
END $$;
-- Ensure it exists
ALTER TABLE public.post_comments
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
-- 2. FIX POST_LIKES
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'post_likes'
        AND column_name = 'sent_at'
) THEN
ALTER TABLE public.post_likes
    RENAME COLUMN sent_at TO created_at;
END IF;
END $$;
-- Ensure it exists
ALTER TABLE public.post_likes
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
-- 3. FIX NOTIFICATIONS (Just in case)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'notifications'
        AND column_name = 'sent_at'
) THEN
ALTER TABLE public.notifications
    RENAME COLUMN sent_at TO created_at;
END IF;
END $$;
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
-- 4. RELOAD CACHE
NOTIFY pgrst,
'reload config';
COMMIT;