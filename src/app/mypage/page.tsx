'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function MyPage() {
  return (
    <ProtectedRoute>
      <MyPageContent />
    </ProtectedRoute>
  )
}

function MyPageContent() {
  const { profile, isAjussi } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
          <p className="text-gray-600">
            안녕하세요, {profile?.nickname || profile?.name}님!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 프로필 관리 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">프로필 관리</h2>
            <p className="text-gray-600 mb-4">
              개인정보 및 프로필을 수정할 수 있습니다.
            </p>
            <Button asChild>
              <Link href="/mypage/profile">프로필 수정</Link>
            </Button>
          </div>

          {/* 의뢰 관리 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">의뢰 관리</h2>
            <p className="text-gray-600 mb-4">
              {isAjussi ? '받은 의뢰를 확인하고 관리하세요.' : '신청한 의뢰를 확인하고 관리하세요.'}
            </p>
            <Button asChild variant="outline">
              <Link href="/mypage/requests">의뢰 내역</Link>
            </Button>
          </div>

          {/* 아저씨 전용 */}
          {isAjussi && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">아저씨 관리</h2>
              <p className="text-gray-600 mb-4">
                아저씨 프로필과 활동 상태를 관리하세요.
              </p>
              <Button asChild variant="secondary">
                <Link href="/mypage/ajussi">아저씨 설정</Link>
              </Button>
            </div>
          )}

          {/* 즐겨찾기 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">즐겨찾기</h2>
            <p className="text-gray-600 mb-4">
              관심있는 아저씨들을 확인하세요.
            </p>
            <Button asChild variant="ghost">
              <Link href="/mypage/favorites">즐겨찾기</Link>
            </Button>
          </div>

          {/* 리뷰 관리 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">리뷰 관리</h2>
            <p className="text-gray-600 mb-4">
              {isAjussi ? '받은 리뷰를 확인하세요.' : '작성한 리뷰를 관리하세요.'}
            </p>
            <Button asChild variant="ghost">
              <Link href="/mypage/reviews">리뷰 보기</Link>
            </Button>
          </div>

          {/* 일반 사용자가 아저씨 되기 */}
          {!isAjussi && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-primary">아저씨 되기</h2>
              <p className="text-gray-600 mb-4">
                아저씨로 활동하여 다른 사람들에게 도움을 주세요!
              </p>
              <Button asChild>
                <Link href="/mypage/become-ajussi">아저씨 신청</Link>
              </Button>
            </div>
          )}
        </div>

        {/* 계정 설정 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">계정 설정</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" asChild>
              <Link href="/mypage/settings">설정</Link>
            </Button>
            <Button variant="destructive" asChild>
              <Link href="/mypage/delete-account">계정 삭제</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}