import { Button } from '@/components/ui/Button'
import { Container } from '@/components/layout/Container'
import Link from 'next/link'
import { Star, Users, Clock, Shield } from 'lucide-react'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 lg:py-24">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              아저씨 렌탈 서비스
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              산책, 대화, 조언 등 다양한 활동을 함께할 아저씨를 찾아보세요.<br />
              새로운 경험과 따뜻한 만남이 기다립니다.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link href="/ajussi">아저씨 찾기</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="text-lg px-8 py-3">
                <Link href="/guide">이용 가이드</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100+</div>
                <div className="text-sm text-gray-600">등록된 아저씨</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-gray-600">성사된 만남</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.8</div>
                <div className="text-sm text-gray-600">평균 만족도</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-gray-600">고객 지원</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-24 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              다양한 서비스
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              아저씨들과 함께할 수 있는 다양한 활동들을 만나보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-6">🚶‍♂️</div>
              <h3 className="text-xl font-semibold mb-4">산책 동행</h3>
              <p className="text-gray-600 mb-4">
                공원이나 동네를 함께 걸으며 건강한 시간을 보내세요. 
                올바른 걷기 자세와 건강 관리 팁도 함께 배울 수 있습니다.
              </p>
              <div className="text-sm text-primary font-medium">
                시간당 15,000원부터
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-6">💬</div>
              <h3 className="text-xl font-semibold mb-4">대화 상대</h3>
              <p className="text-gray-600 mb-4">
                인생 경험이 풍부한 아저씨와 의미있는 대화를 나누세요. 
                고민 상담부터 일상 이야기까지 편안하게 대화할 수 있습니다.
              </p>
              <div className="text-sm text-primary font-medium">
                시간당 20,000원부터
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-6">💡</div>
              <h3 className="text-xl font-semibold mb-4">조언 & 멘토링</h3>
              <p className="text-gray-600 mb-4">
                인생 선배의 지혜로운 조언과 멘토링을 받아보세요. 
                취업, 인간관계, 인생 설계 등 다양한 분야의 조언을 받을 수 있습니다.
              </p>
              <div className="text-sm text-primary font-medium">
                시간당 25,000원부터
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
              왜 아저씨 렌탈인가요?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              안전하고 신뢰할 수 있는 서비스로 특별한 경험을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">안전한 만남</h3>
              <p className="text-gray-600 text-sm">
                신원 확인된 아저씨들과 공개된 장소에서 안전하게 만나세요
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">검증된 품질</h3>
              <p className="text-gray-600 text-sm">
                리뷰와 평점 시스템으로 검증된 고품질 서비스를 제공합니다
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">유연한 시간</h3>
              <p className="text-gray-600 text-sm">
                원하는 시간과 장소에서 자유롭게 서비스를 이용하세요
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">다양한 선택</h3>
              <p className="text-gray-600 text-sm">
                지역, 연령, 관심사별로 다양한 아저씨를 선택할 수 있습니다
              </p>
            </div>
          </div>
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
              새로운 만남과 경험이 기다리고 있습니다. 
              지금 바로 아저씨를 찾아보세요!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
                <Link href="/ajussi">아저씨 찾기</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary">
                <Link href="/mypage/become-ajussi">아저씨 되기</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}