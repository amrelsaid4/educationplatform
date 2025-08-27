'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import { 
  BookOpenIcon, 
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon 
} from "@heroicons/react/24/outline";
import { getStudentEnrollments, getStudentDashboardStats } from '../../../lib/course-utils'
import { getCurrentUser } from '../../../lib/auth-utils'
import { supabase } from '../../../lib/supabase'
import type { CourseEnrollment } from '../../../lib/course-utils'
import StudentAchievements from '@/components/StudentAchievements'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [studentData, setStudentData] = useState({
    name: "",
    avatar: undefined,
    stats: {
      enrolledCourses: 0,
      completedLessons: 0,
      totalHoursLearned: 0,
    },
    recentCourses: [] as any[],
    upcomingAssignments: [] as any[],
    achievements: [
      { name: "متعلم سريع", description: "أكمل 5 دروس في يوم واحد", icon: "⚡" },
      { name: "درجة كاملة", description: "حصل على 100% في اختبار الرياضيات", icon: "🎯" },
      { name: "المثابرة", description: "سلسلة تعلم لمدة 7 أيام", icon: "🔥" },
    ]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { user: userProfile } = await getCurrentUser(user.id)
        
        // Get dashboard stats
        const { data: stats } = await getStudentDashboardStats(user.id)
        
        // Get enrolled courses
        const { data: enrollments } = await getStudentEnrollments(user.id)
        
        // Transform data for display
        const recentCourses = enrollments?.slice(0, 3).map(enrollment => ({
          id: enrollment.course.id,
          title: enrollment.course.title,
          instructor: enrollment.course.teacher?.name || 'غير محدد',
          progress: enrollment.progress || 0,
          nextLesson: "الدرس التالي",
          dueDate: new Date(enrollment.enrolled_at).toLocaleDateString('ar-SA'),
        })) || []

        setStudentData({
          name: userProfile?.name || '',
          avatar: userProfile?.avatar_url,
          stats: {
            enrolledCourses: stats?.enrolledCourses || 0,
            completedLessons: stats?.completedLessons || 0,
            totalHoursLearned: stats?.totalHours || 0,
          },
          recentCourses,
          upcomingAssignments: [], // Will be implemented later
          achievements: studentData.achievements
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={studentData.name} userAvatar={studentData.avatar}>
        <div className="py-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }
  return (
    <DashboardLayout userRole="student" userName={studentData.name} userAvatar={studentData.avatar}>
      <div className="py-6 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مرحباً بك، {studentData.name}!</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              تابع رحلة التعلم وراقب تقدمك.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* ساعات التعلم */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">ساعات التعلم</p>
                  <p className="text-3xl font-bold mt-2">{studentData.stats.totalHoursLearned} ساعة</p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-purple-200" />
              </div>
            </div>

            {/* الدروس المكتملة */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">الدروس المكتملة</p>
                  <p className="text-3xl font-bold mt-2">{studentData.stats.completedLessons}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-orange-200" />
              </div>
            </div>

            {/* ساعات التعلم */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">ساعات التعلم</p>
                  <p className="text-3xl font-bold mt-2">{studentData.stats.totalHoursLearned} ساعة</p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-green-200" />
              </div>
            </div>

            {/* الكورسات المسجلة */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">الكورسات المسجلة</p>
                  <p className="text-3xl font-bold mt-2">{studentData.stats.enrolledCourses}</p>
                </div>
                <BookOpenIcon className="h-8 w-8 text-blue-200" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Continue Learning */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">تابع التعلم</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {studentData.recentCourses.map((course) => (
                      <div key={course.id} className="group border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-600 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {course.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{course.instructor}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">الدرس التالي: {course.nextLesson}</p>
                            
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600 dark:text-gray-400">التقدم</span>
                                <span className="font-semibold text-teal-600 dark:text-teal-400">{course.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-300"
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => window.location.href = `/dashboard/student/courses/${course.id}`}
                            className="mr-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                          >
                            <PlayIcon className="h-4 w-4 ml-2" />
                            متابعة
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Assignments */}
              <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">المهام القادمة</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {studentData.upcomingAssignments.map((assignment) => (
                      <div key={assignment.id} className="border-r-4 border-orange-400 pr-4 py-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{assignment.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{assignment.course}</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-medium">موعد التسليم: {assignment.dueDate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Student Achievements */}
                              <StudentAchievements userId={user?.id || ''} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
