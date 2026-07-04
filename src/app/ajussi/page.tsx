'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/layout/Container'
import { SearchFilter, FilterOptions } from '@/components/ajussi/SearchFilter'
import { AjussiCard } from '@/components/ajussi/AjussiCard'
import { Loading } from '@/components/ui/Loading'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/providers/AuthProvider'
import { redirectToLogin } from '@/lib/auth-utils'
import { AjussiWithProfile } from '@/types/database'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ApiResponse {
  success: boolean
  data: AjussiWithProfile[]
  meta: {
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export default function AjussiListPage() {
  const [ajussiList, setAjussiList] = useState<AjussiWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  const { isAuthenticated } = useAuth()
  const { success, error } = useToast()

  const fetchFavorites = async () => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set())
      return
    }

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

  const fetchAjussiList = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      })

      if (newFilters.search) params.append('search', newFilters.search)
      if (newFilters.location) params.append('location', newFilters.location)
      if (newFilters.tags?.length) params.append('tags', newFilters.tags.join(','))
      if (newFilters.minRate) params.append('minRate', newFilters.minRate.toString())
      if (newFilters.maxRate) params.append('maxRate', newFilters.maxRate.toString())

      const response = await fetch(`/api/ajussi?${params}`)
      const data: ApiResponse = await response.json()

      if (data.success) {
        setAjussiList(data.data)
        setCurrentPage(data.meta.pagination.page)
        setTotalPages(data.meta.pagination.totalPages)
        setTotal(data.meta.pagination.total)
      } else {
        error('오류 발생', '아저씨 목록을 불러오는데 실패했습니다.')
      }
    } catch (err) {
      console.error('Error fetching ajussi list:', err)
      error('오류 발생', '아저씨 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 목록과 즐겨찾기를 분리 - 로그인 상태가 늦게 확정되어도 목록 전체를 다시 불러오지 않는다
  useEffect(() => {
    fetchAjussiList(1, filters)
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    fetchFavorites()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handlePageChange = (page: number) => {
    fetchAjussiList(page, filters)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
          setFavoriteIds(prev => new Set(Array.from(prev).concat(ajussiId)))
        } else if (result.action === 'removed') {
          success('즐겨찾기 해제', '즐겨찾기에서 제거되었습니다.')
          setFavoriteIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(ajussiId)
            return newSet
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

  return (
    <>
      <Container className="py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">아저씨 찾기</h1>
          <p className="text-gray-600 mt-1">다양한 활동을 함께할 아저씨를 찾아보세요</p>
        </div>

        <div className="space-y-6">
          {/* Search and Filter */}
          <SearchFilter
            onFilterChange={handleFilterChange}
            initialFilters={filters}
          />

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              총 <span className="font-semibold text-gray-900">{total}</span>명의 아저씨가 있습니다
            </p>
            {Object.keys(filters).length > 0 && (
              <p className="text-sm text-gray-500">
                페이지 {currentPage} / {totalPages}
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-12">
              <Loading size="lg" text="아저씨 목록을 불러오는 중..." />
            </div>
          )}

          {/* Empty State */}
          {!loading && ajussiList.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-600 mb-4">
                다른 조건으로 검색해보시거나 필터를 조정해보세요.
              </p>
              <Button
                variant="outline"
                onClick={() => setFilters({})}
              >
                필터 초기화
              </Button>
            </div>
          )}

          {/* Ajussi Grid */}
          {!loading && ajussiList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {ajussiList.map((ajussi) => (
                <AjussiCard
                  key={ajussi.id}
                  ajussi={ajussi}
                  onFavorite={handleFavorite}
                  isFavorited={favoriteIds.has(ajussi.user_id)}
                  showFavorite={true}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
              </Button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                다음
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </Container>
    </>
  )
}