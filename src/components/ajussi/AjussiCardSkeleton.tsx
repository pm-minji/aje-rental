// src/components/ajussi/AjussiCardSkeleton.tsx

import { Card } from '@/components/ui/Card'

/**
 * @function AjussiCardSkeleton
 * @description AjussiCard 컴포넌트의 로딩 상태를 보여주는 스켈레TON UI입니다.
 * 실제 데이터가 로드되기 전에 사용자가 보게 될 화면의 레이아웃을 미리 보여주어
 * 사용자 경험(UX)을 향상시킵니다.
 * @returns {JSX.Element} - 스켈레톤 카드 UI.
 */
export function AjussiCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="animate-pulse space-y-4">
        {/* 상단: 프로필 이미지, 이름 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>

        {/* 본문: 소개글 */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* 하단: 가격, 지역 */}
        <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700 mr-2"></div>
            <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700 mr-2"></div>
            <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </Card>
  )
}
