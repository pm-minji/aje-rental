'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Container } from '@/components/layout/Container'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/ui/Toast'
import { ImageUpload } from '@/components/ui/ImageUpload'

export default function SetupProfilePage() {
  const [nickname, setNickname] = useState('')
  const [introduction, setIntroduction] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateProfile, isAuthenticated } = useAuth()
  const { success, error } = useToast()

  // Check authentication and redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated && user === null) {
      console.log('User not authenticated, redirecting to login')
      router.push('/auth/login')
      return
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nickname.trim()) {
      error('입력 오류', '닉네임을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            nickname: nickname.trim(),
            introduction: introduction.trim() || null,
            profile_image: profileImage,
          }
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Update AuthProvider state immediately
        if (result.data?.profile) {
          await updateProfile({
            nickname: result.data.profile.nickname,
            introduction: result.data.profile.introduction,
          })
        }
        
        success('프로필 설정 완료', '프로필이 성공적으로 설정되었습니다.')
        
        // Wait a bit for the success message to show, then redirect
        setTimeout(() => {
          const redirectTo = searchParams.get('redirect') || '/'
          router.push(redirectTo)
        }, 1500)
      } else {
        error('오류 발생', result.error || '프로필 설정 중 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('Error setting up profile:', err)
      error('오류 발생', '프로필 설정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            프로필 설정
          </h1>
          <p className="text-gray-600">
            서비스 이용을 위해 기본 정보를 입력해주세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              프로필 이미지
            </label>
            <div className="flex justify-center">
              <ImageUpload
                currentImage={profileImage}
                onImageChange={setProfileImage}
                size="xl"
              />
            </div>
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
              닉네임 *
            </label>
            <Input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="사용할 닉네임을 입력하세요"
              maxLength={20}
              required
            />
          </div>

          <div>
            <label htmlFor="introduction" className="block text-sm font-medium text-gray-700 mb-2">
              자기소개 (선택)
            </label>
            <textarea
              id="introduction"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="간단한 자기소개를 입력하세요"
              rows={3}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            프로필 설정 완료
          </Button>
        </form>
      </div>
    </Container>
  )
}