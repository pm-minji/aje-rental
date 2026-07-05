/**
 * 서버 환불 진입점 - 활성 결제 제공자에 맞게 외부 결제를 취소/환불한다.
 * 기존 requests의 외부 결제 참조(payapp_mul_no)를 제공자 무관 "external ref"로 재사용한다.
 * (Gumroad는 sale_id, 페이앱은 mul_no를 이 컬럼에 저장)
 */
import { getPaymentProvider } from './payment-provider'
import { cancelPayment } from './payapp'
import { refundSale } from './gumroad'

export interface RefundArgs {
  /** requests.payapp_mul_no - Gumroad면 sale_id, 페이앱이면 mul_no */
  ref: string | null
  /** 아직 결제 완료 전(PAYMENT_REQUESTED)에서의 취소인가 */
  unpaid: boolean
  /** 페이앱 취소 메모 */
  memo: string
}

export interface RefundResult {
  ok: boolean
  error?: string
}

export async function refundExternalPayment({ ref, unpaid, memo }: RefundArgs): Promise<RefundResult> {
  if (getPaymentProvider() === 'gumroad') {
    // Gumroad는 결제가 완료돼야 sale이 생긴다. 미결제 취소는 취소할 대상이 없음.
    if (unpaid) return { ok: true }
    if (!ref) return { ok: false, error: 'Gumroad sale id 없음' }
    return refundSale(ref)
  }
  // 페이앱
  if (!ref) return { ok: false, error: '페이앱 mul_no 없음' }
  return cancelPayment({ mulNo: ref, memo, mode: unpaid ? 'ready' : undefined })
}
