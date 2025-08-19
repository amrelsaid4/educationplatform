'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, EyeIcon, TrashIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { getCoursesByTeacher, updateCourse } from '../../../../lib/course-utils'
import { getCurrentUser } from '../../../../lib/auth-utils'
import type { Course } from '../../../../lib/course-utils'
import DashboardLayout from '../../../../components/layouts/DashboardLayout'
import { supabase } from '../../../../lib/supabase'

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { user: userProfile } = await getCurrentUser(user.id)
        setCurrentUser(userProfile)
        
        // Get teacher courses
        const { data } = await getCoursesByTeacher(user.id)
        setCourses(data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublishCourse = async (courseId: string) => {
    try {
      const { error } = await updateCourse(courseId, { status: 'published' })
      if (error) {
        alert('حدث خطأ أثناء نشر الكورس')
        return
      }
      
      // Refresh courses
      await loadData()
      alert('تم نشر الكورس بنجاح!')
    } catch (error) {
      console.error('Error publishing course:', error)
      alert('حدث خطأ أثناء نشر الكورس')
    }
  }

  const handleArchiveCourse = async (courseId: string) => {
    try {
      const { error } = await updateCourse(courseId, { status: 'archived' })
      if (error) {
        alert('حدث خطأ أثناء أرشفة الكورس')
        return
      }
      
      // Refresh courses
      await loadData()
      alert('تم أرشفة الكورس بنجاح!')
    } catch (error) {
      console.error('Error archiving course:', error)
      alert('حدث خطأ أثناء أرشفة الكورس')
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة'
      case 'published': return 'منشور'
      case 'archived': return 'مؤرشف'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'مبتدئ'
      case 'intermediate': return 'متوسط'
      case 'advanced': return 'متقدم'
      default: return level
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
        <div className="py-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">كورساتي</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  إدارة الكورسات والدروس
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                إضافة كورس جديد
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                لا توجد كورسات بعد
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                ابدأ بإنشاء كورسك الأول
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 flex items-center mx-auto bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                إضافة كورس جديد
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Course Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                    {course.thumbnail_url ? (
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpenIcon className="h-16 w-16 text-white opacity-80" />
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                        {getStatusText(course.status)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                        course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getLevelText(course.level)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div>
                        <span className="font-medium">{course.enrollment_count}</span> طالب
                      </div>
                      <div>
                        <span className="font-medium">{course.total_lessons}</span> درس
                      </div>
                      <div>
                        <span className="font-medium">{course.duration_hours}</span> ساعة
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {course.is_free ? 'مجاني' : `${course.price} ريال`}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => window.location.href = `/dashboard/teacher/courses/${course.id}`}
                          className="flex items-center text-teal-600 hover:text-teal-700 font-medium text-sm"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          عرض
                        </button>
                        <button
                          onClick={() => setEditingCourse(course)}
                          className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          تعديل
                        </button>
                      </div>

                      <div className="flex space-x-2 space-x-reverse">
                        {course.status === 'draft' && (
                          <button
                            onClick={() => handlePublishCourse(course.id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            نشر
                          </button>
                        )}
                        {course.status === 'published' && (
                          <button
                            onClick={() => handleArchiveCourse(course.id)}
                            className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                          >
                            أرشفة
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
