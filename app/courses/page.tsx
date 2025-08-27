'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, PlayIcon, BookOpenIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getPublishedCourses, searchCourses, enrollInCourse, getStudentEnrollments } from '../../lib/course-utils'
import { getCurrentUser } from '../../lib/auth-utils'
import type { Course, CourseEnrollment } from '../../lib/course-utils'
import { supabase } from '../../lib/supabase'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<CourseEnrollment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { user: userProfile } = await getCurrentUser(user.id)
        setCurrentUser(userProfile)
        
        // Get enrolled courses if student
        if (userProfile?.role === 'student') {
          const { data: enrollments } = await getStudentEnrollments(user.id)
          setEnrolledCourses(enrollments || [])
        }
      }

      // Get all published courses
      const { data } = await getPublishedCourses()
      setCourses(data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData()
      return
    }

    try {
      setSearching(true)
      const { data } = await searchCourses(searchQuery)
      setCourses(data || [])
    } catch (error) {
      console.error('Error searching courses:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleEnroll = async (courseId: string) => {
    if (!currentUser || currentUser.role !== 'student') {
      alert('يجب أن تكون طالباً للتسجيل في الكورسات')
      return
    }

    try {
      setEnrolling(courseId)
      const { error } = await enrollInCourse(courseId, currentUser.id)
      
      if (error) {
        alert('حدث خطأ أثناء التسجيل في الكورس')
        return
      }

      // Refresh enrollments
      const { data: enrollments } = await getStudentEnrollments(currentUser.id)
      setEnrolledCourses(enrollments || [])
      
      alert('تم التسجيل في الكورس بنجاح!')
    } catch (error) {
      console.error('Error enrolling:', error)
      alert('حدث خطأ أثناء التسجيل في الكورس')
    } finally {
      setEnrolling(null)
    }
  }

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.some(enrollment => enrollment.course_id === courseId)
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
      <DashboardLayout userRole={currentUser?.role || "student"} userName={currentUser?.name || ""} userAvatar={currentUser?.avatar_url}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={currentUser?.role || "student"} userName={currentUser?.name || ""} userAvatar={currentUser?.avatar_url}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            الكورسات المتاحة
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            اكتشف مجموعة متنوعة من الكورسات التعليمية
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن الكورسات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="mt-2 w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {searching ? 'جاري البحث...' : 'بحث'}
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              لا توجد كورسات متاحة
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'سيتم إضافة كورسات جديدة قريباً'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Course Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                  {course.thumbnail_url ? (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpenIcon className="h-16 w-16 text-white opacity-80" />
                  )}
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                      {getLevelText(course.level)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {course.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      <span>{course.enrollment_count} طالب</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>{course.duration_hours} ساعة</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpenIcon className="h-4 w-4 mr-1" />
                      <span>{course.total_lessons} درس</span>
                    </div>
                  </div>

                  {/* Teacher Info */}
                  {course.teacher && (
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 dark:text-teal-400 text-sm font-medium">
                          {course.teacher.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                        {course.teacher.name}
                      </span>
                    </div>
                  )}

                  {/* Price and Enroll Button */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {course.is_free ? 'مجاني' : `${course.price} ريال`}
                    </div>
                    
                    {isEnrolled(course.id) ? (
                      <button
                        onClick={() => window.location.href = `/courses/${course.id}`}
                        className="flex items-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <PlayIcon className="h-4 w-4 mr-2" />
                        متابعة التعلم
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrolling === course.id}
                        className="flex items-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {enrolling === course.id ? 'جاري التسجيل...' : 'تسجيل في الكورس'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
