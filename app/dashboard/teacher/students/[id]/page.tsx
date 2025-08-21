'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon, AcademicCapIcon, ClockIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { getCurrentUser } from '../../../../../lib/auth-utils'
import DashboardLayout from '../../../../../components/layouts/DashboardLayout'
import { supabase } from '../../../../../lib/supabase'

interface Student {
  id: string
  name: string
  email: string
  avatar_url: string
  enrolled_courses: number
  completed_courses: number
  total_progress: number
  last_activity: string
}

interface Enrollment {
  id: string
  course: {
    id: string
    title: string
    description: string
    thumbnail_url: string
  }
  enrolled_at: string
  completed_at: string | null
  progress: number
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string
  
  const [student, setStudent] = useState<Student | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [studentId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { user: userProfile } = await getCurrentUser(user.id)
        setCurrentUser(userProfile)
        
        // Get student details
        const { data: studentData, error: studentError } = await supabase
          .from('users')
          .select('*')
          .eq('id', studentId)
          .single()
        
        if (studentError) {
          alert('لم يتم العثور على الطالب')
          router.push('/dashboard/teacher/students')
          return
        }
        
        if (studentData) {
          // Get student enrollments for teacher's courses
          const { data: enrollmentsData, error: enrollmentsError } = await supabase
            .from('course_enrollments')
            .select(`
              id,
              enrolled_at,
              completed_at,
              course:courses(
                id,
                title,
                description,
                thumbnail_url
              )
            `)
            .eq('student_id', studentId)
            .eq('course.teacher_id', user.id)
          
          if (!enrollmentsError && enrollmentsData) {
            const processedEnrollments = enrollmentsData.map(enrollment => ({
              id: enrollment.id,
              course: enrollment.course,
              enrolled_at: enrollment.enrolled_at,
              completed_at: enrollment.completed_at,
              progress: enrollment.completed_at ? 100 : 0 // Simplified progress calculation
            }))
            
            setEnrollments(processedEnrollments)
            
            // Calculate student stats
            const studentStats = {
              id: studentData.id,
              name: studentData.name,
              email: studentData.email,
              avatar_url: studentData.avatar_url,
              enrolled_courses: processedEnrollments.length,
              completed_courses: processedEnrollments.filter(e => e.completed_at).length,
              total_progress: processedEnrollments.length > 0 
                ? Math.round(processedEnrollments.reduce((sum, e) => sum + e.progress, 0) / processedEnrollments.length)
                : 0,
              last_activity: processedEnrollments.length > 0 
                ? processedEnrollments[0].enrolled_at 
                : new Date().toISOString()
            }
            
            setStudent(studentStats)
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
        <div className="py-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                </div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!student) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
        <div className="py-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                الطالب غير موجود
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                عذراً، الطالب الذي تبحث عنه غير متاح
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="teacher" userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
      <div className="py-6 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-4"
              >
                <ArrowLeftIcon className="h-5 w-5 ml-1" />
                رجوع
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تفاصيل الطالب</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Student Info */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  {student.avatar_url ? (
                    <img 
                      src={student.avatar_url} 
                      alt={student.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-[#49BBBD] to-[#06b6d4] rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {student.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">{student.email}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <AcademicCapIcon className="w-8 h-8 text-[#49BBBD] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {student.enrolled_courses}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الكورسات المسجلة</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <BookOpenIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {student.completed_courses}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الكورسات المكتملة</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <ClockIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {student.total_progress}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">التقدم العام</p>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      آخر نشاط: {new Date(student.last_activity).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    الكورسات المسجلة ({enrollments.length})
                  </h3>
                </div>
                
                <div className="p-6">
                  {enrollments.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        لا توجد كورسات مسجلة
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        هذا الطالب لم يسجل في أي كورس بعد
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enrollments.map((enrollment) => (
                        <div key={enrollment.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                {enrollment.course.thumbnail_url ? (
                                  <img 
                                    src={enrollment.course.thumbnail_url} 
                                    alt={enrollment.course.title}
                                    className="w-12 h-12 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-r from-[#49BBBD] to-[#06b6d4] rounded-lg flex items-center justify-center">
                                    <BookOpenIcon className="w-6 h-6 text-white" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {enrollment.course.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {enrollment.course.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span>تاريخ التسجيل: {new Date(enrollment.enrolled_at).toLocaleDateString('en-US')}</span>
                                  {enrollment.completed_at && (
                                    <span className="text-green-600 dark:text-green-400">
                                      مكتمل في {new Date(enrollment.completed_at).toLocaleDateString('en-US')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {enrollment.progress}%
                                </div>
                                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-[#49BBBD] to-[#06b6d4] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${enrollment.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  إجراءات سريعة
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/dashboard/teacher/students/${studentId}/messages`)}
                    className="w-full btn-primary btn-sm"
                  >
                    <AcademicCapIcon className="h-4 w-4" />
                    إرسال رسالة
                  </button>
                  
                  <button
                    onClick={() => router.push(`/dashboard/teacher/students/${studentId}/progress`)}
                    className="w-full btn-secondary btn-sm"
                  >
                    <BookOpenIcon className="h-4 w-4" />
                    عرض التقدم
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
