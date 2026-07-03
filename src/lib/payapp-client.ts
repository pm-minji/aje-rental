/**
 * 페이앱(PayApp) 클라이언트 사이드 결제창 호출 - JS API(payapp-lite.js)
 *
 * recvphone을 전달하지 않으므로 구매자가 페이앱 결제창에서 휴대폰 번호를 직접 입력한다.
 * 결제 결과는 서버 웹훅(/api/payments/payapp/webhook)으로만 신뢰한다.
 */

const PAYAPP_LITE_URL = 'https://lite.payapp.kr/public/api/v2/payapp-lite.js'

declare global {
  interface Window {
    PayApp?: {
      setDefault: (key: string, value: string) => void
      setParam: (key: string, value: string) => void
      setTarget: (target: string) => void
      payrequest: (params?: Record<string, string>) => void
    }
  }
}

let scriptPromise: Promise<NonNullable<Window['PayApp']>> | null = null

function loadPayappScript(): Promise<NonNullable<Window['PayApp']>> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('PayApp checkout is only available in the browser'))
  }
  if (window.PayApp) {
    return Promise.resolve(window.PayApp)
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = PAYAPP_LITE_URL
      script.async = true
      script.onload = () => {
        if (window.PayApp) {
          resolve(window.PayApp)
        } else {
          scriptPromise = null
          reject(new Error('payapp-lite.js loaded but PayApp is not available'))
        }
      }
      script.onerror = () => {
        scriptPromise = null
        reject(new Error('Failed to load payapp-lite.js'))
      }
      document.head.appendChild(script)
    })
  }
  return scriptPromise
}

export interface PayappCheckoutParams {
  /** requests.id - 웹훅 var1으로 되돌아와 결제와 예약을 연결한다 */
  requestId: string
  goodname: string
  price: number
}

/**
 * 결제창을 현재 탭에서 연다. 결제 완료 후 returnurl(/mypage/requests)로 복귀.
 */
export async function openPayappCheckout({ requestId, goodname, price }: PayappCheckoutParams): Promise<void> {
  const userid = process.env.NEXT_PUBLIC_PAYAPP_USERID
  if (!userid) {
    throw new Error('NEXT_PUBLIC_PAYAPP_USERID is not configured')
  }

  const payapp = await loadPayappScript()
  const origin = window.location.origin

  payapp.setDefault('userid', userid)
  payapp.setDefault('shopname', process.env.NEXT_PUBLIC_PAYAPP_SHOPNAME || '아저씨렌탈')
  // 같은 탭에서 결제창으로 이동 (모바일 팝업 차단 회피)
  payapp.setTarget('_self')

  payapp.payrequest({
    goodname,
    price: String(price),
    smsuse: 'n',
    redirectpay: '1',
    openpaytype: process.env.NEXT_PUBLIC_PAYAPP_OPENPAYTYPE || 'card,kakaopay,naverpay',
    feedbackurl: `${origin}/api/payments/payapp/webhook`,
    returnurl: `${origin}/mypage/requests`,
    var1: requestId,
    checkretry: 'y',
  })
}
