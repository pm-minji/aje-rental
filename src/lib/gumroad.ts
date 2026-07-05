/**
 * Gumroad(판매대행/MoR) 서버 사이드 연동 - 판매 검증 + 환불 (API v2)
 * 체크아웃 오픈은 클라이언트의 gumroad-client.ts가 담당한다.
 *
 * API: https://api.gumroad.com/v2  (access_token 인증)
 * Ping(판매 웹훅)은 서명이 없으므로 sale_id를 이 API로 재조회해 진위를 확인한다.
 */

const GUMROAD_API = 'https://api.gumroad.com/v2'

function accessToken(): string | null {
  return process.env.GUMROAD_ACCESS_TOKEN || null
}

/** 우리 판매 상품 permalink (예: 'ajussi-session'). 웹훅에서 상품 일치 확인용 */
export function expectedPermalink(): string | null {
  return process.env.GUMROAD_PRODUCT_PERMALINK || null
}

/** 판매자 id (Ping의 seller_id와 대조. 토큰이 없을 때의 약한 검증용) */
export function expectedSellerId(): string | null {
  return process.env.GUMROAD_SELLER_ID || null
}

export interface GumroadSale {
  id: string
  product_permalink?: string
  permalink?: string
  product_id?: string
  email?: string
  price?: number // cents
  refunded?: boolean
  disputed?: boolean
  seller_id?: string
  [k: string]: any
}

export interface GumroadResult<T = unknown> {
  ok: boolean
  data?: T
  error?: string
}

/**
 * sale_id로 단건 판매를 조회해 진위/상태를 확인한다.
 * GET /v2/sales/:id
 */
export async function verifySale(saleId: string): Promise<GumroadResult<GumroadSale>> {
  const token = accessToken()
  if (!token) return { ok: false, error: 'GUMROAD_ACCESS_TOKEN not configured' }
  try {
    const res = await fetch(`${GUMROAD_API}/sales/${encodeURIComponent(saleId)}?access_token=${encodeURIComponent(token)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    const json = await res.json().catch(() => null) as any
    if (!res.ok || !json?.success || !json?.sale) {
      return { ok: false, error: `Gumroad verify failed (${res.status}): ${json?.message || 'no sale'}` }
    }
    return { ok: true, data: json.sale as GumroadSale }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Gumroad verify error' }
  }
}

/**
 * 판매 환불. PUT /v2/sales/:id/refund  (amount_cents 지정 시 부분환불)
 */
export async function refundSale(saleId: string, amountCents?: number): Promise<GumroadResult> {
  const token = accessToken()
  if (!token) return { ok: false, error: 'GUMROAD_ACCESS_TOKEN not configured' }
  try {
    const params = new URLSearchParams({ access_token: token })
    if (amountCents && amountCents > 0) params.set('amount_cents', String(amountCents))
    const res = await fetch(`${GUMROAD_API}/sales/${encodeURIComponent(saleId)}/refund`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: params.toString(),
    })
    const json = await res.json().catch(() => null) as any
    if (!res.ok || !json?.success) {
      return { ok: false, error: `Gumroad refund failed (${res.status}): ${json?.message || 'unknown'}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Gumroad refund error' }
  }
}
