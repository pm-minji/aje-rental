import { NotificationChannel, Recipient, RenderedMessage, SendResult } from '../types'

/**
 * 카카오 알림톡 채널 - 스텁.
 *
 * 활성화 전제 (사업자 필요):
 * 1. 카카오톡 채널 개설 + 비즈니스 인증
 * 2. 발송 대행사(솔라피 등) 가입 및 발신프로필 연동
 * 3. 템플릿 사전 심사 통과
 * 이후 SOLAPI_API_KEY / SOLAPI_API_SECRET / NOTIFY_ALIMTALK_ENABLED env를 추가하고
 * send()를 솔라피 REST API 호출로 구현하면 이메일과 병행 발송된다.
 */
export const alimtalkChannel: NotificationChannel = {
  name: 'alimtalk',

  enabled() {
    return false
  },

  supports(_recipient: Recipient) {
    return false
  },

  async send(_recipient: Recipient, _message: RenderedMessage): Promise<SendResult> {
    return { ok: false, error: 'Alimtalk channel is not implemented yet' }
  },
}
