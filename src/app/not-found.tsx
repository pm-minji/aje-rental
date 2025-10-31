'use client'
import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <Container className="py-16">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              홈으로 이동
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            이전 페이지로
          </Button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>문제가 지속되면 고객센터로 문의해주세요.</p>
          <p className="mt-1">
            이메일: <a href="mailto:support@ajussi-rental.com" className="text-primary hover:underline">
              support@ajussi-rental.com
            </a>
          </p>
        </div>
      </div>
    </Container>
  )
}
