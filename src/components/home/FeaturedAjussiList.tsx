'use client'

import { useState, useEffect } from 'react'
import { AjussiCard } from '@/components/ajussi/AjussiCard'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/ui/Toast'
import { redirectToLogin } from '@/lib/auth-utils'
import { AjussiWithProfile } from '@/types/database'
import { pushToDataLayer } from '@/lib/gtm'

interface FeaturedAjussiListProps {
    initialData: AjussiWithProfile[]
}

export function FeaturedAjussiList({ initialData }: FeaturedAjussiListProps) {
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
    const { isAuthenticated } = useAuth()
    const { success, error } = useToast()

    useEffect(() => {
        if (isAuthenticated) {
            fetchFavorites()
        } else {
            setFavoriteIds(new Set())
        }
    }, [isAuthenticated])

    const fetchFavorites = async () => {
        try {
            const response = await fetch('/api/favorites')
            const result = await response.json()

            if (result.success) {
                const ids = new Set<string>(result.data.map((fav: any) => fav.ajussi_id))
                setFavoriteIds(ids)
            }
        } catch (err) {
            console.error('Error fetching favorites:', err)
        }
    }

    const handleFavorite = async (ajussiId: string) => {
        if (!isAuthenticated) {
            redirectToLogin()
            return
        }

        try {
            const response = await fetch('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ajussiId }),
            })

            const result = await response.json()

            if (result.success) {
                if (result.action === 'added') {
                    success('즐겨찾기 추가', '즐겨찾기에 추가되었습니다.')
                    setFavoriteIds(prev => new Set([...Array.from(prev), ajussiId]))
                    pushToDataLayer({
                        event: 'favorite_added',
                        ajussiId,
                        location: 'home',
                    })
                } else if (result.action === 'removed') {
                    success('즐겨찾기 해제', '즐겨찾기에서 제거되었습니다.')
                    setFavoriteIds(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(ajussiId)
                        return newSet
                    })
                    pushToDataLayer({
                        event: 'favorite_removed',
                        ajussiId,
                        location: 'home',
                    })
                }
            } else {
                error('오류 발생', result.error || '즐겨찾기 처리 중 오류가 발생했습니다.')
            }
        } catch (err) {
            console.error('Error toggling favorite:', err)
            error('오류 발생', '즐겨찾기 처리 중 오류가 발생했습니다.')
        }
    }

    if (!initialData || initialData.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>아직 등록된 아저씨가 없습니다.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {initialData.slice(0, 4).map((ajussi) => (
                <AjussiCard
                    key={ajussi.id}
                    ajussi={ajussi}
                    onFavorite={handleFavorite}
                    isFavorited={favoriteIds.has(ajussi.user_id)}
                    showFavorite={true}
                />
            ))}
        </div>
    )
}
