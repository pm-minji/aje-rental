import { Request } from '@/types/database'

/**
 * 알림 이벤트 - 결제/예약 라이프사이클의 주요 지점마다 발생
 */
export type NotificationEventType =
  | 'PAYMENT_COMPLETED'   // 결제 완료 → 아저씨(새 요청) + 클라이언트(접수 확인) + 운영자
  | 'REQUEST_ACCEPTED'    // 아저씨 수락 → 클라이언트
  | 'REQUEST_REJECTED'    // 아저씨 거절 → 클라이언트 (환불 안내 포함)
  | 'PAYMENT_EXPIRED'     // 미결제 만료 → 클라이언트
  | 'REQUEST_CANCELLED'   // 취소 → 상대방 (+환불 개입 필요 시 운영자)
  | 'REFUND_COMPLETED'    // 환불 완료 → 클라이언트
  | 'REFUND_ACTION_NEEDED' // 자동 환불 실패 → 운영자

export interface NotificationParty {
  id: string
  email: string | null
  name: string | null
  nickname: string | null
}

export interface NotificationEvent {
  type: NotificationEventType
  request: Pick<Request, 'id' | 'date' | 'duration' | 'location' | 'description' | 'deposit_amount'>
  client: NotificationParty | null
  ajussi: NotificationParty | null
  /** 템플릿에 삽입할 추가 문구 (환불 결과 등) */
  extra?: {
    refundNote?: string
  }
}

export interface Recipient {
  kind: 'client' | 'ajussi' | 'admin'
  email?: string | null
}

export interface RenderedMessage {
  subject: string
  body: string
}

export interface SendResult {
  ok: boolean
  error?: string
}

export interface NotificationChannel {
  name: 'email' | 'telegram' | 'alimtalk'
  /** env 플래그와 필수 키가 모두 갖춰졌는지 */
  enabled(): boolean
  /** 이 채널이 해당 수신자를 처리할 수 있는지 (telegram은 admin 전용 등) */
  supports(recipient: Recipient): boolean
  send(recipient: Recipient, message: RenderedMessage): Promise<SendResult>
}
