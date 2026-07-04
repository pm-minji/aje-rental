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
import { pushToDataLayer } from '@/lib/gtm'
import { openPayappCheckout } from '@/lib/payapp-client'
import { DEPOSIT_AMOUNT, depositGoodName } from '@/lib/pricing'

export interface AjussiDetailData {
  ajussi: AjussiWithProfile
  reviews: ReviewWithDetails[]
  averageRating: number
  reviewCount: number
}

interface AjussiDetailClientProps {
  slug: string
  initialData?: AjussiDetailData | null
}

export default function AjussiDetailClient({ slug, initialData }: AjussiDetailClientProps) {
  const { isAuthenticated } = useAuth()
  const { error, success } = useToast()
  const [data, setData] = useState<AjussiDetailData | null>(initialData ?? null)
  const [loading, setLoading] = useState(!initialData)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)

  useEffect(() => {
    // 서버에서 initialData를 받았으면 클라이언트 재조회를 생략한다
    if (!initialData) {
      fetchAjussiDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const fetchAjussiDetail = async () => {
    try {
      setLoading(true)
      // API now supports both slug and UUID lookup
      const response = await fetch(`/api/ajussi/${slug}`)
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
          pushToDataLayer({
            event: 'favorite_removed',
            ajussiId: data?.ajussi.user_id,
            ajussiTitle: data?.ajussi.title,
          })
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
          pushToDataLayer({
            event: 'favorite_added',
            ajussiId: data?.ajussi.user_id,
            ajussiTitle: data?.ajussi.title,
          })
        }
      }
    } catch (err) {
      error('오류 발생', '즐겨찾기 처리 중 오류가 발생했습니다.')
    }
  }

  const handleOpenChat = () => {
    if (!isAuthenticated) {
      redirectToLogin()
      return
    }
    if (!data?.ajussi.open_chat_url) {
      error('오류', '오픈채팅 링크가 설정되지 않았습니다.')
      return
    }
    pushToDataLayer({
      event: 'open_chat_clicked',
      ajussiId: data?.ajussi.user_id,
      ajussiTitle: data?.ajussi.title,
    })
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

    pushToDataLayer({
      event: 'service_requested',
      ajussiId: data?.ajussi.user_id,
      ajussiTitle: data?.ajussi.title,
      location: requestData.location,
      duration: requestData.duration,
    })

    // 예약 = 결제: 생성된 요청으로 페이앱 결제창을 같은 탭에서 바로 연다.
    // 결제창 열기에 실패해도 요청은 이미 생성됐으므로(PAYMENT_REQUESTED),
    // 모달에서 '요청 실패'로 오인해 재제출(중복 생성)하지 않도록 마이페이지로 이동해
    // '결제하기'로 이어서 결제하게 한다.
    try {
      await openPayappCheckout({
        requestId: result.data.id,
        goodname: depositGoodName(data?.ajussi.title),
        price: DEPOSIT_AMOUNT,
      })
    } catch (checkoutErr) {
      console.error('Failed to open PayApp checkout:', checkoutErr)
      window.location.href = '/mypage/requests'
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

      <Container className="py-8 pb-32">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Card */}
          <Card>
            {/* Header: Avatar + Name + Rating + Favorite */}
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
                    {ajussi.title} 아저씨
                  </h1>
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
                  className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`}
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
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {ajussi.description}
              </p>
            </div>

            {/* Service Info */}
            <div className="pt-6 border-t space-y-4">
              <h3 className="font-semibold text-gray-900">서비스 조건</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg text-center">
                  <p className="text-xl font-bold text-primary">20,000원</p>
                  <p className="text-sm text-gray-600">첫 1시간</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <p className="text-xl font-bold text-gray-700">10,000원</p>
                  <p className="text-sm text-gray-600">추가 시간당</p>
                  <p className="text-xs text-gray-500 mt-1">(현장 정산)</p>
                </div>
              </div>
              {ajussi.available_areas && ajussi.available_areas.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    {ajussi.available_areas.map(area =>
                      area === 'Seoul' ? '서울 (오프라인)' : area === 'Online' ? '온라인' : area
                    ).join(', ')}
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500">
                ※ 이동, 식사, 문화생활 등 활동 비용은 의뢰인 부담입니다.
              </p>
            </div>

            {/* Pre-consultation Notice */}
            <div className="mt-6 pt-6 border-t">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-900 mb-1">💬 사전 문의를 권장합니다</p>
                <p className="text-sm text-blue-700">
                  서비스 요청 전, 오픈채팅으로 일정과 상세 내용을 미리 조율하시면 더 원활한 진행이 가능합니다.
                </p>
              </div>
            </div>

            {/* Usage Notice */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center mb-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                <h3 className="font-medium text-gray-900">이용 안내</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 서비스 이용 전 오픈채팅으로 사전 문의를 권장합니다.</li>
                <li>• 공개된 장소에서 만나시기를 권장합니다.</li>
                <li>• 서비스 이용 후 리뷰를 남겨주세요.</li>
                <li>• 문제 발생 시 joon@pm-minji.com 으로 연락해주세요.</li>
              </ul>
            </div>
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
      </Container>

      {/* Sticky CTA Bar - Above bottom nav on mobile */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 z-40">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-center text-gray-500 mb-2">
            💬 오픈채팅으로 먼저 일정을 협의한 후 서비스를 요청해주세요
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleOpenChat}
              variant="outline"
              className="flex-1"
              disabled={!ajussi.open_chat_url}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              채팅 문의
            </Button>
            <Button
              onClick={handleRequestService}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              서비스 요청
            </Button>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && data && (
        <RequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          ajussiId={data.ajussi.id}
          ajussiName={`${data.ajussi.title} 아저씨`}
          hourlyRate={20000}
          onSubmit={handleSubmitRequest}
        />
      )}
    </>
  )
}