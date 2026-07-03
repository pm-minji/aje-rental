'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { RequestWithDetails } from '@/types/database'
import { paymentStatusLabels, paymentStatusToBadgeVariant } from '@/styles/tokens'
import { DEPOSIT_AMOUNT } from '@/lib/pricing'

const PAY_TYPE_LABELS: Record<number, string> = {
  1: '신용카드',
  2: '휴대전화',
  4: '대면결제',
  6: '계좌이체',
  7: '가상계좌',
  15: '카카오페이',
  16: '네이버페이',
  21: '스마일페이',
  23: '애플페이',
  24: '내통장결제',
  25: '토스페이',
}

type PaymentRow = RequestWithDetails

export function PaymentManagementTab() {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/payments')
      const result = await response.json()

      if (result.success) {
        setPayments(result.data)
      } else {
        error('오류 발생', result.error || '결제 목록을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('Error fetching payments:', err)
      error('오류 발생', '결제 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleRefund = async (payment: PaymentRow) => {
    const note = prompt(
      `환불 메모를 입력해주세요 (예약금 ${formatCurrency(payment.deposit_amount ?? DEPOSIT_AMOUNT)} 전액 환불):`,
      '관리자 환불 처리'
    )
    if (note === null) return

    try {
      setProcessing(payment.id)
      const response = await fetch(`/api/admin/payments/${payment.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refund', note }),
      })
      const result = await response.json()

      if (result.success) {
        success('환불 완료', '페이앱 환불이 처리되었습니다.')
        fetchPayments()
      } else {
        error('환불 실패', result.error || '환불 처리에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error processing refund:', err)
      error('환불 실패', '환불 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(null)
    }
  }

  const handleDeny = async (payment: PaymentRow) => {
    const note = prompt('환불 불가 처리 사유를 입력해주세요:')
    if (!note) return

    try {
      setProcessing(payment.id)
      const response = await fetch(`/api/admin/payments/${payment.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deny', note }),
      })
      const result = await response.json()

      if (result.success) {
        success('처리 완료', '환불 불가로 처리되었습니다.')
        fetchPayments()
      } else {
        error('처리 실패', result.error || '처리에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error denying refund:', err)
      error('처리 실패', '처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="py-8">
        <Loading size="lg" text="결제 목록을 불러오는 중..." />
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <p className="text-gray-500">결제 이력이 없습니다.</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  const refundRequestedCount = payments.filter(
    (p) => p.payment_status === 'REFUND_REQUESTED'
  ).length

  return (
    <div className="space-y-4">
      <p className="text-gray-600">
        총 {payments.length}건의 결제
        {refundRequestedCount > 0 && (
          <span className="ml-2 text-red-600 font-medium">
            (환불 대기 {refundRequestedCount}건)
          </span>
        )}
      </p>

      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">
                  {payment.client?.nickname || payment.client?.name || '알 수 없음'}
                  {' → '}
                  {payment.ajussi?.nickname || payment.ajussi?.name || '알 수 없음'}
                </h3>
                <p className="text-sm text-gray-500">
                  예약 일시: {formatDateTime(payment.date)} / {payment.location}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant={paymentStatusToBadgeVariant[payment.payment_status] || 'default'}
                >
                  {paymentStatusLabels[payment.payment_status] || payment.payment_status}
                </Badge>
                <Badge variant="secondary" size="sm">
                  요청 {payment.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-500 block">결제 금액</span>
                <span className="font-semibold">
                  {formatCurrency(payment.deposit_amount ?? DEPOSIT_AMOUNT)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">결제 수단</span>
                <span>
                  {payment.pay_type ? PAY_TYPE_LABELS[payment.pay_type] || `기타(${payment.pay_type})` : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">결제 일시</span>
                <span>{payment.paid_at ? formatDateTime(payment.paid_at) : '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">페이앱 결제번호</span>
                <span className="font-mono text-xs">{payment.payapp_mul_no || '-'}</span>
              </div>
            </div>

            {payment.admin_payment_note && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <h4 className="font-medium text-gray-700 mb-1 text-sm">관리자 메모</h4>
                <p className="text-sm text-gray-600">{payment.admin_payment_note}</p>
              </div>
            )}

            {['PAID', 'REFUND_REQUESTED'].includes(payment.payment_status) && (
              <div className="flex gap-2">
                <Button
                  variant={payment.payment_status === 'REFUND_REQUESTED' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleRefund(payment)}
                  loading={processing === payment.id}
                  disabled={processing !== null}
                >
                  전액 환불 실행
                </Button>
                {payment.payment_status === 'REFUND_REQUESTED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeny(payment)}
                    loading={processing === payment.id}
                    disabled={processing !== null}
                    className="text-red-500 border-red-200 hover:bg-red-50"
                  >
                    환불 불가 처리
                  </Button>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  )
}
