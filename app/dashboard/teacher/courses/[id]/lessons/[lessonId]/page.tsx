'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon, PencilIcon, EyeIcon, TrashIcon, ClockIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { getLessonById, getCourseById, deleteLesson } from '../../../../../../../lib/course-utils'
import { getCurrentUser } from '../../../../../../../lib/auth-utils'
import { supabase } from '../../../../../../../lib/supabase'
import DashboardLayout from '../../../../../../../components/layouts/DashboardLayout'
import ReactPlayer from 'react-player'

export default function TeacherLessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const lessonId = params.lessonId as string

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [lesson, setLesson] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)

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
        alert('ليس لديك صلاحية لعرض هذا الكورس')
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
    } catch (error) {
      console.error('Error loading data:', error)
      alert('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLesson = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) {
      return
    }

    try {
      setDeleting(true)
      const { error } = await deleteLesson(lessonId)
      
      if (error) {
        throw error
      }

      alert('تم حذف الدرس بنجاح')
      router.push(`/dashboard/teacher/courses/${courseId}`)
    } catch (error) {
      console.error('Error deleting lesson:', error)
      alert('حدث خطأ أثناء حذف الدرس')
    } finally {
      setDeleting(false)
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
      <div className="max-w-6xl mx-auto p-6">
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
                {lesson?.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                درس في {course?.title}
              </p>
            </div>
          </div>

          <div className="flex space-x-3 space-x-reverse">
            <button
              onClick={() => router.push(`/dashboard/teacher/courses/${courseId}/lessons/${lessonId}/edit`)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              تعديل الدرس
            </button>
            <button
              onClick={handleDeleteLesson}
              disabled={deleting}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              {deleting ? 'جاري الحذف...' : 'حذف الدرس'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {lesson?.video_url ? (
                <div className="aspect-video bg-black">
                  <ReactPlayer
                    url={lesson.video_url}
                    width="100%"
                    height="100%"
                    controls
                    config={{
                      file: {
                        attributes: {
                          controlsList: 'nodownload'
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <BookOpenIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">لا يوجد فيديو لهذا الدرس</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lesson Info */}
          <div className="space-y-6">
            {/* Lesson Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                تفاصيل الدرس
              </h2>

              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span>المدة: {lesson?.duration_minutes || 0} دقيقة</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  <span>الترتيب: {lesson?.order_index || 0}</span>
                </div>

                <div className="flex items-center text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lesson?.is_free 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {lesson?.is_free ? 'مجاني' : 'مدفوع'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {lesson?.description && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  وصف الدرس
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {lesson.description}
                </p>
              </div>
            )}

            {/* Content */}
            {lesson?.content && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  محتوى الدرس
                </h3>
                <div className="text-gray-600 dark:text-gray-400 leading-relaxed prose dark:prose-invert max-w-none">
                  {lesson.content}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
