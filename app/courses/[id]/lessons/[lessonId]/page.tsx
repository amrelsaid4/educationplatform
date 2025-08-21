'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
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

  useEffect(() => {
    const loadLesson = async () => {
      if (params.lessonId && user?.id) {
        try {
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">الدرس غير موجود</h1>
          <Link href="/courses" className="text-blue-600 hover:text-blue-500">
            العودة إلى الكورسات
          </Link>
        </div>
      </div>
    )
  }

  const nextLesson = getNextLesson()
  const previousLesson = getPreviousLesson()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href={`/courses/${lesson.course.id}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-500 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              العودة إلى الكورس
            </Link>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                الدرس {lesson.order_index} من {lesson.course.lessons.length}
              </span>
              {isCompleted && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircleSolidIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">مكتمل</span>
                </div>
              )}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {lesson.title}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            {lesson.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {formatDuration(lesson.duration)}
            </div>
            <span>•</span>
            <span>الكورس: {lesson.course.title}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="relative aspect-video bg-black">
                {lesson.video_url ? (
                  <ReactPlayer
                    url={lesson.video_url}
                    width="100%"
                    height="100%"
                    controls
                    onProgress={({ played }) => setVideoProgress(played)}
                    onEnded={handleVideoEnd}
                    config={{
                      file: {
                        attributes: {
                          controlsList: 'nodownload'
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <PlayIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">لا يوجد فيديو لهذا الدرس</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {lesson.title}
                  </h2>
                  
                  {user?.role === 'student' && (
                    <button
                      onClick={handleMarkAsCompleted}
                      disabled={isCompleted}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isCompleted
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircleSolidIcon className="w-5 h-5" />
                          مكتمل
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-5 h-5" />
                          إكمال الدرس
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {lesson.description}
                </p>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  {previousLesson ? (
                    <Link
                      href={`/courses/${lesson.course.id}/lessons/${previousLesson.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      الدرس السابق
                    </Link>
                  ) : (
                    <div></div>
                  )}
                  
                  {nextLesson ? (
                    <Link
                      href={`/courses/${lesson.course.id}/lessons/${nextLesson.id}`}
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
    </div>
  )
}
