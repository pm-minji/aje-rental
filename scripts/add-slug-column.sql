-- ============================================
-- Slug 컬럼 추가 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. slug 컬럼 추가 (nullable로 시작 → 마이그레이션 후 NOT NULL로 변경)
ALTER TABLE ajussi_profiles
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- 2. slug에 유니크 인덱스 추가 (중복 방지)
CREATE UNIQUE INDEX IF NOT EXISTS idx_ajussi_profiles_slug 
ON ajussi_profiles (slug) 
WHERE slug IS NOT NULL;

-- 3. slug로 빠른 조회를 위한 일반 인덱스
CREATE INDEX IF NOT EXISTS idx_ajussi_profiles_slug_lookup 
ON ajussi_profiles (slug);

-- ============================================
-- 마이그레이션 스크립트 실행 후 아래 실행
-- ============================================
-- ALTER TABLE ajussi_profiles 
-- ALTER COLUMN slug SET NOT NULL;
