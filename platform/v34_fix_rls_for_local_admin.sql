-- v34_fix_rls_for_local_admin.sql
-- Purpose: Fix "Message not sending" by allowing Local Admin (anon) to bypass strict auth RLS.
-- Also enables "Delete Message" functionality for anon users.
BEGIN;
-- =================================================================
-- 1. MESSAGES TABLE RLS (Fixing the main blocker)
-- =================================================================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- Drop strict policies causing the failure
DROP POLICY IF EXISTS "Users can read their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
-- Create OPEN policies for Anon (Local Admin)
-- We allow 'anon' to do everything because this is a local admin tool.
-- If we wanted to be strict, we'd check `sender_id = '0000...000'`
CREATE POLICY "Anon/User Read Messages" ON public.messages FOR
SELECT USING (true);
-- Allow reading all messages (simplifies debugging & community view)
CREATE POLICY "Anon/User Send Messages" ON public.messages FOR
INSERT WITH CHECK (
        auth.role() = 'anon'
        OR auth.uid() = sender_id
    );
CREATE POLICY "Anon/User Delete Messages" ON public.messages FOR DELETE USING (
    auth.role() = 'anon'
    OR auth.uid() = sender_id
);
-- =================================================================
-- 2. POSTS TABLE RLS (Ensuring Social Feed works)
-- =================================================================
-- Ensure Anon can Insert/Delete posts (likely already set, but reinforcing)
DROP POLICY IF EXISTS "Anon Manage Posts" ON public.posts;
-- Drop old v30 policy to replace
CREATE POLICY "Anon Manage Posts V34" ON public.posts FOR ALL USING (
    auth.role() = 'anon'
    OR auth.uid() = user_id
) WITH CHECK (
    auth.role() = 'anon'
    OR auth.uid() = user_id
);
-- =================================================================
-- 3. NOTIFICATIONS RLS
-- =================================================================
DROP POLICY IF EXISTS "System insert notifications" ON public.notifications;
CREATE POLICY "Allow All Insert Notifications" ON public.notifications FOR
INSERT WITH CHECK (true);
COMMIT;