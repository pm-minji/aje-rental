'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/providers/AuthProvider'
import { AjussiApplication } from '@/types/database'

interface ApplicationForm {
  title: string
  description: string
  hourly_rate: number
  available_areas: string[]
  open_chat_url: string
  tags: string[]
}

const AREAS = [
  '강남구', '서초구', '송파구', '강동구', '마포구', '용산구', '중구', '종로구',
  '성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구', '도봉구', '노원구',
  '은평구', '서대문구', '양천구', '강서구', '구로구', '금천구', '영등포구', '동작구', '관악구'
]

const TAGS = [
  '산책', '운동', '건강관리', '대화', '조언', '멘토링', '요리', '생활팁', 
  '독서', '철학', '문학', '여행', '맛집', '문화', 'IT', '프로그래밍', '컴퓨터'
]

export default function AjussiApplicationPage() {
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [existingApplication, setExistingApplication] = useState<AjussiApplication | null>(null)
  const router = useRouter()
  const { success, error } = useToast()
  const { isAjussi } = useAuth()
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ApplicationForm>()

  useEffect(() => {
    // 이미 아저씨인 경우 리다이렉트
    if (isAjussi) {
      router.push('/mypage/ajussi')
      return
    }
    
    // 기존 신청 내역 불러오기 (재신청용)
    fetchExistingApplication()
  }, [isAjussi])

  const fetchExistingApplication = async () => {
    try {
      setPageLoading(true)
      const response = await fetch('/api/ajussi/application')
      const result = await response.json()

      if (result.success && result.data) {
        const app = result.data
        setExistingApplication(app)
        
        // 폼에 기존 데이터 채우기 (거절된 경우만)
        if (app.status === 'REJECTED') {
          setValue('title', app.title)
          setValue('description', app.description)
          setValue('hourly_rate', app.hourly_rate)
          setValue('open_chat_url', app.open_chat_url)
          setSelectedAreas(app.available_areas)
          setSelectedTags(app.tags)
        }
      }
    } catch (err) {
      console.error('Error fetching existing application:', err)
      // 기존 신청이 없는 경우는 정상적인 상황이므로 에러 표시하지 않음
    } finally {
      setPageLoading(false)
    }
  }

  const handleAreaToggle = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    )
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const onSubmit = async (data: ApplicationForm) => {
    if (selectedAreas.length === 0) {
      error('입력 오류', '활동 가능 지역을 최소 1개 이상 선택해주세요.')
      return
    }

    if (selectedTags.length === 0) {
      error('입력 오류', '서비스 태그를 최소 1개 이상 선택해주세요.')
      return
    }

    // 이미 대기 중인 신청이 있는지 확인
    if (existingApplication && existingApplication.status === 'PENDING') {
      error('신청 불가', '이미 검토 중인 신청이 있습니다.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/ajussi-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          available_areas: selectedAreas,
          tags: selectedTags,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const isReapplication = existingApplication && existingApplication.status === 'REJECTED'
        success(
          '신청 완료', 
          isReapplication 
            ? '재신청이 완료되었습니다. 검토 후 연락드리겠습니다.'
            : '아저씨 신청이 완료되었습니다. 검토 후 연락드리겠습니다.'
        )
        router.push('/mypage/become-ajussi')
      } else {
        error('신청 실패', result.error || '신청 처리 중 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('Error submitting application:', err)
      error('신청 실패', '신청 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <Container className="py-16">
        <Loading size="lg" text="페이지를 불러오는 중..." />
      </Container>
    )
  }

  const isReapplication = existingApplication && existingApplication.status === 'REJECTED'

  return (
    <>
      <PageHeader
        title={isReapplication ? "아저씨 재신청" : "아저씨 신청"}
        description={
          isReapplication 
            ? "거절 사유를 참고하여 내용을 수정한 후 다시 신청해주세요"
            : "아저씨로 활동하기 위한 신청서를 작성해주세요"
        }
        breadcrumbs={[
          { label: '마이페이지', href: '/mypage' },
          { label: '아저씨 되기', href: '/mypage/become-ajussi' },
          { label: isReapplication ? '재신청' : '신청' }
        ]}
      />

      <Container className="py-8">
        <div className="max-w-2xl mx-auto">
          {/* 재신청 안내 */}
          {isReapplication && existingApplication && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardHeader>
                <h3 className="text-lg font-semibold text-orange-800">재신청 안내</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-orange-700 text-sm">
                    이전 신청이 거절되었습니다. 아래 사유를 참고하여 내용을 수정해주세요.
                  </p>
                  {existingApplication.admin_notes && (
                    <div className="bg-white border border-orange-200 rounded p-3">
                      <h4 className="font-medium text-orange-800 mb-1">거절 사유</h4>
                      <p className="text-sm text-orange-700">{existingApplication.admin_notes}</p>
                    </div>
                  )}
                  <p className="text-orange-700 text-sm">
                    폼에 이전 신청 내용이 자동으로 채워져 있습니다. 필요한 부분을 수정한 후 다시 제출해주세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                {isReapplication ? "아저씨 재신청서" : "아저씨 신청서"}
              </h2>
              <p className="text-gray-600">
                신청서 검토 후 승인되면 아저씨로 활동할 수 있습니다.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    서비스 제목 *
                  </label>
                  <Input
                    {...register('title', { required: '서비스 제목을 입력해주세요' })}
                    placeholder="예: 인생 선배의 따뜻한 조언"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    서비스 설명 *
                  </label>
                  <textarea
                    {...register('description', { required: '서비스 설명을 입력해주세요' })}
                    rows={4}
                    placeholder="제공할 수 있는 서비스에 대해 자세히 설명해주세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시간당 요금 (원) *
                  </label>
                  <Input
                    type="number"
                    {...register('hourly_rate', { 
                      required: '시간당 요금을 입력해주세요',
                      min: { value: 10000, message: '최소 10,000원 이상 입력해주세요' }
                    })}
                    placeholder="15000"
                  />
                  {errors.hourly_rate && (
                    <p className="text-red-500 text-sm mt-1">{errors.hourly_rate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    오픈채팅 URL *
                  </label>
                  <Input
                    {...register('open_chat_url', { required: '오픈채팅 URL을 입력해주세요' })}
                    placeholder="https://open.kakao.com/o/..."
                  />
                  {errors.open_chat_url && (
                    <p className="text-red-500 text-sm mt-1">{errors.open_chat_url.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    활동 가능 지역 * (최소 1개)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {AREAS.map((area) => {
                      const isSelected = selectedAreas.includes(area)
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => handleAreaToggle(area)}
                          className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                            isSelected
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {area}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    서비스 태그 * (최소 1개)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            isSelected
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full"
                  >
                    {isReapplication ? "재신청서 제출" : "신청서 제출"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  )
}