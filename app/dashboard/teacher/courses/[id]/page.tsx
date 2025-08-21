'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PlusIcon, PencilIcon, EyeIcon, BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline'
import { getCourseById, getCourseLessons, updateCourse, getCourseStats, updateCourseStats } from '../../../../../lib/course-utils'
import { getCurrentUser } from '../../../../../lib/auth-utils'
import { supabase } from '../../../../../lib/supabase'
import DashboardLayout from '../../../../../components/layouts/DashboardLayout'
import type { Course, Lesson } from '../../../../../lib/course-utils'

export default function TeacherCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [courseStats, setCourseStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      
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
        
        // Get course lessons
        const { data: lessonsData } = await getCourseLessons(courseId)
        setLessons(lessonsData || [])
        
        // Get actual course statistics
        const { data: statsData } = await getCourseStats(courseId)
        setCourseStats(statsData)
      }
    } catch (error) {
      console.error('Error loading course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleArchiveCourse = async () => {
    if (!course) return

    try {
      setUpdating(true)
      const { error } = await updateCourse(course.id, { status: 'archived' })
      
      if (error) {
        alert('حدث خطأ أثناء أرشفة الكورس')
        return
      }

      // Refresh course data
      await loadCourseData()
      alert('تم أرشفة الكورس بنجاح!')
    } catch (error) {
      console.error('Error archiving course:', error)
      alert('حدث خطأ أثناء أرشفة الكورس')
    } finally {
      setUpdating(false)
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!course) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
        <div className="py-6 px-6">
          <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {course.title}
                </h1>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(course.status)}`}>
                    {getStatusText(course.status)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {course.category}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {getLevelText(course.level)}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2 space-x-reverse">
                {course.status === 'draft' && (
                  <button
                    onClick={handlePublishCourse}
                    disabled={updating}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updating ? 'جاري النشر...' : 'نشر الكورس'}
                  </button>
                )}
                {course.status === 'published' && (
                  <button
                    onClick={handleArchiveCourse}
                    disabled={updating}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updating ? 'جاري الأرشفة...' : 'أرشفة الكورس'}
                  </button>
                )}
                <button
                  onClick={() => router.push(`/dashboard/teacher/courses/${courseId}/edit`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  تعديل الكورس
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  معلومات الكورس
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">المدة الإجمالية</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {courseStats?.total_duration || 0} ساعة
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <BookOpenIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">عدد الدروس</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {lessons.length} درس
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-5 h-5 text-gray-400 mr-2">💰</div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">السعر</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {course.is_free ? 'مجاني' : `${course.price} ريال`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lessons Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    الدروس ({lessons.length})
                  </h3>
                  <button
                    onClick={() => router.push(`/dashboard/teacher/courses/${courseId}/lessons/create`)}
                    className="flex items-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    إضافة درس جديد
                  </button>
                </div>
                
                <div className="p-6">
                  {lessons.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        لا توجد دروس بعد
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        ابدأ بإضافة أول درس للكورس
                      </p>
                      <button
                        onClick={() => router.push(`/dashboard/teacher/courses/${courseId}/lessons/create`)}
                        className="flex items-center mx-auto bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        إضافة درس جديد
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lessons.map((lesson) => (
                        <div key={lesson.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mr-3">
                                <span className="text-teal-600 dark:text-teal-400 text-sm font-medium">
                                  {lesson.order_index}
                                </span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                  {lesson.title}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                  {lesson.description}
                                </p>
                                <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  <span>{lesson.duration_minutes} دقيقة</span>
                                  {lesson.is_free && (
                                    <span className="mr-4 text-green-600 dark:text-green-400">مجاني</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2 space-x-reverse">
                              <button
                                onClick={() => router.push(`/dashboard/teacher/courses/${courseId}/lessons/${lesson.id}/edit`)}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => router.push(`/dashboard/teacher/courses/${courseId}/lessons/${lesson.id}`)}
                                className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Course Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  إحصائيات الكورس
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">إجمالي الطلاب</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {courseStats?.enrollment_count || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">إجمالي الدروس</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {courseStats?.total_lessons || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">التقييم</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {course.rating ? `${course.rating}/5` : 'غير متوفر'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">الحالة</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                      {getStatusText(course.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
