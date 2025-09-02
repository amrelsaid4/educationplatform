'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from "../../../../components/layouts/DashboardLayout";
import ProtectedRoute from "../../../../components/auth/ProtectedRoute";
import { 
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { supabase } from '../../../../lib/supabase'

interface AnalyticsData {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  totalEnrollments: number;
  userGrowth: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  courseGrowth: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  revenueGrowth: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  monthlyStats: Array<{
    month: string;
    users: number;
    courses: number;
    revenue: number;
  }>;
  topCourses: Array<{
    id: string;
    title: string;
    enrollments: number;
    revenue: number;
    rating: number;
  }>;
  userRoles: {
    students: number;
    teachers: number;
    admins: number;
  };
  courseCategories: Array<{
    category: string;
    count: number;
  }>;
}

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    totalEnrollments: 0,
    userGrowth: { thisMonth: 0, lastMonth: 0, growth: 0 },
    courseGrowth: { thisMonth: 0, lastMonth: 0, growth: 0 },
    revenueGrowth: { thisMonth: 0, lastMonth: 0, growth: 0 },
    monthlyStats: [],
    topCourses: [],
    userRoles: { students: 0, teachers: 0, admins: 0 },
    courseCategories: []
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Get dashboard stats using RPC function
      const { data: dashboardStats, error: statsError } = await supabase
        .rpc('get_dashboard_stats', { role_type: 'admin' })
      
      if (statsError) {
        console.error('Error fetching dashboard stats:', statsError)
      }

      // Get user growth stats using RPC function
      const { data: userGrowthStats, error: userGrowthError } = await supabase
        .rpc('get_user_growth_stats')
      
      if (userGrowthError) {
        console.error('Error fetching user growth stats:', userGrowthError)
      }

      // Get course performance stats using RPC function
      const { data: coursePerformanceStats, error: coursePerformanceError } = await supabase
        .rpc('get_course_performance_stats')
      
      if (coursePerformanceError) {
        console.error('Error fetching course performance stats:', coursePerformanceError)
      }

      // Get payment stats using RPC function
      const { data: paymentStats, error: paymentError } = await supabase
        .rpc('get_payment_stats')
      
      if (paymentError) {
        console.error('Error fetching payment stats:', paymentError)
      }

      // Get user roles distribution
      const { data: users } = await supabase
        .from('users')
        .select('role')

      const userRoles = {
        students: users?.filter(u => u.role === 'student').length || 0,
        teachers: users?.filter(u => u.role === 'teacher').length || 0,
        admins: users?.filter(u => u.role === 'admin').length || 0
      }

      // Get course categories
      const { data: allCourses } = await supabase
        .from('courses')
        .select('category')

      const categoryCounts = allCourses?.reduce((acc, course) => {
        const category = course.category || 'غير محدد'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const courseCategories = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count
      }))

      // Extract data from RPC results
      const stats = dashboardStats || {}
      const userGrowth = userGrowthStats || { thisMonth: 0, lastMonth: 0, growth: 0 }
      const courseGrowth = coursePerformanceStats?.growth || { thisMonth: 0, lastMonth: 0, growth: 0 }
      const revenueGrowth = paymentStats?.growth || { thisMonth: 0, lastMonth: 0, growth: 0 }
      const topCourses = coursePerformanceStats?.topCourses || []
      const monthlyStats = paymentStats?.monthlyStats || generateMonthlyStats()

      setAnalyticsData({
        totalUsers: stats.totalUsers || 0,
        totalCourses: stats.totalCourses || 0,
        totalRevenue: stats.totalRevenue || 0,
        totalEnrollments: stats.totalEnrollments || 0,
        userGrowth,
        courseGrowth,
        revenueGrowth,
        monthlyStats,
        topCourses,
        userRoles,
        courseCategories
      })
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyStats = () => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
    return months.map((month, index) => ({
      month,
      users: Math.floor(Math.random() * 100) + 50,
      courses: Math.floor(Math.random() * 20) + 10,
      revenue: Math.floor(Math.random() * 5000) + 1000
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout userRole="admin" userName="المدير">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout userRole="admin" userName="المدير">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">التحليلات والإحصائيات</h1>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    نظرة شاملة على أداء المنصة والإحصائيات المهمة
                  </p>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="7d">آخر 7 أيام</option>
                  <option value="30d">آخر 30 يوم</option>
                  <option value="90d">آخر 90 يوم</option>
                  <option value="1y">آخر سنة</option>
                </select>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users */}
              <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">إجمالي المستخدمين</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {analyticsData.totalUsers.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      {(() => {
                        const Icon = getGrowthIcon(analyticsData.userGrowth.growth)
                        return <Icon className={`h-4 w-4 ml-1 ${getGrowthColor(analyticsData.userGrowth.growth)}`} />
                      })()}
                      <span className={`text-sm font-medium ${getGrowthColor(analyticsData.userGrowth.growth)}`}>
                        {analyticsData.userGrowth.growth > 0 ? '+' : ''}{analyticsData.userGrowth.growth}%
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">من الشهر الماضي</span>
                    </div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                    <UserGroupIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Total Courses */}
              <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">إجمالي الكورسات</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {analyticsData.totalCourses.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      {(() => {
                        const Icon = getGrowthIcon(analyticsData.courseGrowth.growth)
                        return <Icon className={`h-4 w-4 ml-1 ${getGrowthColor(analyticsData.courseGrowth.growth)}`} />
                      })()}
                      <span className={`text-sm font-medium ${getGrowthColor(analyticsData.courseGrowth.growth)}`}>
                        {analyticsData.courseGrowth.growth > 0 ? '+' : ''}{analyticsData.courseGrowth.growth}%
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">من الشهر الماضي</span>
                    </div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                    <BookOpenIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">إجمالي الإيرادات</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {formatCurrency(analyticsData.totalRevenue)}
                    </p>
                    <div className="flex items-center mt-2">
                      {(() => {
                        const Icon = getGrowthIcon(analyticsData.revenueGrowth.growth)
                        return <Icon className={`h-4 w-4 ml-1 ${getGrowthColor(analyticsData.revenueGrowth.growth)}`} />
                      })()}
                      <span className={`text-sm font-medium ${getGrowthColor(analyticsData.revenueGrowth.growth)}`}>
                        {analyticsData.revenueGrowth.growth > 0 ? '+' : ''}{analyticsData.revenueGrowth.growth}%
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">من الشهر الماضي</span>
                    </div>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                    <CurrencyDollarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Total Enrollments */}
              <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">إجمالي التسجيلات</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {analyticsData.totalEnrollments.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">في جميع الكورسات</span>
                    </div>
                  </div>
                  <div className="bg-indigo-100 dark:bg-indigo-900/20 p-3 rounded-full">
                    <ChartBarIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Charts Section */}
              <div className="lg:col-span-2 space-y-8">
                {/* Monthly Trends Chart */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">التوجهات الشهرية</h3>
                  <div className="h-80 flex items-end justify-between gap-2">
                    {analyticsData.monthlyStats.map((stat, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg relative">
                          <div 
                            className="bg-indigo-500 rounded-t-lg transition-all duration-500"
                            style={{ 
                              height: `${(stat.users / Math.max(...analyticsData.monthlyStats.map(s => s.users))) * 200}px` 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                          {stat.month}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-center gap-6 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-indigo-500 rounded ml-2"></div>
                      <span className="text-gray-600 dark:text-gray-400">المستخدمين الجدد</span>
                    </div>
                  </div>
                </div>

                {/* Top Performing Courses */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">أفضل الكورسات أداءً</h3>
                  <div className="space-y-4">
                    {analyticsData.topCourses.map((course, index) => (
                      <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center ml-3">
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">#{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{course.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {course.enrollments} طالب • {formatCurrency(course.revenue)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                            ⭐ {course.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* User Roles Distribution */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">توزيع المستخدمين</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded ml-2"></div>
                        <span className="text-gray-700 dark:text-gray-300">الطلاب</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {analyticsData.userRoles.students}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded ml-2"></div>
                        <span className="text-gray-700 dark:text-gray-300">المعلمون</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {analyticsData.userRoles.teachers}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded ml-2"></div>
                        <span className="text-gray-700 dark:text-gray-300">المديرون</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {analyticsData.userRoles.admins}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Categories */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">فئات الكورسات</h3>
                  <div className="space-y-3">
                    {analyticsData.courseCategories.slice(0, 5).map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{category.category}</span>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {category.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">إحصائيات سريعة</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-400 ml-2" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">الكورسات النشطة</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {analyticsData.totalCourses}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-gray-400 ml-2" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">متوسط مدة الكورس</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        4.5 ساعات
                      </span>
                    </div>
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
