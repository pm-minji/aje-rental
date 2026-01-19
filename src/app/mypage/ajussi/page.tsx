'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Form, FormField, FormActions } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/components/providers/AuthProvider'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

const ajussiProfileSchema = z.object({
  title: z.string().min(5, '제목은 5자 이상이어야 합니다').max(50, '제목은 50자 이하여야 합니다'),
  description: z.string().min(20, '설명은 20자 이상이어야 합니다').max(500, '설명은 500자 이하여야 합니다'),
  hourly_rate: z.number().min(20000, '요금은 20,000원이어야 합니다').max(20000, '요금은 20,000원이어야 합니다'),
  available_areas: z.array(z.string()).min(1, '최소 1개 지역을 선택해주세요'),
  open_chat_url: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
  is_active: z.boolean(),
  tags: z.array(z.string()).max(10, '최대 10개까지 선택 가능합니다'),
})

type AjussiProfileFormData = z.infer<typeof ajussiProfileSchema>

const LOCATIONS = [
  'Seoul', 'Online'
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
            <CardBody>
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
                        min="20000"
                        max="20000"
                        value={20000}
                        readOnly
                        className="bg-gray-100"
                        helperText="첫 만남 1시간 비용은 20,000원으로 고정됩니다. (수수료 50% 공제 후 10,000원 정산)"
                        {...form.register('hourly_rate', { valueAsNumber: true })}
                      />
                    </FormField>
                    <FormField>
                      <Input
                        label="오픈채팅 URL"
                        placeholder="https://open.kakao.com/..."
                        {...form.register('open_chat_url')}
                      />
                      <details className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-md">
                        <summary className="p-3 cursor-pointer font-medium hover:text-primary list-none flex items-center">
                          <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs">?</span>
                          오픈채팅방이 왜 필요한가요? / 만드는 방법
                        </summary>
                        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                          <div>
                            <p className="font-semibold text-gray-800 mb-1">💡 왜 필요한가요?</p>
                            <p>
                              아저씨렌탈은 개인 연락처 노출 없이 안전하게 소통하기 위해 카카오톡 오픈채팅을 사용합니다.
                              고객과의 상담 및 일정 조율이 이 링크를 통해 이루어집니다.
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 mb-1">🛠 만드는 방법</p>
                            <ol className="list-decimal pl-5 space-y-1">
                              <li>카카오톡 앱 실행 → '채팅' 탭 → 우측 상단 말풍선(+) 아이콘 터치</li>
                              <li><strong>[오픈채팅]</strong> 선택 → <strong>[오픈프로필]</strong> 탭 선택 → <strong>[+ 만들기]</strong></li>
                              <li>프로필 이름(예: OOO 아저씨) 설정 후 '완료'</li>
                              <li>생성된 프로필의 <strong>[링크 공유]</strong> 버튼을 눌러 주소를 복사하여 위 칸에 붙여넣기</li>
                            </ol>
                          </div>
                        </div>
                      </details>
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
                        // Mapping for display
                        const displayArea = area === 'Seoul' ? '서울 (오프라인)' : (area === 'Online' ? '온라인' : area);

                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => handleAreaToggle(area)}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${isSelected
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
                              }`}
                          >
                            {displayArea}
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
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="태그 입력 후 Enter (예: #고민상담, #낚시, #코딩)"
                        onKeyDown={(e) => {
                          if (e.nativeEvent.isComposing) return
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const val = e.currentTarget.value.trim()
                            if (val) {
                              handleTagToggle(val) //Reuse logic to add
                              e.currentTarget.value = ''
                            }
                          }
                        }}
                      />
                      <Button type="button" onClick={() => {
                        // Logic handled by input
                      }}>추가</Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.watch('tags')?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-1">
                          #{tag.replace(/^#/, '')}
                          <button type="button" onClick={() => handleTagToggle(tag)} className="hover:text-red-500 ml-1">×</button>
                        </Badge>
                      ))}
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
            </CardBody>
          </Card>
        </div>
      </Container>
    </>
  )
}