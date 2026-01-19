'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/layout/Container'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/providers/AuthProvider'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { AjussiApplication } from '@/types/database'
import { Badge } from '@/components/ui/Badge'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'

export default function ApplicationStatusPage() {
  return (
    <ProtectedRoute>
      <ApplicationContent />
    </ProtectedRoute>
  )
}

function ApplicationContent() {
  const { profile } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<AjussiApplication | null>(null)

  useEffect(() => {
    fetchApplication()
  }, [])

  const fetchApplication = async () => {
    try {
      setLoading(true)
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
      setLoading(false)
    }
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
        return '축하합니다! 아저씨로 승인되었습니다. 이제 서비스를 제공할 수 있습니다.'
      case 'REJECTED':
        return '신청이 거절되었습니다. 아래 사유를 확인하고 수정 후 재신청해주세요.'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <Container className="py-16">
        <Loading size="lg" text="신청 내역을 불러오는 중..." />
      </Container>
    )
  }

  return (
    <>
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">아저씨 신청 내역</h1>
            <p className="text-gray-600 mt-1">아저씨 신청 상태를 확인하고 관리할 수 있습니다</p>
          </div>

          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/mypage"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              마이페이지로 돌아가기
            </Link>
          </div>

          {!application ? (
            <Card>
              <CardBody>
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    아저씨 신청 내역이 없습니다
                  </h3>
                  <p className="text-gray-600 mb-6">
                    아직 아저씨로 신청하지 않으셨습니다. 지금 신청해보세요!
                  </p>
                  <Button asChild>
                    <Link href="/ajussi/apply">
                      아저씨 신청하기
                    </Link>
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Status Card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">신청 상태</h2>
                      <p className="text-sm text-gray-500">
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
                        className="p-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 text-sm">
                      {getStatusMessage(application.status)}
                    </p>
                  </div>

                  {application.admin_notes && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-700 mb-2">관리자 메모</h4>
                      <p className="text-sm text-gray-600">{application.admin_notes}</p>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Application Details */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">신청 내용</h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">서비스 제목</h4>
                      <p className="text-gray-900">{application.title}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">시간당 요금</h4>
                      <p className="text-gray-900">{application.hourly_rate.toLocaleString()}원</p>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="font-medium text-gray-700 mb-2">서비스 설명</h4>
                      <p className="text-gray-900 whitespace-pre-wrap">{application.description}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">활동 지역</h4>
                      <div className="flex flex-wrap gap-2">
                        {application.available_areas.map((area) => (
                          <span
                            key={area}
                            className="px-3 py-1 bg-gray-100 text-sm rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">서비스 태그</h4>
                      <div className="flex flex-wrap gap-2">
                        {application.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="font-medium text-gray-700 mb-2">오픈채팅 URL</h4>
                      <a
                        href={application.open_chat_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {application.open_chat_url}
                      </a>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Actions */}
              {application.status === 'REJECTED' && (
                <Card>
                  <CardBody>
                    <div className="text-center py-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        재신청하기
                      </h3>
                      <p className="text-gray-600 mb-6">
                        거절 사유를 참고하여 내용을 수정한 후 다시 신청해주세요.
                      </p>
                      <Button asChild>
                        <Link href="/ajussi/apply">
                          다시 신청하기
                        </Link>
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          )}
        </div>
      </Container>
    </>
  )
}