import Link from 'next/link'
import { Mail } from 'lucide-react'

interface FooterProps {
  showFullFooter?: boolean;
}

export default function Footer({ showFullFooter = true }: FooterProps) {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        {showFullFooter ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 브랜드 정보 */}
            <div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">아저씨렌탈</h3>
              <p className="text-gray-600 text-sm mb-4">
                검증된 아저씨들의 다양한 재능을 만나보세요.
              </p>
              <a
                href="mailto:joon@pm-minji.com"
                className="inline-flex items-center text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                joon@pm-minji.com
              </a>
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
              </ul>
            </div>

            {/* 고객지원 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">고객지원</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="mailto:joon@pm-minji.com?subject=[문의] 아저씨렌탈"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    문의하기
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:joon@pm-minji.com?subject=[신고] 아저씨렌탈"
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
            © 2025 아저씨렌탈. All rights reserved.
          </div>
          <div className="mt-2 sm:mt-0">
            <span>Made with ❤️ in Seoul</span>
          </div>
        </div>
      </div>
    </footer>
  )
}