'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import {
  BookOpenIcon,
  UserGroupIcon,
  PlusIcon,
  EyeIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";
import { getCoursesByTeacher, getDashboardStats } from '../../../lib/course-utils'
import { useAuth } from '../../../components/providers/AuthProvider'
import Link from 'next/link'

export default function TeacherDashboard() {
  const [teacherData, setTeacherData] = useState({
    name: "",
    avatar: undefined as string | undefined,
    stats: {
      totalCourses: 0,
      totalStudents: 0,
      pendingAssignments: 0,
      monthlyRevenue: 0,
    },
    courses: [] as any[],
    recentActivity: [] as any[],
    pendingReviews: [] as any[]
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      loadDashboardData(user.id)
    } else {
      setLoading(false)
    }
  }, [user?.id])

  const loadDashboardData = async (userId: string) => {
    try {
      setLoading(true)
      // Get dashboard stats
      const { data: stats } = await getDashboardStats('teacher', userId)
      // Get teacher courses
      const { data: courses } = await getCoursesByTeacher(userId)
      // Transform courses data
      const transformedCourses = courses?.slice(0, 3).map(course => ({
        id: course.id,
        title: course.title,
        students: course.enrollment_count || 0,
        progress: 75,
        status: course.status === 'published' ? 'منشور' : course.status === 'draft' ? 'مسودة' : 'مؤرشف',
        revenue: course.is_free ? 0 : (course.price || 0) * (course.enrollment_count || 0),
      })) || []

      setTeacherData({
        name: user?.name || '',
        avatar: user?.avatar_url,
        stats: {
          totalCourses: (stats as any)?.totalCourses || 0,
          totalStudents: (stats as any)?.totalStudents || 0,
          pendingAssignments: 0,
          monthlyRevenue: (stats as any)?.monthlyRevenue || 0,
        },
        courses: transformedCourses,
        recentActivity: [],
        pendingReviews: []
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['teacher']}>
        <DashboardLayout userRole="teacher" userName={teacherData.name} userAvatar={teacherData.avatar}>
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['teacher']}>
      <DashboardLayout userRole="teacher" userName={teacherData.name} userAvatar={teacherData.avatar}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مرحباً بك، {teacherData.name}!</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                إدارة الكورسات ومتابعة تقدم الطلاب.
              </p>
            </div>
            <Link href="/dashboard/teacher/courses/create">
              <button className="btn-primary flex items-center">
                <PlusIcon className="h-5 w-5 ml-2" />
                إنشاء كورس جديد
              </button>
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat-card stat-card-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">إجمالي الكورسات</p>
                  <p className="text-3xl font-bold mt-2">{teacherData.stats.totalCourses}</p>
                </div>
                <BookOpenIcon className="h-8 w-8 text-white/80" />
              </div>
            </div>

            <div className="stat-card stat-card-success">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">إجمالي الطلاب</p>
                  <p className="text-3xl font-bold mt-2">{teacherData.stats.totalStudents}</p>
                </div>
                <UserGroupIcon className="h-8 w-8 text-white/80" />
              </div>
            </div>

            <div className="stat-card stat-card-warning">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">المراجعات المعلقة</p>
                  <p className="text-3xl font-bold mt-2">{teacherData.stats.pendingAssignments}</p>
                </div>
                <ClipboardDocumentCheckIcon className="h-8 w-8 text-white/80" />
              </div>
            </div>

            <div className="stat-card stat-card-accent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">الإيرادات الشهرية</p>
                  <p className="text-3xl font-bold mt-2">${teacherData.stats.monthlyRevenue}</p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-white/80" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* My Courses */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="card-header flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">كورساتي</h3>
                  <Link href="/dashboard/teacher/courses">
                    <button className="text-sm text-[#49BBBD] hover:text-[#49BBBD]/80 font-medium transition-colors">
                      عرض الكل
                    </button>
                  </Link>
                </div>
                <div className="card-body">
                  {teacherData.courses.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        لا توجد كورسات بعد
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        ابدأ بإنشاء كورسك الأول
                      </p>
                      <Link href="/dashboard/teacher/courses/create">
                        <button className="mt-4 btn-primary flex items-center">
                          <PlusIcon className="h-5 w-5 ml-2" />
                          إنشاء كورس جديد
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {teacherData.courses.map((course) => (
                        <div key={course.id} className="group border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-[#49BBBD]/20 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-[#49BBBD] transition-colors">
                                {course.title}
                              </h4>
                              <div className="flex items-center gap-6 mt-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center">
                                  <UserGroupIcon className="h-4 w-4 ml-1" />
                                  {course.students} طالب
                                </div>
                                <div className="flex items-center">
                                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${course.status === 'منشور'
                                    ? 'bg-[#10b981]/10 text-[#10b981]'
                                    : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                                    }`}>
                                    {course.status}
                                  </span>
                                </div>
                                <div className="flex items-center text-[#10b981] font-medium">
                                  <CurrencyDollarIcon className="h-4 w-4 ml-1" />
                                  ${course.revenue}
                                </div>
                              </div>
                              <div className="mt-4">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-[#49BBBD] to-[#06b6d4] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${course.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            <div className="flex-shrink-0 flex gap-2 mr-6">
                              <Link href={`/dashboard/teacher/courses/${course.id}`}>
                                <button className="btn-secondary btn-sm">
                                  <EyeIcon className="h-4 w-4" />
                                  عرض
                                </button>
                              </Link>
                              <Link href={`/dashboard/teacher/courses/${course.id}/edit`}>
                                <button className="btn-primary btn-sm">
                                  تحرير
                                </button>
                              </Link>
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
            <div className="space-y-6">
              {/* Pending Reviews */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">المراجعات المعلقة</h3>
                </div>
                <div className="card-body">
                  {teacherData.pendingReviews.length === 0 ? (
                    <div className="text-center py-8">
                      <ClipboardDocumentCheckIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        لا توجد مراجعات معلقة
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teacherData.pendingReviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="border-r-4 border-[#f59e0b] pr-4 py-3 bg-[#f59e0b]/5 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{review.assignment}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{review.student}</p>
                          <p className="text-xs text-[#f59e0b] mt-2 font-medium">تم التسليم: {review.submittedAt}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">النشاط الأخير</h3>
                </div>
                <div className="card-body">
                  {teacherData.recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <ArrowTrendingUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        لا يوجد نشاط حديث
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teacherData.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-[#49BBBD] rounded-full mt-2"></div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{activity.title}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{activity.course}</p>
                            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
