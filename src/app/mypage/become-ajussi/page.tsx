'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/providers/AuthProvider'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { CheckCircle, Star, Users, Clock, Shield } from 'lucide-react'

export default function BecomeAjussiPage() {
  return (
    <ProtectedRoute>
      <BecomeAjussiContent />
    </ProtectedRoute>
  )
}

function BecomeAjussiContent() {
  const { profile, isAjussi } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBecomeAjussi = async () => {
    try {
      setLoading(true)
      
      // Update user role to ajussi
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: { role: 'ajussi' },
        }),
      })

      const result = await response.json()
      if (result.success) {
        success('아저씨 등록 완료', '이제 아저씨로 활동할 수 있습니다!')
        router.push('/mypage/profile')
      } else {
        error('등록 실패', result.error || '아저씨 등록에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error becoming ajussi:', err)
      error('등록 실패', '아저씨 등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (isAjussi) {
    return (
      <>
        <PageHeader
          title="아저씨 되기"
          breadcrumbs={[
            { label: '마이페이지', href: '/mypage' },
            { label: '아저씨 되기' }
          ]}
        />
        <Container className="py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              이미 아저씨로 등록되어 있습니다!
            </h2>
            <p className="text-gray-600 mb-6">
              프로필 관리에서 아저씨 정보를 수정하거나 활동 상태를 관리할 수 있습니다.
            </p>
            <Button asChild>
              <a href="/mypage/profile">프로필 관리하기</a>
            </Button>
          </div>
        </Container>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="아저씨 되기"
        description="다른 사람들에게 도움을 주는 아저씨가 되어보세요"
        breadcrumbs={[
          { label: '마이페이지', href: '/mypage' },
          { label: '아저씨 되기' }
        ]}
      />

      <Container className="py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center">
            <div className="text-6xl mb-6">👨‍🏫</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              아저씨가 되어 다른 사람들을 도와주세요
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              당신의 경험과 지혜를 나누어 다른 사람들에게 도움을 주고, 
              동시에 의미있는 수입도 얻을 수 있습니다.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardBody>
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">의미있는 활동</h3>
                <p className="text-sm text-gray-600">
                  다른 사람들에게 도움을 주며 보람을 느껴보세요
                </p>
              </CardBody>
            </Card>

            <Card className="text-center">
              <CardBody>
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">유연한 시간</h3>
                <p className="text-sm text-gray-600">
                  원하는 시간에 원하는 만큼 활동할 수 있습니다
                </p>
              </CardBody>
            </Card>

            <Card className="text-center">
              <CardBody>
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">새로운 만남</h3>
                <p className="text-sm text-gray-600">
                  다양한 사람들과 만나며 인맥을 넓혀보세요
                </p>
              </CardBody>
            </Card>

            <Card className="text-center">
              <CardBody>
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">안전한 환경</h3>
                <p className="text-sm text-gray-600">
                  검증된 플랫폼에서 안전하게 활동하세요
                </p>
              </CardBody>
            </Card>
          </div>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">아저씨 되기 조건</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">만 20세 이상</h4>
                    <p className="text-sm text-gray-600">성인 인증이 완료된 회원</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">서비스 제공 의지</h4>
                    <p className="text-sm text-gray-600">다른 사람들을 도우려는 진정성 있는 마음</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">기본 매너</h4>
                    <p className="text-sm text-gray-600">상대방을 존중하고 예의를 지키는 태도</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">약속 준수</h4>
                    <p className="text-sm text-gray-600">정해진 시간과 약속을 지키는 책임감</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Process */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">등록 절차</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
                    1
                  </div>
                  <h4 className="font-medium mb-2">아저씨 등록</h4>
                  <p className="text-sm text-gray-600">
                    아래 버튼을 클릭하여 아저씨로 등록합니다
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
                    2
                  </div>
                  <h4 className="font-medium mb-2">프로필 작성</h4>
                  <p className="text-sm text-gray-600">
                    서비스 내용, 요금, 활동 지역 등을 설정합니다
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
                    3
                  </div>
                  <h4 className="font-medium mb-2">활동 시작</h4>
                  <p className="text-sm text-gray-600">
                    프로필이 공개되어 서비스 요청을 받을 수 있습니다
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <Card className="bg-primary/5 border-primary/20">
              <CardBody>
                <h3 className="text-xl font-semibold mb-4">
                  지금 바로 아저씨가 되어보세요!
                </h3>
                <p className="text-gray-600 mb-6">
                  등록 후 언제든지 활동을 중단하거나 재개할 수 있습니다.
                </p>
                <Button
                  onClick={handleBecomeAjussi}
                  loading={loading}
                  size="lg"
                  className="px-8"
                >
                  아저씨로 등록하기
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>
    </>
  )
}