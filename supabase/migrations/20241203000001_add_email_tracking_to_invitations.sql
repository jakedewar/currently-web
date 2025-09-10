-- Add email tracking fields to organization_invitations table
ALTER TABLE organization_invitations 
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_sent_status TEXT DEFAULT 'pending' CHECK (email_sent_status IN ('pending', 'sent', 'failed')),
ADD COLUMN IF NOT EXISTS email_error TEXT;

-- Create index for email tracking
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email_sent_status ON organization_invitations(email_sent_status);

-- Update existing invitations to have 'sent' status if they were created before this migration
-- (assuming they were manually shared)
UPDATE organization_invitations 
SET email_sent_status = 'sent' 
WHERE email_sent_status IS NULL AND status = 'active';
