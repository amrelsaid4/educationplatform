'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getAvailableAssignments, submitAssignment } from '@/lib/course-utils'
import { getCurrentUser } from '@/lib/auth-utils'
import { 
  BookOpenIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

interface Assignment {
  id: string
  title: string
  description: string
  assignment_type: string
  max_score: number
  due_date: string
  instructions: string
  attachments: string[]
  course: {
    id: string
    title: string
    teacher: {
      name: string
    }
  }
  lesson: {
    id: string
    title: string
  }
}

export default function StudentAssignmentsPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submissionContent, setSubmissionContent] = useState('')
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [userData, setUserData] = useState({ name: '', avatar: '' })

  useEffect(() => {
    if (user?.id) {
      loadUserData()
      loadAssignments()
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

  const loadAssignments = async () => {
    try {
      console.log('Loading assignments for user:', user!.id)
      const { data, error } = await getAvailableAssignments(user!.id)
      if (error) {
        console.error('Error loading assignments:', error)
        return
      }
      console.log('Loaded assignments:', data)
      setAssignments(data || [])
    } catch (error) {
      console.error('Error loading assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !submissionContent.trim()) return

    setSubmitting(true)
    try {
      const { error } = await submitAssignment(
        selectedAssignment.id,
        user!.id,
        submissionContent
      )

      if (error) {
        console.error('Error submitting assignment:', error)
        return
      }

      setShowSubmissionModal(false)
      setSelectedAssignment(null)
      setSubmissionContent('')
      loadAssignments() // Reload to update status
    } catch (error) {
      console.error('Error submitting assignment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getAssignmentTypeIcon = (type: string) => {
    switch (type) {
      case 'homework':
        return <DocumentTextIcon className="w-5 h-5" />
      case 'project':
        return <BookOpenIcon className="w-5 h-5" />
      case 'quiz':
        return <AcademicCapIcon className="w-5 h-5" />
      case 'exam':
        return <CheckCircleIcon className="w-5 h-5" />
      default:
        return <DocumentTextIcon className="w-5 h-5" />
    }
  }

  const getAssignmentTypeText = (type: string) => {
    switch (type) {
      case 'homework':
        return 'واجب منزلي'
      case 'project':
        return 'مشروع'
      case 'quiz':
        return 'اختبار قصير'
      case 'exam':
        return 'امتحان'
      default:
        return 'واجب'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
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
            الواجبات
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            عرض وإدارة جميع الواجبات المطلوبة
          </p>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              لا توجد واجبات متاحة
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              لم يتم نشر أي واجبات بعد في الكورسات المسجلة
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getAssignmentTypeIcon(assignment.assignment_type)}
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {getAssignmentTypeText(assignment.assignment_type)}
                    </span>
                  </div>
                  {isOverdue(assignment.due_date) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      متأخر
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {assignment.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {assignment.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <BookOpenIcon className="w-4 h-4" />
                    <span>{assignment.course.title}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <AcademicCapIcon className="w-4 h-4" />
                    <span>{assignment.course.teacher.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>آخر موعد: {formatDate(assignment.due_date)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>الدرجة القصوى: {assignment.max_score}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedAssignment(assignment)
                    setShowSubmissionModal(true)
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  تسليم الواجب
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Submission Modal */}
        {showSubmissionModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    تسليم الواجب: {selectedAssignment.title}
                  </h2>
                  <button
                    onClick={() => setShowSubmissionModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    تعليمات الواجب:
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">
                      {selectedAssignment.instructions || 'لا توجد تعليمات محددة لهذا الواجب.'}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    إجابة الواجب:
                  </label>
                  <textarea
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="اكتب إجابتك هنا..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitAssignment}
                    disabled={submitting || !submissionContent.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {submitting ? 'جاري التسليم...' : 'تسليم الواجب'}
                  </button>
                  <button
                    onClick={() => setShowSubmissionModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
