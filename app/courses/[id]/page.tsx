'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PlayIcon, CheckCircleIcon, ClockIcon, BookOpenIcon, UserIcon } from '@heroicons/react/24/outline'
import { getCourseById, getCourseLessons, getLessonProgress, updateLessonProgress } from '../../../lib/course-utils'
import { getCurrentUser } from '../../../lib/auth-utils'
import type { Course, Lesson, LessonProgress } from '../../../lib/course-utils'
import ReactPlayer from 'react-player'
import { supabase } from '../../../lib/supabase'

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [lessonProgress, setLessonProgress] = useState<{ [key: string]: LessonProgress }>({})
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [videoProgress, setVideoProgress] = useState(0)

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
        if (lessonsData && lessonsData.length > 0) {
          setLessons(lessonsData)
          setCurrentLesson(lessonsData[0])
          
          // Load lesson progress for current user
          if (user) {
            const progressData: { [key: string]: LessonProgress } = {}
            for (const lesson of lessonsData) {
              const { data: progress } = await getLessonProgress(lesson.id, user.id)
              if (progress) {
                progressData[lesson.id] = progress
              }
            }
            setLessonProgress(progressData)
          }
        }
      }
    } catch (error) {
      console.error('Error loading course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson)
    setVideoProgress(0)
  }

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress)
  }

  const handleVideoEnd = async () => {
    if (!currentLesson || !currentUser) return

    try {
      await updateLessonProgress(currentLesson.id, currentUser.id, {
        is_completed: true,
        watch_time_seconds: currentLesson.duration_minutes * 60,
        completed_at: new Date().toISOString()
      })

      // Update local state
      setLessonProgress(prev => ({
        ...prev,
        [currentLesson.id]: {
          id: '',
          lesson_id: currentLesson.id,
          student_id: currentUser.id,
          is_completed: true,
          watch_time_seconds: currentLesson.duration_minutes * 60,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      }))
    } catch (error) {
      console.error('Error updating lesson progress:', error)
    }
  }

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress[lessonId]?.is_completed || false
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'مبتدئ'
      case 'intermediate': return 'متوسط'
      case 'advanced': return 'متقدم'
      default: return level
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            الكورس غير موجود
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            عذراً، الكورس الذي تبحث عنه غير متاح
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {course.title}
              </h1>
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getLevelColor(course.level)}`}>
                  {getLevelText(course.level)}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {course.category}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {course.duration_hours} ساعة
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {course.total_lessons} درس
                </span>
              </div>
            </div>
            {course.teacher && (
              <div className="flex items-center">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 dark:text-teal-400 text-lg font-medium">
                    {course.teacher.name.charAt(0)}
                  </span>
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {course.teacher.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    المعلم
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            {course.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {currentLesson ? (
                <div>
                  <div className="aspect-video bg-black">
                    {currentLesson.video_url ? (
                      <ReactPlayer
                        url={currentLesson.video_url}
                        width="100%"
                        height="100%"
                        controls
                        onProgress={({ played }) => handleVideoProgress(played)}
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
                          <BookOpenIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">لا يوجد فيديو لهذا الدرس</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {currentLesson.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {currentLesson.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>{currentLesson.duration_minutes} دقيقة</span>
                      </div>
                      <div className="flex items-center">
                        <span>الدرس {currentLesson.order_index}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      اختر درساً لبدء التعلم
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lessons List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  قائمة الدروس
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {lessons.length} درس متاح
                </p>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    className={`px-6 py-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                      currentLesson?.id === lesson.id
                        ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0">
                          {isLessonCompleted(lesson.id) ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <PlayIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="mr-3 flex-1">
                          <h4 className={`text-sm font-medium ${
                            currentLesson?.id === lesson.id
                              ? 'text-teal-600 dark:text-teal-400'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {lesson.title}
                          </h4>
                          <div className="flex items-center mt-1">
                            <ClockIcon className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {lesson.duration_minutes} دقيقة
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {lesson.is_free && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          مجاني
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
