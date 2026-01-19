'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/providers/AuthProvider'
import { AjussiApplication } from '@/types/database'
import { CheckCircle2, ChevronRight, AlertCircle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface ApplicationForm {
  // Step 1: Basic Info
  real_name: string
  birth_date: string // YYYY-MM-DD
  phone_number: string

  // Step 2: Career & Tags
  career_history: string
  // specialties handled by local state

  // Step 3: Service & Location
  title: string // Nickname
  description: string
  available_areas: string[] // Handled by local state
  open_chat_url: string

  // Consents
  consent_terms: boolean
  consent_privacy: boolean
  consent_settlement: boolean
  consent_chat_policy: boolean
  consent_safety: boolean
}

export default function AjussiApplicationPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [existingApplication, setExistingApplication] = useState<AjussiApplication | null>(null)

  // Custom states for data not easily handled by simple inputs
  const [specialties, setSpecialties] = useState<string[]>([])
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])

  const router = useRouter()
  const { success, error } = useToast()
  const { isAjussi, user } = useAuth()

  const { register, handleSubmit, watch, formState: { errors, isValid }, setValue, trigger } = useForm<ApplicationForm>({
    mode: 'onChange'
  })

  // Watch fields for validation
  const birthDate = watch('birth_date')

  useEffect(() => {
    if (isAjussi) {
      router.push('/mypage/ajussi')
      return
    }
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

        if (app.status === 'REJECTED') {
          // Prefill logic
          setValue('title', app.title)
          setValue('description', app.description)
          setValue('open_chat_url', app.open_chat_url)
          setValue('real_name', app.real_name || '')
          setValue('birth_date', app.birth_date || '')
          setValue('phone_number', app.phone_number || '')
          setValue('career_history', app.career_history || '')

          if (app.specialties) setSpecialties(app.specialties)
          if (app.tags) setSpecialties(app.tags) // Fallback for old data
          if (app.available_areas) setSelectedAreas(app.available_areas)
        }
      }
    } catch (err) {
      console.error('Error fetching existing application:', err)
    } finally {
      setPageLoading(false)
    }
  }

  // Calculate age
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const userAge = calculateAge(birthDate)
  const isAgeValid = userAge >= 34

  // Tag Handlers
  const handleAddSpecialty = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return

    if (e.key === 'Enter') {
      e.preventDefault()
      if (specialtyInput.trim()) {
        if (!specialties.includes(specialtyInput.trim())) {
          setSpecialties([...specialties, specialtyInput.trim()])
        }
        setSpecialtyInput('')
      }
    }
  }

  const removeSpecialty = (tag: string) => {
    setSpecialties(specialties.filter(t => t !== tag))
  }

  // Location Handlers
  const toggleArea = (area: string) => {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    )
  }

  // Navigation
  const nextStep = async () => {
    let valid = false
    if (step === 1) {
      valid = await trigger(['real_name', 'birth_date', 'phone_number'])
      if (valid && !isAgeValid) {
        error('연령 제한', '만 34세 이상만 신청 가능합니다.')
        return
      }
    } else if (step === 2) {
      valid = await trigger(['career_history'])
      if (valid && specialties.length === 0) {
        error('입력 확인', '전문 분야 태그를 최소 1개 이상 입력해주세요.')
        return
      }
    }

    if (valid) setStep(prev => prev + 1)
  }

  const prevStep = () => setStep(prev => prev - 1)

  const onSubmit = async (data: ApplicationForm) => {
    if (selectedAreas.length === 0) {
      error('입력 오류', '활동 지역을 최소 1개 이상 선택해주세요.')
      return
    }

    if (!data.consent_terms || !data.consent_privacy || !data.consent_settlement || !data.consent_chat_policy || !data.consent_safety) {
      error('동의 필요', '모든 필수 항목에 동의해야 신청 가능합니다.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ajussi-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          hourly_rate: 20000, // Fixed first hour rate
          available_areas: selectedAreas,
          tags: specialties, // Mapping specialties to tags
          specialties: specialties,
        }),
      })

      const result = await response.json()
      if (result.success) {
        success('신청 완료', '검토 후 곧 연락드리겠습니다.')
        router.push('/mypage/become-ajussi')
      } else {
        error('신청 실패', result.error)
      }
    } catch (err) {
      error('오류 발생', '서버와 통신 중 오류가 발생했습니다.')
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

  return (
    <>
      <PageHeader
        title="아저씨 등록 신청"
        description="당신의 경험이 누군가에게는 큰 힘이 됩니다"
        breadcrumbs={[
          { label: '마이페이지', href: '/mypage' },
          { label: '아저씨 되기', href: '/mypage/become-ajussi' },
          { label: '신청서 작성' }
        ]}
      />

      <Container className="py-8 max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className={`text-sm font-medium ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>1. 본인 확인</span>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>2. 전문성</span>
            <span className={`text-sm font-medium ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>3. 활동 설정</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Service Flow Guide */}
        {step === 1 && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardBody>
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                아저씨 활동 프로세스 안내
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-2xl mb-1">📝</div>
                  <div className="font-semibold text-blue-900 text-sm">신청서 제출</div>
                </div>
                <div className="flex items-center justify-center md:hidden">↓</div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-2xl mb-1">📞</div>
                  <div className="font-semibold text-blue-900 text-sm">전화 인터뷰</div>
                  <div className="text-xs text-blue-600">관리자 검증</div>
                </div>
                <div className="flex items-center justify-center md:hidden">↓</div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-2xl mb-1">💬</div>
                  <div className="font-semibold text-blue-900 text-sm">오픈채팅 협의</div>
                  <div className="text-xs text-blue-600">고객 문의 응대</div>
                </div>
                <div className="flex items-center justify-center md:hidden">↓</div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-2xl mb-1">🤝</div>
                  <div className="font-semibold text-blue-900 text-sm">의뢰 확정</div>
                  <div className="text-xs text-blue-600">매칭 및 결제</div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardBody className="p-6 md:p-8">

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                    기본 정보 및 본인 확인
                  </h2>

                  <div>
                    <label className="block text-sm font-medium mb-1">실명 (본인 확인용) *</label>
                    <Input {...register('real_name', { required: '실명을 입력해주세요' })} placeholder="홍길동" />
                    {errors.real_name && <p className="text-red-500 text-sm mt-1">{errors.real_name.message}</p>}
                    <p className="text-xs text-gray-500 mt-1">실명은 관리자 확인 용도로만 사용되며, 대외적으로 공개되지 않습니다.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">생년월일 *</label>
                      <Input
                        type="date"
                        {...register('birth_date', { required: '생년월일을 입력해주세요' })}
                      />
                      {birthDate && (
                        <div className={`text-sm mt-1 flex items-center ${isAgeValid ? 'text-green-600' : 'text-red-500'}`}>
                          {isAgeValid ? (
                            <><CheckCircle2 className="w-4 h-4 mr-1" /> 만 {userAge}세 (신청 가능)</>
                          ) : (
                            <><AlertCircle className="w-4 h-4 mr-1" /> 만 {userAge}세 (만 34세 이상만 가능)</>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">휴대폰 번호 *</label>
                      <Input {...register('phone_number', { required: '연락처를 입력해주세요' })} placeholder="010-1234-5678" />
                      {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Specialist Info */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                    경력 및 전문성
                  </h2>

                  <div>
                    <label className="block text-sm font-medium mb-1">주요 경력 및 소개 *</label>
                    <textarea
                      {...register('career_history', { required: '경력 및 소개를 입력해주세요' })}
                      className="w-full min-h-[150px] p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={`예시:\n- OO전자 개발팀 15년 근무\n- 취미로 목공 및 인테리어 5년\n- 두 자녀 입시 지도 경험`}
                    />
                    {errors.career_history && <p className="text-red-500 text-sm mt-1">{errors.career_history.message}</p>}
                    <p className="text-xs text-gray-500 mt-1">이 내용은 인터뷰 시 참고자료로 활용됩니다.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">자신을 나타내는 태그 (전문 분야) *</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={specialtyInput}
                        onChange={(e) => setSpecialtyInput(e.target.value)}
                        onKeyDown={handleAddSpecialty}
                        placeholder="태그 입력 후 Enter (예: #고민상담, #낚시, #코딩)"
                      />
                      <Button type="button" onClick={() => {
                        if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
                          setSpecialties([...specialties, specialtyInput.trim()])
                          setSpecialtyInput('')
                        }
                      }}>추가</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {specialties.map(tag => (
                        <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-1">
                          #{tag.replace(/^#/, '')}
                          <button type="button" onClick={() => removeSpecialty(tag)} className="hover:text-red-500 ml-1">×</button>
                        </Badge>
                      ))}
                    </div>
                    {specialties.length === 0 && <p className="text-red-500 text-sm mt-1">태그를 최소 1개 이상 입력해주세요.</p>}
                  </div>
                </div>
              )}

              {/* Step 3: Activity & Policy */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center">
                    <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                    활동 설정 및 동의
                  </h2>

                  <div>
                    <label className="block text-sm font-medium mb-1">아저씨 닉네임 *</label>
                    <div className="flex items-center">
                      <Input {...register('title', { required: '닉네임을 입력해주세요' })} placeholder="낚시왕" className="rounded-r-none border-r-0" />
                      <div className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r-md text-gray-600">
                        아저씨
                      </div>
                    </div>
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                    <p className="text-xs text-gray-500 mt-1">서비스에는 "{watch('title') || 'OOO'} 아저씨"로 표시됩니다.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">아저씨 설명 (한줄 소개) *</label>
                    <Input {...register('description', { required: '한줄 소개를 입력해주세요' })} placeholder="따뜻한 조언과 맛집 투어를 함께해요" />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">오픈채팅방 주소 *</label>
                    <Input {...register('open_chat_url', {
                      required: '오픈채팅 주소를 입력해주세요',
                      pattern: {
                        value: /^https:\/\/open\.kakao\.com\/.+/,
                        message: '올바른 카카오톡 오픈채팅 주소를 입력해주세요'
                      }
                    })} placeholder="https://open.kakao.com/o/..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">활동 가능 지역 *</label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAreas.includes('Online')}
                          onChange={() => toggleArea('Online')}
                          className="mr-3 h-5 w-5 text-primary"
                        />
                        <div>
                          <span className="font-medium">온라인 상담</span>
                          <p className="text-xs text-gray-500">전화, 화상채팅, 메신저 등</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAreas.includes('Seoul')}
                          onChange={() => toggleArea('Seoul')}
                          className="mr-3 h-5 w-5 text-primary"
                        />
                        <div>
                          <span className="font-medium">오프라인 만남 (서울)</span>
                          <p className="text-xs text-gray-500">현재 오프라인 활동은 서울 지역만 지원합니다.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 space-y-2">
                    <h4 className="font-bold mb-2">💰 요금 및 정산 정책</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>첫 1시간 (매칭)</strong>: 고객 결제 20,000원 → 플랫폼 수수료 1만원 공제 후 <strong>10,000원 정산</strong></li>
                      <li><strong>시간 연장</strong>: 시간당 10,000원 (현장에서 고객과 직접 협의/정산, 플랫폼 수수료 0원)</li>
                      <li><strong>인원 추가</strong>: 1명 추가 시마다 시간당 요금 100% 가산</li>
                    </ul>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-bold">필수 동의 항목</h4>
                    {[
                      { key: 'consent_terms', label: '서비스 이용약관 동의 (필수)' },
                      { key: 'consent_privacy', label: '개인정보 수집 및 이용 동의 (필수)' },
                      { key: 'consent_settlement', label: '위 정산 및 수수료 정책을 확인하였으며 이에 동의합니다 (필수)' },
                      { key: 'consent_chat_policy', label: '오픈채팅 응대 및 외부 거래 정책에 동의합니다 (필수)' },
                      { key: 'consent_safety', label: '안전 수칙 및 매너 서약을 준수하겠습니다 (필수)' },
                    ].map(item => (
                      <label key={item.key} className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          {...register(item.key as any, { required: true })}
                          className="mt-1 mr-2 h-4 w-4 text-primary"
                        />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between mt-8">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    이전 단계
                  </Button>
                ) : (
                  <div></div> // Spacer
                )}

                {step < 3 ? (
                  <Button type="button" onClick={nextStep} disabled={step === 1 && !isAgeValid}>
                    다음 단계 <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                ) : (
                  <Button type="submit" loading={loading} disabled={!isValid || selectedAreas.length === 0}>
                    신청서 제출
                  </Button>
                )}
              </div>

            </CardBody>
          </Card>
        </form>
      </Container>
    </>
  )
}