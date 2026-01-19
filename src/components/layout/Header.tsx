'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Menu, X, User, LogOut, Settings, Heart, Shield } from 'lucide-react'

export default function Header() {
  const { isAuthenticated, profile, signOut, loading, isAjussi } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAdmin = profile?.role === 'admin'

  const handleSignOut = async () => {
    try {
      await signOut()
      setMobileMenuOpen(false)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-primary hover:text-primary/80 transition-colors"
            onClick={closeMobileMenu}
          >
            아저씨렌탈
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/ajussi"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              아저씨 찾기
            </Link>
            <Link
              href="/guide"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              이용 가이드
            </Link>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 hidden lg:block">
                  안녕하세요, {profile?.nickname || profile?.name}님
                </span>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    관리자
                  </Link>
                )}
                <Link
                  href="/mypage"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  마이페이지
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900"
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href="/auth/login">
                  로그인
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Navigation Links */}
              <Link
                href="/ajussi"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                아저씨 찾기
              </Link>
              <Link
                href="/guide"
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                이용 가이드
              </Link>

              {/* Auth Section */}
              {loading ? (
                <div className="px-3 py-2">
                  <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                </div>
              ) : isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="px-3 py-2 border-t">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {profile?.profile_image ? (
                          <img
                            src={profile.profile_image}
                            alt="프로필"
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {profile?.nickname || profile?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isAjussi ? '아저씨' : '일반 사용자'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <Shield className="h-4 w-4 mr-3" />
                      관리자
                    </Link>
                  )}

                  <Link
                    href="/mypage"
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-4 w-4 mr-3" />
                    마이페이지
                  </Link>

                  <Link
                    href="/mypage/favorites"
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Heart className="h-4 w-4 mr-3" />
                    즐겨찾기
                  </Link>

                  <Link
                    href="/mypage/settings"
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    설정
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    로그아웃
                  </button>
                </>
              ) : (
                <div className="px-3 py-2 border-t">
                  <Button asChild className="w-full">
                    <Link href="/auth/login" onClick={closeMobileMenu}>
                      로그인
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}