'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

export interface FilterOptions {
  search?: string
  location?: string
}

interface SearchFilterProps {
  onFilterChange: (filters: FilterOptions) => void
  initialFilters?: FilterOptions
}

export function SearchFilter({ onFilterChange, initialFilters = {} }: SearchFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)
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

  const handleLocationToggle = (location: string) => {
    const newLocation = filters.location === location ? undefined : location
    const newFilters = { ...filters, location: newLocation }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearSearch = () => {
    setSearchInput('')
    const newFilters = { ...filters, search: undefined }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="아저씨 닉네임 또는 #해시태그로 검색..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchInput && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Location Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 mr-2">활동 지역:</span>
        <button
          onClick={() => handleLocationToggle('Seoul')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.location === 'Seoul'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          서울 (오프라인)
        </button>
        <button
          onClick={() => handleLocationToggle('Online')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filters.location === 'Online'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          온라인
        </button>
        {filters.location && (
          <button
            onClick={() => handleLocationToggle(filters.location!)}
            className="text-sm text-gray-500 hover:text-gray-700 ml-2"
          >
            전체 보기
          </button>
        )}
      </div>

      {/* Active Search Display */}
      {searchInput && (
        <div className="flex items-center gap-2">
          <Badge variant="info" className="flex items-center gap-1">
            검색: {searchInput}
            <button
              onClick={clearSearch}
              className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
    </div>
  )
}