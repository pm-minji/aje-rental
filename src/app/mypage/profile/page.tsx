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
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/ui/ImageUpload'

const profileSchema = z.object({
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다').max(20, '닉네임은 20자 이하여야 합니다'),
  introduction: z.string().max(200, '자기소개는 200자 이하여야 합니다').optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const { profile, deleteAccount } = useAuth()
  const { success, error } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
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

        // Set profile image
        setProfileImage(result.data.profile.profile_image || null)
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
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            ...data,
            profile_image: profileImage,
          },
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



  const handleDeleteAccount = async () => {
    if (!confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    if (!confirm('모든 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?')) {
      return
    }

    try {
      setDeleting(true)
      await deleteAccount()
      
      // Show success message
      success('계정 삭제 완료', '계정이 성공적으로 삭제되었습니다.')
      
      // AuthProvider will handle the page reload
      
    } catch (err) {
      console.error('Error deleting account:', err)
      error('삭제 실패', '계정 삭제 중 오류가 발생했습니다.')
      setDeleting(false) // Only reset loading state on error
    }
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
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    프로필 이미지
                  </label>
                  <ImageUpload
                    currentImage={profileImage}
                    onImageChange={setProfileImage}
                    size="xl"
                  />
                </FormField>

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

                <FormActions>
                  <Button type="submit" loading={saving}>
                    저장하기
                  </Button>
                </FormActions>
              </Form>
            </CardBody>
          </Card>



          {/* Account Management */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-red-600">계정 관리</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-medium text-red-800 mb-2">계정 삭제</h3>
                  <p className="text-sm text-red-600 mb-4">
                    계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                    삭제되는 데이터: 프로필 정보, 리뷰, 즐겨찾기, 요청 내역 등
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    loading={deleting}
                  >
                    계정 삭제하기
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </Container>
    </>
  )
}