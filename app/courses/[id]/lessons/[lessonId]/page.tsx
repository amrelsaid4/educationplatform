'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getCurrentUser } from '@/lib/auth-utils'
import { getLessonById, markLessonAsCompleted, getLessonProgress, saveStudentNote, getStudentNote } from '@/lib/course-utils'
import { PlayIcon, CheckCircleIcon, ClockIcon, ArrowLeftIcon, ArrowRightIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import ReactPlayer from 'react-player'
import Comments from '@/components/Comments'

interface Lesson {
  id: string
  title: string
  description: string
  video_url?: string
  duration: number
  order_index: number
  course: {
    id: string
    title: string
    lessons: Array<{
      id: string
      title: string
      order_index: number
    }>
  }
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [studentNote, setStudentNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingNote, setSavingNote] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [userData, setUserData] = useState({ name: '', avatar: '', role: 'student' as 'student' | 'admin' | 'teacher' })

  useEffect(() => {
    const loadLesson = async () => {
      if (params.lessonId && user?.id) {
        try {
          // Load user data
          const { user: userProfile } = await getCurrentUser(user.id)
          setUserData({
            name: userProfile?.name || '',
            avatar: userProfile?.avatar_url || '',
            role: (userProfile?.role || 'student') as 'student' | 'admin' | 'teacher'
          })

          const { data: lessonData } = await getLessonById(params.lessonId as string)
          setLesson(lessonData)
          
          // Get lesson progress
          const progress = await getLessonProgress(user.id, params.lessonId as string)
          setIsCompleted(progress?.is_completed || false)
          
          // Get student note
          const note = await getStudentNote(user.id, params.lessonId as string)
          if (note?.note) {
            setStudentNote(note.note)
          }
        } catch (error) {
          console.error('Error loading lesson:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadLesson()
  }, [params.lessonId, user])

  const handleMarkAsCompleted = async () => {
    if (!user?.id || !params.lessonId) return
    
    try {
      await markLessonAsCompleted(user.id, params.lessonId as string)
      setIsCompleted(true)
    } catch (error) {
      console.error('Error marking lesson as completed:', error)
    }
  }

  const handleSaveNote = async () => {
    if (!user?.id || !params.lessonId) return
    
    setSavingNote(true)
    try {
      await saveStudentNote(user.id, params.lessonId as string, studentNote)
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setSavingNote(false)
    }
  }

  const handleVideoEnd = () => {
    if (!isCompleted && user?.role === 'student') {
      handleMarkAsCompleted()
    }
  }

  const getNextLesson = () => {
    if (!lesson) return null
    const currentIndex = lesson.course.lessons.findIndex(l => l.id === lesson.id)
    return lesson.course.lessons[currentIndex + 1] || null
  }

  const getPreviousLesson = () => {
    if (!lesson) return null
    const currentIndex = lesson.course.lessons.findIndex(l => l.id === lesson.id)
    return lesson.course.lessons[currentIndex - 1] || null
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}س ${mins}د` : `${mins}دقيقة`
  }

  if (loading) {
    return (
      <DashboardLayout userRole={userData.role} userName={userData.name} userAvatar={userData.avatar}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!lesson) {
    return (
      <DashboardLayout userRole={userData.role} userName={userData.name} userAvatar={userData.avatar}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">الدرس غير موجود</h1>
            <Link href="/courses" className="text-blue-600 hover:text-blue-500">
              العودة إلى الكورسات
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const nextLesson = getNextLesson()
  const previousLesson = getPreviousLesson()

  return (
    <DashboardLayout userRole={userData.role} userName={userData.name} userAvatar={userData.avatar}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/courses/${lesson.course.id}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-500"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              العودة للكورس
            </Link>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 dark:text-gray-400">{lesson.course.title}</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {lesson.title}
          </h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              <span>{formatDuration(lesson.duration)}</span>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircleSolidIcon className="w-4 h-4" />
                <span>مكتمل</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lesson Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {lesson.video_url && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="relative aspect-video">
                  <ReactPlayer
                    url={lesson.video_url}
                    width="100%"
                    height="100%"
                    controls
                    onEnded={handleVideoEnd}
                    onProgress={(state) => setVideoProgress(state.played * 100)}
                    config={{
                      file: {
                        attributes: {
                          controlsList: 'nodownload'
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Lesson Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                وصف الدرس
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {lesson.description}
              </p>
            </div>

            {/* Lesson Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {user?.role === 'student' && (
                    <button
                      onClick={handleMarkAsCompleted}
                      disabled={isCompleted}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isCompleted
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircleSolidIcon className="w-4 h-4" />
                          مكتمل
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-4 h-4" />
                          تحديد كمكتمل
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {getPreviousLesson() && (
                    <Link
                      href={`/courses/${lesson.course.id}/lessons/${getPreviousLesson()?.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      الدرس السابق
                    </Link>
                  )}
                  
                  {getNextLesson() ? (
                    <Link
                      href={`/courses/${lesson.course.id}/lessons/${getNextLesson()?.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      الدرس التالي
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link
                      href={`/courses/${lesson.course.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      إكمال الكورس
                      <CheckCircleIcon className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <Comments lessonId={lesson.id} />
          </div>

          {/* Notes Section */}
          <div className="space-y-6">
            {/* Student Notes */}
            {user?.role === 'student' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookmarkIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    ملاحظاتي
                  </h3>
                </div>
                
                <textarea
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="اكتب ملاحظاتك الخاصة بهذا الدرس..."
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {savingNote ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
                </button>
              </div>
            )}

            {/* Course Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                تقدم الكورس
              </h3>
              
              <div className="space-y-3">
                {lesson.course.lessons.map((courseLesson) => (
                  <Link
                    key={courseLesson.id}
                    href={`/courses/${lesson.course.id}/lessons/${courseLesson.id}`}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      courseLesson.id === lesson.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {courseLesson.id === lesson.id ? (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <PlayIcon className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {courseLesson.order_index}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        courseLesson.id === lesson.id
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        الدرس {courseLesson.order_index}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
