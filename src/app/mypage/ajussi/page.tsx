'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Form, FormField, FormActions } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/providers/AuthProvider'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

const ajussiProfileSchema = z.object({
  title: z.string().min(5, '제목은 5자 이상이어야 합니다').max(50, '제목은 50자 이하여야 합니다'),
  description: z.string().min(20, '설명은 20자 이상이어야 합니다').max(500, '설명은 500자 이하여야 합니다'),
  hourly_rate: z.number().min(5000, '최소 5,000원 이상이어야 합니다').max(100000, '최대 100,000원 이하여야 합니다'),
  available_areas: z.array(z.string()).min(1, '최소 1개 지역을 선택해주세요'),
  open_chat_url: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
  is_active: z.boolean(),
  tags: z.array(z.string()).max(10, '최대 10개까지 선택 가능합니다'),
})

type AjussiProfileFormData = z.infer<typeof ajussiProfileSchema>

const LOCATIONS = [
  '강남구', '서초구', '송파구', '마포구', '용산구', '중구', '영등포구',
  '종로구', '성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구',
  '도봉구', '노원구', '은평구', '서대문구', '양천구', '강서구', '구로구',
  '금천구', '관악구', '동작구', '강동구'
]

const TAGS = [
  '산책', '대화', '조언', '멘토링', '운동', '건강관리',
  '취업상담', '직장생활', '인생상담', '카페', '공원',
  '문화생활', '독서', '음악', '영화', '요리', '여행',
  '언어교환', '컴퓨터', '스마트폰', '투자', '부동산'
]

export default function AjussiProfilePage() {
  return (
    <ProtectedRoute>
      <AjussiProfileContent />
    </ProtectedRoute>
  )
}

function AjussiProfileContent() {
  const { isAjussi } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const form = useForm<AjussiProfileFormData>({
    resolver: zodResolver(ajussiProfileSchema),
    defaultValues: {
      is_active: true,
      available_areas: [],
      tags: [],
    },
  })

  useEffect(() => {
    if (!isAjussi) {
      error('접근 권한 없음', '아저씨만 접근할 수 있는 페이지입니다.')
      return
    }
    fetchAjussiProfile()
  }, [isAjussi])

  const fetchAjussiProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      const result = await response.json()

      if (result.success && result.data.ajussiProfile) {
        form.reset({
          title: result.data.ajussiProfile.title || '',
          description: result.data.ajussiProfile.description || '',
          hourly_rate: result.data.ajussiProfile.hourly_rate || 15000,
          available_areas: result.data.ajussiProfile.available_areas || [],
          open_chat_url: result.data.ajussiProfile.open_chat_url || '',
          is_active: result.data.ajussiProfile.is_active ?? true,
          tags: result.data.ajussiProfile.tags || [],
        })
      }
    } catch (err) {
      console.error('Error fetching ajussi profile:', err)
      error('오류 발생', '아저씨 프로필 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: AjussiProfileFormData) => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ajussiProfile: data,
        }),
      })

      const result = await response.json()
      if (result.success) {
        success('저장 완료', '아저씨 프로필이 성공적으로 업데이트되었습니다.')
      } else {
        error('저장 실패', result.error || '프로필 저장에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error saving ajussi profile:', err)
      error('저장 실패', '프로필 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleAreaToggle = (area: string) => {
    const currentAreas = form.getValues('available_areas')
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter(a => a !== area)
      : [...currentAreas, area]
    
    form.setValue('available_areas', newAreas)
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = form.getValues('tags')
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    form.setValue('tags', newTags)
  }

  if (!isAjussi) {
    return (
      <Container className="py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 권한 없음</h2>
          <p className="text-gray-600">아저씨만 접근할 수 있는 페이지입니다.</p>
        </div>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container className="py-16">
        <Loading size="lg" text="아저씨 프로필 정보를 불러오는 중..." />
      </Container>
    )
  }

  return (
    <>
      <PageHeader
        title="아저씨 프로필 관리"
        description="서비스 정보와 활동 상태를 관리하세요"
        breadcrumbs={[
          { label: '마이페이지', href: '/mypage' },
          { label: '아저씨 프로필' }
        ]}
      />

      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">서비스 정보</h2>
            </CardHeader>
            <CardContent>
              <Form onSubmit={form.handleSubmit(handleSave)}>
                <div className="space-y-6">
                  <FormField>
                    <Input
                      label="서비스 제목"
                      placeholder="예: 건강한 산책과 운동 동행"
                      error={form.formState.errors.title?.message}
                      {...form.register('title')}
                    />
                  </FormField>

                  <FormField>
                    <Textarea
                      label="서비스 설명"
                      placeholder="제공하는 서비스에 대해 자세히 설명해주세요"
                      rows={4}
                      error={form.formState.errors.description?.message}
                      {...form.register('description')}
                    />
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField>
                      <Input
                        label="시간당 요금 (원)"
                        type="number"
                        min="5000"
                        max="100000"
                        step="1000"
                        error={form.formState.errors.hourly_rate?.message}
                        {...form.register('hourly_rate', { valueAsNumber: true })}
                      />
                    </FormField>
                    <FormField>
                      <Input
                        label="오픈채팅 URL"
                        placeholder="https://open.kakao.com/..."
                        error={form.formState.errors.open_chat_url?.message}
                        {...form.register('open_chat_url')}
                      />
                    </FormField>
                  </div>

                  <FormField>
                    <Checkbox
                      label="활동 상태 (체크하면 다른 사용자에게 노출됩니다)"
                      {...form.register('is_active')}
                    />
                  </FormField>

                  {/* Available Areas */}
                  <FormField>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      활동 가능 지역
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {LOCATIONS.map((area) => {
                        const isSelected = form.watch('available_areas')?.includes(area)
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => handleAreaToggle(area)}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                              isSelected
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                            }`}
                          >
                            {area}
                          </button>
                        )
                      })}
                    </div>
                    {form.formState.errors.available_areas && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.available_areas.message}
                      </p>
                    )}
                  </FormField>

                  {/* Tags */}
                  <FormField>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      서비스 태그
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map((tag) => {
                        const isSelected = form.watch('tags')?.includes(tag)
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                              isSelected
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                            }`}
                          >
                            {tag}
                          </button>
                        )
                      })}
                    </div>
                    {form.formState.errors.tags && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.tags.message}
                      </p>
                    )}
                  </FormField>

                  <FormActions>
                    <Button type="submit" loading={saving}>
                      저장하기
                    </Button>
                  </FormActions>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  )
}