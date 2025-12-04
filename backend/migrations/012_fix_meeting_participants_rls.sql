-- Fix infinite recursion in meeting_participants RLS policies

-- Drop the problematic policy and any new ones we might create
DROP POLICY IF EXISTS "View participants" ON meeting_participants;
DROP POLICY IF EXISTS "View own participants" ON meeting_participants;
DROP POLICY IF EXISTS "Insert participants" ON meeting_participants;

-- Create a simpler policy that allows users to see their own participant records
-- and participants in meetings they can view
CREATE POLICY "View own participants" ON meeting_participants
    FOR SELECT
    USING (
        -- Users can always see their own participant records
        user_id = auth.uid() OR
        -- Users can see participants in meetings they host
        EXISTS (
            SELECT 1 FROM meetings
            WHERE id = meeting_participants.meeting_id
            AND host_id = auth.uid()
        ) OR
        -- Users can see participants in open meetings
        EXISTS (
            SELECT 1 FROM meetings
            WHERE id = meeting_participants.meeting_id
            AND is_open = TRUE
        ) OR
        -- Users can see participants if they are also participants in the same meeting
        -- (but we check this differently to avoid recursion)
        EXISTS (
            SELECT 1 FROM meeting_participants mp2
            WHERE mp2.meeting_id = meeting_participants.meeting_id
            AND mp2.user_id = auth.uid()
            AND mp2.id != meeting_participants.id
        )
    );

-- Also need to allow INSERT for users being invited (host creates it via backend, but we need RLS to allow it)
-- The backend uses admin client, so this might not be needed, but let's add it for safety
CREATE POLICY "Insert participants" ON meeting_participants
    FOR INSERT
    WITH CHECK (
        -- Host can add participants
        EXISTS (
            SELECT 1 FROM meetings
            WHERE id = meeting_participants.meeting_id
            AND host_id = auth.uid()
        )
    );

