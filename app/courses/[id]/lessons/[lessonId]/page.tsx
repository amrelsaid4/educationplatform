'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon, PlayIcon, CheckIcon } from '@heroicons/react/24/outline'
import ReactPlayer from 'react-player'
import { getLessonById, getCourseById, enrollInCourse, updateLessonProgress } from '../../../../lib/course-utils'
import { getCurrentUser } from '../../../../lib/auth-utils'
import { supabase } from '../../../../lib/supabase'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const lessonId = params.lessonId as string

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [lesson, setLesson] = useState<any>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    loadData()
  }, [courseId, lessonId])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      // تحميل الكورس
      const courseData = await getCourseById(courseId)
      if (!courseData) {
        alert('الكورس غير موجود')
        router.push('/courses')
        return
      }

      setCourse(courseData)

      // تحميل الدرس
      const lessonData = await getLessonById(lessonId)
      if (!lessonData) {
        alert('الدرس غير موجود')
        router.push(`/courses/${courseId}`)
        return
      }

      // التحقق من أن الدرس ينتمي للكورس
      if (lessonData.course_id !== courseId) {
        alert('الدرس لا ينتمي لهذا الكورس')
        router.push(`/courses/${courseId}`)
        return
      }

      setLesson(lessonData)

      // التحقق من التسجيل في الكورس
      const { data: enrollment } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', currentUser.id)
        .single()

      setIsEnrolled(!!enrollment)

      // التحقق من إكمال الدرس
      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('student_id', currentUser.id)
        .single()

      setIsCompleted(progress?.is_completed || false)
    } catch (error) {
      console.error('Error loading data:', error)
      alert('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    try {
      await enrollInCourse(courseId, user.id)
      setIsEnrolled(true)
      alert('تم التسجيل في الكورس بنجاح')
    } catch (error) {
      console.error('Error enrolling:', error)
      alert('حدث خطأ أثناء التسجيل في الكورس')
    }
  }

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress)
    
    // تحديث التقدم كل 10 ثواني
    if (Math.floor(progress * 100) % 10 === 0) {
      const { error } = await updateLessonProgress(lessonId, user.id, {
        watch_time_seconds: Math.floor(progress * (lesson?.duration_minutes * 60 || 0)),
        is_completed: progress > 0.9 // يعتبر مكتمل إذا شاهد 90% من الفيديو
      })
      
      if (error) {
        console.error('Error updating progress:', error)
      }
    }
  }

  const handleVideoEnd = async () => {
    try {
      const { error } = await updateLessonProgress(lessonId, user.id, {
        is_completed: true,
        completed_at: new Date().toISOString()
      })
      
      if (error) {
        throw error
      }
      
      setIsCompleted(true)
      alert('تم إكمال الدرس بنجاح!')
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  if (!isEnrolled && !course?.is_free && !lesson?.is_free) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              يجب التسجيل في الكورس أولاً
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              للوصول إلى هذا الدرس، يجب عليك التسجيل في الكورس أولاً
            </p>
            <div className="space-y-4">
              <button
                onClick={handleEnroll}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                التسجيل في الكورس
              </button>
              <button
                onClick={() => router.push(`/courses/${courseId}`)}
                className="block w-full px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                العودة إلى الكورس
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={() => router.push(`/courses/${courseId}`)}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {lesson?.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {course?.title}
              </p>
            </div>
          </div>
          
          {isCompleted && (
            <div className="flex items-center space-x-2 space-x-reverse text-green-600">
              <CheckIcon className="w-5 h-5" />
              <span className="text-sm font-medium">مكتمل</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {lesson?.video_url ? (
                <div className="relative aspect-video">
                  <ReactPlayer
                    url={lesson.video_url}
                    width="100%"
                    height="100%"
                    controls
                    playing={playing}
                    onProgress={handleVideoProgress}
                    onEnded={handleVideoEnd}
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
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <PlayIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      لا يوجد فيديو لهذا الدرس
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                معلومات الدرس
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    وصف الدرس
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {lesson?.description || 'لا يوجد وصف لهذا الدرس'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      المدة:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {lesson?.duration_minutes || 0} دقيقة
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      التقدم:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {Math.floor(videoProgress * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Content */}
            {lesson?.content && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  محتوى الدرس
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                معلومات الكورس
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    المعلم:
                  </span>
                  <p className="text-gray-900 dark:text-white">
                    {course?.teacher?.name || 'غير محدد'}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    المستوى:
                  </span>
                  <p className="text-gray-900 dark:text-white">
                    {course?.level === 'beginner' ? 'مبتدئ' : 
                     course?.level === 'intermediate' ? 'متوسط' : 'متقدم'}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    السعر:
                  </span>
                  <p className="text-gray-900 dark:text-white">
                    {course?.is_free ? 'مجاني' : `$${course?.price}`}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    عدد الدروس:
                  </span>
                  <p className="text-gray-900 dark:text-white">
                    {course?.total_lessons || 0}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => router.push(`/courses/${courseId}`)}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  العودة إلى الكورس
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
