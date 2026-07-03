-- 005: 페이앱 선결제 + 결제 이벤트/알림 발송 이력
-- 결제 축(payment_status)은 매칭 축(requests.status)과 직교로 관리한다.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 결제 상태
CREATE TYPE payment_status AS ENUM (
  'NONE',               -- 결제 프로세스 없음 (기존 데이터 / 미결제 취소)
  'PAYMENT_REQUESTED',  -- 결제창 오픈됨, 결제 대기
  'PAID',               -- 결제 완료 (웹훅 pay_state=4)
  'EXPIRED',            -- 기한 내 미결제 만료
  'REFUND_REQUESTED',   -- 환불 필요하나 자동 처리 실패 → 관리자 대기
  'REFUNDED',           -- 환불 완료
  'REFUND_DENIED'       -- 정책상 환불 불가 (예약 24시간 이내 취소)
);

ALTER TABLE requests
  ADD COLUMN payment_status payment_status NOT NULL DEFAULT 'NONE',
  ADD COLUMN deposit_amount INTEGER,
  ADD COLUMN payapp_mul_no TEXT,
  ADD COLUMN pay_type INTEGER,
  ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN refund_requested_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN refund_processed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN admin_payment_note TEXT;

CREATE INDEX idx_requests_payment_status ON requests(payment_status);

-- 페이앱 웹훅 원문 감사 로그 (분쟁 증빙)
CREATE TABLE payment_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  mul_no TEXT,
  pay_state INTEGER,
  raw JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_events_request ON payment_events(request_id);

-- 알림 발송 이력 (디버깅 + 중복 발송 방지)
CREATE TABLE notification_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'SENT' CHECK (status IN ('SENT', 'FAILED')),
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_logs_request ON notification_logs(request_id);

-- payment_events / notification_logs는 서버(service_role)만 접근한다.
-- 003에서 RLS가 전면 비활성이지만, 이 두 테이블은 결제 원문·이메일 등 PII를 담으므로
-- RLS를 켜고 정책을 두지 않아 공개 anon 키로는 읽기/쓰기가 불가능하게 한다.
-- (service_role 키는 RLS를 우회하므로 서버 로직은 그대로 동작한다.)
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
