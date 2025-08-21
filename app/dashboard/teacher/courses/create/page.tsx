'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline'
import { createCourse } from '../../../../../lib/course-utils'
import { getCurrentUser } from '../../../../../lib/auth-utils'
import DashboardLayout from '../../../../../components/layouts/DashboardLayout'
import { supabase } from '../../../../../lib/supabase'

export default function CreateCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category: '',
    is_free: false,
    thumbnail_url: ''
  })

  useState(() => {
    // Get current user
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { user: userProfile } = await getCurrentUser(user.id)
        setCurrentUser(userProfile)
      }
    }
    loadUser()
  })

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
      
      const { data, error } = await createCourse({
        ...formData,
        teacher_id: currentUser.id
      })

      if (error) {
        alert('حدث خطأ أثناء إنشاء الكورس')
        return
      }

      alert('تم إنشاء الكورس بنجاح!')
      router.push('/dashboard/teacher/courses')
    } catch (error) {
      console.error('Error creating course:', error)
      alert('حدث خطأ أثناء إنشاء الكورس')
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

  return (
    <DashboardLayout userRole="teacher" userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
      <div className="py-6 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                رجوع
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إضافة كورس جديد</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              قم بإنشاء كورس جديد وإضافة المحتوى التعليمي
            </p>
          </div>

          {/* Form */}
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="w-2 h-8 bg-gradient-to-b from-[#49BBBD] to-[#06b6d4] rounded-full ml-3"></div>
                  المعلومات الأساسية
                </h3>
                
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
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
                      placeholder="أدخل عنوان الكورس"
                      required
                    />
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
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
                      placeholder="مثال: الرياضيات، البرمجة، اللغات"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    وصف الكورس *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="اكتب وصفاً مفصلاً للكورس"
                    required
                  />
                </div>
              </div>

              {/* Course Settings */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="w-2 h-8 bg-gradient-to-b from-[#06b6d4] to-[#0891b2] rounded-full ml-3"></div>
                  إعدادات الكورس
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المستوى
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
                    >
                      <option value="beginner">مبتدئ</option>
                      <option value="intermediate">متوسط</option>
                      <option value="advanced">متقدم</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      السعر (ريال)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      disabled={formData.is_free}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200 disabled:opacity-50"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_free"
                      checked={formData.is_free}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-[#49BBBD] focus:ring-[#49BBBD] border-gray-300 rounded transition-all duration-200"
                    />
                    <label className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      كورس مجاني
                    </label>
                  </div>
                </div>
              </div>

              {/* Thumbnail */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="w-2 h-8 bg-gradient-to-b from-[#10b981] to-[#059669] rounded-full ml-3"></div>
                  صورة الكورس
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رابط الصورة
                  </label>
                  <input
                    type="url"
                    name="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    يمكنك إضافة رابط صورة للكورس (اختياري)
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 space-x-reverse pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-secondary"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4 ml-2" />
                      إنشاء الكورس
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
