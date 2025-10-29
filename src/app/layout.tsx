import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: '아저씨 렌탈 서비스',
    template: '%s | 아저씨 렌탈 서비스',
  },
  description: '다양한 활동을 함께할 아저씨를 찾아보세요. 산책, 대화, 조언 등 새로운 경험과 따뜻한 만남이 기다립니다.',
  keywords: ['아저씨', '렌탈', '산책', '대화', '조언', '멘토링', '동행', '서울', '활동', '만남'],
  authors: [{ name: '아저씨 렌탈 서비스' }],
  creator: '아저씨 렌탈 서비스',
  metadataBase: new URL('https://ajussi-rental.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://ajussi-rental.com',
    title: '아저씨 렌탈 서비스',
    description: '다양한 활동을 함께할 아저씨를 찾아보세요. 산책, 대화, 조언 등 새로운 경험과 따뜻한 만남이 기다립니다.',
    siteName: '아저씨 렌탈 서비스',
  },
  twitter: {
    card: 'summary_large_image',
    title: '아저씨 렌탈 서비스',
    description: '다양한 활동을 함께할 아저씨를 찾아보세요',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-1 bg-white">
                  {children}
                </main>
                <Footer />
              </div>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}