'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Loading } from '@/components/ui/Loading'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Star, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Review {
    id: string
    rating: number
    comment: string | null
    created_at: string
    reviewer_id: string
    request_id: string
    reviewer?: {
        name: string
        nickname: string | null
        profile_image: string | null
    }
    request?: {
        ajussi_id: string
        client_id: string
        ajussi_profiles?: {
            title: string
            user_id: string
            profiles: {
                name: string
                nickname: string | null
                profile_image: string | null
            }
        }
    }
}

export default function ReviewsPage() {
    return (
        <ProtectedRoute>
            <ReviewsContent />
        </ProtectedRoute>
    )
}

function ReviewsContent() {
    const { user, isAjussi } = useAuth()
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchReviews()
        }
    }, [user])

    const fetchReviews = async () => {
        try {
            setLoading(true)
            // 아저씨인 경우: 내가 받은 리뷰, 일반 사용자: 내가 작성한 리뷰
            const endpoint = isAjussi
                ? `/api/reviews?received=true`
                : `/api/reviews?written=true`

            const response = await fetch(endpoint)
            const result = await response.json()

            if (result.success) {
                setReviews(result.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch reviews:', err)
        } finally {
            setLoading(false)
        }
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                    />
                ))}
                <span className="ml-1 text-sm text-gray-600">{rating}.0</span>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Loading />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">리뷰 관리</h1>
                    <p className="text-gray-600">
                        {isAjussi ? '내가 받은 리뷰를 확인하세요' : '내가 작성한 리뷰를 확인하세요'}
                    </p>
                </div>

                {reviews.length === 0 ? (
                    <Card className="text-center py-12">
                        <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {isAjussi ? '아직 받은 리뷰가 없습니다' : '아직 작성한 리뷰가 없습니다'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {isAjussi
                                ? '서비스를 완료하면 리뷰를 받을 수 있어요!'
                                : '서비스 이용 후 리뷰를 작성해보세요!'}
                        </p>
                        {!isAjussi && (
                            <Button asChild>
                                <Link href="/mypage/requests">의뢰 내역 보기</Link>
                            </Button>
                        )}
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <Card key={review.id}>
                                <div className="flex items-start space-x-4">
                                    <Avatar
                                        src={
                                            isAjussi
                                                ? review.reviewer?.profile_image
                                                : review.request?.ajussi_profiles?.profiles?.profile_image
                                        }
                                        alt={
                                            isAjussi
                                                ? review.reviewer?.name || '사용자'
                                                : review.request?.ajussi_profiles?.profiles?.name || '아저씨'
                                        }
                                        size="md"
                                        fallback={
                                            isAjussi
                                                ? review.reviewer?.name?.[0] || '?'
                                                : review.request?.ajussi_profiles?.profiles?.name?.[0] || '?'
                                        }
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {isAjussi
                                                        ? (review.reviewer?.nickname || review.reviewer?.name)
                                                        : (review.request?.ajussi_profiles?.title)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(review.created_at)}
                                                </p>
                                            </div>
                                            {renderStars(review.rating)}
                                        </div>

                                        {review.comment && (
                                            <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                                                {review.comment}
                                            </p>
                                        )}

                                        {!isAjussi && review.request?.ajussi_profiles && (
                                            <div className="mt-3">
                                                <Link
                                                    href={`/ajussi/${review.request.ajussi_profiles.user_id}`}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    아저씨 프로필 보기 →
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
