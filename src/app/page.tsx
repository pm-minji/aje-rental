import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/layout/Container'
import { FeaturedAjussiList } from '@/components/home/FeaturedAjussiList'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { AjussiWithProfile } from '@/types/database'
import { Database } from '@/types/database'

// ISR: 5분마다 재생성 (대부분의 방문자가 캐시된 버전을 봄)
export const revalidate = 300

// Anonymous Supabase client for public data (enables ISR caching)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getFeaturedAjussi(): Promise<AjussiWithProfile[]> {
  const { data, error } = await supabase
    .from('ajussi_profiles')
    .select(`
      *,
      profiles (
        id,
        name,
        nickname,
        profile_image
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching featured ajussi:', error)
    return []
  }

  return (data as AjussiWithProfile[]) || []
}

export default async function Home() {
  // 서버에서 데이터를 미리 가져옴 (HTML에 포함됨)
  const featuredAjussi = await getFeaturedAjussi()

  return (
    <>
      {/* Hero Section - Simplified */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-12">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              🍗 치킨 한 마리 값으로,<br />
              재능 있는 아저씨를 빌려보세요
            </h1>
            <p className="text-lg text-gray-600 mb-8 break-keep">
              <span className="inline-block">요리사 아저씨도,</span>{' '}
              <span className="inline-block">변호사 아저씨도,</span>{' '}
              <span className="inline-block">귀여운 아저씨도.</span><br className="sm:hidden" />
              <span className="inline-block font-semibold text-primary ml-1">이 모든 아저씨가 균일가!</span>
            </p>
            <Button asChild size="lg" className="text-lg px-8 py-3 w-full sm:w-auto">
              <Link href="/ajussi">지금 아저씨 찾기</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Featured Ajussi Section - Server-rendered */}
      <section className="py-12 bg-white">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                인기 아저씨들
              </h2>
              <p className="text-gray-600">
                높은 평점의 베스트 아저씨를 만나보세요
              </p>
            </div>

            {/* Client Component for interactive favorites */}
            <FeaturedAjussiList initialData={featuredAjussi} />

            {featuredAjussi && featuredAjussi.length > 0 && (
              <div className="text-center mt-8">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/ajussi" className="flex items-center justify-center">
                    더 많은 아저씨 보기
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* How It Works - Compact */}
      <section className="py-12 bg-gray-50">
        <Container>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
              이용 방법
            </h2>
            <div className="space-y-4">
              <div className="flex items-center bg-white rounded-lg p-4 shadow-sm">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">아저씨 선택</p>
                  <p className="text-sm text-gray-600">원하는 재능의 아저씨를 찾아보세요</p>
                </div>
              </div>
              <div className="flex items-center bg-white rounded-lg p-4 shadow-sm">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">오픈채팅 문의</p>
                  <p className="text-sm text-gray-600">일정과 내용을 미리 협의하세요</p>
                </div>
              </div>
              <div className="flex items-center bg-white rounded-lg p-4 shadow-sm">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">서비스 요청</p>
                  <p className="text-sm text-gray-600">첫 1시간 20,000원으로 시작!</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Become Ajussi CTA */}
      <section className="py-12 bg-white">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              나도 아저씨가 되고 싶다면?
            </h2>
            <p className="text-gray-600 mb-6">
              숨겨둔 재능으로 용돈도 벌고, 새로운 인연도 만들어보세요.
            </p>
            <Button asChild variant="outline">
              <Link href="/mypage/become-ajussi">아저씨 등록하기</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  )
}