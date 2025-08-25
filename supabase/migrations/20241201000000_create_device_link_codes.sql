-- Create device_link_codes table for Chrome extension authentication
CREATE TABLE IF NOT EXISTS device_link_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_device_link_codes_code ON device_link_codes(code);
CREATE INDEX IF NOT EXISTS idx_device_link_codes_user_id ON device_link_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_device_link_codes_expires_at ON device_link_codes(expires_at);

-- Enable RLS
ALTER TABLE device_link_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Users can only see their own device link codes
CREATE POLICY "Users can view their own device link codes" ON device_link_codes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own device link codes
CREATE POLICY "Users can insert their own device link codes" ON device_link_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own device link codes
CREATE POLICY "Users can update their own device link codes" ON device_link_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to clean up expired codes (optional)
CREATE OR REPLACE FUNCTION cleanup_expired_device_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM device_link_codes 
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_device_link_codes_updated_at
  BEFORE UPDATE ON device_link_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
