'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export interface FilterOptions {
  search?: string
  location?: string
  tags?: string[]
  minRate?: number
  maxRate?: number
}

interface SearchFilterProps {
  onFilterChange: (filters: FilterOptions) => void
  initialFilters?: FilterOptions
}

const LOCATIONS = [
  { value: '강남구', label: '강남구' },
  { value: '서초구', label: '서초구' },
  { value: '송파구', label: '송파구' },
  { value: '마포구', label: '마포구' },
  { value: '용산구', label: '용산구' },
  { value: '중구', label: '중구' },
  { value: '영등포구', label: '영등포구' },
  { value: '종로구', label: '종로구' },
  { value: '성동구', label: '성동구' },
  { value: '광진구', label: '광진구' },
]

const TAGS = [
  '산책', '대화', '조언', '멘토링', '운동', '건강관리',
  '취업상담', '직장생활', '인생상담', '카페', '공원',
  '문화생활', '독서', '음악', '영화', '요리'
]

const RATE_RANGES = [
  { value: '', label: '전체 요금' },
  { value: '0-15000', label: '1만5천원 이하' },
  { value: '15000-25000', label: '1만5천원 - 2만5천원' },
  { value: '25000-35000', label: '2만5천원 - 3만5천원' },
  { value: '35000-', label: '3만5천원 이상' },
]

export function SearchFilter({ onFilterChange, initialFilters = {} }: SearchFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchInput, setSearchInput] = useState(initialFilters.search || '')

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchInput !== filters.search) {
        const newFilters = { ...filters, search: searchInput || undefined }
        setFilters(newFilters)
        onFilterChange(newFilters)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchInput])

  const handleLocationChange = (location: string) => {
    const newFilters = { ...filters, location: location || undefined }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleRateRangeChange = (range: string) => {
    let minRate: number | undefined
    let maxRate: number | undefined

    if (range) {
      const [min, max] = range.split('-')
      minRate = min ? parseInt(min) : undefined
      maxRate = max ? parseInt(max) : undefined
    }

    const newFilters = { ...filters, minRate, maxRate }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]

    const newFilters = { 
      ...filters, 
      tags: newTags.length > 0 ? newTags : undefined 
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const newFilters: FilterOptions = {}
    setFilters(newFilters)
    setSearchInput('')
    onFilterChange(newFilters)
    setShowAdvanced(false)
  }

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof FilterOptions] !== undefined
  )

  const getCurrentRateRange = () => {
    if (!filters.minRate && !filters.maxRate) return ''
    if (filters.minRate && !filters.maxRate) return `${filters.minRate}-`
    if (!filters.minRate && filters.maxRate) return `0-${filters.maxRate}`
    return `${filters.minRate}-${filters.maxRate}`
  }

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="아저씨 이름이나 서비스 내용을 검색하세요..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          필터
          {hasActiveFilters && (
            <Badge variant="error" size="sm" className="ml-1">
              {Object.keys(filters).length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">상세 필터</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  초기화
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location Filter */}
              <Select
                label="지역"
                placeholder="지역을 선택하세요"
                options={LOCATIONS}
                value={filters.location || ''}
                onChange={(e) => handleLocationChange(e.target.value)}
              />

              {/* Rate Range Filter */}
              <Select
                label="시간당 요금"
                options={RATE_RANGES}
                value={getCurrentRateRange()}
                onChange={(e) => handleRateRangeChange(e.target.value)}
              />
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                서비스 태그
              </label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => {
                  const isSelected = filters.tags?.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        isSelected
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.location && (
            <Badge variant="info" className="flex items-center gap-1">
              지역: {filters.location}
              <button
                onClick={() => handleLocationChange('')}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {(filters.minRate || filters.maxRate) && (
            <Badge variant="info" className="flex items-center gap-1">
              요금: {filters.minRate ? `${filters.minRate.toLocaleString()}원` : '0원'} - 
              {filters.maxRate ? `${filters.maxRate.toLocaleString()}원` : '무제한'}
              <button
                onClick={() => handleRateRangeChange('')}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.tags?.map((tag) => (
            <Badge key={tag} variant="info" className="flex items-center gap-1">
              {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}