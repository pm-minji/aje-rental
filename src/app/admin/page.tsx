'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
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

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  )
}

function AdminContent() {
  const { profile } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<AjussiApplication[]>([])
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    // Check admin status and fetch applications
    checkAdminAndFetch()
  }, [])

  const checkAdminAndFetch = async () => {
    try {
      console.log('Current profile from AuthProvider:', profile)

      // Fetch fresh profile data to check admin status
      const response = await fetch('/api/profile')
      const result = await response.json()

      console.log('Profile API response:', result)

      if (!result.success) {
        error('오류 발생', '프로필 정보를 불러올 수 없습니다.')
        return
      }

      const freshProfile = result.data.profile
      console.log('Fresh profile role:', freshProfile?.role)

      if (freshProfile?.role !== 'admin') {
        error('접근 권한 없음', `관리자만 접근할 수 있는 페이지입니다. 현재 역할: ${freshProfile?.role}`)
        return
      }

      console.log('Admin access confirmed, fetching applications...')
      // If admin, fetch applications
      fetchApplications()
    } catch (err) {
      console.error('Error checking admin status:', err)
      error('오류 발생', '권한 확인 중 오류가 발생했습니다.')
    }
  }

  const fetchApplications = async () => {
    try {
      setLoading(true)
      console.log('Fetching applications from /api/admin/applications')

      const response = await fetch('/api/admin/applications')
      console.log('Response status:', response.status)

      const result = await response.json()
      console.log('API result:', result)

      if (result.success) {
        setApplications(result.data)
        console.log('Applications loaded:', result.data.length)
      } else {
        console.error('API error:', result.error)
        error('오류 발생', result.error || '신청서 목록을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('Error fetching applications:', err)
      error('오류 발생', '신청서 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId: string) => {
    try {
      setProcessing(applicationId)
      const response = await fetch(`/api/admin/applications/${applicationId}/approve`, {
        method: 'POST',
      })
      const result = await response.json()

      if (result.success) {
        success('승인 완료', '아저씨 신청이 승인되었습니다.')
        fetchApplications() // Refresh list
      } else {
        error('승인 실패', result.error || '승인 처리에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error approving application:', err)
      error('승인 실패', '승인 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (applicationId: string) => {
    const reason = prompt('거절 사유를 입력해주세요:')
    if (!reason) return

    try {
      setProcessing(applicationId)
      const response = await fetch(`/api/admin/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })
      const result = await response.json()

      if (result.success) {
        success('거절 완료', '아저씨 신청이 거절되었습니다.')
        fetchApplications() // Refresh list
      } else {
        error('거절 실패', result.error || '거절 처리에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error rejecting application:', err)
      error('거절 실패', '거절 처리 중 오류가 발생했습니다.')
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">대기 중</Badge>
      case 'APPROVED':
        return <Badge variant="success">승인됨</Badge>
      case 'REJECTED':
        return <Badge variant="error">거절됨</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (profile?.role !== 'admin') {
    return (
      <Container className="py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 권한 없음</h2>
          <p className="text-gray-600">관리자만 접근할 수 있는 페이지입니다.</p>
        </div>
      </Container>
    )
  }

  if (loading) {
    return (
      <Container className="py-16">
        <Loading size="lg" text="신청서 목록을 불러오는 중..." />
      </Container>
    )
  }

  return (
    <>
      <PageHeader
        title="관리자 대시보드"
        description="아저씨 신청서를 검토하고 승인/거절할 수 있습니다"
      />

      <Container className="py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">아저씨 신청서 목록</h2>
            <p className="text-gray-600">
              총 {applications.length}개의 신청서가 있습니다.
            </p>
          </div>

          {applications.length === 0 ? (
            <Card>
              <CardBody>
                <div className="text-center py-8">
                  <p className="text-gray-500">신청서가 없습니다.</p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{application.title}</h3>
                        <p className="text-sm text-gray-500">
                          신청일: {formatDistanceToNow(new Date(application.created_at), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(application.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      {/* 신청자 정보 */}
                      <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-2">신청자 본인 확인 정보</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-sm text-blue-600 block">실명</span>
                            <span className="font-medium text-gray-900">{application.real_name || '-'}</span>
                          </div>
                          <div>
                            <span className="text-sm text-blue-600 block">생년월일 (만 나이)</span>
                            <span className="font-medium text-gray-900">
                              {application.birth_date || '-'}
                              {application.birth_date && ` (만 ${new Date().getFullYear() - new Date(application.birth_date).getFullYear()}세)`}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-blue-600 block">연락처</span>
                            <span className="font-medium text-gray-900">{application.phone_number || '-'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">서비스 제목 (닉네임)</h4>
                        <p className="font-bold text-gray-900 text-lg">{application.title}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">시간당 요금</h4>
                        <p className="text-sm text-gray-600">
                          {application.hourly_rate.toLocaleString()}원
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-700 mb-1">한줄 소개</h4>
                        <p className="text-gray-900 bg-gray-50 p-2 rounded">{application.description}</p>
                      </div>

                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-700 mb-1">경력 및 주요 이력</h4>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm">
                          {application.career_history || '입력된 경력이 없습니다.'}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">활동 지역</h4>
                        <div className="flex flex-wrap gap-1">
                          {application.available_areas.map((area) => (
                            <span
                              key={area}
                              className="px-2 py-1 bg-gray-100 text-xs rounded border border-gray-200"
                            >
                              {area === 'Seoul' || area === 'Gangnam-gu' ? '서울(오프라인)' : (area === 'Online' ? '온라인' : area)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">전문 분야 (태그)</h4>
                        <div className="flex flex-wrap gap-1">
                          {(application.specialties || application.tags).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-1">오픈채팅 URL</h4>
                      <a
                        href={application.open_chat_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {application.open_chat_url}
                      </a>
                    </div>

                    {application.admin_notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded">
                        <h4 className="font-medium text-gray-700 mb-1">관리자 메모</h4>
                        <p className="text-sm text-gray-600">{application.admin_notes}</p>
                      </div>
                    )}

                    {application.status !== 'REJECTED' && (
                      <div className="flex gap-2">
                        {application.status !== 'APPROVED' && (
                          <Button
                            onClick={() => handleApprove(application.id)}
                            loading={processing === application.id}
                            disabled={processing !== null}
                          >
                            승인
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => handleReject(application.id)}
                          loading={processing === application.id}
                          disabled={processing !== null}
                          className={application.status === 'APPROVED' ? 'text-red-500 border-red-200 hover:bg-red-50' : ''}
                        >
                          {application.status === 'APPROVED' ? '승인 취소 (거절)' : '거절'}
                        </Button>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  )
}