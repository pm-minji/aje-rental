-- 더미 데이터 삽입 SQL (수정된 버전)
-- 주의: 이 스크립트는 개발/테스트 환경에서만 사용하세요

-- 1. auth.users 테이블에 더미 사용자 생성
INSERT INTO auth.users (
  id, 
  instance_id, 
  aud, 
  role, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
  -- 일반 사용자들
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user1@example.com', '$2a$10$dummy.hash.for.testing.purposes.only', NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "김철수"}', false, '', '', '', ''),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user2@example.com', '$2a$10$dummy.hash.for.testing.purposes.only', NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "이영희"}', false, '', '', '', ''),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user3@example.com', '$2a$10$dummy.hash.for.testing.purposes.only', NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "박민수"}', false, '', '', '', ''),
  
  -- 아저씨 사용자들
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ajussi1@example.com', '$2a$10$dummy.hash.for.testing.purposes.only', NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "김대한"}', false, '', '', '', ''),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ajussi2@example.com', '$2a$10$dummy.hash.for.testing.purposes.only', NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "이민국"}', false, '', '', '', ''),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ajussi3@example.com', '$2a$10$dummy.hash.for.testing.purposes.only', NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "박태극"}', false, '', '', '', ''),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ajussi4@example.com', '$2a$10$dummy.hash.for.testing.purposes.only', NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "최무궁화"}', false, '', '', '', ''),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ajussi5@example.com', '$2a$10$dummy.hash.for.testing.purposes.only', NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "정삼천리"}', false, '', '', '', ''),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ajussi6@example.com', '$2a$10$dummy.hash.for.testing.purposes.only', NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "한반도"}', false, '', '', '', '');

-- 2. 더미 사용자 프로필 생성 (일반 사용자)
INSERT INTO profiles (id, email, name, nickname, profile_image, introduction, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'user1@example.com', '김철수', '철수', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', '안녕하세요! 새로운 경험을 찾고 있어요.', 'user'),
  ('22222222-2222-2222-2222-222222222222', 'user2@example.com', '이영희', '영희', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', '산책을 좋아하는 직장인입니다.', 'user'),
  ('33333333-3333-3333-3333-333333333333', 'user3@example.com', '박민수', '민수', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', '대화 나누는 것을 좋아해요.', 'user');

-- 3. 더미 아저씨 프로필 생성
INSERT INTO profiles (id, email, name, nickname, profile_image, introduction, role) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ajussi1@example.com', '김대한', '대한아저씨', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face', '30년 직장생활 경험으로 인생 조언을 드립니다.', 'ajussi'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ajussi2@example.com', '이민국', '민국아저씨', 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face', '건강한 산책과 운동을 함께해요!', 'ajussi'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ajussi3@example.com', '박태극', '태극아저씨', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face', '요리와 생활 노하우를 알려드려요.', 'ajussi'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'ajussi4@example.com', '최무궁화', '무궁화아저씨', 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face', '독서와 철학 이야기를 좋아합니다.', 'ajussi'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'ajussi5@example.com', '정삼천리', '삼천리아저씨', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face', '여행과 맛집 탐방 전문가예요.', 'ajussi'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'ajussi6@example.com', '한반도', '반도아저씨', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', '기술과 IT 분야 멘토링 가능합니다.', 'ajussi');

-- 4. 아저씨 상세 프로필 생성
INSERT INTO ajussi_profiles (user_id, title, description, hourly_rate, available_areas, open_chat_url, is_active, tags) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '인생 선배의 따뜻한 조언', '30년간 다양한 직장에서 일한 경험을 바탕으로 취업, 인간관계, 인생 설계에 대한 조언을 드립니다. 특히 젊은 분들의 고민을 잘 들어드려요.', 25000, ARRAY['강남구', '서초구', '송파구'], 'https://open.kakao.com/o/sample1', true, ARRAY['조언', '멘토링', '취업상담', '인생상담']),
  
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '건강한 산책 파트너', '매일 아침 한강에서 운동하는 건강한 아저씨입니다. 올바른 걷기 자세, 스트레칭 방법을 알려드리고 함께 건강한 시간을 보내요.', 15000, ARRAY['마포구', '영등포구', '용산구'], 'https://open.kakao.com/o/sample2', true, ARRAY['산책', '운동', '건강관리', '한강']),
  
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '요리하는 아저씨', '20년 요리 경력의 아마추어 요리사입니다. 간단한 집밥부터 특별한 요리까지, 요리 노하우와 생활 팁을 알려드려요.', 20000, ARRAY['종로구', '중구', '성동구'], 'https://open.kakao.com/o/sample3', true, ARRAY['요리', '생활팁', '집밥', '레시피']),
  
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '책 읽는 아저씨', '평생 독서를 취미로 하며 철학, 문학, 역사에 관심이 많습니다. 책 추천부터 인생 철학까지 깊이 있는 대화를 나눠요.', 22000, ARRAY['서대문구', '은평구', '마포구'], 'https://open.kakao.com/o/sample4', true, ARRAY['독서', '철학', '문학', '대화']),
  
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '여행 가이드 아저씨', '전국 방방곡곡 여행해본 경험으로 숨은 맛집과 여행지를 소개해드립니다. 서울 구석구석 재미있는 곳들을 함께 탐방해요.', 18000, ARRAY['전체지역'], 'https://open.kakao.com/o/sample5', true, ARRAY['여행', '맛집', '서울투어', '문화']),
  
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'IT 멘토 아저씨', '대기업 IT 부서에서 30년 근무한 경험으로 프로그래밍, 컴퓨터 활용, 디지털 기기 사용법을 쉽게 알려드려요.', 30000, ARRAY['강남구', '서초구', '분당구'], 'https://open.kakao.com/o/sample6', true, ARRAY['IT', '프로그래밍', '컴퓨터', '멘토링']);

