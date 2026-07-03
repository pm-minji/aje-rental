import { NotificationEvent, Recipient, RenderedMessage } from './types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ajussirental.com'
const REQUESTS_URL = `${SITE_URL}/mypage/requests`

function formatKstDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Asia/Seoul',
    })
  } catch {
    return iso
  }
}

function formatWon(amount: number | null): string {
  return `${(amount ?? 0).toLocaleString('ko-KR')}원`
}

function partyName(party: { name: string | null; nickname: string | null } | null): string {
  return party?.nickname || party?.name || '회원'
}

function requestSummary(event: NotificationEvent): string {
  const { request } = event
  return [
    `일시: ${formatKstDateTime(request.date)}`,
    `소요 시간: ${request.duration}분`,
    `장소: ${request.location}`,
    `요청 내용: ${request.description}`,
  ].join('\n')
}

/**
 * 이벤트를 수신자별 메시지로 렌더링한다. 한국어 문구는 전부 이 파일에서 관리.
 */
export function renderMessages(event: NotificationEvent): Array<{ recipient: Recipient; message: RenderedMessage }> {
  const messages: Array<{ recipient: Recipient; message: RenderedMessage }> = []
  const clientRecipient: Recipient = { kind: 'client', email: event.client?.email }
  const ajussiRecipient: Recipient = { kind: 'ajussi', email: event.ajussi?.email }
  const adminRecipient: Recipient = { kind: 'admin' }
  const summary = requestSummary(event)
  const amount = formatWon(event.request.deposit_amount)
  const refundNote = event.extra?.refundNote

  switch (event.type) {
    case 'PAYMENT_COMPLETED':
      messages.push({
        recipient: ajussiRecipient,
        message: {
          subject: '[아저씨렌탈] 새 서비스 요청이 도착했어요',
          body: `${partyName(event.client)}님이 예약금 결제를 완료하고 서비스를 요청했어요.\n\n${summary}\n\n마이페이지에서 수락 또는 거절을 선택해주세요:\n${REQUESTS_URL}`,
        },
      })
      messages.push({
        recipient: clientRecipient,
        message: {
          subject: '[아저씨렌탈] 결제가 완료되었어요',
          body: `예약금 ${amount} 결제가 완료되었어요.\n아저씨가 수락하면 다시 알려드릴게요. 수락 전에는 언제든 취소하면 전액 환불됩니다.\n\n${summary}\n\n요청 확인: ${REQUESTS_URL}`,
        },
      })
      messages.push({
        recipient: adminRecipient,
        message: {
          subject: `[아저씨렌탈] 새 결제 완료 (${amount})`,
          body: `클라이언트: ${partyName(event.client)}\n아저씨: ${partyName(event.ajussi)}\n\n${summary}\n\nrequest_id: ${event.request.id}`,
        },
      })
      break

    case 'REQUEST_ACCEPTED':
      messages.push({
        recipient: clientRecipient,
        message: {
          subject: '[아저씨렌탈] 예약이 확정되었어요',
          body: `${partyName(event.ajussi)}님이 요청을 수락했어요.\n오픈채팅으로 당일 세부 사항을 조율해보세요.\n\n${summary}\n\n요청 확인: ${REQUESTS_URL}`,
        },
      })
      break

    case 'REQUEST_REJECTED':
      messages.push({
        recipient: clientRecipient,
        message: {
          subject: '[아저씨렌탈] 요청이 거절되었어요',
          body: `아쉽지만 ${partyName(event.ajussi)}님이 요청을 수락하지 못했어요.\n${refundNote || `결제하신 예약금 ${amount}은 전액 환불 처리됩니다.`}\n\n${summary}\n\n다른 아저씨 둘러보기: ${SITE_URL}/ajussi`,
        },
      })
      break

    case 'PAYMENT_EXPIRED':
      messages.push({
        recipient: clientRecipient,
        message: {
          subject: '[아저씨렌탈] 결제가 완료되지 않아 요청이 만료되었어요',
          body: `결제가 완료되지 않아 서비스 요청이 만료되었어요.\n다시 예약하시려면 아저씨 페이지에서 새로 요청해주세요.\n\n${summary}\n\n${SITE_URL}/ajussi`,
        },
      })
      break

    case 'REQUEST_CANCELLED':
      messages.push({
        recipient: ajussiRecipient,
        message: {
          subject: '[아저씨렌탈] 요청이 취소되었어요',
          body: `${partyName(event.client)}님이 서비스 요청을 취소했어요.\n\n${summary}`,
        },
      })
      messages.push({
        recipient: clientRecipient,
        message: {
          subject: '[아저씨렌탈] 요청 취소가 접수되었어요',
          body: `서비스 요청이 취소되었어요.\n${refundNote || ''}\n\n${summary}`.trim(),
        },
      })
      break

    case 'REFUND_COMPLETED':
      messages.push({
        recipient: clientRecipient,
        message: {
          subject: '[아저씨렌탈] 환불이 완료되었어요',
          body: `예약금 ${amount} 환불이 완료되었어요.\n결제수단에 따라 실제 반영까지 며칠 걸릴 수 있어요.\n\n${summary}`,
        },
      })
      break

    case 'REFUND_ACTION_NEEDED':
      messages.push({
        recipient: adminRecipient,
        message: {
          subject: '[아저씨렌탈][확인 필요] 자동 환불 실패',
          body: `자동 환불 처리에 실패했어요. 관리자 결제 관리에서 수동 처리가 필요합니다.\n${refundNote || ''}\n\n클라이언트: ${partyName(event.client)}\n아저씨: ${partyName(event.ajussi)}\n${summary}\n\nrequest_id: ${event.request.id}\n${SITE_URL}/admin`,
        },
      })
      break
  }

  return messages
}
