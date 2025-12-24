'use client'

// React 및 Next.js에서 필요한 모듈들을 가져옵니다.
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

// UI 컴포넌트들을 가져옵니다.
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/layout/Container'
import { AjussiCard } from '@/components/ajussi/AjussiCard'
import { AjussiCardSkeleton } from '@/components/ajussi/AjussiCardSkeleton' // 스켈레톤 컴포넌트 추가

// 아이콘들을 가져옵니다.
import { Star, Users, Clock, Shield, ArrowRight, TrendingUp } from 'lucide-react'

// 인증 및 UI 피드백을 위한 커스텀 훅을 가져옵니다.
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/ui/Toast'
import { redirectToLogin } from '@/lib/auth-utils'

// TypeScript 타입을 가져옵니다.
import { AjussiWithProfile } from '@/types/database'

/**
 * @page Home
 * @description 웹사이트의 메인 페이지입니다. 서비스 소개, 추천 아저씨 목록 등을 보여줍니다.
 */
export default function Home() {
  // --- 상태 관리 ---
  // featuredAjussi: 추천 아저씨 목록을 저장하는 상태
  const [featuredAjussi, setFeaturedAjussi] = useState<AjussiWithProfile[]>([])
  // loading: 데이터 로딩 상태를 관리하는 상태
  const [loading, setLoading] = useState(true)
  // favoriteIds: 사용자가 즐겨찾기한 아저씨들의 ID를 저장하는 상태 (Set으로 중복 방지 및 빠른 조회)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  // --- 커스텀 훅 사용 ---
  // isAuthenticated: 현재 사용자의 로그인 여부
  const { isAuthenticated } = useAuth()
  // success, error: 사용자에게 피드백 메시지를 보여주기 위한 토스트 함수
  const { success, error } = useToast()

  // --- 데이터 로딩 함수 ---
  /**
   * @function fetchFavorites
   * @description 로그인한 사용자의 즐겨찾기 목록을 서버에서 가져와 상태를 업데이트합니다.
   * useCallback을 사용하여 isAuthenticated가 변경될 때만 함수를 재생성합니다.
   */
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set()) // 로그아웃 상태이면 즐겨찾기 목록을 비웁니다.
      return
    }

    try {
      const response = await fetch('/api/favorites')
      if (!response.ok) throw new Error('서버 응답 오류') // HTTP 응답이 정상이 아닐 경우 에러 발생

      const result = await response.json()
      
      if (result.success && Array.isArray(result.data)) {
        const ids = new Set<string>(result.data.map((fav: any) => fav.ajussi_id))
        setFavoriteIds(ids)
      } else {
        // API 호출은 성공했으나, 데이터 형식이 잘못되었을 경우를 대비
        console.warn('즐겨찾기 데이터를 가져왔지만, 형식이 올바르지 않습니다.', result)
      }
    } catch (err) {
      console.error('즐겨찾기 목록 로딩 중 오류 발생:', err)
      // 사용자에게는 오류 메시지를 보여주지 않아 UX를 해치지 않도록 처리 (선택적)
    }
  }, [isAuthenticated])

  /**
   * @function fetchFeaturedAjussi
   * @description 서버에서 추천 아저씨 목록을 가져와 상태를 업데이트합니다.
   */
  const fetchFeaturedAjussi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ajussi?limit=6&sort=rating')
      if (!response.ok) throw new Error('서버 응답 오류')

      const result = await response.json()
      if (result.success && result.data) {
        setFeaturedAjussi(result.data)
      } else {
        // 데이터 로딩에 실패했을 때 사용자에게 알림
        error('데이터 로딩 실패', '추천 아저씨 목록을 불러오는 데 실패했습니다.')
      }
    } catch (err) {
      console.error('추천 아저씨 목록 로딩 중 오류 발생:', err)
      error('네트워크 오류', '서버와 통신 중 오류가 발생했습니다.')
    } finally {
      setLoading(false) // 성공하든 실패하든 로딩 상태를 해제
    }
  }

  // --- 컴포넌트 생명주기 관리 ---
  // 컴포넌트가 처음 마운트되거나, 사용자의 로그인 상태가 변경될 때 데이터를 새로고침합니다.
  useEffect(() => {
    fetchFeaturedAjussi()
    fetchFavorites()
  }, [fetchFavorites]) // fetchFavorites는 useCallback으로 메모이제이션 되어있으므로, isAuthenticated가 바뀔 때만 변경됩니다.

  // --- 이벤트 핸들러 ---
  /**
   * @function handleFavorite
   * @description 아저씨 카드에서 '좋아요' 버튼을 클릭했을 때 실행되는 함수입니다.
   * @param {string} ajussiId - '좋아요'를 누른 아저씨의 user_id
   */
  const handleFavorite = async (ajussiId: string) => {
    if (!isAuthenticated) {
      redirectToLogin() // 로그인하지 않았다면 로그인 페이지로 이동
      return
    }

    // 낙관적 업데이트(Optimistic Update): 서버 응답을 기다리지 않고 UI를 먼저 변경하여 사용자 경험 향상
    const originalFavorites = new Set(favoriteIds);
    const isCurrentlyFavorited = favoriteIds.has(ajussiId);

    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyFavorited) {
        newSet.delete(ajussiId);
      } else {
        newSet.add(ajussiId);
      }
      return newSet;
    });

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ajussiId }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // 서버 응답이 성공적이면 토스트 메시지를 보여줌
        if (result.action === 'added') {
          success('즐겨찾기 추가', '성공적으로 추가되었습니다.')
        } else if (result.action === 'removed') {
          success('즐겨찾기 해제', '성공적으로 제거되었습니다.')
        }
      } else {
        // 서버에서 오류가 발생하면 UI를 원래 상태로 되돌리고 에러 메시지를 보여줌
        setFavoriteIds(originalFavorites);
        error('오류 발생', result.error || '즐겨찾기 처리 중 오류가 발생했습니다.')
      }
    } catch (err) {
      // 네트워크 오류 등 예외 발생 시에도 UI를 되돌리고 에러 메시지를 보여줌
      setFavoriteIds(originalFavorites);
      console.error('즐겨찾기 토글 중 오류 발생:', err)
      error('네트워크 오류', '서버와 통신 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      {/* --- 히어로 섹션 --- */}
      {/* 화려한 그라데이션 배경과 애니메이션으로 시선을 사로잡는 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-100 via-purple-50 to-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <Container className="relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">내 삶의 새로운 활력,</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                나의 아저씨
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 md:text-xl">
              산책, 대화, 조언이 필요할 때, 인생 경험이 풍부한 아저씨들과 의미 있는 시간을 보내세요.
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="group text-lg px-8 py-4 shadow-lg transition-transform duration-200 hover:scale-105">
                <Link href="/ajussi">
                  아저씨 찾기 <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="text-lg px-8 py-4 transition-transform duration-200 hover:scale-105">
                <Link href="/guide">이용 가이드 보기</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* --- 서비스 소개 섹션 --- */}
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">다양한 활동을 함께</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              아저씨들과 함께할 수 있는 의미있고 즐거운 활동들을 만나보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 각 서비스 카드를 동적으로 생성하면 더 좋을 수 있습니다. */}
            <div className="transform rounded-xl border border-gray-100 bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="mb-6 text-5xl">🚶‍♂️</div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">산책 동행</h3>
              <p className="text-gray-600">공원을 걸으며 건강한 시간을 보내세요. 올바른 자세와 건강 팁도 얻을 수 있습니다.</p>
            </div>
            <div className="transform rounded-xl border border-gray-100 bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="mb-6 text-5xl">💬</div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">대화 상대</h3>
              <p className="text-gray-600">인생 경험이 풍부한 아저씨와 고민 상담부터 일상 이야기까지 편안하게 나눠보세요.</p>
            </div>
            <div className="transform rounded-xl border border-gray-100 bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <div className="mb-6 text-5xl">💡</div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">조언 & 멘토링</h3>
              <p className="text-gray-600">취업, 인간관계, 인생 설계 등 인생 선배의 지혜로운 조언을 받아보세요.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* --- 서비스 특징 섹션 --- */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">신뢰할 수 있는 만남</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              안전하고 믿을 수 있는 환경에서 특별한 경험을 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 각 특징을 아이콘과 함께 시각적으로 강조 */}
            <div className="text-center p-6 bg-white rounded-lg shadow-sm transition-shadow hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">안전한 만남</h3>
              <p className="text-gray-600 text-sm">신원 확인된 아저씨들과 안전하게 만나세요.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm transition-shadow hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">검증된 품질</h3>
              <p className="text-gray-600 text-sm">리뷰와 평점 시스템으로 검증된 서비스를 제공합니다.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm transition-shadow hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">유연한 시간</h3>
              <p className="text-gray-600 text-sm">원하는 시간과 장소에서 자유롭게 이용하세요.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm transition-shadow hover:shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">다양한 선택</h3>
              <p className="text-gray-600 text-sm">지역, 연령, 관심사별로 다양한 아저씨를 선택할 수 있습니다.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* --- 추천 아저씨 섹션 --- */}
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">이주의 인기 아저씨</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              이번 주, 가장 많은 사랑을 받은 아저씨들을 만나보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* 로딩 중일 때는 스켈레톤 UI를, 로딩이 끝나면 실제 데이터를 보여줍니다. */}
            {loading ? (
              // Array.from을 사용하여 6개의 스켈레톤 카드를 렌더링
              Array.from({ length: 6 }).map((_, index) => <AjussiCardSkeleton key={index} />)
            ) : featuredAjussi.length > 0 ? (
              // 데이터가 있을 경우 AjussiCard를 렌더링
              featuredAjussi.map((ajussi) => (
                <AjussiCard
                  key={ajussi.id}
                  ajussi={ajussi}
                  onFavorite={handleFavorite}
                  isFavorited={favoriteIds.has(ajussi.user_id)}
                  showFavorite={true}
                />
              ))
            ) : (
              // 데이터가 없을 경우 메시지를 보여줍니다.
              <div className="col-span-full text-center py-12 text-gray-500">
                <p className="text-lg">😢 추천할 아저씨가 아직 없습니다.</p>
                <p className="mt-2 text-sm">새로운 아저씨들이 곧 등록될 예정입니다.</p>
              </div>
            )}
          </div>

          {/* 데이터가 있을 때만 '더보기' 버튼을 보여줍니다. */}
          {!loading && featuredAjussi.length > 0 && (
            <div className="text-center">
              <Button asChild size="lg" variant="outline" className="group text-lg px-8 py-3 transition-all hover:bg-primary hover:text-white">
                <Link href="/ajussi" className="flex items-center">
                  더 많은 아저씨 보기
                  <ArrowRight className="h-5 w-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          )}
        </Container>
      </section>

      {/* --- CTA (Call To Action) 섹션 --- */}
      {/* 사용자의 행동을 유도하는 마지막 섹션 */}
      <section className="relative bg-gray-800 py-20 lg:py-28 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-primary opacity-80"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-70"></div>
        </div>
        <Container className="relative z-10">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold">
              지금 바로, 새로운 만남을 시작해보세요
            </h2>
            <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
              당신의 삶에 따뜻한 위로와 새로운 활력을 더해줄 아저씨가 기다리고 있습니다.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-4 shadow-lg transition-transform duration-200 hover:scale-105">
                <Link href="/ajussi">내게 맞는 아저씨 찾기</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white text-lg px-8 py-4 transition-all duration-200 hover:scale-105 hover:bg-white hover:text-primary">
                <Link href="/mypage/become-ajussi">아저씨로 활동하기</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}