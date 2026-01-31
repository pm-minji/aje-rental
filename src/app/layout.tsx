import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ToastProvider } from '@/components/ui/Toast'
import AuthLoadingWrapper from '@/components/auth/AuthLoadingWrapper'
import Script from 'next/script'
import GTMTracker from '@/components/analytics/GTMTracker'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  themeColor: '#2563eb',
}

export const metadata: Metadata = {
  title: {
    default: '아저씨렌탈',
    template: '%s | 아저씨렌탈',
  },
  description: '아저씨렌탈에서 다양한 활동을 함께할 아저씨를 찾아보세요. 산책, 대화, 조언 등 새로운 경험과 따뜻한 만남이 기다립니다.',
  keywords: ['아저씨렌탈', '아저씨', '렌탈', '산책', '대화', '조언', '멘토링', '동행', '서울', '활동', '만남'],
  authors: [{ name: '아저씨렌탈' }],
  creator: '아저씨렌탈',
  metadataBase: new URL('https://ajussirental.com'),
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://aje-rental.vercel.app',
    title: '아저씨렌탈',
    description: '아저씨렌탈에서 다양한 활동을 함께할 아저씨를 찾아보세요. 산책, 대화, 조언 등 새로운 경험과 따뜻한 만남이 기다립니다.',
    siteName: '아저씨렌탈',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '아저씨렌탈',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '아저씨렌탈',
    description: '아저씨렌탈에서 다양한 활동을 함께할 아저씨를 찾아보세요',
    images: ['/og-image.png'],
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
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'jcGSsidXGfZXE4Fj5ne1aPLH2-EzvgbU51uMfp6zry8',
  },
  other: {
    'naver-site-verification': '4bf4d478500fe1c1bdf8efbef23f553b',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <Script id="gtm" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-PLQSBK8B');
        `}
      </Script>
      <body className={inter.className}>
        <Suspense>
          <GTMTracker />
        </Suspense>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PLQSBK8B"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <AuthLoadingWrapper>
                <div className="min-h-screen flex flex-col bg-gray-50">
                  <Header />
                  <main className="flex-1 bg-white pb-16 lg:pb-0">
                    {children}
                  </main>
                  <Footer />
                  <BottomNav />
                </div>
              </AuthLoadingWrapper>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}