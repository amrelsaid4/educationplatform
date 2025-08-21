'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline'
import { updateCourse, getCourseById } from '../../../../../../lib/course-utils'
import { getCurrentUser } from '../../../../../../lib/auth-utils'
import { supabase } from '../../../../../../lib/supabase'
import DashboardLayout from '../../../../../../components/layouts/DashboardLayout'

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category: '',
    price: 0,
    is_free: false,
    language: 'ar',
    status: 'draft' as 'draft' | 'published' | 'archived'
  })

  useEffect(() => {
    loadData()
  }, [courseId])

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
      setFormData({
        title: courseData.title || '',
        description: courseData.description || '',
        level: courseData.level || 'beginner',
        category: courseData.category || '',
        price: courseData.price || 0,
        is_free: courseData.is_free || false,
        language: courseData.language || 'ar',
        status: courseData.status || 'draft'
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
              type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('يرجى إدخال عنوان الكورس')
      return
    }

    try {
      setSaving(true)
      
      const { data: updatedCourse, error } = await updateCourse(courseId, {
        ...formData,
        price: formData.is_free ? 0 : parseFloat(formData.price.toString())
      })

      if (error) {
        throw error
      }

      alert('تم تحديث الكورس بنجاح')
      router.push(`/dashboard/teacher/courses/${courseId}`)
    } catch (error) {
      console.error('Error updating course:', error)
      alert('حدث خطأ أثناء تحديث الكورس')
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
                تعديل الكورس
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                تحديث معلومات الكورس
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              معلومات الكورس الأساسية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  عنوان الكورس *
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
                  المستوى
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="beginner">مبتدئ</option>
                  <option value="intermediate">متوسط</option>
                  <option value="advanced">متقدم</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الفئة
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="مثال: برمجة، تصميم، تسويق"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اللغة
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                وصف الكورس
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="وصف مفصل للكورس ومحتواه..."
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              التسعير
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_free"
                  checked={formData.is_free}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  كورس مجاني
                </label>
              </div>

              {!formData.is_free && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    السعر (بالدولار)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              حالة الكورس
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الحالة
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
                <option value="archived">مؤرشف</option>
              </select>
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
