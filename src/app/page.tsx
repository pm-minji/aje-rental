'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/layout/Container'
import { AjussiCard } from '@/components/ajussi/AjussiCard'
import { Loading } from '@/components/ui/Loading'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/components/ui/Toast'
import { redirectToLogin } from '@/lib/auth-utils'
import Link from 'next/link'
import { Star, Users, Clock, Shield, ArrowRight } from 'lucide-react'
import { AjussiWithProfile } from '@/types/database'

export default function Home() {
  const [featuredAjussi, setFeaturedAjussi] = useState<AjussiWithProfile[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    fetchFeaturedAjussi()
    fetchFavorites()
  }, [isAuthenticated])

  const fetchFeaturedAjussi = async () => {
    try {
      const response = await fetch('/api/ajussi?limit=6&sort=rating')
      const result = await response.json()
      if (result.success && result.data) {
        setFeaturedAjussi(result.data)
      }
    } catch (error) {
      console.error('Error fetching featured ajussi:', error)
    } finally {
      setLoading(false)
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
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 lg:py-24">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              아저씨렌탈
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              각 분야의 숨은 고수, 검증된 아저씨들의 재능을<br />
              합리적인 가격으로 이용해보세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link href="/ajussi">아저씨 찾기</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="text-lg px-8 py-3">
                <Link href="/guide">이용 가이드</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              다양한 생활 재능
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              일상의 도움이 필요할 때, 경험 많은 아저씨들의 재능을 활용하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-6">🎓</div>
              <h3 className="text-xl font-semibold mb-4">고민상담 & 멘토링</h3>
              <p className="text-gray-600 mb-4">
                인생 선배의 지혜로운 조언이 필요하신가요?
                취업, 진로, 인간관계 등 깊이 있는 1:1 멘토링을 받아보세요.
              </p>
              <div className="text-sm text-primary font-medium">
                1시간 20,000원 ~ (전문가 매칭)
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-6">🛠️</div>
              <h3 className="text-xl font-semibold mb-4">취미 & 기술 레슨</h3>
              <p className="text-gray-600 mb-4">
                낚시, 바둑, 목공, 운전 연수 팁까지.
                검증된 아저씨들의 숨겨진 특기를 저렴하게 배워보세요.
              </p>
              <div className="text-sm text-primary font-medium">
                1시간 20,000원 ~ (합리적 가격)
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-6">🤝</div>
              <h3 className="text-xl font-semibold mb-4">생활 도움 & 동행</h3>
              <p className="text-gray-600 mb-4">
                혼자하기 힘든 일, 든든한 동행이 필요할 때.
                가구 이동, 쇼핑 동행, 산책 친구가 되어드립니다.
              </p>
              <div className="text-sm text-primary font-medium">
                1시간 20,000원 ~ (안전한 만남)
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 아저씨렌탈인가요?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              신뢰할 수 있는 이웃 전문가를 가장 쉽고 안전하게 만나는 방법
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">철저한 신원 검증</h3>
              <p className="text-gray-600 text-sm">
                실명, 나이, 연락처 인증은 물론<br />관리자 인터뷰를 통과한 분들만 활동합니다.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">검증된 품질</h3>
              <p className="text-gray-600 text-sm">
                실제 이용자들의 리뷰와 평점으로<br />검증된 고품질 서비스를 제공합니다.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">합리적인 비용</h3>
              <p className="text-gray-600 text-sm">
                중개 수수료 거품을 뺀 직거래 방식으로<br />업계 최저가 수준의 비용을 제안합니다.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">다양한 선택</h3>
              <p className="text-gray-600 text-sm">
                우리 동네 숨은 고수부터 전문직 은퇴자까지<br />다양한 아저씨를 만나보세요.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Ajussi Section */}
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              인기 아저씨들
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              높은 평점과 실력을 인정받은 베스트 아저씨들을 만나보세요
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {featuredAjussi && featuredAjussi.length > 0 ? (
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
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <p>아직 등록된 아저씨가 없습니다.</p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3">
                  <Link href="/ajussi" className="flex items-center">
                    더 많은 아저씨 보기
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-primary text-white">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              지금 시작해보세요
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              당신에게 딱 맞는 생활 전문가를 찾는 가장 빠른 방법.<br />
              지금 바로 아저씨렌탈을 시작하세요!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3 bg-white text-primary hover:bg-white text-primary">
                <Link href="/ajussi">아저씨 찾기</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent border-white text-white hover:bg-transparent hover:text-white">
                <Link href="/mypage/become-ajussi">아저씨 등록하기</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}