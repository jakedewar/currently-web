-- Create organization_invitations table
CREATE TABLE IF NOT EXISTS organization_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    invitation_code TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'expired')),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organization_invitations_organization_id ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_invitation_code ON organization_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_status ON organization_invitations(status);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_organization_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_organization_invitations_updated_at
    BEFORE UPDATE ON organization_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_organization_invitations_updated_at();

-- Create a function to automatically expire invitations
CREATE OR REPLACE FUNCTION expire_organization_invitations()
RETURNS void AS $$
BEGIN
    UPDATE organization_invitations 
    SET status = 'expired'
    WHERE status = 'active' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a function to clean up expired invitations (optional, can be run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_invitations(days_old INTEGER DEFAULT 30)
RETURNS void AS $$
BEGIN
    DELETE FROM organization_invitations 
    WHERE status = 'expired' 
    AND updated_at < NOW() - INTERVAL '1 day' * days_old;
END;
$$ LANGUAGE plpgsql;

-- Add RLS (Row Level Security) policies
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations for organizations they belong to
CREATE POLICY "Users can view organization invitations" ON organization_invitations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_members.organization_id = organization_invitations.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Policy: Admins and owners can create invitations
CREATE POLICY "Admins and owners can create invitations" ON organization_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_members.organization_id = organization_invitations.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin')
        )
    );

-- Policy: Admins and owners can update invitations
CREATE POLICY "Admins and owners can update invitations" ON organization_invitations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_members.organization_id = organization_invitations.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin')
        )
    );

-- Policy: Admins and owners can delete invitations
CREATE POLICY "Admins and owners can delete invitations" ON organization_invitations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_members.organization_id = organization_invitations.organization_id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role IN ('owner', 'admin')
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_invitations TO authenticated;
GRANT USAGE ON SEQUENCE organization_invitations_id_seq TO authenticated;
