'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getCurrentUser } from '@/lib/auth-utils'
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
  const [userData, setUserData] = useState({ name: '', avatar: '', role: 'student' as 'student' | 'admin' | 'teacher' })

  useEffect(() => {
    const loadCourse = async () => {
      if (params.id && user?.id) {
        try {
          // Load user data
          const { user: userProfile } = await getCurrentUser(user.id)
          setUserData({
            name: userProfile?.name || '',
            avatar: userProfile?.avatar_url || '',
            role: (userProfile?.role || 'student') as 'student' | 'admin' | 'teacher'
          })

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
      <DashboardLayout userRole={userData.role} userName={userData.name} userAvatar={userData.avatar}>
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
      </DashboardLayout>
    )
  }

  if (!course) {
    return (
      <DashboardLayout userRole={userData.role} userName={userData.name} userAvatar={userData.avatar}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">الكورس غير موجود</h1>
            <Link href="/courses" className="text-blue-600 hover:text-blue-500">
              العودة إلى الكورسات
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}س ${mins}د` : `${mins}دقيقة`
  }

  return (
    <DashboardLayout userRole={userData.role} userName={userData.name} userAvatar={userData.avatar}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {course.category && (
              <span
                className="px-3 py-1 text-sm font-medium text-white rounded-full"
                style={{ backgroundColor: course.category.color }}
              >
                {course.category.name}
              </span>
            )}
            <div className="flex items-center gap-1">
              <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 dark:text-gray-400">4.8</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {course.title}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {course.description}
          </p>
          
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              <span>{course.teacher.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5" />
              <span>{course.lessons?.length || 0} درس</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              <span>
                {formatDuration(course.lessons.reduce((total, lesson) => total + lesson.duration, 0))}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            {/* Course Image */}
            {course.image_url && (
              <div className="mb-8">
                <img 
                  src={course.image_url} 
                  alt={course.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Course Progress */}
            {user?.role === 'student' && completionPercentage > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  تقدمك في الكورس
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">التقدم العام</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Course Lessons */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                محتوى الكورس
              </h3>
              
              <div className="space-y-4">
                {course.lessons?.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {index + 1}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {lesson.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{formatDuration(lesson.duration)}</span>
                          {lesson.is_completed && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>مكتمل</span>
                            </div>
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
    </DashboardLayout>
  )
}
