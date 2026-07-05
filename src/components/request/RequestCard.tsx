'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, User, MessageCircle, ExternalLink, Star, Copy, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { RequestWithDetails } from '@/types/database'
import { ReviewModal } from '@/components/review/ReviewModal'
import { paymentStatusLabels, paymentStatusToBadgeVariant } from '@/styles/tokens'
import { openCheckout } from '@/lib/checkout-client'
import { DEPOSIT_AMOUNT, depositGoodName } from '@/lib/pricing'

interface RequestCardProps {
  request: RequestWithDetails
  userType: 'client' | 'ajussi'
  onStatusChange: (requestId: string, status: string) => Promise<void>
}

export function RequestCard({ request, userType, onStatusChange }: RequestCardProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const { success, error } = useToast()

  const otherParty = userType === 'client' ? request.ajussi : request.client
  const isClient = userType === 'client'
  const isAjussi = userType === 'ajussi'

  // 결제창으로 이동(같은 탭) 후 뒤로가기(bfcache)로 복귀하면 로딩 상태가 고착된다. pageshow에서 해제.
  useEffect(() => {
    const reset = () => setLoading(false)
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])

  // 결제 완료 또는 결제 도입 이전(legacy) 데이터
  const isPaidOrLegacy = ['PAID', 'NONE'].includes(request.payment_status ?? 'NONE')
  const isAwaitingPayment = request.payment_status === 'PAYMENT_REQUESTED'

  // 취소 시 전액 환불 가능 여부 (수락 전 언제든 / 확정 후 예약 24시간 전까지)
  const hoursUntilService = (new Date(request.date).getTime() - Date.now()) / (60 * 60 * 1000)
  const isFullyRefundable = request.status === 'PENDING' || hoursUntilService >= 24

  // Check if the scheduled service time has passed (date + duration)
  const isServiceTimeOver = (() => {
    const serviceDate = new Date(request.date)
    const endTime = new Date(serviceDate.getTime() + request.duration * 60 * 1000)
    return new Date() > endTime
  })()

  const handleResumePayment = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    try {
      setLoading(true)
      await openCheckout({
        requestId: request.id,
        goodname: depositGoodName(request.ajussi_profiles?.title),
        price: request.deposit_amount ?? DEPOSIT_AMOUNT,
      })
    } catch (err) {
      console.error('Resume payment error:', err)
      error('결제 오류', '결제창을 여는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setLoading(false)
    }
  }

  const handleCopySummary = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    const summary = [
      '[아저씨렌탈 예약 요약]',
      `일시: ${formatDateTime(request.date)}`,
      `소요 시간: ${request.duration}분`,
      `장소: ${request.location}`,
      `요청 내용: ${request.description}`,
      request.payment_status === 'PAID'
        ? `예약금 ${formatCurrency(request.deposit_amount ?? DEPOSIT_AMOUNT)} 결제완료`
        : '',
    ].filter(Boolean).join('\n')

    try {
      await navigator.clipboard.writeText(summary)
      success('복사 완료', '예약 요약이 복사되었어요. 오픈채팅에 붙여넣어 주세요.')
    } catch {
      error('복사 실패', '클립보드 복사에 실패했습니다.')
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true)
      console.log('Changing status:', { requestId: request.id, newStatus })
      await onStatusChange(request.id, newStatus)
      success(
        '상태 변경 완료',
        getStatusChangeMessage(newStatus)
      )
      setShowConfirmModal(false)
      setPendingAction(null)
    } catch (err) {
      console.error('Status change error:', err)
      error('오류 발생', `상태 변경 중 오류가 발생했습니다: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusChangeMessage = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return '요청을 수락했습니다.'
      case 'REJECTED': return '요청을 거절했습니다.'
      case 'COMPLETED': return '서비스가 완료되었습니다.'
      case 'CANCELLED': return '요청을 취소했습니다.'
      default: return '상태가 변경되었습니다.'
    }
  }

  const openConfirmModal = (action: string, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setPendingAction(action)
    setShowConfirmModal(true)
  }

  const getActionButtons = () => {
    const buttons = []

    switch (request.status) {
      case 'PENDING':
        // 결제 미완료: 이어서 결제 (클라이언트)
        if (isClient && isAwaitingPayment) {
          buttons.push(
            <Button
              key="pay"
              size="sm"
              loading={loading}
              onClick={handleResumePayment}
            >
              <CreditCard className="h-4 w-4 mr-1" />
              결제하기
            </Button>
          )
        }
        if (isClient) {
          buttons.push(
            <Button
              key="cancel"
              variant="outline"
              size="sm"
              onClick={(e) => openConfirmModal('CANCELLED', e)}
            >
              취소하기
            </Button>
          )
        }
        if (isAjussi && isPaidOrLegacy) {
          buttons.push(
            <Button
              key="reject"
              variant="outline"
              size="sm"
              onClick={(e) => openConfirmModal('REJECTED', e)}
            >
              거절하기
            </Button>,
            <Button
              key="confirm"
              size="sm"
              onClick={(e) => openConfirmModal('CONFIRMED', e)}
            >
              수락하기
            </Button>
          )
        }
        break

      case 'CONFIRMED':
        if (isServiceTimeOver && isPaidOrLegacy) {
          buttons.push(
            <Button
              key="complete"
              size="sm"
              onClick={(e) => openConfirmModal('COMPLETED', e)}
            >
              완료하기
            </Button>
          )
        } else if (!isServiceTimeOver) {
          buttons.push(
            <Button
              key="complete-disabled"
              size="sm"
              variant="outline"
              disabled
              title="예약 시간 이후에 완료할 수 있습니다"
            >
              예약시간 전
            </Button>
          )
        }
        // 채팅하기 버튼은 클라이언트(유저)에게만 표시
        if (isClient && isPaidOrLegacy && request.ajussi_profiles?.open_chat_url) {
          buttons.push(
            <Button
              key="chat"
              variant="outline"
              size="sm"
              onClick={() => window.open(request.ajussi_profiles?.open_chat_url ?? '', '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              채팅하기
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          )
        }
        // 예약 요약 복사 - 오픈채팅에 붙여넣어 컨텍스트 전달
        if (isClient && isPaidOrLegacy) {
          buttons.push(
            <Button
              key="copy-summary"
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
            >
              <Copy className="h-4 w-4 mr-1" />
              예약 요약 복사
            </Button>
          )
        }
        // 확정 후에도 취소 가능 (환불정책: 예약 24시간 전까지 전액 환불)
        if (isClient) {
          buttons.push(
            <Button
              key="cancel-confirmed"
              variant="outline"
              size="sm"
              onClick={(e) => openConfirmModal('CANCELLED', e)}
            >
              취소하기
            </Button>
          )
        }
        break

      case 'COMPLETED':
        // 클라이언트만 리뷰 작성 가능 (리뷰가 없는 경우에만)
        if (isClient && !request.review && !hasReviewed) {
          buttons.push(
            <Button
              key="review"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowReviewModal(true)
              }}
            >
              <Star className="h-4 w-4 mr-1" />
              리뷰 작성
            </Button>
          )
        }
        break
    }

    return buttons
  }

  const getConfirmModalContent = () => {
    switch (pendingAction) {
      case 'CONFIRMED':
        return {
          title: '요청 수락',
          message: '이 서비스 요청을 수락하시겠습니까?',
          confirmText: '수락하기',
          variant: 'default' as const,
        }
      case 'REJECTED':
        return {
          title: '요청 거절',
          message: '이 서비스 요청을 거절하시겠습니까?',
          confirmText: '거절하기',
          variant: 'destructive' as const,
        }
      case 'COMPLETED':
        return {
          title: '서비스 완료',
          message: '서비스가 완료되었나요?',
          confirmText: '완료하기',
          variant: 'default' as const,
        }
      case 'CANCELLED':
        return {
          title: '요청 취소',
          message:
            request.payment_status === 'PAID'
              ? isFullyRefundable
                ? '취소 시 결제하신 예약금이 전액 환불됩니다. 취소하시겠습니까?'
                : '예약 24시간 이내 취소는 취소/환불정책에 따라 환불되지 않습니다. 그래도 취소하시겠습니까?'
              : '이 서비스 요청을 취소하시겠습니까?',
          confirmText: '취소하기',
          variant: 'destructive' as const,
        }
      default:
        return {
          title: '확인',
          message: '작업을 진행하시겠습니까?',
          confirmText: '확인',
          variant: 'default' as const,
        }
    }
  }

  const modalContent = getConfirmModalContent()

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }

    if (isClient) {
      // Navigate to specific ajussi detail page using ajussi_profiles.id
      const ajussiProfileId = request.ajussi_profiles?.id
      if (ajussiProfileId) {
        window.location.href = `/ajussi/${ajussiProfileId}`
      }
    }
  }

  return (
    <>
      <Card
        hover
        className={`${isClient ? 'cursor-pointer' : ''}`}
        onClick={isClient ? handleCardClick : undefined}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar
                src={otherParty?.profile_image}
                alt={otherParty?.name || '사용자'}
                size="md"
                fallback={otherParty?.name || '?'}
              />
              <div>
                <h3 className="font-medium text-gray-900">
                  {otherParty?.nickname || otherParty?.name || '알 수 없음'}
                </h3>
                {isClient && request.ajussi_profiles && (
                  <p className="text-sm text-gray-600">
                    {request.ajussi_profiles.title}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={request.status} />
              {request.payment_status && paymentStatusLabels[request.payment_status] && (
                <Badge variant={paymentStatusToBadgeVariant[request.payment_status] || 'default'} size="sm">
                  {paymentStatusLabels[request.payment_status]}
                </Badge>
              )}
            </div>
          </div>

          {/* Request Details */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDateTime(request.date)}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{request.duration}분</span>
              <span className="ml-2 font-medium text-primary">
                ({formatCurrency(request.deposit_amount ?? DEPOSIT_AMOUNT)} / 첫 1시간)
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{request.location}</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              {request.description}
            </p>
          </div>

          {/* Review Display (if exists) */}
          {request.review && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm font-medium text-gray-700">내 리뷰</span>
                <div className="flex items-center ml-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${star <= request.review!.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
              </div>
              {request.review.comment && (
                <p className="text-sm text-gray-600">{request.review.comment}</p>
              )}
            </div>
          )}

          {/* Actions */}
          {getActionButtons().length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {getActionButtons()}
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          if (!loading) {
            setShowConfirmModal(false)
            setPendingAction(null)
          }
        }}
        title={modalContent.title}
        closeOnOverlayClick={!loading}
      >
        <ModalBody>
          <p className="text-gray-700">{modalContent.message}</p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowConfirmModal(false)
              setPendingAction(null)
            }}
            disabled={loading}
          >
            취소
          </Button>
          <Button
            variant={modalContent.variant}
            onClick={() => handleStatusChange(pendingAction!)}
            loading={loading}
          >
            {modalContent.confirmText}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Review Modal */}
      {isClient && request.status === 'COMPLETED' && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          requestId={request.id}
          ajussiName={request.ajussi_profiles?.title || request.ajussi?.name || '아저씨'}
          onSuccess={() => setHasReviewed(true)}
        />
      )}
    </>
  )
}