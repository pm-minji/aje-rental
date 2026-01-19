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
            <div className="text-6xl mb-6">🥸</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              당신의 숨겨진 재능이 누군가에게는 큰 힘이 됩니다
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              경험과 노하우를 이웃과 나누고, 합리적인 수입도 창출해보세요.<br />
              검증된 '동네 전문가'로서의 새로운 삶이 시작됩니다.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardBody>
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">재능의 가치 발견</h3>
                <p className="text-sm text-gray-600">
                  사소해 보이는 취미나 특기도<br />누군가에게는 훌륭한 배움이 됩니다.
                </p>
              </CardBody>
            </Card>

            <Card className="text-center">
              <CardBody>
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">자유로운 활동</h3>
                <p className="text-sm text-gray-600">
                  원하는 시간, 원하는 장소에서<br />부담 없이 활동할 수 있습니다.
                </p>
              </CardBody>
            </Card>

            <Card className="text-center">
              <CardBody>
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">합리적 수익</h3>
                <p className="text-sm text-gray-600">
                  플랫폼 수수료를 최소화하여<br />노력한 만큼의 정당한 보상을 받으세요.
                </p>
              </CardBody>
            </Card>

            <Card className="text-center">
              <CardBody>
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">검증된 전문가</h3>
                <p className="text-sm text-gray-600">
                  까다로운 검증을 통과한 '선생님'으로서<br />존중받으며 활동합니다.
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
                    <h4 className="font-medium">만 34세 이상 남성</h4>
                    <p className="text-sm text-gray-600">인생의 경험이 충분히 쌓인 대한민국 성인 남성</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">확실한 신원 인증</h4>
                    <p className="text-sm text-gray-600">본인 명의 휴대폰 및 실명 인증이 가능한 분</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">자신만의 특기/재능</h4>
                    <p className="text-sm text-gray-600">전문 지식, 취미, 혹은 경청하는 능력이 있으신 분</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">신뢰와 책임감</h4>
                    <p className="text-sm text-gray-600">약속을 생명처럼 여기고 매너를 갖추신 분</p>
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
                  <h4 className="font-medium mb-2">신청서 작성</h4>
                  <p className="text-sm text-gray-600">
                    경력, 전문 분야, 활동 계획 등을 상세히 작성하여 제출합니다.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
                    2
                  </div>
                  <h4 className="font-medium mb-2">인터뷰 심사</h4>
                  <p className="text-sm text-gray-600">
                    관리자와의 전화 인터뷰를 통해 신원과 전문성을 검증받습니다.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-semibold">
                    3
                  </div>
                  <h4 className="font-medium mb-2">활동 승인</h4>
                  <p className="text-sm text-gray-600">
                    승인 즉시 검색 목록에 노출되며 활동을 시작할 수 있습니다.
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