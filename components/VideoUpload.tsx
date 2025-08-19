'use client'

import { useState } from 'react'
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'

interface VideoUploadProps {
  onUploadComplete: (url: string) => void
  onUploadError: (error: string) => void
  className?: string
}

export default function VideoUpload({ onUploadComplete, onUploadError, className = '' }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const uploadVideo = async (file: File) => {
    try {
      setUploading(true)
      setUploadProgress(0)

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `videos/${fileName}`

      console.log('Starting upload to course-videos bucket...')
      console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type)

      // Upload to Supabase Storage directly (bucket exists)
      const { data, error } = await supabase.storage
        .from('course-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error details:', error)
        if (error.message.includes('Bucket not found')) {
          throw new Error('Bucket course-videos not found. Please check Supabase Storage configuration.')
        } else if (error.message.includes('policy')) {
          throw new Error('Storage policy error. Please check Supabase Storage policies.')
        } else {
          throw error
        }
      }

      console.log('Upload successful:', data)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-videos')
        .getPublicUrl(filePath)

      console.log('Public URL:', publicUrl)
      setUploadProgress(100)
      onUploadComplete(publicUrl)
    } catch (error: any) {
      console.error('Error uploading video:', error)
      if (error?.message?.includes('Bucket not found')) {
        onUploadError('Bucket course-videos غير موجود. يرجى التحقق من إعدادات Supabase Storage.')
      } else if (error?.message?.includes('policy')) {
        onUploadError('خطأ في سياسات التخزين. يرجى التحقق من الـ policies في Supabase.')
      } else {
        onUploadError(`حدث خطأ أثناء رفع الفيديو: ${error?.message || 'خطأ غير معروف'}`)
      }
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('video/')) {
        uploadVideo(file)
      } else {
        onUploadError('يرجى اختيار ملف فيديو صحيح')
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (file.type.startsWith('video/')) {
        uploadVideo(file)
      } else {
        onUploadError('يرجى اختيار ملف فيديو صحيح')
      }
    }
  }

  return (
    <div className={className}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-4">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {uploading ? 'جاري رفع الفيديو...' : 'رفع فيديو'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              اسحب وأفلت ملف الفيديو هنا أو انقر للاختيار
            </p>
          </div>

          {uploading && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400">
            يدعم: MP4, AVI, MOV, WMV (الحد الأقصى: 100MB)
          </div>
        </div>
      </div>
    </div>
  )
}
