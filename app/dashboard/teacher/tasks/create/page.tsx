'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { getCurrentUser } from '../../../../../lib/auth-utils'
import DashboardLayout from '../../../../../components/layouts/DashboardLayout'
import { supabase } from '../../../../../lib/supabase'

interface Course {
  id: string
  title: string
}

export default function CreateTaskPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseIdFromUrl = searchParams.get('course_id')
  
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: courseIdFromUrl || '',
    priority: 'medium',
    due_date: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { user: userProfile } = await getCurrentUser(user.id)
        setCurrentUser(userProfile)
        
        // Get teacher's courses
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title')
          .eq('teacher_id', user.id)
          .order('title')
        
        setCourses(coursesData || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.course_id || !formData.due_date) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('يجب تسجيل الدخول أولاً')
        return
      }

      const { error } = await supabase
        .from('tasks')
        .insert({
          title: formData.title,
          description: formData.description,
          course_id: formData.course_id,
          teacher_id: user.id,
          priority: formData.priority,
          due_date: formData.due_date,
          status: 'pending'
        })

      if (error) {
        console.error('Error creating task:', error)
        alert('حدث خطأ أثناء إنشاء المهمة')
        return
      }

      alert('تم إنشاء المهمة بنجاح!')
      router.push('/dashboard/teacher/tasks')
    } catch (error) {
      console.error('Error creating task:', error)
      alert('حدث خطأ أثناء إنشاء المهمة')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-4"
              >
                <ArrowLeftIcon className="h-5 w-5 ml-1" />
                رجوع
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إنشاء مهمة جديدة</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              أضف مهمة جديدة لإدارة واجباتك ومتابعة مهامك
            </p>
          </div>

          {/* Form */}
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  عنوان المهمة *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
                  placeholder="أدخل عنوان المهمة"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  وصف المهمة
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
                  placeholder="أدخل وصف المهمة (اختياري)"
                />
              </div>

              {/* Course */}
              <div>
                <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الكورس *
                </label>
                <select
                  id="course_id"
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">اختر الكورس</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الأولوية
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تاريخ الاستحقاق *
                </label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6">
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
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4" />
                      إنشاء المهمة
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
