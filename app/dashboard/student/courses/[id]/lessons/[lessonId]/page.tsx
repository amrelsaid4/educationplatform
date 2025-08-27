'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getCurrentUser } from '@/lib/auth-utils'
import { supabase } from '@/lib/supabase'
import { 
  BookOpenIcon, 
  AcademicCapIcon, 
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Lesson {
  id: string
  title: string
  description: string
  video_url?: string
  content?: string
  duration_minutes: number
  order_index: number
  course_id: string
}

interface Course {
  id: string
  title: string
  teacher: {
    id: string
    name: string
  }
}

export default function StudentLessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const lessonId = params.lessonId as string
  const { user } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [nextLesson, setNextLesson] = useState<Lesson | null>(null)
  const [prevLesson, setPrevLesson] = useState<Lesson | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({ name: '', avatar: '' })

  useEffect(() => {
    if (user?.id && courseId && lessonId) {
      loadUserData()
      loadLessonData()
    }
  }, [user, courseId, lessonId])

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

  const loadLessonData = async () => {
    try {
      // Load lesson details
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

      if (lessonError) {
        console.error('Error loading lesson:', lessonError)
        return
      }

      setLesson(lessonData)

      // Load course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          teacher:users!courses_teacher_id_fkey(id, name)
        `)
        .eq('id', courseId)
        .single()

      if (courseError) {
        console.error('Error loading course:', courseError)
        return
      }

      const transformedCourse = {
        ...courseData,
        teacher: Array.isArray(courseData.teacher) ? courseData.teacher[0] : courseData.teacher
      }

      setCourse(transformedCourse)

      // Load all lessons in course to get prev/next
      const { data: allLessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })

      if (lessonsError) {
        console.error('Error loading lessons:', lessonsError)
        return
      }

      const currentIndex = allLessons.findIndex(l => l.id === lessonId)
      if (currentIndex > 0) {
        setPrevLesson(allLessons[currentIndex - 1])
      }
      if (currentIndex < allLessons.length - 1) {
        setNextLesson(allLessons[currentIndex + 1])
      }

      // Check if lesson is completed
      const { data: completionData } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('student_id', user!.id)
        .eq('is_completed', true)
        .single()

      setIsCompleted(!!completionData)
    } catch (error) {
      console.error('Error loading lesson data:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsCompleted = async () => {
    if (!lesson || isCompleted) return

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          lesson_id: lesson.id,
          student_id: user!.id,
          is_completed: true,
          completed_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error marking lesson as completed:', error)
        return
      }

      setIsCompleted(true)
      
      // Update course progress
      await updateCourseProgress()
    } catch (error) {
      console.error('Error marking lesson as completed:', error)
    }
  }

  const updateCourseProgress = async () => {
    try {
      // Get total lessons and completed lessons
      const { data: totalLessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId)

      const { data: completedLessons } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('student_id', user!.id)
        .eq('is_completed', true)
        .in('lesson_id', totalLessons?.map(l => l.id) || [])

      const progressPercentage = totalLessons && totalLessons.length > 0
        ? Math.round((completedLessons?.length || 0) / totalLessons.length * 100)
        : 0

      // Update enrollment progress
      await supabase
        .from('course_enrollments')
        .update({ progress: progressPercentage })
        .eq('course_id', courseId)
        .eq('student_id', user!.id)
    } catch (error) {
      console.error('Error updating course progress:', error)
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

  if (!lesson || !course) {
    return (
      <DashboardLayout userRole="student" userName={userData.name} userAvatar={userData.avatar}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              الدرس غير موجود
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              عذراً، الدرس المطلوب غير متاح
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="student" userName={userData.name} userAvatar={userData.avatar}>
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/student/courses/${courseId}`}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              العودة للكورس
            </Link>

            <div className="flex items-center gap-4">
              {prevLesson && (
                <Link
                  href={`/dashboard/student/courses/${courseId}/lessons/${prevLesson.id}`}
                  className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  الدرس السابق
                </Link>
              )}

              {nextLesson && (
                <Link
                  href={`/dashboard/student/courses/${courseId}/lessons/${nextLesson.id}`}
                  className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  الدرس التالي
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Lesson Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {lesson.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {course.title} - {course.teacher?.name || 'غير محدد'}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                  <span>{formatDuration(lesson.duration_minutes)}</span>
                </div>

                {isCompleted && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">مكتمل</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {lesson.description}
            </p>
          </div>
        </div>

        {/* Video Player */}
        {lesson.video_url && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
            <div className="aspect-video bg-black">
              <video
                src={lesson.video_url}
                controls
                className="w-full h-full"
                poster={lesson.thumbnail_url}
              >
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
            </div>
          </div>
        )}

        {/* Lesson Content */}
        {lesson.content && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                محتوى الدرس
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {!isCompleted && (
                  <button
                    onClick={markAsCompleted}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    تحديد كمكتمل
                  </button>
                )}

                {isCompleted && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="font-medium">تم إكمال الدرس</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {prevLesson && (
                  <Link
                    href={`/dashboard/student/courses/${courseId}/lessons/${prevLesson.id}`}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    الدرس السابق
                  </Link>
                )}

                {nextLesson && (
                  <Link
                    href={`/dashboard/student/courses/${courseId}/lessons/${nextLesson.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    الدرس التالي
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                )}

                {!nextLesson && (
                  <Link
                    href={`/dashboard/student/courses/${courseId}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    العودة للكورس
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
