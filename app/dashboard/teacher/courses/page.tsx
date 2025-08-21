'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, EyeIcon, TrashIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { getCoursesByTeacher, updateCourse } from '../../../../lib/course-utils'
import { getCurrentUser } from '../../../../lib/auth-utils'
import type { Course } from '../../../../lib/course-utils'
import DashboardLayout from '../../../../components/layouts/DashboardLayout'
import { supabase } from '../../../../lib/supabase'
import Link from 'next/link'

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
      case 'draft': return 'bg-[#f59e0b]/10 text-[#f59e0b]'
      case 'published': return 'bg-[#10b981]/10 text-[#10b981]'
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
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
                  <div key={i} className="card">
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
              <Link href="/dashboard/teacher/courses/create">
                <button className="btn-primary flex items-center">
                  <PlusIcon className="h-5 w-5 ml-2" />
                  إضافة كورس جديد
                </button>
              </Link>
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
              <Link href="/dashboard/teacher/courses/create">
                <button className="mt-4 btn-primary flex items-center">
                  <PlusIcon className="h-5 w-5 ml-2" />
                  إضافة كورس جديد
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="card overflow-hidden hover:shadow-2xl transition-all duration-300">
                  {/* Course Thumbnail */}
                  <div className="h-48 bg-gradient-to-br from-[#49BBBD] to-[#06b6d4] flex items-center justify-center">
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
                        course.level === 'beginner' ? 'bg-[#10b981]/10 text-[#10b981]' :
                        course.level === 'intermediate' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                        'bg-[#ef4444]/10 text-[#ef4444]'
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
                        <Link href={`/dashboard/teacher/courses/${course.id}`}>
                          <button className="btn-secondary btn-sm">
                            <EyeIcon className="h-4 w-4" />
                            عرض
                          </button>
                        </Link>
                        <Link href={`/dashboard/teacher/courses/${course.id}/edit`}>
                          <button className="btn-primary btn-sm">
                            <PencilIcon className="h-4 w-4" />
                            تعديل
                          </button>
                        </Link>
                      </div>

                      <div className="flex space-x-2 space-x-reverse">
                        {course.status === 'draft' && (
                          <button
                            onClick={() => handlePublishCourse(course.id)}
                            className="text-[#10b981] hover:text-[#10b981]/80 text-sm font-medium transition-colors"
                          >
                            نشر
                          </button>
                        )}
                        {course.status === 'published' && (
                          <button
                            onClick={() => handleArchiveCourse(course.id)}
                            className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm font-medium transition-colors"
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
