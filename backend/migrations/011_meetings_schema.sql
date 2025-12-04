-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, active, completed, cancelled
    type TEXT NOT NULL DEFAULT 'scheduled', -- instant, scheduled, webinar
    is_open BOOLEAN DEFAULT FALSE, -- true: anyone with link can join, false: only invited
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_name TEXT UNIQUE, -- LiveKit room name
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meeting_participants table
CREATE TABLE IF NOT EXISTS meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable for external users (if we support them later via email)
    email TEXT, -- For external users
    name TEXT, -- For external users
    role TEXT NOT NULL DEFAULT 'attendee', -- host, assistant, attendee
    status TEXT NOT NULL DEFAULT 'invited', -- invited, accepted, declined, joined
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(meeting_id, user_id),
    UNIQUE(meeting_id, email)
);

-- Create meeting_chat_messages table (ephemeral storage for meeting duration)
CREATE TABLE IF NOT EXISTS meeting_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes (with IF NOT EXISTS check)
CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON meeting_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_chat_messages_meeting_id ON meeting_chat_messages(meeting_id);

-- Enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meetings

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "View meetings" ON meetings;
DROP POLICY IF EXISTS "Manage meetings" ON meetings;
DROP POLICY IF EXISTS "View participants" ON meeting_participants;
DROP POLICY IF EXISTS "Host manage participants" ON meeting_participants;
DROP POLICY IF EXISTS "Update own participant status" ON meeting_participants;
DROP POLICY IF EXISTS "View chat messages" ON meeting_chat_messages;
DROP POLICY IF EXISTS "Insert chat messages" ON meeting_chat_messages;

-- Everyone can view open meetings or meetings they are invited to
CREATE POLICY "View meetings" ON meetings
    FOR SELECT
    USING (
        is_open = TRUE OR
        host_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM meeting_participants
            WHERE meeting_id = meetings.id
            AND user_id = auth.uid()
        )
    );

-- Only host can insert/update/delete meetings
CREATE POLICY "Manage meetings" ON meetings
    FOR ALL
    USING (host_id = auth.uid());

-- RLS Policies for meeting_participants

-- Participants can view other participants in the same meeting
CREATE POLICY "View participants" ON meeting_participants
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM meetings
            WHERE id = meeting_participants.meeting_id
            AND (
                is_open = TRUE OR
                host_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM meeting_participants mp
                    WHERE mp.meeting_id = meetings.id
                    AND mp.user_id = auth.uid()
                )
            )
        )
    );

-- Host can manage participants
CREATE POLICY "Host manage participants" ON meeting_participants
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM meetings
            WHERE id = meeting_participants.meeting_id
            AND host_id = auth.uid()
        )
    );

-- Users can update their own status (e.g. join/leave)
CREATE POLICY "Update own participant status" ON meeting_participants
    FOR UPDATE
    USING (user_id = auth.uid());

-- RLS Policies for meeting_chat_messages

-- Participants can view messages in their meeting
CREATE POLICY "View chat messages" ON meeting_chat_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM meetings
            WHERE id = meeting_chat_messages.meeting_id
            AND (
                is_open = TRUE OR
                host_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM meeting_participants
                    WHERE meeting_id = meetings.id
                    AND user_id = auth.uid()
                )
            )
        )
    );

-- Participants can insert messages
CREATE POLICY "Insert chat messages" ON meeting_chat_messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM meetings
            WHERE id = meeting_chat_messages.meeting_id
            AND (
                is_open = TRUE OR
                host_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM meeting_participants
                    WHERE meeting_id = meetings.id
                    AND user_id = auth.uid()
                )
            )
        )
    );
