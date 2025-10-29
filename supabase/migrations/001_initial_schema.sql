-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for request status
CREATE TYPE request_status AS ENUM (
  'PENDING',
  'CONFIRMED', 
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED'
);

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  nickname TEXT,
  profile_image TEXT,
  introduction TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'ajussi')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajussi profiles table
CREATE TABLE ajussi_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hourly_rate INTEGER NOT NULL,
  available_areas TEXT[] DEFAULT '{}',
  open_chat_url TEXT,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  availability_mask JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requests table
CREATE TABLE requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  ajussi_id UUID REFERENCES profiles(id) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  status request_status DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES requests(id) UNIQUE,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  ajussi_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ajussi_id)
);

-- Indexes for performance
CREATE INDEX idx_ajussi_profiles_active ON ajussi_profiles(is_active);
CREATE INDEX idx_ajussi_profiles_rate ON ajussi_profiles(hourly_rate);
CREATE INDEX idx_ajussi_profiles_tags ON ajussi_profiles USING GIN(tags);
CREATE INDEX idx_requests_client ON requests(client_id);
CREATE INDEX idx_requests_ajussi ON requests(ajussi_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_date ON requests(date);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajussi_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can only view/edit their own profile
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Ajussi profiles: Public read, owner write
CREATE POLICY "Anyone can view active ajussi profiles" ON ajussi_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own ajussi profile" ON ajussi_profiles FOR ALL USING (auth.uid() = user_id);

-- Requests: Only involved parties can access
CREATE POLICY "Users can view own requests" ON requests FOR SELECT USING (auth.uid() = client_id OR auth.uid() = ajussi_id);
CREATE POLICY "Clients can create requests" ON requests FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Involved parties can update requests" ON requests FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = ajussi_id);

-- Reviews: Public read, reviewer write
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviewers can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Favorites: Owner only
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Functions for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ajussi_profiles_updated_at BEFORE UPDATE ON ajussi_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();