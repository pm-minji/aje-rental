'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, User, MessageCircle, ExternalLink, Star } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { formatDateTime } from '@/lib/utils'
import { RequestWithDetails } from '@/types/database'
import { ReviewModal } from '@/components/review/ReviewModal'

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

  // Check if the scheduled service time has passed (date + duration)
  const isServiceTimeOver = (() => {
    const serviceDate = new Date(request.date)
    const endTime = new Date(serviceDate.getTime() + request.duration * 60 * 1000)
    return new Date() > endTime
  })()

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
        if (isAjussi) {
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
        if (isServiceTimeOver) {
          buttons.push(
            <Button
              key="complete"
              size="sm"
              onClick={(e) => openConfirmModal('COMPLETED', e)}
            >
              완료하기
            </Button>
          )
        } else {
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
        if (isClient && request.ajussi_profiles?.open_chat_url) {
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
        break

      case 'COMPLETED':
        // 클라이언트만 리뷰 작성 가능
        if (isClient && !hasReviewed) {
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
          message: '이 서비스 요청을 취소하시겠습니까?',
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
            <StatusBadge status={request.status} />
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
                (20,000원 / 첫 1시간)
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