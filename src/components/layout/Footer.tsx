import Link from 'next/link'
import { Mail } from 'lucide-react'

interface FooterProps {
  showFullFooter?: boolean;
}

export default function Footer({ showFullFooter = true }: FooterProps) {
  return (
    <footer className="bg-gray-50 border-t mt-auto pb-20 lg:pb-0">
      <div className="container mx-auto px-4 py-8">
        {showFullFooter ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 브랜드 정보 */}
            <div>
              <h3 className="font-bold text-xl text-gray-900 mb-4">아저씨렌탈</h3>
              <p className="text-gray-600 text-sm mb-4 max-w-md">
                검증된 아저씨와 함께하는 다양한 활동.
                산책, 대화, 조언 등 새로운 경험이 기다립니다.
              </p>
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:joon@pm-minji.com" className="hover:text-gray-900">
                    joon@pm-minji.com
                  </a>
                </div>
              </div>
            </div>

            {/* 서비스 링크 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">바로가기</h4>
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
              </ul>
            </div>
          </div>
        ) : null}

        <div className={`${showFullFooter ? 'mt-8 pt-8 border-t border-gray-200' : ''} flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500`}>
          <div className="flex items-center space-x-4">
            <span>© 2024 아저씨렌탈</span>
            <Link href="/terms" className="hover:text-gray-900">이용약관</Link>
            <Link href="/privacy" className="hover:text-gray-900">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}