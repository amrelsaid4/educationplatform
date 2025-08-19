'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from "../../../components/layouts/DashboardLayout";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import { 
  UserGroupIcon, 
  BookOpenIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon 
} from "@heroicons/react/24/outline";
import { getAllUsers, getDashboardStats, getPublishedCourses } from '../../../lib/course-utils'
import { getCurrentUser } from '../../../lib/auth-utils'
import { supabase } from '../../../lib/supabase'

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState({
    name: "مدير النظام",
    avatar: undefined,
    stats: {
      totalUsers: 0,
      totalCourses: 0,
      totalRevenue: 0,
      activeIssues: 0,
    },
    userGrowth: {
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    recentUsers: [] as any[],
    topCourses: [] as any[],
    systemAlerts: [] as any[]
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
        const { data: stats } = await getDashboardStats('admin')
        
        // Get all users
        const { data: users } = await getAllUsers()
        
        // Get published courses
        const { data: courses } = await getPublishedCourses()
        
        // Transform recent users
        const recentUsers = users?.slice(0, 5).map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role === 'student' ? 'طالب' : user.role === 'teacher' ? 'معلم' : 'مدير',
          joinedAt: new Date(user.created_at).toLocaleDateString('ar-SA'),
          status: user.is_active ? 'نشط' : 'معلق',
        })) || []

        // Transform top courses
        const topCourses = courses?.slice(0, 3).map(course => ({
          id: course.id,
          title: course.title,
          instructor: course.teacher?.name || 'غير محدد',
          students: course.enrollment_count || 0,
          revenue: course.is_free ? 0 : (course.price || 0) * (course.enrollment_count || 0),
          rating: course.rating || 0,
        })) || []

        setAdminData({
          name: userProfile?.name || "مدير النظام",
          avatar: userProfile?.avatar_url,
          stats: {
            totalUsers: (stats as any)?.totalUsers || 0,
            totalCourses: (stats as any)?.totalCourses || 0,
            totalRevenue: 0, // Will be calculated later
            activeIssues: 0, // Will be implemented later
          },
          userGrowth: {
            thisMonth: 0, // Will be calculated later
            lastMonth: 0,
            growth: 0
          },
          recentUsers,
          topCourses,
          systemAlerts: [] // Will be implemented later
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
      description: "بعض المدفوعات تفشل في المعالجة",
      time: "منذ 4 ساعات",
    },
  ]
};

  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout userRole="admin" userName={adminData.name} userAvatar={adminData.avatar}>
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
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
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout userRole="admin" userName={adminData.name} userAvatar={adminData.avatar}>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">لوحة تحكم المدير</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                مراقبة أداء المنصة، إدارة المستخدمين، الكورسات، وإعدادات النظام.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">إجمالي المستخدمين</p>
                    <p className="text-3xl font-bold mt-2">{adminData.stats.totalUsers.toLocaleString()}</p>
                  </div>
                  <UserGroupIcon className="h-8 w-8 text-blue-200" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <ArrowTrendingUpIcon className="h-4 w-4 ml-1" />
                    <span className="font-medium">+{adminData.userGrowth.growth}%</span>
                    <span className="text-blue-200 ml-1">من الشهر الماضي</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">إجمالي الكورسات</p>
                    <p className="text-3xl font-bold mt-2">{adminData.stats.totalCourses}</p>
                  </div>
                  <BookOpenIcon className="h-8 w-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">إجمالي الإيرادات</p>
                    <p className="text-3xl font-bold mt-2">${adminData.stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <CurrencyDollarIcon className="h-8 w-8 text-purple-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">المشاكل النشطة</p>
                    <p className="text-3xl font-bold mt-2">{adminData.stats.activeIssues}</p>
                  </div>
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-200" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Recent Users */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">المستخدمون الجدد</h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors">
                      عرض جميع المستخدمين
                    </button>
                  </div>
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            المستخدم
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            الدور
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            الحالة
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            تاريخ الانضمام
                          </th>
                          <th className="relative px-6 py-3">
                            <span className="sr-only">إجراءات</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {adminData.recentUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'معلم' 
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                user.status === 'نشط' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {user.joinedAt}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                              <div className="flex gap-2">
                                <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Courses */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">أفضل الكورسات أداءً</h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors">
                      عرض جميع الكورسات
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {adminData.topCourses.map((course, index) => (
                        <div key={course.id} className="group border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-600 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-white">#{index + 1}</span>
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {course.title}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400">{course.instructor}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
                              <div className="text-center">
                                <div className="font-bold text-gray-900 dark:text-white text-lg">{course.students}</div>
                                <div>طالب</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-green-600 dark:text-green-400 text-lg">${course.revenue}</div>
                                <div>إيرادات</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-yellow-600 dark:text-yellow-400 text-lg">{course.rating}</div>
                                <div>تقييم</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* System Alerts */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">تنبيهات النظام</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {adminData.systemAlerts.map((alert) => (
                        <div key={alert.id} className={`border-r-4 pr-4 py-3 rounded-lg ${
                          alert.type === 'error' ? 'border-red-400 bg-red-50 dark:bg-red-900/20' :
                          alert.type === 'warning' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        }`}>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{alert.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{alert.description}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{alert.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">إجراءات سريعة</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <button className="w-full text-right px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600 transition-all duration-200">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 ml-3" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">إدارة المستخدمين</span>
                      </div>
                    </button>
                    <button className="w-full text-right px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600 transition-all duration-200">
                      <div className="flex items-center">
                        <BookOpenIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 ml-3" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">مراجعة الكورسات</span>
                      </div>
                    </button>
                    <button className="w-full text-right px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600 transition-all duration-200">
                      <div className="flex items-center">
                        <ChartBarIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 ml-3" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">عرض التحليلات</span>
                      </div>
                    </button>
                    <button className="w-full text-right px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600 transition-all duration-200">
                      <div className="flex items-center">
                        <ShieldCheckIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 ml-3" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">إعدادات الأمان</span>
                      </div>
                    </button>
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
