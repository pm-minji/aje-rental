import { NotificationChannel, Recipient, RenderedMessage, SendResult } from '../types'

/**
 * 이메일 채널 - Resend REST API (https://resend.com)
 * SDK 없이 fetch 한 번으로 발송. 무료 티어: 100통/일.
 */
export const emailChannel: NotificationChannel = {
  name: 'email',

  enabled() {
    return (
      process.env.NOTIFY_EMAIL_ENABLED === 'true' &&
      !!process.env.RESEND_API_KEY &&
      !!process.env.NOTIFY_FROM_EMAIL
    )
  },

  supports(recipient: Recipient) {
    if (recipient.kind === 'admin') {
      return !!process.env.ADMIN_EMAIL
    }
    return !!recipient.email
  },

  async send(recipient: Recipient, message: RenderedMessage): Promise<SendResult> {
    const to = recipient.kind === 'admin' ? process.env.ADMIN_EMAIL : recipient.email
    if (!to) {
      return { ok: false, error: 'No email address for recipient' }
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.NOTIFY_FROM_EMAIL,
          to: [to],
          subject: message.subject,
          text: message.body,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        return { ok: false, error: `Resend ${res.status}: ${errText.slice(0, 300)}` }
      }
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Email send failed' }
    }
  },
}
