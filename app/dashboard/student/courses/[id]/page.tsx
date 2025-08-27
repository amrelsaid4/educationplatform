'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getCurrentUser } from '@/lib/auth-utils'
import { supabase } from '@/lib/supabase'
import { 
  BookOpenIcon, 
  AcademicCapIcon, 
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url?: string
  price: number
  duration_hours: number
  level: string
  language: string
  is_published: boolean
  created_at: string
  teacher: {
    id: string
    name: string
    avatar_url?: string
  }
  enrollment?: {
    id: string
    status: string
    enrolled_at: string
    progress_percentage: number
  }
  stats?: {
    total_students: number
    average_rating: number
    total_lessons: number
  }
}

interface Lesson {
  id: string
  title: string
  description: string
  video_url?: string
  duration_minutes: number
  order_index: number
  is_completed?: boolean
}

export default function StudentCoursePage() {
  const params = useParams()
  const courseId = params.id as string
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({ name: '', avatar: '' })

  useEffect(() => {
    if (user?.id && courseId) {
      loadUserData()
      loadCourseData()
    }
  }, [user, courseId])

  const loadUserData = async () => {
    try {
      const { user: userProfile } = await getCurrentUser(user!.id)
      setUserData({
        name: userProfile?.name || '',
        avatar: userProfile?.avatar_url || ''
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const loadCourseData = async () => {
    try {
      // Load course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          teacher:users!courses_teacher_id_fkey(id, name, avatar_url)
        `)
        .eq('id', courseId)
        .single()

      if (courseError) {
        console.error('Error loading course:', courseError)
        return
      }

      // Load enrollment data
      const { data: enrollmentData } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', user!.id)
        .single()

      // Load lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })

      if (lessonsError) {
        console.error('Error loading lessons:', lessonsError)
        return
      }

      // Load lesson completion status
      const { data: completedLessons } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('student_id', user!.id)
        .eq('is_completed', true)
        .in('lesson_id', lessonsData?.map(l => l.id) || [])

      const completedLessonIds = new Set(completedLessons?.map(cl => cl.lesson_id) || [])

      const lessonsWithCompletion = (lessonsData || []).map(lesson => ({
        ...lesson,
        is_completed: completedLessonIds.has(lesson.id)
      }))

      setLessons(lessonsWithCompletion)

      // Transform course data
      const transformedCourse = {
        ...courseData,
        teacher: Array.isArray(courseData.teacher) ? courseData.teacher[0] : courseData.teacher,
        enrollment: enrollmentData ? {
          id: enrollmentData.id,
          status: enrollmentData.status,
          enrolled_at: enrollmentData.enrolled_at,
          progress_percentage: enrollmentData.progress || 0
        } : undefined
      }

      setCourse(transformedCourse)
    } catch (error) {
      console.error('Error loading course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'مبتدئ'
      case 'intermediate':
        return 'متوسط'
      case 'advanced':
        return 'متقدم'
      default:
        return level
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}س ${mins}د` : `${mins} دقيقة`
  }

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={userData.name} userAvatar={userData.avatar}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!course) {
    return (
      <DashboardLayout userRole="student" userName={userData.name} userAvatar={userData.avatar}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              الكورس غير موجود
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              عذراً، الكورس المطلوب غير متاح
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="student" userName={userData.name} userAvatar={userData.avatar}>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard/student/courses"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            العودة للكورسات
          </Link>
        </div>

        {/* Course Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
          <div className="md:flex">
            {/* Course Image */}
            <div className="md:w-1/3">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpenIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {course.title}
              </h1>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {course.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>{course.teacher?.name || 'غير محدد'}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                  <span>{course.duration_hours} ساعة</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                    {getLevelText(course.level)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <BookOpenIcon className="w-4 h-4" />
                  <span>{lessons.length} درس</span>
                </div>
              </div>

              {course.enrollment && (
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900 dark:text-blue-100">
                        التقدم في الكورس
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {course.enrollment.progress_percentage}% مكتمل
                      </p>
                    </div>
                    <div className="w-24 h-2 bg-blue-200 dark:bg-blue-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${course.enrollment.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              الدروس ({lessons.length})
            </h2>
          </div>

          {lessons.length === 0 ? (
            <div className="p-6 text-center">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                لا توجد دروس متاحة
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                لم يتم إضافة أي دروس لهذا الكورس بعد
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {lesson.is_completed ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {lesson.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatDuration(lesson.duration_minutes)}</span>
                          {lesson.is_completed && (
                            <span className="text-green-600 dark:text-green-400">
                              مكتمل
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {lesson.video_url ? (
                        <Link
                          href={`/dashboard/student/courses/${courseId}/lessons/${lesson.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <PlayIcon className="w-4 h-4" />
                          {lesson.is_completed ? 'إعادة المشاهدة' : 'مشاهدة'}
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-sm">غير متاح</span>
                      )}
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
