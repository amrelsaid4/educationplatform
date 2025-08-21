'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline'
import { getCurrentUser } from '../../../../../../lib/auth-utils'
import DashboardLayout from '../../../../../../components/layouts/DashboardLayout'
import { supabase } from '../../../../../../lib/supabase'

interface Course {
  id: string
  title: string
}

interface Task {
  id: string
  title: string
  description: string
  course_id: string
  priority: string
  due_date: string
  status: string
}

export default function EditTaskPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [task, setTask] = useState<Task | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    priority: 'medium',
    due_date: '',
    status: 'pending'
  })

  useEffect(() => {
    loadData()
  }, [taskId])

  const loadData = async () => {
    try {
      setLoading(true)
      
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
        
        // Get task details
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', taskId)
          .eq('teacher_id', user.id)
          .single()
        
        if (taskError) {
          alert('لم يتم العثور على المهمة')
          router.push('/dashboard/teacher/tasks')
          return
        }
        
        if (taskData) {
          setTask(taskData)
          setFormData({
            title: taskData.title,
            description: taskData.description || '',
            course_id: taskData.course_id,
            priority: taskData.priority,
            due_date: taskData.due_date,
            status: taskData.status
          })
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.course_id || !formData.due_date) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('tasks')
        .update({
          title: formData.title,
          description: formData.description,
          course_id: formData.course_id,
          priority: formData.priority,
          due_date: formData.due_date,
          status: formData.status
        })
        .eq('id', taskId)

      if (error) {
        console.error('Error updating task:', error)
        alert('حدث خطأ أثناء تحديث المهمة')
        return
      }

      alert('تم تحديث المهمة بنجاح!')
      router.push('/dashboard/teacher/tasks')
    } catch (error) {
      console.error('Error updating task:', error)
      alert('حدث خطأ أثناء تحديث المهمة')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      return
    }

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        console.error('Error deleting task:', error)
        alert('حدث خطأ أثناء حذف المهمة')
        return
      }

      alert('تم حذف المهمة بنجاح!')
      router.push('/dashboard/teacher/tasks')
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('حدث خطأ أثناء حذف المهمة')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
        <div className="py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
              <div className="card">
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i}>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-4"
                >
                  <ArrowLeftIcon className="h-5 w-5 ml-1" />
                  رجوع
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تعديل المهمة</h1>
              </div>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="btn-warning btn-sm"
              >
                <TrashIcon className="h-4 w-4" />
                حذف المهمة
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              عدل تفاصيل المهمة
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

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الحالة
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
                >
                  <option value="pending">معلق</option>
                  <option value="completed">مكتمل</option>
                  <option value="overdue">متأخر</option>
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
                  disabled={saving}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ التغييرات'
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
