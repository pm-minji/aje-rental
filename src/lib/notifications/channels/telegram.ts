import { NotificationChannel, Recipient, RenderedMessage, SendResult } from '../types'

/**
 * 텔레그램 채널 - 운영자 전용 실시간 알림 (봇 무료)
 */
export const telegramChannel: NotificationChannel = {
  name: 'telegram',

  enabled() {
    return (
      process.env.NOTIFY_TELEGRAM_ENABLED === 'true' &&
      !!process.env.TELEGRAM_BOT_TOKEN &&
      !!process.env.TELEGRAM_ADMIN_CHAT_ID
    )
  },

  supports(recipient: Recipient) {
    return recipient.kind === 'admin'
  },

  async send(_recipient: Recipient, message: RenderedMessage): Promise<SendResult> {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_ADMIN_CHAT_ID,
            text: `${message.subject}\n\n${message.body}`,
          }),
        }
      )

      if (!res.ok) {
        const errText = await res.text()
        return { ok: false, error: `Telegram ${res.status}: ${errText.slice(0, 300)}` }
      }
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Telegram send failed' }
    }
  },
}
