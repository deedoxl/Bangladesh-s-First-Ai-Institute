-- Fix Messages Table Schema to match strict requirements (Idempotent)
-- Requirements: id, sender_id, receiver_id, text, image_url, created_at
BEGIN;
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES auth.users NOT NULL,
    receiver_id uuid REFERENCES auth.users NOT NULL,
    text text,
    -- Ensuring column name is 'text'
    message_text text,
    -- Legacy support (optional, can drop later)
    image_url text,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);
-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
-- Create Policies
CREATE POLICY "Users can read their own messages" ON public.messages FOR
SELECT USING (
        auth.uid() = sender_id
        OR auth.uid() = receiver_id
    );
CREATE POLICY "Users can send messages" ON public.messages FOR
INSERT WITH CHECK (auth.uid() = sender_id);
-- Fix 'notifications' table if not exists (from v31 safety check)
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    sender_id uuid REFERENCES auth.users,
    type text NOT NULL,
    content text,
    is_read boolean DEFAULT false,
    action_url text,
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- Drop existing notifications policies
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users see own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System/Users can insert notifications" ON public.notifications;
-- Create Notification Policies
CREATE POLICY "Users read own notifications" ON public.notifications FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "System insert notifications" ON public.notifications FOR
INSERT WITH CHECK (true);
-- Allow anyone (system/users) to send notifications
COMMIT;