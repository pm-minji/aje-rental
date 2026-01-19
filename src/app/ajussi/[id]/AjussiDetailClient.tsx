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
  ExternalLink,
  ChevronRight
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
        title={`${ajussi.title} 아저씨`}
        breadcrumbs={[
          { label: '아저씨 찾기', href: '/ajussi' },
          { label: `${ajussi.title} 아저씨` }
        ]}
      />

      <Container className="py-8 pb-32 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Column (Left) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Unified Profile Header Card */}
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:flex-shrink-0">
                  <div className="relative h-64 md:h-full md:w-64 bg-gray-100">
                    {ajussi.profiles?.profile_image ? (
                      <img
                        src={ajussi.profiles.profile_image}
                        alt={ajussi.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                        {ajussi.profiles?.name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h1 className="text-2xl font-bold text-gray-900">
                            {ajussi.title} 아저씨
                          </h1>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleFavorite}
                            className="text-gray-400 hover:text-red-500 p-1 h-auto"
                          >
                            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                        </div>
                        {ajussi.tags && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {ajussi.tags.slice(0, 5).map(tag => (
                              <Badge key={tag} variant="secondary" size="sm">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {ajussi.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">활동 지역</p>
                      <div className="flex items-center font-medium text-gray-900">
                        <MapPin className="h-4 w-4 mr-1 text-primary" />
                        {ajussi.available_areas.map(area =>
                          area === 'Seoul' ? '서울' : area === 'Online' ? '온라인' : area
                        ).join(', ')}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">시간당 요금</p>
                      <div className="flex items-center font-medium text-gray-900">
                        <Clock className="h-4 w-4 mr-1 text-primary" />
                        20,000원
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Process Guide (New) */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                이용 전 꼭 확인해주세요!
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-100 text-center">
                  <div className="text-blue-600 font-bold mb-1">STEP 1</div>
                  <div className="font-medium text-gray-900 mb-1">오픈채팅 문의</div>
                  <p className="text-xs text-gray-500">일정/장소를 먼저 조율하세요</p>
                </div>
                <div className="hidden md:flex items-center justify-center text-blue-300">
                  <ChevronRight />
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-100 text-center">
                  <div className="text-blue-600 font-bold mb-1">STEP 2</div>
                  <div className="font-medium text-gray-900 mb-1">서비스 신청</div>
                  <p className="text-xs text-gray-500">플랫폼에서 안전하게 결제</p>
                </div>
                <div className="hidden md:flex items-center justify-center text-blue-300">
                  <ChevronRight />
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-100 text-center">
                  <div className="text-blue-600 font-bold mb-1">STEP 3</div>
                  <div className="font-medium text-gray-900 mb-1">아저씨 만남</div>
                  <p className="text-xs text-gray-500">약속 장소에서 만남!</p>
                </div>
              </div>
            </div>

            {/* Detailed Info */}
            <div className="space-y-6">
              {ajussi.profiles?.introduction && (
                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">자기소개</h3>
                  <div className="prose max-w-none bg-white p-6 rounded-xl border text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {ajussi.profiles.introduction}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  리뷰 <span className="text-primary">{reviewCount}</span>
                </h3>
                <Card>
                  <CardBody>
                    {reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                            <div className="flex items-start space-x-3">
                              <Avatar
                                src={review.reviewer?.profile_image}
                                alt={review.reviewer?.name || '사용자'}
                                size="sm"
                                fallback={review.reviewer?.name || '?'}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-medium text-gray-900">
                                    {review.reviewer?.nickname || review.reviewer?.name || '익명'}
                                  </p>
                                  <span className="text-xs text-gray-400">
                                    {formatDate(review.created_at)}
                                  </span>
                                </div>
                                <div className="flex items-center mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                                {review.comment && (
                                  <p className="text-gray-700 text-sm">
                                    {review.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        <MessageCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                        <p>아직 작성된 리뷰가 없습니다.</p>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </section>
            </div>
          </div>

          {/* Sidebar Column (Right) - Sticky Desktop */}
          <div className="space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Action Card */}
              <Card className="border-2 border-primary/10 shadow-lg">
                <CardHeader className="bg-gray-50 border-b pb-4">
                  <h3 className="font-bold text-lg">서비스 신청하기</h3>
                </CardHeader>
                <CardBody className="space-y-6 pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">20,000원</p>
                    <p className="text-sm text-gray-500 mt-1">기본 1시간 (수수료 포함)</p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleOpenChat}
                      variant="outline"
                      className="w-full h-12 text-base font-medium border-primary/20 hover:bg-blue-50 hover:text-primary transition-colors"
                      disabled={!ajussi.open_chat_url}
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      1. 오픈채팅으로 문의
                    </Button>
                    <p className="text-xs text-center text-gray-500">
                      👆 결제 전, 일정과 장소를 먼저 상의하세요!
                    </p>

                    <Button
                      onClick={handleRequestService}
                      className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      <Calendar className="h-5 w-5 mr-2" />
                      2. 서비스 신청하기
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-dashed">
                    <ul className="text-xs text-gray-500 space-y-1.5">
                      <li>• 추가 요금: 시간당 10,000원 (현장 결제)</li>
                      <li>• 이동/식사/티켓 비용은 의뢰인 부담입니다.</li>
                    </ul>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

        </div>
      </Container>

      {/* Mobile Sticky CTA Bar (Updated) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary/10 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-3 px-4 lg:hidden z-50 safe-area-bottom">
        <div className="flex flex-col gap-2 max-w-lg mx-auto">
          {/* Notice - auto hide on scroll could be better but keep simple for now */}
          <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500 pb-1">
            <AlertCircle className="h-3 w-3" />
            <span>결제 전 채팅으로 일정을 먼저 잡아주세요</span>
          </div>
          <div className="flex gap-3 h-12">
            <Button
              onClick={handleOpenChat}
              variant="outline"
              className="flex-1 border-primary/20 text-primary font-medium dark:bg-white"
              disabled={!ajussi.open_chat_url}
            >
              <MessageCircle className="h-5 w-5 mr-1.5" />
              문의하기
            </Button>
            <Button
              onClick={handleRequestService}
              className="flex-[1.5] font-bold shadow-md"
            >
              신청하기
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