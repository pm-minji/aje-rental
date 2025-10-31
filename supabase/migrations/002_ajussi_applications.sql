-- Create enum for application status
CREATE TYPE application_status AS ENUM (
  'PENDING',
  'APPROVED', 
  'REJECTED'
);

-- Ajussi applications table
CREATE TABLE ajussi_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hourly_rate INTEGER NOT NULL,
  available_areas TEXT[] DEFAULT '{}',
  open_chat_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status application_status DEFAULT 'PENDING',
  admin_notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id)
);

-- Indexes
CREATE INDEX idx_ajussi_applications_status ON ajussi_applications(status);
CREATE INDEX idx_ajussi_applications_user ON ajussi_applications(user_id);

-- RLS Policies
ALTER TABLE ajussi_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON ajussi_applications 
FOR SELECT USING (auth.uid() = user_id);

-- Users can create applications
CREATE POLICY "Users can create applications" ON ajussi_applications 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their pending applications
CREATE POLICY "Users can update pending applications" ON ajussi_applications 
FOR UPDATE USING (auth.uid() = user_id AND status = 'PENDING');