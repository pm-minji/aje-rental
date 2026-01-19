import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

interface FooterProps {
  showFullFooter?: boolean;
}

export default function Footer({ showFullFooter = true }: FooterProps) {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        {showFullFooter ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* 브랜드 정보 */}
            <div className="md:col-span-2">
              <h3 className="font-bold text-xl text-gray-900 mb-4">아저씨렌탈</h3>
              <p className="text-gray-600 text-sm mb-4 max-w-md">
                다양한 활동을 함께할 아저씨를 찾아보세요.
                산책, 대화, 조언 등 새로운 경험과 따뜻한 만남이 기다립니다.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@ajussi-rental.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>1588-0000</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>서울특별시 강남구</span>
                </div>
              </div>
            </div>

            {/* 서비스 링크 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">서비스</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/ajussi"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    아저씨 찾기
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guide"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    이용 가이드
                  </Link>
                </li>
                <li>
                  <Link
                    href="/mypage/become-ajussi"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    아저씨 되기
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guide#faq"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    자주 묻는 질문
                  </Link>
                </li>
              </ul>
            </div>

            {/* 고객지원 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">고객지원</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="mailto:joon@pm-minji.com?subject=[문의]"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    문의하기
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:joon@pm-minji.com?subject=[신고]"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    신고하기
                  </a>
                </li>
              </ul>
            </div>
          </div>
        ) : null}

        <div className={`${showFullFooter ? 'mt-8 pt-8 border-t border-gray-200' : ''} flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500`}>
          <div>
            © 2024 아저씨렌탈. All rights reserved.
          </div>
          <div className="mt-2 sm:mt-0">
            <span>Made with ❤️ in Seoul</span>
          </div>
        </div>
      </div>
    </footer>
  )
}