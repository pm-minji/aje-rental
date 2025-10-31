'use client'

import { useState, useRef } from 'react'
import { Camera, X, Upload } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { createClientSupabase } from '@/lib/supabase'

interface ImageUploadProps {
  currentImage?: string | null
  onImageChange: (imageUrl: string | null) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function ImageUpload({ 
  currentImage, 
  onImageChange, 
  size = 'xl',
  className = '' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { success, error } = useToast()
  const supabase = createClientSupabase()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error('파일 오류', '이미지 파일만 업로드 가능합니다.')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      error('파일 크기 오류', '파일 크기는 5MB 이하여야 합니다.')
      return
    }

    try {
      setUploading(true)

      // Convert to Base64 for simple storage
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64String = e.target?.result as string
        setPreviewUrl(base64String)
        onImageChange(base64String)
        success('업로드 완료', '프로필 이미지가 업로드되었습니다.')
        setUploading(false)
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
      
      reader.onerror = () => {
        error('업로드 실패', '이미지 읽기 중 오류가 발생했습니다.')
        setUploading(false)
      }
      
      reader.readAsDataURL(file)

    } catch (err) {
      console.error('Error uploading image:', err)
      error('업로드 실패', '이미지 업로드 중 오류가 발생했습니다.')
      setUploading(false)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    onImageChange(null)
    success('삭제 완료', '프로필 이미지가 삭제되었습니다.')
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative">
        <Avatar
          src={previewUrl}
          alt="프로필 이미지"
          size={size}
          fallback="프로필"
        />
        
        {/* Upload/Change Button */}
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={uploading}
          className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>

        {/* Remove Button */}
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {previewUrl ? '이미지 변경' : '이미지 업로드'}
        </Button>
        
        <p className="text-xs text-gray-500 mt-2">
          JPG, PNG 파일 (최대 5MB)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}