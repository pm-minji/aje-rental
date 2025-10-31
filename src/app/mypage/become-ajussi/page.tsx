'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/providers/AuthProvider'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { CheckCircle, Star, Users, Clock, Shield, RefreshCw, ArrowRight } from 'lucide-react'
import { AjussiApplication } from '@/types/database'
import { Badge } from '@/components/ui/Badge'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

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
  const [applicationLoading, setApplicationLoading] = useState(true)
  const [application, setApplication] = useState<AjussiApplication | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!isAjussi) {
      fetchApplication()
    }
  }, [isAjussi])

  const fetchApplication = async () => {
    try {
      setApplicationLoading(true)
      const response = await fetch('/api/ajussi/application')
      const result = await response.json()

      if (result.success) {
        setApplication(result.data)
      } else if (result.error !== 'No application found') {
        error('오류 발생', result.error || '신청 내역을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('Error fetching application:', err)
      error('오류 발생', '신청 내역을 불러오는데 실패했습니다.')
    } finally {
      setApplicationLoading(false)
    }
  }

  const handleBecomeAjussi = async () => {
    // Redirect to application form
    router.push('/mypage/ajussi-application')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">검토 중</Badge>
      case 'APPROVED':
        return <Badge variant="success">승인됨</Badge>
      case 'REJECTED':
        return <Badge variant="error">거절됨</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '관리자가 신청서를 검토 중입니다. 검토 완료까지 1-2일 정도 소요될 수 있습니다.'
      case 'APPROVED':
        return '축하합니다! 아저씨로 승인되었습니다. 페이지를 새로고침하면 아저씨 기능을 사용할 수 있습니다.'
      case 'REJECTED':
        return '신청이 거절되었습니다. 아래 사유를 확인하고 수정 후 재신청해주세요.'
      default:
        return ''
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
              <a href="/mypage/ajussi">아저씨 프로필 관리</a>
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
          {/* Application Status Section - Show if user has applied */}
          {!applicationLoading && application && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-blue-900 mb-2">아저씨 신청 현황</h2>
                    <p className="text-sm text-blue-700">
                      신청일: {formatDistanceToNow(new Date(application.created_at), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(application.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchApplication}
                      className="p-2 text-blue-600 hover:text-blue-800"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 text-sm">
                    {getStatusMessage(application.status)}
                  </p>
                </div>

                {application.admin_notes && (
                  <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-800 mb-2">관리자 메모</h4>
                    <p className="text-sm text-blue-700">{application.admin_notes}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <a href="/mypage/application">
                      상세 내역 보기
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                  
                  {application.status === 'REJECTED' && (
                    <Button
                      onClick={handleBecomeAjussi}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      다시 신청하기
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

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
          {!application && (
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
          )}
        </div>
      </Container>
    </>
  )
}