/**
 * 페이앱(PayApp) 서버 사이드 연동 - 취소(환불) API + 웹훅 검증
 * 결제창 오픈은 클라이언트의 payapp-client.ts(JS API)가 담당한다.
 *
 * API 문서: https://docs.payapp.kr/dev_center01.html
 */

const PAYAPP_API_URL = 'https://api.payapp.kr/oapi/apiLoad.html'

function getCredentials() {
  const userid = process.env.NEXT_PUBLIC_PAYAPP_USERID
  const linkkey = process.env.PAYAPP_LINKKEY
  const linkval = process.env.PAYAPP_LINKVAL

  if (!userid || !linkkey || !linkval) {
    throw new Error('PayApp credentials are not configured (NEXT_PUBLIC_PAYAPP_USERID / PAYAPP_LINKKEY / PAYAPP_LINKVAL)')
  }
  return { userid, linkkey, linkval }
}

export interface PayappCancelParams {
  mulNo: string
  memo: string
  /** 'ready': 미결제(결제요청) 상태만 취소 - 이미 승인된 결제는 건드리지 않음 */
  mode?: 'ready'
  /** 부분취소 금액(원). 미지정 시 전액 취소 */
  partAmount?: number
}

export interface PayappResult {
  ok: boolean
  error?: string
}

/**
 * 결제취소(환불). state=1이면 성공.
 * 호출부에서 실패를 반드시 처리할 것 - 실패 시 REFUND_REQUESTED로 두고 관리자 개입.
 */
export async function cancelPayment({ mulNo, memo, mode, partAmount }: PayappCancelParams): Promise<PayappResult> {
  try {
    const { userid, linkkey } = getCredentials()

    const params = new URLSearchParams({
      cmd: 'paycancel',
      userid,
      linkkey,
      mul_no: mulNo,
      cancelmemo: memo,
    })
    if (mode === 'ready') params.set('cancelmode', 'ready')
    if (partAmount && partAmount > 0) {
      params.set('partcancel', '1')
      params.set('cancelprice', String(partAmount))
    }

    const res = await fetch(PAYAPP_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const text = await res.text()
    const parsed = new URLSearchParams(text)

    if (parsed.get('state') === '1') {
      return { ok: true }
    }
    return { ok: false, error: parsed.get('errorMessage') || `PayApp paycancel failed: ${text.slice(0, 200)}` }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown PayApp error' }
  }
}

/**
 * 웹훅(feedbackurl) 진위 검증 - userid/linkkey/linkval 3개 모두 일치해야 정상 호출.
 */
export function verifyWebhook(fields: Record<string, string>): boolean {
  try {
    const { userid, linkkey, linkval } = getCredentials()
    return fields.userid === userid && fields.linkkey === linkkey && fields.linkval === linkval
  } catch {
    return false
  }
}

/** 페이앱 pay_state 값 */
export const PAY_STATE = {
  REQUESTED: 1,        // 결제요청 생성 (SUCCESS 응답해야 결제 진행)
  COMPLETED: 4,        // 결제완료
  REQUEST_CANCELLED: [8, 32],   // 요청취소 (미결제 취소)
  APPROVAL_CANCELLED: [9, 64],  // 승인취소 (환불 완료)
  VBANK_PENDING: 10,   // 가상계좌 입금 대기
  PARTIAL_CANCELLED: [70, 71],  // 부분취소
} as const
