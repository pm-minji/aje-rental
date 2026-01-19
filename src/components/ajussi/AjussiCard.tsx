'use client'

import Link from 'next/link'
import { Heart, MapPin, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { AjussiWithProfile } from '@/types/database'

interface AjussiCardProps {
  ajussi: AjussiWithProfile
  onFavorite?: (id: string) => void
  isFavorited?: boolean
  showFavorite?: boolean
}

export function AjussiCard({
  ajussi,
  onFavorite,
  isFavorited = false,
  showFavorite = true
}: AjussiCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite?.(ajussi.user_id)
  }

  return (
    <Card hover className="relative overflow-hidden">
      <Link href={`/ajussi/${ajussi.id}`}>
        <div className="space-y-4">
          {/* Header with Avatar and Favorite */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar
                src={ajussi.profiles?.profile_image}
                alt={ajussi.profiles?.name || '아저씨'}
                size="lg"
                fallback={ajussi.profiles?.name || '?'}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {ajussi.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {ajussi.profiles?.nickname || ajussi.profiles?.name || ''}
                </p>
              </div>
            </div>

            {showFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className="h-8 w-8 p-0 hover:bg-red-50"
              >
                <Heart
                  className={`h-4 w-4 ${isFavorited
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-400 hover:text-red-500'
                    }`}
                />
              </Button>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {ajussi.description}
          </p>

          {/* Tags */}
          {ajussi.tags && ajussi.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {ajussi.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
              {ajussi.tags.length > 3 && (
                <Badge variant="secondary" size="sm">
                  +{ajussi.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Info */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span className="font-semibold text-primary">
                {formatCurrency(ajussi.hourly_rate)}/시간
              </span>
            </div>

            {ajussi.available_areas && ajussi.available_areas.length > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="truncate">
                  {ajussi.available_areas.slice(0, 2).join(', ')}
                  {ajussi.available_areas.length > 2 && ` 외 ${ajussi.available_areas.length - 2}곳`}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </Card>
  )
}