/**
 * Gumroad 클라이언트 사이드 체크아웃 - 상품 페이지로 이동해 결제.
 *
 * request_id를 url_params로 심어 Gumroad Ping 웹훅에서 예약과 결제를 연결한다.
 * (Gumroad는 상품 URL의 쿼리스트링을 Ping의 url_params[...]로 되돌려준다.)
 * 결제 완료 후에는 Gumroad 상품 설정의 "redirect" 로 /mypage/requests 로 복귀시킨다.
 */

export interface GumroadCheckoutParams {
  /** requests.id - Ping의 url_params[request_id]로 되돌아옴 */
  requestId: string
  /** 구매자 이메일 프리필(선택) */
  email?: string | null
}

export function openGumroadCheckout({ requestId, email }: GumroadCheckoutParams): void {
  if (typeof window === 'undefined') {
    throw new Error('Gumroad checkout is only available in the browser')
  }
  const base = process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL
  if (!base) {
    throw new Error('NEXT_PUBLIC_GUMROAD_PRODUCT_URL is not configured')
  }

  const url = new URL(base)
  // 결제창으로 바로 진입
  url.searchParams.set('wanted', 'true')
  // 예약 식별자 - 웹훅에서 url_params[request_id]로 회수
  url.searchParams.set('request_id', requestId)
  if (email) url.searchParams.set('email', email)

  window.location.href = url.toString()
}
