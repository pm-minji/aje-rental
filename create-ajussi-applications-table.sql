-- Create ajussi_applications table
CREATE TABLE IF NOT EXISTS ajussi_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hourly_rate INTEGER NOT NULL,
  available_areas TEXT[] NOT NULL DEFAULT '{}',
  open_chat_url TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ajussi_applications_user_id ON ajussi_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_ajussi_applications_status ON ajussi_applications(status);
CREATE INDEX IF NOT EXISTS idx_ajussi_applications_created_at ON ajussi_applications(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE ajussi_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own applications
CREATE POLICY "Users can view own applications" ON ajussi_applications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own applications
CREATE POLICY "Users can insert own applications" ON ajussi_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own applications (only if status is PENDING)
CREATE POLICY "Users can update own pending applications" ON ajussi_applications
  FOR UPDATE USING (auth.uid() = user_id AND status = 'PENDING');

-- Admins can view all applications
CREATE POLICY "Admins can view all applications" ON ajussi_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all applications
CREATE POLICY "Admins can update all applications" ON ajussi_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ajussi_applications_updated_at 
  BEFORE UPDATE ON ajussi_applications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();