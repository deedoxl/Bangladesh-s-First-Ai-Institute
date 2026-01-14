-- v36_fix_schema_discrepancies.sql
-- Purpose: Fix "400 Bad Request" errors caused by column name mismatches and missing Foreign Keys.
BEGIN;
-- 1. FIX MESSAGES TIMESTAMP (sent_at -> created_at)
-- The UI expects 'created_at', but table has 'sent_at' (or vice versa). We standardize on 'created_at'.
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'messages'
        AND column_name = 'sent_at'
) THEN
ALTER TABLE public.messages
    RENAME COLUMN sent_at TO created_at;
END IF;
END $$;
-- Ensure created_at actually exists if it wasn't there
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
-- 2. FIX COMMUNITY MESSAGES FK (sender_id -> users.id)
-- This fixes the "PGRST200" error when joining sender:users(...)
ALTER TABLE public.community_messages DROP CONSTRAINT IF EXISTS community_messages_sender_id_fkey;
ALTER TABLE public.community_messages
ADD CONSTRAINT community_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- 3. ENSURE POSTS SCHEMA (Just in case)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
COMMIT;