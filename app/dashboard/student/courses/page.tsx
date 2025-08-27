'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getPublishedCourses, getStudentEnrollments, enrollInCourse } from '@/lib/course-utils'
import { getCurrentUser } from '@/lib/auth-utils'
import Dialog, { DialogFooter } from '@/components/ui/Dialog'
import ActionIcons from '@/components/ui/ActionIcons'
import { 
  BookOpenIcon, 
  AcademicCapIcon, 
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  EyeIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

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

export default function StudentCoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEnrollDialog, setShowEnrollDialog] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [userData, setUserData] = useState({ name: '', avatar: '' })

  useEffect(() => {
    if (user?.id) {
      loadUserData()
      loadData()
    }
  }, [user])

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

  const loadData = async () => {
    try {
      // Load published courses
      const { data: coursesData, error: coursesError } = await getPublishedCourses()
      if (coursesError) {
        console.error('Error loading courses:', coursesError)
        return
      }

      // Load student enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await getStudentEnrollments(user!.id)
      if (enrollmentsError) {
        console.error('Error loading enrollments:', enrollmentsError)
        return
      }

      setEnrollments(enrollmentsData || [])

      // Merge courses with enrollment data
      const coursesWithEnrollments = (coursesData || []).map(course => {
        const enrollment = enrollmentsData?.find(e => e.course_id === course.id)
        return {
          ...course,
          enrollment: enrollment ? {
            id: enrollment.id,
            status: enrollment.status,
            enrolled_at: enrollment.enrolled_at,
            progress_percentage: enrollment.progress_percentage || 0
          } : undefined
        }
      })

      setCourses(coursesWithEnrollments)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!selectedCourse) return

    setEnrolling(true)
    try {
      const { error } = await enrollInCourse(selectedCourse.id, user!.id)
      if (error) {
        console.error('Error enrolling in course:', error)
        alert('فشل في التسجيل في الكورس')
        return
      }

      setShowEnrollDialog(false)
      setSelectedCourse(null)
      loadData() // Reload to update enrollment status
      alert('تم التسجيل في الكورس بنجاح')
    } catch (error) {
      console.error('Error enrolling in course:', error)
      alert('فشل في التسجيل في الكورس')
    } finally {
      setEnrolling(false)
    }
  }

  const openViewDialog = (course: Course) => {
    setSelectedCourse(course)
    setShowViewDialog(true)
  }

  const openEnrollDialog = (course: Course) => {
    setSelectedCourse(course)
    setShowEnrollDialog(true)
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

  const getEnrollmentStatus = (course: Course) => {
    if (!course.enrollment) {
      return { status: 'not_enrolled', text: 'غير مسجل', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }
    }
    
    switch (course.enrollment.status) {
      case 'enrolled':
        return { status: 'enrolled', text: 'مسجل', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
      case 'completed':
        return { status: 'completed', text: 'مكتمل', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' }
      case 'dropped':
        return { status: 'dropped', text: 'منسحب', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
      default:
        return { status: 'unknown', text: 'غير معروف', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  return (
    <DashboardLayout userRole="student" userName={userData.name} userAvatar={userData.avatar}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            الكورسات المتاحة
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            استكشف الكورسات المتاحة وسجل في ما يهمك
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              لا توجد كورسات متاحة
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              لم يتم نشر أي كورسات بعد
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const enrollmentStatus = getEnrollmentStatus(course)
              return (
                <div
                  key={course.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  {/* Course Image */}
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpenIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${enrollmentStatus.color}`}>
                        {enrollmentStatus.text}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <AcademicCapIcon className="w-4 h-4" />
                        <span>{course.teacher.name}</span>
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

                      {course.stats && (
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <UserGroupIcon className="w-4 h-4" />
                            <span>{course.stats.total_students}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-4 h-4" />
                            <span>{course.stats.average_rating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpenIcon className="w-4 h-4" />
                            <span>{course.stats.total_lessons}</span>
                          </div>
                        </div>
                      )}

                      {course.enrollment && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <ChartBarIcon className="w-4 h-4" />
                          <span>التقدم: {course.enrollment.progress_percentage}%</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {course.price === 0 ? 'مجاني' : `${course.price} ريال`}
                      </div>

                      <div className="flex items-center gap-2">
                        {course.enrollment ? (
                          <button
                            onClick={() => window.location.href = `/dashboard/student/courses/${course.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <PlayIcon className="w-4 h-4" />
                            {course.enrollment.status === 'completed' ? 'مراجعة' : 'متابعة'}
                          </button>
                        ) : (
                          <button
                            onClick={() => openEnrollDialog(course)}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                          >
                            تسجيل
                          </button>
                        )}

                        <ActionIcons
                          onView={() => openViewDialog(course)}
                          viewTitle="عرض تفاصيل الكورس"
                          showEdit={false}
                          showDelete={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* View Course Dialog */}
        <Dialog
          isOpen={showViewDialog}
          onClose={() => setShowViewDialog(false)}
          title="تفاصيل الكورس"
        >
          {selectedCourse && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedCourse.title}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEnrollmentStatus(selectedCourse).color}`}>
                    {getEnrollmentStatus(selectedCourse).text}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(selectedCourse.level)}`}>
                    {getLevelText(selectedCourse.level)}
                  </span>
                </div>
              </div>

              {selectedCourse.thumbnail_url && (
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={selectedCourse.thumbnail_url}
                    alt={selectedCourse.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {selectedCourse.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>المعلم: {selectedCourse.teacher.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                  <span>المدة: {selectedCourse.duration_hours} ساعة</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <span>اللغة: {selectedCourse.language}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <span>السعر: {selectedCourse.price === 0 ? 'مجاني' : `${selectedCourse.price} ريال`}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <span>تاريخ النشر: {formatDate(selectedCourse.created_at)}</span>
                </div>
              </div>

              {selectedCourse.stats && (
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    إحصائيات الكورس:
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{selectedCourse.stats.total_students} طالب</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <StarIcon className="w-4 h-4" />
                      <span>{selectedCourse.stats.average_rating.toFixed(1)} تقييم</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <BookOpenIcon className="w-4 h-4" />
                      <span>{selectedCourse.stats.total_lessons} درس</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedCourse.enrollment && (
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    معلومات التسجيل:
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>تاريخ التسجيل: {formatDate(selectedCourse.enrollment.enrolled_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <ChartBarIcon className="w-4 h-4" />
                      <span>التقدم: {selectedCourse.enrollment.progress_percentage}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedCourse && !selectedCourse.enrollment && (
              <button
                onClick={() => {
                  setShowViewDialog(false)
                  openEnrollDialog(selectedCourse)
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                تسجيل في الكورس
              </button>
            )}
            <button
              onClick={() => setShowViewDialog(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            >
              إغلاق
            </button>
          </DialogFooter>
        </Dialog>

        {/* Enroll Dialog */}
        <Dialog
          isOpen={showEnrollDialog}
          onClose={() => setShowEnrollDialog(false)}
          title="تسجيل في الكورس"
          maxWidth="max-w-md"
        >
          {selectedCourse && (
            <div className="space-y-4">
              <div className="text-center">
                <BookOpenIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedCourse.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  هل أنت متأكد من التسجيل في هذا الكورس؟
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  تفاصيل الكورس:
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• المعلم: {selectedCourse.teacher.name}</li>
                  <li>• المدة: {selectedCourse.duration_hours} ساعة</li>
                  <li>• المستوى: {getLevelText(selectedCourse.level)}</li>
                  <li>• السعر: {selectedCourse.price === 0 ? 'مجاني' : `${selectedCourse.price} ريال`}</li>
                  <li>• اللغة: {selectedCourse.language}</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {enrolling ? 'جاري التسجيل...' : 'تأكيد التسجيل'}
            </button>
            <button
              onClick={() => setShowEnrollDialog(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              إلغاء
            </button>
          </DialogFooter>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}




