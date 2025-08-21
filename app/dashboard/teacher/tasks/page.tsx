'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { getCurrentUser } from '../../../../lib/auth-utils'
import DashboardLayout from '../../../../components/layouts/DashboardLayout'
import { supabase } from '../../../../lib/supabase'
import { getTeacherTasks } from '../../../../lib/course-utils'

interface Task {
  id: string
  title: string
  description: string
  course_id: string
  course_title: string
  due_date: string
  status: 'pending' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

export default function TeacherTasksPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all')

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
        
        // Get teacher tasks from database
        const { data: tasksData, error } = await getTeacherTasks(user.id)
        
        if (error) {
          console.error('Error loading tasks:', error)
          // Fallback to mock data if database fails
          const mockTasks: Task[] = [
            {
              id: '1',
              title: 'مراجعة الواجب الأول',
              description: 'مراجعة واجب الطلاب في الدرس الأول من كورس البرمجة',
              course_id: '1',
              course_title: 'مقدمة في البرمجة',
              due_date: '2024-01-15',
              status: 'pending',
              priority: 'high',
              created_at: '2024-01-10'
            },
            {
              id: '2',
              title: 'إعداد الاختبار النصفي',
              description: 'إعداد اختبار نصفي لكورس الرياضيات',
              course_id: '2',
              course_title: 'الرياضيات الأساسية',
              due_date: '2024-01-20',
              status: 'completed',
              priority: 'medium',
              created_at: '2024-01-08'
            },
            {
              id: '3',
              title: 'تقييم المشاريع النهائية',
              description: 'تقييم المشاريع النهائية لطلاب كورس التصميم',
              course_id: '3',
              course_title: 'تصميم الويب',
              due_date: '2024-01-12',
              status: 'overdue',
              priority: 'high',
              created_at: '2024-01-05'
            }
          ]
          setTasks(mockTasks)
        } else {
          // Transform database data to match interface
          const transformedTasks = tasksData?.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            course_id: task.course_id,
            course_title: task.course?.title || 'غير محدد',
            due_date: task.due_date,
            status: task.status,
            priority: task.priority,
            created_at: task.created_at
          })) || []
          setTasks(transformedTasks)
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
      case 'pending': return 'معلق'
      case 'completed': return 'مكتمل'
      case 'overdue': return 'متأخر'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-[#f59e0b]/10 text-[#f59e0b]'
      case 'completed': return 'bg-[#10b981]/10 text-[#10b981]'
      case 'overdue': return 'bg-[#ef4444]/10 text-[#ef4444]'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-[#ef4444]/10 text-[#ef4444]'
      case 'medium': return 'bg-[#f59e0b]/10 text-[#f59e0b]'
      case 'low': return 'bg-[#10b981]/10 text-[#10b981]'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية'
      case 'medium': return 'متوسطة'
      case 'low': return 'منخفضة'
      default: return priority
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', taskId)

      if (error) {
        console.error('Error completing task:', error)
        alert('حدث خطأ أثناء إكمال المهمة')
        return
      }

      // Refresh tasks
      await loadData()
      alert('تم إكمال المهمة بنجاح!')
    } catch (error) {
      console.error('Error completing task:', error)
      alert('حدث خطأ أثناء إكمال المهمة')
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
        <div className="py-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">المهام</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  إدارة المهام والواجبات
                </p>
              </div>
              <button className="mt-4 btn-primary flex items-center" onClick={() => router.push('/dashboard/teacher/tasks/create')}>
                <PlusIcon className="h-5 w-5 ml-2" />
                إضافة مهمة جديدة
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
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
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'pending' 
                    ? 'bg-[#f59e0b] text-white' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                معلق
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'completed' 
                    ? 'bg-[#10b981] text-white' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                مكتمل
              </button>
              <button
                onClick={() => setFilter('overdue')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'overdue' 
                    ? 'bg-[#ef4444] text-white' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                متأخر
              </button>
            </div>
          </div>

          {/* Tasks List */}
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                لا توجد مهام
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                ابدأ بإنشاء مهمة جديدة
              </p>
              <button className="mt-4 btn-primary flex items-center" onClick={() => router.push('/dashboard/teacher/tasks/create')}>
                <PlusIcon className="h-5 w-5 ml-2" />
                إضافة مهمة جديدة
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id} className="card hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {getPriorityText(task.priority)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <span className="font-medium">الكورس:</span>
                          <span className="mr-1">{task.course_title}</span>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 ml-1" />
                          <span>تاريخ الاستحقاق: {new Date(task.due_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mr-6">
                      {task.status === 'pending' && (
                        <button 
                          className="btn-success btn-sm"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          إكمال
                        </button>
                      )}
                      <button 
                        className="btn-secondary btn-sm"
                        onClick={() => router.push(`/dashboard/teacher/tasks/${task.id}/edit`)}
                      >
                        تعديل
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
