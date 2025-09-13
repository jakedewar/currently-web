-- Create slack_messages table for storing pinned Slack messages
CREATE TABLE IF NOT EXISTS slack_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stream_id UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    slack_message_id TEXT NOT NULL,
    slack_channel_id TEXT NOT NULL,
    slack_channel_name TEXT NOT NULL,
    slack_user_id TEXT NOT NULL,
    slack_user_name TEXT NOT NULL,
    slack_user_display_name TEXT,
    message_text TEXT NOT NULL,
    message_timestamp TIMESTAMPTZ NOT NULL,
    thread_ts TEXT,
    permalink TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    reactions JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_slack_messages_stream_id ON slack_messages(stream_id);
CREATE INDEX IF NOT EXISTS idx_slack_messages_organization_id ON slack_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_slack_messages_slack_message_id ON slack_messages(slack_message_id);
CREATE INDEX IF NOT EXISTS idx_slack_messages_created_by ON slack_messages(created_by);
CREATE INDEX IF NOT EXISTS idx_slack_messages_message_timestamp ON slack_messages(message_timestamp);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_slack_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_slack_messages_updated_at
    BEFORE UPDATE ON slack_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_slack_messages_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE slack_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages for streams they have access to
CREATE POLICY "Users can view slack messages for accessible streams" ON slack_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM stream_members 
            WHERE stream_members.stream_id = slack_messages.stream_id
            AND stream_members.user_id = auth.uid()
        )
    );

-- Policy: Users can insert messages for streams they have access to
CREATE POLICY "Users can insert slack messages for accessible streams" ON slack_messages
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM stream_members 
            WHERE stream_members.stream_id = slack_messages.stream_id
            AND stream_members.user_id = auth.uid()
        )
    );

-- Policy: Users can delete messages they created
CREATE POLICY "Users can delete their own slack messages" ON slack_messages
    FOR DELETE USING (auth.uid() = created_by);

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON slack_messages TO authenticated;
GRANT USAGE ON SEQUENCE slack_messages_id_seq TO authenticated;
