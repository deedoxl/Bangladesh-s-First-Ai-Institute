-- Enable RLS on community_messages (if not already)
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
-- Drop existing delete policies to avoid conflicts or confusion
DROP POLICY IF EXISTS "Users can delete their own community messages" ON community_messages;
DROP POLICY IF EXISTS "Delete own messages" ON community_messages;
-- Create a permissive delete policy for authenticated users
CREATE POLICY "Users can delete their own community messages" ON community_messages FOR DELETE TO authenticated USING (auth.uid() = sender_id);
-- Verify policy
-- SELECT * FROM pg_policies WHERE tablename = 'community_messages';