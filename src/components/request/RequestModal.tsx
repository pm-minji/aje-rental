'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, Clock, MapPin, FileText } from 'lucide-react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Form, FormField, FormActions } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils'

const requestSchema = z.object({
  date: z.string().min(1, '날짜를 선택해주세요'),
  time: z.string().min(1, '시간을 선택해주세요'),
  duration: z.number().min(30, '최소 30분 이상 선택해주세요').max(480, '최대 8시간까지 가능합니다'),
  location: z.string().min(1, '만날 장소를 입력해주세요'),
  description: z.string().min(10, '최소 10자 이상 입력해주세요').max(500, '최대 500자까지 입력 가능합니다'),
})

type RequestFormData = z.infer<typeof requestSchema>

interface RequestModalProps {
  isOpen: boolean
  onClose: () => void
  ajussiId: string
  ajussiName: string
  hourlyRate: number
  onSubmit: (data: RequestFormData) => Promise<void>
}

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return { value: `${hour}:00`, label: `${hour}:00` }
})

const DURATION_OPTIONS = [
  { value: '30', label: '30분' },
  { value: '60', label: '1시간' },
  { value: '90', label: '1시간 30분' },
  { value: '120', label: '2시간' },
  { value: '180', label: '3시간' },
  { value: '240', label: '4시간' },
  { value: '300', label: '5시간' },
  { value: '360', label: '6시간' },
  { value: '420', label: '7시간' },
  { value: '480', label: '8시간' },
]

export function RequestModal({
  isOpen,
  onClose,
  ajussiId,
  ajussiName,
  hourlyRate,
  onSubmit,
}: RequestModalProps) {
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      duration: 60,
    },
  })

  const watchedDuration = watch('duration')
  const estimatedCost = watchedDuration ? (watchedDuration / 60) * hourlyRate : 0

  const handleFormSubmit = async (data: RequestFormData) => {
    try {
      setLoading(true)
      await onSubmit(data)
      success('요청 완료', '서비스 요청이 성공적으로 전송되었습니다.')
      reset()
      onClose()
    } catch (err) {
      error('요청 실패', '서비스 요청 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      reset()
      onClose()
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="서비스 요청하기"
      size="lg"
      closeOnOverlayClick={!loading}
    >
      <Form onSubmit={handleSubmit(handleFormSubmit)}>
        <ModalBody>
          <div className="space-y-6">
            {/* Ajussi Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">요청 대상</h3>
              <p className="text-gray-700">{ajussiName}</p>
              <p className="text-sm text-gray-600">
                시간당 {formatCurrency(hourlyRate)}
              </p>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField>
                <Input
                  label="날짜"
                  type="date"
                  min={today}
                  error={errors.date?.message}
                  {...register('date')}
                />
              </FormField>

              <FormField>
                <Select
                  label="시간"
                  placeholder="시간을 선택하세요"
                  options={TIME_OPTIONS}
                  error={errors.time?.message}
                  {...register('time')}
                />
              </FormField>
            </div>

            {/* Duration */}
            <FormField>
              <Select
                label="예상 소요 시간"
                options={DURATION_OPTIONS}
                error={errors.duration?.message}
                {...register('duration', { valueAsNumber: true })}
              />
              <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">기본 요금 (첫 1시간)</span>
                  <span className="font-semibold text-primary">20,000원</span>
                </div>
                <div className="flex justify-between items-center text-gray-500 text-xs">
                  <span>추가 시간</span>
                  <span>시간당 10,000원 (현장 정산)</span>
                </div>
              </div>
            </FormField>

            {/* Location */}
            <FormField>
              <Input
                label="만날 장소"
                placeholder="예: 강남역 2번 출구, 올림픽공원 정문 등"
                error={errors.location?.message}
                {...register('location')}
              />
            </FormField>

            {/* Description */}
            <FormField>
              <Textarea
                label="요청 내용"
                placeholder="어떤 활동을 함께 하고 싶으신지, 특별한 요청사항이 있으시면 자세히 적어주세요."
                rows={4}
                error={errors.description?.message}
                {...register('description')}
              />
            </FormField>

            {/* Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                📋 요청 전 확인사항
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 요청 후 아저씨의 수락을 기다려주세요</li>
                <li>• 기본 1시간 요금(20,000원)은 선결제됩니다</li>
                <li>
                  • 취소 및 환불 기준은{' '}
                  <Link href="/refund-policy" className="font-medium underline underline-offset-2">
                    취소/환불정책
                  </Link>
                  을 따릅니다
                </li>
                <li>• 이동, 식사, 체험 비용 등은 의뢰인이 부담합니다</li>
                <li>• 공개된 장소에서 만나시기를 권장합니다</li>
                <li>• 서비스 이용 후 리뷰를 남겨주세요</li>
              </ul>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <FormActions>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {loading ? '요청 중...' : '요청하기'}
            </Button>
          </FormActions>
        </ModalFooter>
      </Form>
    </Modal>
  )
}
