'use client'

import Link from 'next/link'
import { Heart, MapPin, Clock, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { AjussiWithProfile } from '@/types/database'

/**
 * @interface AjussiCardProps
 * @description AjussiCard 컴포넌트가 받는 props의 타입 정의입니다.
 * @property {AjussiWithProfile} ajussi - 화면에 표시할 아저씨의 상세 정보 객체.
 * @property {function} [onFavorite] - '좋아요' 버튼 클릭 시 호출될 함수. 아저씨의 user_id를 인자로 받습니다.
 * @property {boolean} [isFavorited] - 현재 이 아저씨가 '좋아요' 목록에 포함되어 있는지 여부.
 * @property {boolean} [showFavorite] - '좋아요' 버튼을 표시할지 여부.
 */
interface AjussiCardProps {
  ajussi: AjussiWithProfile
  onFavorite?: (id: string) => void
  isFavorited?: boolean
  showFavorite?: boolean
}

/**
 * @function AjussiCard
 * @description 개별 아저씨의 정보를 보여주는 카드 형태의 UI 컴포넌트입니다.
 * @param {AjussiCardProps} props - 컴포넌트가 받는 props.
 * @returns {JSX.Element} - 아저씨 정보 카드 UI.
 */
export function AjussiCard({ 
  ajussi, 
  onFavorite, 
  isFavorited = false,
  showFavorite = true 
}: AjussiCardProps): JSX.Element {

  // 데이터가 없는 경우를 대비한 방어 코드. ajussi 객체나 profiles가 없으면 빈 카드를 렌더링합니다.
  if (!ajussi?.profiles) {
    // 실제 운영 환경에서는 스켈레톤 UI나 에러 메시지를 보여주는 것이 더 좋습니다.
    return <Card className="p-4 text-center text-gray-500">정보를 불러올 수 없습니다.</Card>;
  }

  /**
   * @function handleFavoriteClick
   * @description '좋아요' 버튼 클릭 이벤트를 처리하는 함수입니다.
   * Link 컴포넌트의 기본 동작(페이지 이동)을 막고, onFavorite 콜백 함수를 호출합니다.
   * @param {React.MouseEvent} e - 마우스 이벤트 객체.
   */
  const handleFavoriteClick = (e: React.MouseEvent): void => {
    e.preventDefault(); // 링크 이동 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    onFavorite?.(ajussi.user_id); // 부모 컴포넌트로부터 받은 onFavorite 함수 호출
  };

  // 비구조화 할당을 통해 필요한 데이터를 미리 추출하고, 기본값을 제공하여 안정성을 높입니다.
  const { profiles, title, description, tags = [], hourly_rate, available_areas = [], id, user_id } = ajussi;
  const { profile_image, name, nickname } = profiles;

  return (
    // Card 컴포넌트에 디자인 시스템에 정의된 스타일과 함께 커스텀 스타일을 적용합니다.
    // 호버 시 부드럽게 확대되고 그림자가 생기는 효과(transition, transform, shadow)를 추가하여 입체감을 줍니다.
    <Card
      as="div"
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:shadow-slate-700/[.7]"
    >
      {/* Link 컴포넌트로 카드 전체를 감싸 상세 페이지로 이동할 수 있도록 합니다. */}
      <Link href={`/ajussi/${id}`} className="flex h-full flex-col p-6">
        <div className="flex-grow space-y-4">
          {/* 상단: 프로필 이미지, 이름, '좋아요' 버튼 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                src={profile_image}
                alt={name ?? '아저씨 프로필'}
                size="lg"
                fallback={name?.[0] ?? '아'}
              />
              <div className="flex-1">
                <h3 className="truncate font-bold text-lg text-gray-800 dark:text-white">
                  {title ?? '타이틀 없음'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {nickname ?? name ?? '이름 없음'}
                </p>
              </div>
            </div>
            
            {/* '좋아요' 버튼: showFavorite prop이 true일 때만 렌더링됩니다. */}
            {showFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteClick}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/70 backdrop-blur-sm transition-colors duration-200 hover:bg-red-50 dark:bg-gray-800/70"
                aria-label={isFavorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              >
                <Heart
                  className={`h-5 w-5 transition-all duration-200 ${
                    isFavorited 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-400 group-hover:text-red-400'
                  }`}
                  strokeWidth={isFavorited ? 0 : 2}
                />
              </Button>
            )}
          </div>

          {/* 본문: 아저씨 소개글 */}
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-3" style={{ minHeight: '60px' }}>
            {description ?? '소개글이 없습니다.'}
          </p>

          {/* 태그: 3개까지만 보여주고, 나머지는 "+N" 형태로 표시합니다. */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" size="sm" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" size="sm">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* 하단: 시간당 가격, 활동 지역 정보 */}
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            <span className="font-bold text-primary text-base">
              {formatCurrency(hourly_rate ?? 0)}/시간
            </span>
          </div>

          {available_areas.length > 0 && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="truncate">
                {/* 2개까지만 보여주고, 나머지는 "외 N곳" 형태로 표시합니다. */}
                {available_areas.slice(0, 2).join(', ')}
                {available_areas.length > 2 && ` 외 ${available_areas.length - 2}곳`}
              </span>
            </div>
          )}
        </div>
      </Link>
    </Card>
  )
}