'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Form, FormField, FormGroup, FormActions } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/providers/AuthProvider'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

const profileSchema = z.object({
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다').max(20, '닉네임은 20자 이하여야 합니다'),
  introduction: z.string().max(200, '자기소개는 200자 이하여야 합니다').optional(),
})

const ajussiProfileSchema = z.object({
  title: z.string().min(5, '제목은 5자 이상이어야 합니다').max(50, '제목은 50자 이하여야 합니다'),
  description: z.string().min(20, '설명은 20자 이상이어야 합니다').max(500, '설명은 500자 이하여야 합니다'),
  hourly_rate: z.number().min(5000, '최소 5,000원 이상이어야 합니다').max(100000, '최대 100,000원 이하여야 합니다'),
  available_areas: z.array(z.string()).min(1, '최소 1개 지역을 선택해주세요'),
  open_chat_url: z.string().url('올바른 URL을 입력해주세요').optional().or(z.literal('')),
  is_active: z.boolean(),
  tags: z.array(z.string()).max(10, '최대 10개까지 선택 가능합니다'),
})

type ProfileFormData = z.infer<typeof profileSchema>
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

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const { profile, isAjussi } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const ajussiForm = useForm<AjussiProfileFormData>({
    resolver: zodResolver(ajussiProfileSchema),
    defaultValues: {
      is_active: true,
      available_areas: [],
      tags: [],
    },
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      const result = await response.json()

      if (result.success) {
        setProfileData(result.data)
        
        // Set form values
        profileForm.reset({
          nickname: result.data.profile.nickname || '',
          introduction: result.data.profile.introduction || '',
        })

        if (result.data.ajussiProfile) {
          ajussiForm.reset({
            title: result.data.ajussiProfile.title || '',
            description: result.data.ajussiProfile.description || '',
            hourly_rate: result.data.ajussiProfile.hourly_rate || 15000,
            available_areas: result.data.ajussiProfile.available_areas || [],
            open_chat_url: result.data.ajussiProfile.open_chat_url || '',
            is_active: result.data.ajussiProfile.is_active ?? true,
            tags: result.data.ajussiProfile.tags || [],
          })
        }
      } else {
        error('오류 발생', '프로필 정보를 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      error('오류 발생', '프로필 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (data: ProfileFormData) => {
    try {
      setSaving(true)
      
      const ajussiData = isAjussi ? ajussiForm.getValues() : null
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: data,
          ajussiProfile: ajussiData,
        }),
      })

      const result = await response.json()
      if (result.success) {
        success('저장 완료', '프로필이 성공적으로 업데이트되었습니다.')
      } else {
        error('저장 실패', result.error || '프로필 저장에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      error('저장 실패', '프로필 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleAreaToggle = (area: string) => {
    const currentAreas = ajussiForm.getValues('available_areas')
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter(a => a !== area)
      : [...currentAreas, area]
    
    ajussiForm.setValue('available_areas', newAreas)
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = ajussiForm.getValues('tags')
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    ajussiForm.setValue('tags', newTags)
  }

  if (loading) {
    return (
      <Container className="py-16">
        <Loading size="lg" text="프로필 정보를 불러오는 중..." />
      </Container>
    )
  }

  return (
    <>
      <PageHeader
        title="프로필 관리"
        description="개인정보 및 서비스 정보를 관리하세요"
        breadcrumbs={[
          { label: '마이페이지', href: '/mypage' },
          { label: '프로필 관리' }
        ]}
      />

      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Basic Profile */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">기본 정보</h2>
            </CardHeader>
            <CardBody>
              <Form onSubmit={profileForm.handleSubmit(handleSaveProfile)}>
                <FormGroup>
                  <FormField>
                    <Input
                      label="이메일"
                      value={profile?.email || ''}
                      disabled
                      helperText="이메일은 변경할 수 없습니다"
                    />
                  </FormField>
                  <FormField>
                    <Input
                      label="이름"
                      value={profile?.name || ''}
                      disabled
                      helperText="이름은 변경할 수 없습니다"
                    />
                  </FormField>
                </FormGroup>

                <FormField>
                  <Input
                    label="닉네임"
                    placeholder="다른 사용자에게 표시될 닉네임을 입력하세요"
                    error={profileForm.formState.errors.nickname?.message}
                    {...profileForm.register('nickname')}
                  />
                </FormField>

                <FormField>
                  <Textarea
                    label="자기소개"
                    placeholder="간단한 자기소개를 작성해주세요"
                    rows={3}
                    error={profileForm.formState.errors.introduction?.message}
                    {...profileForm.register('introduction')}
                  />
                </FormField>

                {!isAjussi && (
                  <FormActions>
                    <Button type="submit" loading={saving}>
                      저장하기
                    </Button>
                  </FormActions>
                )}
              </Form>
            </CardBody>
          </Card>

          {/* Ajussi Profile */}
          {isAjussi && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">아저씨 프로필</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  <FormField>
                    <Input
                      label="서비스 제목"
                      placeholder="예: 건강한 산책과 운동 동행"
                      error={ajussiForm.formState.errors.title?.message}
                      {...ajussiForm.register('title')}
                    />
                  </FormField>

                  <FormField>
                    <Textarea
                      label="서비스 설명"
                      placeholder="제공하는 서비스에 대해 자세히 설명해주세요"
                      rows={4}
                      error={ajussiForm.formState.errors.description?.message}
                      {...ajussiForm.register('description')}
                    />
                  </FormField>

                  <FormGroup>
                    <FormField>
                      <Input
                        label="시간당 요금 (원)"
                        type="number"
                        min="5000"
                        max="100000"
                        step="1000"
                        error={ajussiForm.formState.errors.hourly_rate?.message}
                        {...ajussiForm.register('hourly_rate', { valueAsNumber: true })}
                      />
                    </FormField>
                    <FormField>
                      <Input
                        label="오픈채팅 URL"
                        placeholder="https://open.kakao.com/..."
                        error={ajussiForm.formState.errors.open_chat_url?.message}
                        {...ajussiForm.register('open_chat_url')}
                      />
                    </FormField>
                  </FormGroup>

                  <FormField>
                    <Checkbox
                      label="활동 상태 (체크하면 다른 사용자에게 노출됩니다)"
                      {...ajussiForm.register('is_active')}
                    />
                  </FormField>

                  {/* Available Areas */}
                  <FormField>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      활동 가능 지역
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {LOCATIONS.map((area) => {
                        const isSelected = ajussiForm.watch('available_areas')?.includes(area)
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
                    {ajussiForm.formState.errors.available_areas && (
                      <p className="text-sm text-red-600 mt-1">
                        {ajussiForm.formState.errors.available_areas.message}
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
                        const isSelected = ajussiForm.watch('tags')?.includes(tag)
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
                    {ajussiForm.formState.errors.tags && (
                      <p className="text-sm text-red-600 mt-1">
                        {ajussiForm.formState.errors.tags.message}
                      </p>
                    )}
                  </FormField>

                  <FormActions>
                    <Button 
                      type="button"
                      onClick={profileForm.handleSubmit(handleSaveProfile)}
                      loading={saving}
                    >
                      저장하기
                    </Button>
                  </FormActions>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </Container>
    </>
  )
}