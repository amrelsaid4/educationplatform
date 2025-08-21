'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { getCourseById, getCourseCompletionPercentage } from '@/lib/course-utils'
import { BookOpenIcon, ClockIcon, UserIcon, StarIcon, PlayIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  description: string
  price: number
  image_url?: string
  teacher: {
    name: string
    avatar_url?: string
  }
  lessons: Array<{
    id: string
    title: string
    duration: number
    is_completed?: boolean
  }>
  category?: {
    name: string
    color: string
  }
}

export default function CoursePage() {
  const params = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourse = async () => {
      if (params.id && user?.id) {
        try {
          const courseData = await getCourseById(params.id as string)
          if (courseData.data) {
            setCourse(courseData.data)
          }
          
          // Get completion percentage for students
          if (user.role === 'student') {
            const percentage = await getCourseCompletionPercentage(user.id, params.id as string)
            setCompletionPercentage(percentage)
          }
        } catch (error) {
          console.error('Error loading course:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadCourse()
  }, [params.id, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">الكورس غير موجود</h1>
          <Link href="/courses" className="text-blue-600 hover:text-blue-500">
            العودة إلى الكورسات
          </Link>
        </div>
      </div>
    )
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}س ${mins}د` : `${mins}دقيقة`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {course.category && (
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: course.category.color }}
              >
                {course.category.name}
              </span>
            )}
            <span className="text-gray-500 dark:text-gray-400">•</span>
            <span className="text-gray-500 dark:text-gray-400">
              {course.lessons?.length || 0} درس
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {course.title}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-3xl">
            {course.description}
          </p>

          {/* Teacher Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              {course.teacher?.avatar_url ? (
                <img 
                  src={course.teacher.avatar_url} 
                  alt={course.teacher.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {course.teacher?.name || 'مدرس غير محدد'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">المدرس</p>
              </div>
            </div>
          </div>

          {/* Progress Bar for Students */}
          {user?.role === 'student' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  تقدمك في الكورس
                </h3>
                <span className="text-2xl font-bold text-blue-600">
                  {completionPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {course.lessons?.filter(lesson => lesson.is_completed).length || 0} من {course.lessons?.length || 0} درس مكتمل
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  محتوى الكورس
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {course.lessons?.map((lesson, index) => (
                  <div key={lesson.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {lesson.is_completed ? (
                            <CheckCircleIcon className="w-6 h-6 text-green-500" />
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {index + 1}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {lesson.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                              <ClockIcon className="w-4 h-4" />
                              {formatDuration(lesson.duration)}
                            </div>
                            {lesson.is_completed && (
                              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                مكتمل
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Link
                        href={`/courses/${course.id}/lessons/${lesson.id}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <PlayIcon className="w-4 h-4" />
                        {lesson.is_completed ? 'إعادة المشاهدة' : 'مشاهدة'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Course Sidebar */}
          <div className="space-y-6">
            {/* Course Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              {course.image_url && (
                <img 
                  src={course.image_url} 
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />
              )}
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${course.price}
                  </span>
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">4.8</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <BookOpenIcon className="w-5 h-5" />
                    <span>{course.lessons?.length || 0} درس</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <ClockIcon className="w-5 h-5" />
                    <span>
                      {formatDuration(course.lessons.reduce((total, lesson) => total + lesson.duration, 0))}
                    </span>
                  </div>
                </div>

                {user?.role === 'student' ? (
                  <Link
                    href={`/courses/${course.id}/lessons/${course.lessons[0]?.id}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center block"
                  >
                    {completionPercentage > 0 ? 'متابعة التعلم' : 'ابدأ التعلم'}
                  </Link>
                ) : (
                  <button className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-medium py-3 px-4 rounded-lg cursor-not-allowed">
                    سجل دخول كطالب للوصول
                  </button>
                )}
              </div>
            </div>

            {/* Course Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                إحصائيات الكورس
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">إجمالي الدروس</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {course.lessons.length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">المدة الإجمالية</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDuration(course.lessons.reduce((total, lesson) => total + lesson.duration, 0))}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">المستوى</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    مبتدئ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