-- 5. 더미 요청 데이터 생성
INSERT INTO requests (client_id, ajussi_id, date, duration, location, description, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-11-01 14:00:00+09', 120, '강남역 스타벅스', '취업 준비 관련 조언을 구하고 싶습니다. 면접 준비와 이력서 작성에 대해 이야기하고 싶어요.', 'COMPLETED'),
  
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-11-02 07:00:00+09', 90, '한강공원 여의도', '아침 산책을 함께 하며 건강 관리 방법에 대해 배우고 싶습니다.', 'COMPLETED'),
  
  ('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-11-03 16:00:00+09', 150, '종로 전통찻집', '혼자 사는 직장인을 위한 간단한 요리법을 배우고 싶어요.', 'COMPLETED'),
  
  ('11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-11-05 19:00:00+09', 120, '서촌 카페거리', '인생에 대한 깊이 있는 대화를 나누고 싶습니다. 책 추천도 받고 싶어요.', 'CONFIRMED'),
  
  ('22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2024-11-07 13:00:00+09', 180, '명동 일대', '서울 시내 숨은 맛집 투어를 함께 하고 싶습니다.', 'PENDING'),
  
  ('33333333-3333-3333-3333-333333333333', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2024-11-10 10:00:00+09', 120, '강남 코워킹스페이스', '프로그래밍 공부 방향에 대해 조언을 구하고 싶어요.', 'PENDING');

-- 6. 더미 리뷰 데이터 생성 (완료된 요청에 대해서만)
INSERT INTO reviews (request_id, reviewer_id, rating, comment) VALUES
  ((SELECT id FROM requests WHERE client_id = '11111111-1111-1111-1111-111111111111' AND ajussi_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), 
   '11111111-1111-1111-1111-111111111111', 5, '정말 유익한 시간이었습니다. 실무 경험을 바탕으로 한 조언이 매우 도움이 되었어요. 면접 준비에 자신감이 생겼습니다!'),
  
  ((SELECT id FROM requests WHERE client_id = '22222222-2222-2222-2222-222222222222' AND ajussi_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), 
   '22222222-2222-2222-2222-222222222222', 5, '아침 산책이 이렇게 즐거울 줄 몰랐어요. 올바른 걷기 자세도 배우고 건강 관리 팁도 많이 얻었습니다. 또 만나고 싶어요!'),
  
  ((SELECT id FROM requests WHERE client_id = '33333333-3333-3333-3333-333333333333' AND ajussi_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'), 
   '33333333-3333-3333-3333-333333333333', 4, '요리 초보자도 쉽게 따라할 수 있는 레시피를 알려주셨어요. 생활 노하우도 많이 배웠습니다. 친근하고 재미있으셨어요.');

-- 7. 더미 즐겨찾기 데이터 생성
INSERT INTO favorites (user_id, ajussi_id) VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('11111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  ('33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('33333333-3333-3333-3333-333333333333', 'ffffffff-ffff-ffff-ffff-ffffffffffff');

-- 완료 메시지
SELECT 'Dummy data inserted successfully!' as message;