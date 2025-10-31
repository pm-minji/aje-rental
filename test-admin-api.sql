-- Check if ajussi_applications table exists and has data
SELECT COUNT(*) FROM ajussi_applications;

-- If no data, insert a test application
INSERT INTO ajussi_applications (
  user_id,
  title,
  description,
  hourly_rate,
  available_areas,
  open_chat_url,
  tags,
  status
) VALUES (
  (SELECT id FROM profiles WHERE role = 'user' LIMIT 1),
  '테스트 아저씨 서비스',
  '테스트용 아저씨 신청서입니다.',
  15000,
  ARRAY['서울시 강남구', '서울시 서초구'],
  'https://open.kakao.com/test',
  ARRAY['청소', '정리'],
  'PENDING'
);

-- Check the inserted data
SELECT * FROM ajussi_applications;