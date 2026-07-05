/**
 * 결제 제공자 스위치 - 페이앱 코드는 남기되 env로 활성 제공자를 고른다.
 * NEXT_PUBLIC_ 접두사라 클라이언트/서버 양쪽에서 읽힌다.
 */
export type PaymentProvider = 'gumroad' | 'payapp'

export function getPaymentProvider(): PaymentProvider {
  // 기본값은 'payapp'(기존 프로덕션 동작 보존) - 이 코드를 머지해도 프로덕션은 안 바뀐다.
  // Gumroad 셋업(상품·토큰·env)을 마친 뒤 NEXT_PUBLIC_PAYMENT_PROVIDER=gumroad 로 명시해야 전환된다.
  return process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === 'gumroad' ? 'gumroad' : 'payapp'
}
