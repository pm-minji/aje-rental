-- 테스트용 더미 데이터 삽입 스크립트

-- 1. 테스트 사용자 프로필 생성
INSERT INTO profiles (id, email, nickname, introduction, role, avatar_url, created_at, updated_at) VALUES
-- 일반 사용자들
('user1-test-uuid-1111-111111111111', 'user1@test.com', '김고객', '서비스를 이용하고 싶은 일반 사용자입니다.', 'user', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', NOW(), NOW()),
('user2-test-uuid-2222-222222222222', 'user2@test.com', '이손님', '다양한 아저씨 서비스에 관심이 많습니다.', 'user', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', NOW(), NOW()),
('user3-test-uuid-3333-333333333333', 'user3@test.com', '박회원', '처음 이용해보는 신규 사용자입니다.', 'user', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', NOW(), NOW()),

-- 아저씨 사용자들
('ajussi1-test-uuid-1111-111111111111', 'ajussi1@test.com', '김아저씨', '20년 경력의 베테랑 아저씨입니다.', 'ajussi', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face', NOW(), NOW()),
('ajussi2-test-uuid-2222-222222222222', 'ajussi2@test.com', '이삼촌', '친근하고 유머러스한 아저씨입니다.', 'ajussi', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face', NOW(), NOW()),
('ajussi3-test-uuid-3333-333333333333', 'ajussi3@test.com', '박아빠', '자상하고 든든한 아버지 같은 아저씨입니다.', 'ajussi', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face', NOW(), NOW()),
('ajussi4-test-uuid-4444-444444444444', 'ajussi4@test.com', '최형님', '운동을 좋아하는 건강한 아저씨입니다.', 'ajussi', 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face', NOW(), NOW()),
('ajussi5-test-uuid-5555-555555555555', 'ajussi5@test.com', '정선생', '교육 경험이 풍부한 지적인 아저씨입니다.', 'ajussi', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face', NOW(), NOW());

-- 2. 아저씨 프로필 생성
INSERT INTO ajussi_profiles (
  user_id, title, description, hourly_rate, available_areas, 
  open_chat_url, is_active, tags, total_requests, completed_requests, 
  average_rating, created_at, updated_at
) VALUES
('ajussi1-test-uuid-1111-111111111111', 
 '경험 많은 산책 동반자', 
 '20년간 다양한 사람들과 함께 걸어온 경험이 있습니다. 건강한 산책과 좋은 대화를 원하시는 분들께 최고의 서비스를 제공합니다. 특히 한강 공원과 남산 코스에 정통합니다.',
 25000, 
 ARRAY['강남구', '서초구', '용산구'], 
 'https://open.kakao.com/o/test1', 
 true, 
 ARRAY['산책', '대화', '운동', '한강'], 
 45, 42, 4.8, NOW(), NOW()),

('ajussi2-test-uuid-2222-222222222222',
 '유머 넘치는 대화 전문가',
 '재미있는 이야기와 유머로 즐거운 시간을 만들어드립니다. 스트레스 해소가 필요하거나 웃음이 필요한 분들께 추천합니다. 다양한 주제로 대화 가능합니다.',
 20000,
 ARRAY['마포구', '홍대', '신촌'],
 'https://open.kakao.com/o/test2',
 true,
 ARRAY['대화', '유머', '상담', '카페'],
 32, 30, 4.6, NOW(), NOW()),

('ajussi3-test-uuid-3333-333333333333',
 '따뜻한 인생 상담사',
 '인생의 선배로서 따뜻한 조언과 격려를 해드립니다. 고민이 있거나 누군가와 진솔한 대화가 필요한 분들께 도움이 되고 싶습니다.',
 30000,
 ARRAY['종로구', '중구', '성북구'],
 'https://open.kakao.com/o/test3',
 true,
 ARRAY['상담', '조언', '대화', '멘토링'],
 28, 26, 4.9, NOW(), NOW()),

('ajussi4-test-uuid-4444-444444444444',
 '건강한 운동 파트너',
 '헬스, 조깅, 등산 등 다양한 운동을 함께 할 수 있습니다. 운동 초보자도 환영하며, 안전하고 즐거운 운동 시간을 만들어드립니다.',
 35000,
 ARRAY['강남구', '송파구', '강동구'],
 'https://open.kakao.com/o/test4',
 true,
 ARRAY['운동', '헬스', '조깅', '등산'],
 18, 17, 4.7, NOW(), NOW()),

('ajussi5-test-uuid-5555-555555555555',
 '지식 나눔 선생님',
 '오랜 교육 경험을 바탕으로 학습 도움이나 진로 상담을 해드립니다. 학생들이나 취업 준비생들에게 도움이 되고 싶습니다.',
 40000,
 ARRAY['서대문구', '은평구', '마포구'],
 'https://open.kakao.com/o/test5',
 false,
 ARRAY['교육', '상담', '진로', '학습'],
 12, 11, 4.5, NOW(), NOW());

-- 3. 테스트용 서비스 요청 생성
INSERT INTO requests (
  client_id, ajussi_id, service_type, requested_date, duration_hours,
  location, description, status, total_amount, created_at, updated_at
) VALUES
-- 완료된 요청들
('user1-test-uuid-1111-111111111111', 'ajussi1-test-uuid-1111-111111111111', 
 '산책', '2024-10-25 14:00:00', 2, '한강공원 반포지구', 
 '스트레스 해소를 위한 한강 산책을 함께 해주세요.', 'COMPLETED', 50000, 
 '2024-10-23 10:00:00', '2024-10-25 16:00:00'),

('user2-test-uuid-2222-222222222222', 'ajussi2-test-uuid-2222-222222222222',
 '대화', '2024-10-26 19:00:00', 1, '홍대 카페거리',
 '재미있는 이야기를 들려주세요. 웃고 싶어요!', 'COMPLETED', 20000,
 '2024-10-24 15:30:00', '2024-10-26 20:00:00'),

-- 진행 중인 요청들
('user1-test-uuid-1111-111111111111', 'ajussi3-test-uuid-3333-333333333333',
 '상담', '2024-10-30 15:00:00', 1, '종로 카페',
 '인생 고민이 있어서 조언을 구하고 싶습니다.', 'CONFIRMED', 30000,
 '2024-10-28 09:00:00', '2024-10-28 11:00:00'),

-- 대기 중인 요청들
('user3-test-uuid-3333-333333333333', 'ajussi1-test-uuid-1111-111111111111',
 '산책', '2024-11-01 10:00:00', 3, '남산 N서울타워',
 '남산 등반과 함께 서울 구경을 하고 싶습니다.', 'PENDING', 75000,
 '2024-10-29 14:00:00', '2024-10-29 14:00:00'),

('user2-test-uuid-2222-222222222222', 'ajussi4-test-uuid-4444-444444444444',
 '운동', '2024-11-02 07:00:00', 2, '강남 헬스장',
 '헬스 운동을 배우고 싶습니다. 초보자입니다.', 'PENDING', 70000,
 '2024-10-29 16:30:00', '2024-10-29 16:30:00');

-- 4. 테스트용 리뷰 생성
INSERT INTO reviews (
  request_id, client_id, ajussi_id, rating, comment, created_at, updated_at
) VALUES
((SELECT id FROM requests WHERE client_id = 'user1-test-uuid-1111-111111111111' AND ajussi_id = 'ajussi1-test-uuid-1111-111111111111' LIMIT 1),
 'user1-test-uuid-1111-111111111111', 'ajussi1-test-uuid-1111-111111111111',
 5, '정말 좋은 시간이었습니다! 김아저씨께서 한강의 숨겨진 명소들도 알려주시고, 재미있는 이야기도 많이 해주셨어요. 다음에도 꼭 함께하고 싶습니다.', NOW(), NOW()),

((SELECT id FROM requests WHERE client_id = 'user2-test-uuid-2222-222222222222' AND ajussi_id = 'ajussi2-test-uuid-2222-222222222222' LIMIT 1),
 'user2-test-uuid-2222-222222222222', 'ajussi2-test-uuid-2222-222222222222',
 5, '이삼촌 정말 재미있으세요! 1시간 내내 웃었어요. 스트레스가 완전히 날아갔습니다. 유머 감각이 정말 뛰어나세요!', NOW(), NOW());

-- 5. 테스트용 즐겨찾기 생성
INSERT INTO favorites (user_id, ajussi_id, created_at) VALUES
('user1-test-uuid-1111-111111111111', 'ajussi1-test-uuid-1111-111111111111', NOW()),
('user1-test-uuid-1111-111111111111', 'ajussi3-test-uuid-3333-333333333333', NOW()),
('user2-test-uuid-2222-222222222222', 'ajussi2-test-uuid-2222-222222222222', NOW()),
('user2-test-uuid-2222-222222222222', 'ajussi4-test-uuid-4444-444444444444', NOW()),
('user3-test-uuid-3333-333333333333', 'ajussi1-test-uuid-1111-111111111111', NOW());

-- 6. 아저씨 프로필 통계 업데이트 (리뷰 평점 반영)
UPDATE ajussi_profiles 
SET average_rating = (
  SELECT COALESCE(AVG(rating), 0) 
  FROM reviews 
  WHERE ajussi_id = ajussi_profiles.user_id
)
WHERE user_id IN (
  'ajussi1-test-uuid-1111-111111111111',
  'ajussi2-test-uuid-2222-222222222222',
  'ajussi3-test-uuid-3333-333333333333',
  'ajussi4-test-uuid-4444-444444444444',
  'ajussi5-test-uuid-5555-555555555555'
);