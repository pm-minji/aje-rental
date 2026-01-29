'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/layout/Container'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Select } from '@/components/ui/Select'
import { Loading } from '@/components/ui/Loading'
import { RequestCard } from '@/components/request/RequestCard'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/providers/AuthProvider'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { RequestWithDetails } from '@/types/database'

const STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'PENDING', label: '대기중' },
  { value: 'CONFIRMED', label: '확정' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'REJECTED', label: '거절' },
  { value: 'CANCELLED', label: '취소' },
]

export default function RequestsPage() {
  return (
    <ProtectedRoute>
      <RequestsContent />
    </ProtectedRoute>
  )
}

function RequestsContent() {
  const { isAjussi } = useAuth()
  const { error } = useToast()
  const [activeTab, setActiveTab] = useState('sent')
  const [statusFilter, setStatusFilter] = useState('')
  const [sentRequests, setSentRequests] = useState<RequestWithDetails[]>([])
  const [receivedRequests, setReceivedRequests] = useState<RequestWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [statusFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)

      // Fetch sent requests
      const sentParams = new URLSearchParams({
        type: 'sent',
        ...(statusFilter && { status: statusFilter }),
      })

      const sentPromise = fetch(`/api/requests?${sentParams}`).then((res) =>
        res.json()
      )

      // Fetch received requests (only for ajussi)
      let receivedPromise = Promise.resolve(null)
      if (isAjussi) {
        const receivedParams = new URLSearchParams({
          type: 'received',
          ...(statusFilter && { status: statusFilter }),
        })

        receivedPromise = fetch(`/api/requests?${receivedParams}`).then((res) =>
          res.json()
        )
      }

      const [sentResult, receivedResult] = await Promise.all([
        sentPromise,
        receivedPromise,
      ])

      if (sentResult.success) {
        setSentRequests(sentResult.data)
      }

      if (receivedResult && receivedResult.success) {
        setReceivedRequests(receivedResult.data)
      }
    } catch (err) {
      console.error('Error fetching requests:', err)
      error('오류 발생', '요청 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      console.log('API call:', { requestId, newStatus })
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      console.log('API response status:', response.status)
      const result = await response.json()
      console.log('API response data:', result)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Refresh the requests
      await fetchRequests()
    } catch (err) {
      console.error('handleStatusChange error:', err)
      throw err
    }
  }

  const EmptyState = ({ type }: { type: 'sent' | 'received' }) => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📋</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {type === 'sent' ? '신청한 요청이 없습니다' : '받은 요청이 없습니다'}
      </h3>
      <p className="text-gray-600">
        {type === 'sent'
          ? '아저씨를 찾아서 서비스를 요청해보세요!'
          : '아직 받은 서비스 요청이 없습니다.'
        }
      </p>
    </div>
  )

  return (
    <>
      <Container className="py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">의뢰 관리</h1>
          <p className="text-gray-600 mt-1">서비스 요청 내역을 확인하고 관리하세요</p>
        </div>

        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="w-48">
              <Select
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder="상태 필터"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="sent" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="sent">
                내가 신청한 요청 ({sentRequests.length})
              </TabsTrigger>
              {isAjussi && (
                <TabsTrigger value="received">
                  내가 받은 요청 ({receivedRequests.length})
                </TabsTrigger>
              )}
            </TabsList>

            {/* Sent Requests */}
            <TabsContent value="sent">
              {loading ? (
                <div className="py-8">
                  <Loading size="lg" text="요청 목록을 불러오는 중..." />
                </div>
              ) : sentRequests.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sentRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      userType="client"
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState type="sent" />
              )}
            </TabsContent>

            {/* Received Requests (Ajussi only) */}
            {isAjussi && (
              <TabsContent value="received">
                {loading ? (
                  <div className="py-8">
                    <Loading size="lg" text="요청 목록을 불러오는 중..." />
                  </div>
                ) : receivedRequests.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {receivedRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        userType="ajussi"
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState type="received" />
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </Container>
    </>
  )
}