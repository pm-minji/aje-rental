'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

interface ReviewModalProps {
    isOpen: boolean
    onClose: () => void
    requestId: string
    ajussiName: string
    onSuccess?: () => void
}

export function ReviewModal({
    isOpen,
    onClose,
    requestId,
    ajussiName,
    onSuccess,
}: ReviewModalProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const { success, error: showError } = useToast()

    const handleSubmit = async () => {
        if (rating === 0) {
            showError('오류', '별점을 선택해주세요.')
            return
        }

        try {
            setLoading(true)
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId,
                    rating,
                    comment: comment.trim() || null,
                }),
            })

            const result = await response.json()

            if (result.success) {
                success('리뷰 작성 완료', '소중한 리뷰 감사합니다!')
                handleClose()
                onSuccess?.()
            } else {
                showError('오류', result.error || '리뷰 작성에 실패했습니다.')
            }
        } catch (err) {
            showError('오류', '리뷰 작성 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading) {
            setRating(0)
            setHoveredRating(0)
            setComment('')
            onClose()
        }
    }

    const displayRating = hoveredRating || rating

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="리뷰 작성"
            size="md"
            closeOnOverlayClick={!loading}
        >
            <ModalBody>
                <div className="space-y-6">
                    {/* 아저씨 정보 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">서비스 제공자</p>
                        <p className="font-medium text-gray-900">{ajussiName}</p>
                    </div>

                    {/* 별점 선택 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            별점을 선택해주세요
                        </label>
                        <div className="flex items-center justify-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={cn(
                                            'h-10 w-10 transition-colors',
                                            star <= displayRating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300 hover:text-yellow-300'
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-2">
                            {displayRating > 0
                                ? ['', '별로예요', '그저 그래요', '괜찮아요', '좋아요', '최고예요'][displayRating]
                                : '별을 클릭해주세요'}
                        </p>
                    </div>

                    {/* 코멘트 입력 */}
                    <div>
                        <Textarea
                            label="후기 (선택사항)"
                            placeholder="서비스에 대한 솔직한 후기를 남겨주세요."
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                            {comment.length}/500
                        </p>
                    </div>
                </div>
            </ModalBody>

            <ModalFooter>
                <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                >
                    취소
                </Button>
                <Button
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={loading || rating === 0}
                >
                    {loading ? '작성 중...' : '리뷰 작성'}
                </Button>
            </ModalFooter>
        </Modal>
    )
}
