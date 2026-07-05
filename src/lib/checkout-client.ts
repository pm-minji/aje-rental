/**
 * 클라이언트 체크아웃 진입점 - 활성 결제 제공자에 맞는 결제창을 연다.
 */
import { getPaymentProvider } from './payment-provider'
import { openGumroadCheckout } from './gumroad-client'
import { openPayappCheckout } from './payapp-client'

export interface CheckoutArgs {
  requestId: string
  /** 페이앱 전용: 상품명 */
  goodname: string
  /** 페이앱 전용: 금액(원) */
  price: number
  /** Gumroad 전용(선택): 구매자 이메일 프리필 */
  email?: string | null
}

export async function openCheckout({ requestId, goodname, price, email }: CheckoutArgs): Promise<void> {
  if (getPaymentProvider() === 'gumroad') {
    return openGumroadCheckout({ requestId, email })
  }
  return openPayappCheckout({ requestId, goodname, price })
}
