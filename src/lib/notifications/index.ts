import { createServerClient } from '@/lib/supabase'
import { renderMessages } from './templates'
import { NotificationEvent, NotificationChannel, Recipient } from './types'
import { emailChannel } from './channels/email'
import { telegramChannel } from './channels/telegram'
import { alimtalkChannel } from './channels/alimtalk'

export type { NotificationEvent, NotificationEventType, NotificationParty } from './types'

const channels: NotificationChannel[] = [emailChannel, telegramChannel, alimtalkChannel]

function recipientLabel(channel: NotificationChannel, recipient: Recipient): string {
  if (recipient.kind === 'admin') {
    return channel.name === 'telegram' ? 'telegram:admin' : process.env.ADMIN_EMAIL || 'admin'
  }
  return recipient.email || recipient.kind
}

/**
 * 알림 발송 진입점. 절대 throw하지 않는다 - 알림 실패가 본 트랜잭션을 깨면 안 됨.
 *
 * 반드시 `await notify(...)`로 호출할 것. Vercel 서버리스는 응답 후 람다를 동결하므로
 * fire-and-forget(void notify)은 발송이 유실된다.
 */
export async function notify(event: NotificationEvent): Promise<void> {
  try {
    const messages = renderMessages(event)

    const jobs: Array<Promise<{
      channel: string
      recipient: string
      ok: boolean
      error?: string
    }>> = []

    for (const { recipient, message } of messages) {
      for (const channel of channels) {
        if (!channel.enabled() || !channel.supports(recipient)) continue
        jobs.push(
          channel.send(recipient, message).then((result) => ({
            channel: channel.name,
            recipient: recipientLabel(channel, recipient),
            ok: result.ok,
            error: result.error,
          }))
        )
      }
    }

    if (jobs.length === 0) return

    const results = await Promise.allSettled(jobs)

    // 발송 이력 기록 (best-effort)
    try {
      const supabase = createServerClient()
      const rows = results.map((r) => {
        const value = r.status === 'fulfilled'
          ? r.value
          : { channel: 'unknown', recipient: 'unknown', ok: false, error: String(r.reason) }
        return {
          event_type: event.type,
          channel: value.channel,
          recipient: value.recipient,
          request_id: event.request.id || null,
          status: (value.ok ? 'SENT' : 'FAILED') as 'SENT' | 'FAILED',
          error: value.error || null,
        }
      })
      await supabase.from('notification_logs').insert(rows)
    } catch (logErr) {
      console.error('[notifications] failed to write notification_logs:', logErr)
    }
  } catch (err) {
    console.error('[notifications] notify() failed:', err)
  }
}
