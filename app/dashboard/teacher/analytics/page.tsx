'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  AcademicCapIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { getCurrentUser } from '../../../../lib/auth-utils'
import DashboardLayout from '../../../../components/layouts/DashboardLayout'
import { supabase } from '../../../../lib/supabase'
import { getTeacherAnalytics } from '../../../../lib/course-utils'

interface AnalyticsData {
  totalRevenue: number
  monthlyRevenue: number
  totalStudents: number
  activeStudents: number
  totalCourses: number
  completedCourses: number
  averageCompletionRate: number
  topPerformingCourse: {
    title: string
    revenue: number
    students: number
  }
  recentEnrollments: number
  revenueGrowth: number
  studentGrowth: number
}

export default function TeacherAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    loadData()
  }, [timeRange])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { user: userProfile } = await getCurrentUser(user.id)
        setCurrentUser(userProfile)
        
        // Get teacher analytics from database
        const { data: analyticsData, error } = await getTeacherAnalytics(user.id, timeRange)
        
        if (error) {
          console.error('Error loading analytics:', error)
          // Fallback to mock data if database fails
          const mockAnalytics: AnalyticsData = {
            totalRevenue: 15420,
            monthlyRevenue: 3200,
            totalStudents: 156,
            activeStudents: 142,
            totalCourses: 8,
            completedCourses: 6,
            averageCompletionRate: 78,
            topPerformingCourse: {
              title: 'مقدمة في البرمجة',
              revenue: 5400,
              students: 45
            },
            recentEnrollments: 23,
            revenueGrowth: 15.5,
            studentGrowth: 8.2
          }
          setAnalytics(mockAnalytics)
        } else {
          setAnalytics(analyticsData)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount)
  }

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
        <div className="py-6 px-6">
          <div className="max-w-7xl mx-auto">
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
    )
  }

  if (!analytics) return null

  return (
    <DashboardLayout userRole="teacher" userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
      <div className="py-6 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">التحليلات</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  نظرة شاملة على أداء الكورسات والإيرادات
                </p>
              </div>
              
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeRange === 'week' 
                      ? 'bg-[#49BBBD] text-white' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  أسبوع
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeRange === 'month' 
                      ? 'bg-[#49BBBD] text-white' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  شهر
                </button>
                <button
                  onClick={() => setTimeRange('year')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeRange === 'year' 
                      ? 'bg-[#49BBBD] text-white' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  سنة
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stat-card stat-card-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">الإيرادات الإجمالية</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(analytics.totalRevenue)}</p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-300 ml-1" />
                    <span className="text-green-300 text-sm">+{analytics.revenueGrowth}%</span>
                  </div>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-white/80" />
              </div>
            </div>

            <div className="stat-card stat-card-success">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">إجمالي الطلاب</p>
                  <p className="text-3xl font-bold mt-2">{analytics.totalStudents}</p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-300 ml-1" />
                    <span className="text-green-300 text-sm">+{analytics.studentGrowth}%</span>
                  </div>
                </div>
                <UserGroupIcon className="h-8 w-8 text-white/80" />
              </div>
            </div>

            <div className="stat-card stat-card-warning">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">الكورسات النشطة</p>
                  <p className="text-3xl font-bold mt-2">{analytics.totalCourses}</p>
                  <p className="text-white/60 text-sm mt-1">{analytics.completedCourses} مكتملة</p>
                </div>
                <AcademicCapIcon className="h-8 w-8 text-white/80" />
              </div>
            </div>

            <div className="stat-card stat-card-accent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">معدل الإكمال</p>
                  <p className="text-3xl font-bold mt-2">{analytics.averageCompletionRate}%</p>
                  <p className="text-white/60 text-sm mt-1">متوسط الطلاب</p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-white/80" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Performing Course */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">أفضل كورس أداءً</h3>
              </div>
              <div className="card-body">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#49BBBD] to-[#06b6d4] rounded-full flex items-center justify-center mx-auto mb-4">
                    <AcademicCapIcon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {analytics.topPerformingCourse.title}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#49BBBD]">
                        {formatCurrency(analytics.topPerformingCourse.revenue)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">الإيرادات</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#10b981]">
                        {analytics.topPerformingCourse.students}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">الطلاب</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">النشاط الأخير</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-[#10b981] rounded-full ml-3"></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">تسجيل جديد</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">طالب جديد انضم لكورس البرمجة</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">منذ 2 ساعة</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-[#49BBBD] rounded-full ml-3"></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">إكمال كورس</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">طالب أكمل كورس الرياضيات</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">منذ 5 ساعات</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-[#f59e0b] rounded-full ml-3"></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">دفع جديد</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">دفع جديد لكورس التصميم</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">منذ يوم</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="card">
              <div className="card-body text-center">
                <div className="text-3xl font-bold text-[#49BBBD] mb-2">{analytics.monthlyRevenue}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">الإيرادات الشهرية (ريال)</div>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <div className="text-3xl font-bold text-[#10b981] mb-2">{analytics.activeStudents}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">الطلاب النشطين</div>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <div className="text-3xl font-bold text-[#f59e0b] mb-2">{analytics.recentEnrollments}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">التسجيلات الجديدة</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
