'use client'

import { useState, useEffect } from 'react'
import {
  Heart,
  MapPin,
  Clock,
  Star,
  MessageCircle,
  Calendar,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Loading, LoadingPage } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/providers/AuthProvider'
import { redirectToLogin } from '@/lib/auth-utils'
import { RequestModal } from '@/components/request/RequestModal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AjussiWithProfile, ReviewWithDetails } from '@/types/database'

interface AjussiDetailData {
  ajussi: AjussiWithProfile
  reviews: ReviewWithDetails[]
  averageRating: number
  reviewCount: number
}

export default function AjussiDetailClient({ params }: { params: { id: string } }) {
  const { isAuthenticated } = useAuth()
  const { error, success } = useToast()
  const [data, setData] = useState<AjussiDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)

  useEffect(() => {
    fetchAjussiDetail()
  }, [params.id])

  const fetchAjussiDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/ajussi/${params.id}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        error('오류 발생', '아저씨 정보를 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('Error fetching ajussi detail:', err)
      error('오류 발생', '아저씨 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      redirectToLogin()
      return
    }

    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/favorites?ajussiId=${data?.ajussi.user_id}`, {
          method: 'DELETE',
        })
        const result = await response.json()
        if (result.success) {
          setIsFavorited(false)
          success('즐겨찾기 해제', '즐겨찾기에서 제거되었습니다.')
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ajussiId: data?.ajussi.user_id,
          }),
        })
        const result = await response.json()
        if (result.success) {
          setIsFavorited(true)
          success('즐겨찾기 추가', '즐겨찾기에 추가되었습니다.')
        }
      }
    } catch (err) {
      error('오류 발생', '즐겨찾기 처리 중 오류가 발생했습니다.')
    }
  }

  const handleOpenChat = () => {
    if (!data?.ajussi.open_chat_url) {
      error('오류', '오픈채팅 링크가 설정되지 않았습니다.')
      return
    }
    window.open(data.ajussi.open_chat_url, '_blank')
  }

  const handleRequestService = () => {
    if (!isAuthenticated) {
      redirectToLogin()
      return
    }
    setShowRequestModal(true)
  }

  const handleSubmitRequest = async (requestData: any) => {
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ajussiId: data?.ajussi.user_id,
          ...requestData,
        }),
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (err) {
      throw err
    }
  }

  if (loading) {
    return <LoadingPage text="아저씨 정보를 불러오는 중..." />
  }

  if (!data) {
    return (
      <Container className="py-16 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          아저씨를 찾을 수 없습니다
        </h2>
        <p className="text-gray-600">
          요청하신 아저씨 정보가 존재하지 않거나 삭제되었습니다.
        </p>
      </Container>
    )
  }

  const { ajussi, reviews, averageRating, reviewCount } = data

  return (
    <>
      <PageHeader
        title={ajussi.title}
        breadcrumbs={[
          { label: '아저씨 찾기', href: '/ajussi' },
          { label: ajussi.title }
        ]}
      />

      <Container className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <Card>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Avatar
                    src={ajussi.profiles?.profile_image}
                    alt={ajussi.profiles?.name || '아저씨'}
                    size="xl"
                    fallback={ajussi.profiles?.name || '?'}
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {ajussi.title}
                    </h1>
                    <p className="text-lg text-gray-600">
                      {ajussi.profiles?.nickname || ajussi.profiles?.name || ''}
                    </p>
                    {reviewCount > 0 && (
                      <div className="flex items-center mt-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(averageRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {averageRating} ({reviewCount}개 리뷰)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={handleFavorite}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Heart
                    className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''
                      }`}
                  />
                </Button>
              </div>

              {/* Tags */}
              {ajussi.tags && ajussi.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {ajussi.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {ajussi.description}
                </p>
              </div>

              {/* Introduction */}
              {ajussi.profiles?.introduction && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">자기소개</h3>
                  <p className="text-gray-700">
                    {ajussi.profiles?.introduction}
                  </p>
                </div>
              )}
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  리뷰 ({reviewCount})
                </h2>
              </CardHeader>
              <CardBody>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start space-x-3">
                          <Avatar
                            src={review.reviewer?.profile_image}
                            alt={review.reviewer?.name || '사용자'}
                            size="sm"
                            fallback={review.reviewer?.name || '?'}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {review.reviewer?.nickname || review.reviewer?.name || '익명'}
                                </p>
                                <div className="flex items-center mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${i < review.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                        }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(review.created_at)}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="mt-2 text-gray-700">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>아직 리뷰가 없습니다.</p>
                    <p className="text-sm">첫 번째 리뷰를 남겨보세요!</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">서비스 정보</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center text-lg font-semibold text-primary">
                  <Clock className="h-5 w-5 mr-2" />
                  {formatCurrency(20000)}/1시간 (첫 만남 고정)
                </div>

                {ajussi.available_areas && ajussi.available_areas.length > 0 && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">활동 지역</p>
                      <p className="text-sm text-gray-600">
                        {ajussi.available_areas.join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t">
                  <Button
                    onClick={handleOpenChat}
                    variant="outline"
                    className="w-full"
                    disabled={!ajussi.open_chat_url}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    오픈채팅 문의
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>

                  <Button
                    onClick={handleRequestService}
                    className="w-full"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    서비스 요청하기
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Notice Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  <h3 className="font-medium">이용 안내</h3>
                </div>
              </CardHeader>
              <CardBody>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 서비스 이용 전 오픈채팅으로 사전 문의를 권장합니다.</li>
                  <li>• 공개된 장소에서 만나시기를 권장합니다.</li>
                  <li>• 서비스 이용 후 리뷰를 남겨주세요.</li>
                  <li>• 문제 발생 시 고객센터로 연락해주세요.</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>

      {/* Request Modal */}
      {showRequestModal && data && (
        <RequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          ajussiId={data.ajussi.id}
          ajussiName={data.ajussi.profiles?.nickname || data.ajussi.profiles?.name || '아저씨'}
          hourlyRate={20000}
          onSubmit={handleSubmitRequest}
        />
      )}
    </>
  )
}