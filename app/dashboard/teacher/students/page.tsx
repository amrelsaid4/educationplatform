'use client'

import { useState, useEffect } from 'react'
import { UserGroupIcon, MagnifyingGlassIcon, AcademicCapIcon, ClockIcon } from '@heroicons/react/24/outline'
import { getCurrentUser } from '../../../../lib/auth-utils'
import DashboardLayout from '../../../../components/layouts/DashboardLayout'
import { supabase } from '../../../../lib/supabase'
import { getTeacherStudents } from '../../../../lib/course-utils'
import { useRouter } from 'next/navigation'

interface Student {
  id: string
  name: string
  email: string
  avatar_url?: string
  enrolled_courses: number
  completed_courses: number
  total_progress: number
  last_activity: string
  status: 'active' | 'inactive'
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const router = useRouter()

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
        
        // Get teacher students from database
        const { data: studentsData, error } = await getTeacherStudents(user.id)
        
        if (error) {
          console.error('Error loading students:', error)
          // Fallback to mock data if database fails
          const mockStudents: Student[] = [
            {
              id: '1',
              name: 'أحمد محمد',
              email: 'ahmed@example.com',
              avatar_url: undefined,
              enrolled_courses: 3,
              completed_courses: 1,
              total_progress: 75,
              last_activity: '2024-01-15T10:30:00Z',
              status: 'active'
            },
            {
              id: '2',
              name: 'فاطمة علي',
              email: 'fatima@example.com',
              avatar_url: undefined,
              enrolled_courses: 2,
              completed_courses: 2,
              total_progress: 100,
              last_activity: '2024-01-14T15:45:00Z',
              status: 'active'
            },
            {
              id: '3',
              name: 'محمد حسن',
              email: 'mohamed@example.com',
              avatar_url: undefined,
              enrolled_courses: 1,
              completed_courses: 0,
              total_progress: 25,
              last_activity: '2024-01-10T09:15:00Z',
              status: 'inactive'
            },
            {
              id: '4',
              name: 'سارة أحمد',
              email: 'sara@example.com',
              avatar_url: undefined,
              enrolled_courses: 4,
              completed_courses: 3,
              total_progress: 90,
              last_activity: '2024-01-15T14:20:00Z',
              status: 'active'
            }
          ]
          setStudents(mockStudents)
        } else {
          setStudents(studentsData || [])
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'inactive': return 'غير نشط'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-[#10b981]/10 text-[#10b981]'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || student.status === filter
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
        <div className="py-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الطلاب</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  إدارة الطلاب ومتابعة تقدمهم
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#49BBBD]">{students.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">إجمالي الطلاب</div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في الطلاب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-[#49BBBD] text-white' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'active' 
                    ? 'bg-[#10b981] text-white' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                نشط
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'inactive' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                غير نشط
              </button>
            </div>
          </div>

          {/* Students Grid */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                لا يوجد طلاب
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                لم يتم العثور على طلاب يطابقون معايير البحث
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <div key={student.id} className="card hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#49BBBD] to-[#06b6d4] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {student.name.charAt(0)}
                    </div>
                    <div className="mr-3 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {student.email}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                      {getStatusText(student.status)}
                    </span>
                  </div>

                  <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">الكورسات المسجلة:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{student.enrolled_courses}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">الكورسات المكتملة:</span>
                      <span className="font-semibold text-[#10b981]">{student.completed_courses}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">التقدم العام:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{student.total_progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#49BBBD] to-[#06b6d4] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${student.total_progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <ClockIcon className="h-4 w-4 ml-1" />
                        <span>آخر نشاط: {new Date(student.last_activity).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <button 
                        className="btn-primary btn-sm"
                        onClick={() => router.push(`/dashboard/teacher/students/${student.id}`)}
                      >
                        <AcademicCapIcon className="h-4 w-4" />
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
