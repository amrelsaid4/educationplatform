'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline'
import { createLesson, getCourseById } from '../../../../../../../lib/course-utils'
import { getCurrentUser } from '../../../../../../../lib/auth-utils'
import { supabase } from '../../../../../../../lib/supabase'
import DashboardLayout from '../../../../../../../components/layouts/DashboardLayout'
import VideoUpload from '../../../../../../../components/VideoUpload'

export default function CreateLessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    content: '',
    duration_minutes: 0,
    order_index: 1,
    is_free: false,
    resources_urls: [] as string[]
  })

  useEffect(() => {
    loadData()
  }, [courseId])

  const loadData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { user: userProfile } = await getCurrentUser(user.id)
        setCurrentUser(userProfile)
      }

      // Get course details
      const { data: courseData } = await getCourseById(courseId)
      if (courseData) {
        setCourse(courseData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) {
      alert('يجب تسجيل الدخول أولاً')
      return
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      setLoading(true)
      
      const { data, error } = await createLesson({
        ...formData,
        course_id: courseId
      })

      if (error) {
        alert('حدث خطأ أثناء إنشاء الدرس')
        return
      }

      alert('تم إنشاء الدرس بنجاح!')
      router.push(`/dashboard/teacher/courses/${courseId}`)
    } catch (error) {
      console.error('Error creating lesson:', error)
      alert('حدث خطأ أثناء إنشاء الدرس')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleVideoUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData(prev => ({ ...prev, video_url: value }))
    
    // Try to get video duration if it's a valid URL
    if (value && value.startsWith('http')) {
      try {
        const video = document.createElement('video')
        video.src = value
        video.preload = 'metadata'
        
        video.onloadedmetadata = () => {
          const durationInMinutes = Math.ceil(video.duration / 60)
          setFormData(prev => ({ 
            ...prev, 
            video_url: value,
            duration_minutes: durationInMinutes
          }))
        }
        
        video.onerror = () => {
          // If we can't get duration, just update the URL
          setFormData(prev => ({ ...prev, video_url: value }))
        }
      } catch (error) {
        console.warn('Could not get video duration:', error)
        setFormData(prev => ({ ...prev, video_url: value }))
      }
    }
  }

  const addResourceUrl = () => {
    setFormData(prev => ({
      ...prev,
      resources_urls: [...prev.resources_urls, '']
    }))
  }

  const updateResourceUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      resources_urls: prev.resources_urls.map((url, i) => i === index ? value : url)
    }))
  }

  const removeResourceUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources_urls: prev.resources_urls.filter((_, i) => i !== index)
    }))
  }

  if (!course) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
        <div className="py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                الكورس غير موجود
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                عذراً، الكورس الذي تبحث عنه غير متاح
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="teacher" userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
      <div className="py-6 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                رجوع
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إضافة درس جديد</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              إضافة درس جديد إلى كورس: {course.title}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  معلومات الدرس
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      عنوان الدرس *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="أدخل عنوان الدرس"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ترتيب الدرس
                    </label>
                    <input
                      type="number"
                      name="order_index"
                      value={formData.order_index}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    وصف الدرس *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="اكتب وصفاً للدرس"
                    required
                  />
                </div>
              </div>

              {/* Video Content */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  محتوى الفيديو
                </h3>
                
                {/* Video Upload Component */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رفع فيديو جديد
                  </label>
                                <VideoUpload
                onUploadComplete={(url, duration) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    video_url: url,
                    duration_minutes: duration || prev.duration_minutes
                  }))
                }}
                onUploadError={(error) => {
                  alert(error)
                }}
              />
                </div>

                {/* Or use existing URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      أو رابط الفيديو
                    </label>
                                    <input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleVideoUrlChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="https://example.com/video.mp4"
                />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  يمكنك إضافة رابط فيديو من YouTube أو أي منصة أخرى. سيتم تحديث مدة الفيديو تلقائياً عند إدخال الرابط.
                </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      مدة الفيديو (دقائق)
                    </label>
                    <input
                      type="number"
                      name="duration_minutes"
                      value={formData.duration_minutes}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  المحتوى النصي
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    محتوى الدرس
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="اكتب محتوى الدرس النصي..."
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    يمكنك إضافة محتوى نصي إضافي للدرس
                  </p>
                </div>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  الملفات المرفقة
                </h3>
                
                <div className="space-y-4">
                  {formData.resources_urls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateResourceUrl(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="رابط الملف المرفق"
                      />
                      <button
                        type="button"
                        onClick={() => removeResourceUrl(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700 font-medium"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addResourceUrl}
                    className="flex items-center text-teal-600 hover:text-teal-700 font-medium"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    إضافة ملف مرفق
                  </button>
                </div>
              </div>

              {/* Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  إعدادات الدرس
                </h3>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_free"
                    checked={formData.is_free}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    درس مجاني (متاح لجميع الطلاب)
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      إنشاء الدرس
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
