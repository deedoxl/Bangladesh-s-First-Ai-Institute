-- v33_fix_strict_constraints.sql (Robust Version)
-- Purpose: Fix DB Schema for Mock Admin & Ensure Columns Exist
-- Error Fixed: "column sender_id does not exist"
BEGIN;
-- 1. DROP strict user constraint (Permit Local Admin)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
-- 2. Seed Local Admin
INSERT INTO public.users (id, name, email, role, avatar_url)
VALUES (
        '00000000-0000-0000-0000-000000000000',
        'System Admin',
        'admin@local',
        'admin',
        'https://ui-avatars.com/api/?name=Admin'
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role;
-- 3. FIX MESSAGES TABLE (Ensure columns exist first)
-- If table was old, it might miss columns.
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS sender_id uuid;
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS receiver_id uuid;
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS text text;
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS image_url text;
-- Now safe to modify Reference
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE public.messages
ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.messages
ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- 4. FIX POSTS TABLE
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE public.posts
ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
-- 5. FIX NOTIFICATIONS TABLE (Ensure columns exist)
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS sender_id uuid;
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;
-- Now safe to modify Reference
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_sender_id_fkey;
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;
COMMIT;