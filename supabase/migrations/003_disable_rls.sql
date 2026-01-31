-- Migration: Disable RLS on all tables
-- Reason: RLS is redundant as all API routes already implement proper authentication and authorization
-- The application uses API routes (Next.js) for all database operations, with explicit permission checks

-- Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE ajussi_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE ajussi_applications DISABLE ROW LEVEL SECURITY;

-- Drop all existing RLS policies
-- profiles table policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- ajussi_profiles table policies
DROP POLICY IF EXISTS "Anyone can view active ajussi profiles" ON ajussi_profiles;
DROP POLICY IF EXISTS "Users can manage own ajussi profile" ON ajussi_profiles;

-- requests table policies
DROP POLICY IF EXISTS "Users can view own requests" ON requests;
DROP POLICY IF EXISTS "Clients can create requests" ON requests;
DROP POLICY IF EXISTS "Involved parties can update requests" ON requests;

-- reviews table policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Reviewers can create reviews" ON reviews;

-- favorites table policies
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;

-- ajussi_applications table policies
DROP POLICY IF EXISTS "Users can view own applications" ON ajussi_applications;
DROP POLICY IF EXISTS "Users can create applications" ON ajussi_applications;
DROP POLICY IF EXISTS "Users can update pending applications" ON ajussi_applications;
