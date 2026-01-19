-- Migration: Enhance Ajussi verification and profile fields
-- Description: Add fields for real name, birth date, phone number, career history, and specialties

-- Add new columns to ajussi_applications table
ALTER TABLE ajussi_applications 
ADD COLUMN IF NOT EXISTS real_name TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS career_history TEXT,
ADD COLUMN IF NOT EXISTS specialties TEXT[]; -- Array of tags for easier filtering

-- Add new columns to ajussi_profiles table (to store verified info)
ALTER TABLE ajussi_profiles
ADD COLUMN IF NOT EXISTS real_name TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS career_history TEXT,
ADD COLUMN IF NOT EXISTS specialties TEXT[];

-- Add indexes for better search performance on array columns
CREATE INDEX IF NOT EXISTS idx_ajussi_profiles_specialties ON ajussi_profiles USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_ajussi_applications_specialties ON ajussi_applications USING GIN(specialties);

-- Comments for documentation
COMMENT ON COLUMN ajussi_applications.real_name IS '실명 (본인 확인용)';
COMMENT ON COLUMN ajussi_applications.birth_date IS '생년월일 (만 34세 이상 검증용)';
COMMENT ON COLUMN ajussi_applications.phone_number IS '연락처 (인터뷰 및 긴급 연락용)';
COMMENT ON COLUMN ajussi_applications.career_history IS '주요 경력 및 이력 (인터뷰 참고용)';
COMMENT ON COLUMN ajussi_applications.specialties IS '전문 분야 및 보유 자격 (태그)';
