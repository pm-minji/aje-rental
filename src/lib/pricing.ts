/**
 * 요금 정책 상수 - 가격 변경 시 이 파일만 수정하면 전체에 반영된다.
 */

/** 기본 요금 (첫 1시간, 선결제 예약금) */
export const DEPOSIT_AMOUNT = 20000

/** 추가 시간당 요금 (현장 정산) */
export const EXTRA_HOURLY_RATE = 10000

/** 결제창 오픈 후 미결제 시 요청이 만료되는 시간 */
export const PAYMENT_EXPIRE_HOURS = 24

/** 페이앱 결제요청에 표시할 상품명 */
export function depositGoodName(ajussiTitle?: string | null): string {
  return ajussiTitle ? `아저씨렌탈 예약 - ${ajussiTitle}` : '아저씨렌탈 예약 (기본 1시간)'
}
