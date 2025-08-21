'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline'
import { updateLesson, getLessonById, getCourseById } from '../../../../../../../../lib/course-utils'
import { getCurrentUser } from '../../../../../../../../lib/auth-utils'
import { supabase } from '../../../../../../../../lib/supabase'
import DashboardLayout from '../../../../../../../../components/layouts/DashboardLayout'
import VideoUpload from '../../../../../../../../components/VideoUpload'

export default function EditLessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const lessonId = params.lessonId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [lesson, setLesson] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    content: '',
    duration_minutes: 0,
    order_index: 0,
    is_free: false
  })

  useEffect(() => {
    loadData()
  }, [courseId, lessonId])

  const loadData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { user: currentUser } = await getCurrentUser(user.id)
      if (!currentUser) {
        router.push('/login')
        return
      }

      if (currentUser.role !== 'teacher') {
        router.push('/dashboard')
        return
      }

      setUser(currentUser)

      // تحميل الكورس
      const { data: courseData } = await getCourseById(courseId)
      if (!courseData) {
        alert('الكورس غير موجود')
        router.push('/dashboard/teacher/courses')
        return
      }

      // التحقق من أن المعلم يملك الكورس
      if (courseData.teacher_id !== currentUser.id) {
        alert('ليس لديك صلاحية لتعديل هذا الكورس')
        router.push('/dashboard/teacher/courses')
        return
      }

      setCourse(courseData)

      // تحميل الدرس
      const { data: lessonData } = await getLessonById(lessonId)
      if (!lessonData) {
        alert('الدرس غير موجود')
        router.push(`/dashboard/teacher/courses/${courseId}`)
        return
      }

      // التحقق من أن الدرس ينتمي للكورس
      if (lessonData.course_id !== courseId) {
        alert('الدرس لا ينتمي لهذا الكورس')
        router.push(`/dashboard/teacher/courses/${courseId}`)
        return
      }

      setLesson(lessonData)
      setFormData({
        title: lessonData.title || '',
        description: lessonData.description || '',
        video_url: lessonData.video_url || '',
        content: lessonData.content || '',
        duration_minutes: lessonData.duration_minutes || 0,
        order_index: lessonData.order_index || 0,
        is_free: lessonData.is_free || false
      })
    } catch (error) {
      console.error('Error loading data:', error)
      alert('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('يرجى إدخال عنوان الدرس')
      return
    }

    try {
      setSaving(true)

      const { data: updatedLesson, error } = await updateLesson(lessonId, {
        ...formData,
        duration_minutes: parseInt(formData.duration_minutes.toString()),
        order_index: parseInt(formData.order_index.toString())
      })

      if (error) {
        throw error
      }

      alert('تم تحديث الدرس بنجاح')
      router.push(`/dashboard/teacher/courses/${courseId}`)
    } catch (error) {
      console.error('Error updating lesson:', error)
      alert('حدث خطأ أثناء تحديث الدرس')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={user?.name || ''} userAvatar={user?.avatar_url}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">جاري التحميل...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="teacher" userName={user?.name || ''} userAvatar={user?.avatar_url}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                تعديل الدرس
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                تحديث معلومات الدرس في {course?.title}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              معلومات الدرس الأساسية
            </h2>

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
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  مدة الدرس (بالدقائق)
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_free"
                  checked={formData.is_free}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  درس مجاني
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                وصف الدرس
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="وصف مختصر للدرس..."
              />
            </div>
          </div>

          {/* Video Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              محتوى الفيديو
            </h2>

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
          </div>

          {/* Text Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              المحتوى النصي
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                محتوى الدرس
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="محتوى نصي إضافي للدرس..."
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                يمكنك إضافة ملاحظات أو شرح إضافي للدرس
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <PencilIcon className="w-4 h-4" />
                  <span>حفظ التغييرات</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
