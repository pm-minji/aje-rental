-- Insert sample profiles
INSERT INTO profiles (id, email, name, nickname, role, introduction) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'kim.ajussi@example.com', '김철수', '산책왕 김아저씨', 'ajussi', '30년간 공원을 누빈 산책 전문가입니다. 건강한 산책과 함께 인생 이야기를 나누어요.'),
  ('550e8400-e29b-41d4-a716-446655440002', 'lee.ajussi@example.com', '이영호', '대화의 달인', 'ajussi', '다양한 인생 경험을 바탕으로 진솔한 대화를 나누는 것을 좋아합니다.'),
  ('550e8400-e29b-41d4-a716-446655440003', 'park.ajussi@example.com', '박민수', '조언왕 박아저씨', 'ajussi', '40년 직장 생활의 경험으로 인생 조언을 드립니다.'),
  ('550e8400-e29b-41d4-a716-446655440004', 'user1@example.com', '홍길동', '길동이', 'user', '새로운 경험을 찾고 있는 일반 사용자입니다.');

-- Insert sample ajussi profiles
INSERT INTO ajussi_profiles (user_id, title, description, hourly_rate, available_areas, tags, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '건강한 산책과 운동 동행', '매일 아침 6시부터 공원에서 산책하며 건강 관리를 도와드립니다. 올바른 걷기 자세와 스트레칭도 알려드려요.', 15000, ARRAY['강남구', '서초구', '송파구'], ARRAY['산책', '운동', '건강관리'], true),
  ('550e8400-e29b-41d4-a716-446655440002', '인생 상담과 따뜻한 대화', '젊은 분들의 고민을 들어드리고 인생 선배로서 조언을 드립니다. 커피 한 잔과 함께 편안한 대화를 나누어요.', 20000, ARRAY['마포구', '용산구', '중구'], ARRAY['대화', '상담', '멘토링'], true),
  ('550e8400-e29b-41d4-a716-446655440003', '직장 생활 멘토링', '40년간의 직장 생활 경험을 바탕으로 취업, 승진, 인간관계 등에 대한 실질적인 조언을 드립니다.', 25000, ARRAY['강남구', '서초구', '영등포구'], ARRAY['멘토링', '취업상담', '직장생활'], true);

-- Insert sample requests
INSERT INTO requests (client_id, ajussi_id, date, duration, location, description, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '2024-11-01 07:00:00+09', 60, '올림픽공원', '아침 산책을 함께 하며 건강한 생활 습관에 대해 이야기하고 싶습니다.', 'COMPLETED'),
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '2024-11-05 14:00:00+09', 90, '홍대 카페', '진로에 대한 고민이 있어서 인생 선배의 조언을 듣고 싶습니다.', 'CONFIRMED');

-- Insert sample reviews
INSERT INTO reviews (request_id, reviewer_id, rating, comment) VALUES
  ((SELECT id FROM requests WHERE client_id = '550e8400-e29b-41d4-a716-446655440004' AND ajussi_id = '550e8400-e29b-41d4-a716-446655440001'), 
   '550e8400-e29b-41d4-a716-446655440004', 
   5, 
   '정말 좋은 시간이었습니다. 올바른 걷기 자세도 배우고 건강에 대한 좋은 조언도 많이 들었어요!');

-- Insert sample favorites
INSERT INTO favorites (user_id, ajussi_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002');