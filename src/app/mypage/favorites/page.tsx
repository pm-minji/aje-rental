'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Loading } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import { Heart, MapPin, Clock, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { AjussiWithProfile } from '@/types/database'

export default function FavoritesPage() {
    return (
        <ProtectedRoute>
            <FavoritesContent />
        </ProtectedRoute>
    )
}

function FavoritesContent() {
    const { user } = useAuth()
    const { success, error: showError } = useToast()
    const [favorites, setFavorites] = useState<AjussiWithProfile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchFavorites()
        }
    }, [user])

    const fetchFavorites = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/favorites')
            const result = await response.json()

            if (result.success) {
                setFavorites(result.data || [])
            } else {
                showError('오류', result.error || '즐겨찾기를 불러오는데 실패했습니다.')
            }
        } catch (err) {
            showError('오류', '즐겨찾기를 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveFavorite = async (ajussiId: string) => {
        try {
            const response = await fetch(`/api/favorites?ajussiId=${ajussiId}`, {
                method: 'DELETE',
            })
            const result = await response.json()

            if (result.success) {
                setFavorites(prev => prev.filter(f => f.user_id !== ajussiId))
                success('성공', '즐겨찾기에서 제거되었습니다.')
            } else {
                showError('오류', result.error || '즐겨찾기 제거에 실패했습니다.')
            }
        } catch (err) {
            showError('오류', '즐겨찾기 제거에 실패했습니다.')
        }
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">즐겨찾기</h1>
                    <p className="text-gray-600">
                        관심있는 아저씨들을 모아보세요
                    </p>
                </div>

                {favorites.length === 0 ? (
                    <Card className="text-center py-12">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            아직 즐겨찾기가 없습니다
                        </h3>
                        <p className="text-gray-500 mb-6">
                            마음에 드는 아저씨를 찾아 하트를 눌러보세요!
                        </p>
                        <Button asChild>
                            <Link href="/ajussi">아저씨 찾아보기</Link>
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {favorites.map((ajussi) => (
                            <Card key={ajussi.id} hover className="relative">
                                <Link href={`/ajussi/${ajussi.id}`}>
                                    <div className="flex items-start space-x-4">
                                        <Avatar
                                            src={ajussi.profiles?.profile_image}
                                            alt={ajussi.profiles?.name || '아저씨'}
                                            size="lg"
                                            fallback={ajussi.profiles?.name || '?'}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {ajussi.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {ajussi.profiles?.nickname || ajussi.profiles?.name}
                                            </p>

                                            <div className="mt-2 space-y-1">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    <span className="font-semibold text-primary">
                                                        {formatCurrency(ajussi.hourly_rate)}/시간
                                                    </span>
                                                </div>

                                                {ajussi.available_areas && ajussi.available_areas.length > 0 && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <MapPin className="h-4 w-4 mr-1" />
                                                        <span className="truncate">
                                                            {ajussi.available_areas.slice(0, 2).join(', ')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleRemoveFavorite(ajussi.user_id)
                                    }}
                                    className="absolute top-2 right-2 h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
