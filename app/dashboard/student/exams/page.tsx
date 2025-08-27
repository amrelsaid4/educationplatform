'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getStudentExams, startExamAttempt } from '@/lib/course-utils'
import { getCurrentUser } from '@/lib/auth-utils'
import Dialog, { DialogFooter } from '@/components/ui/Dialog'
import ActionIcons from '@/components/ui/ActionIcons'
import { 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  AcademicCapIcon,
  CalendarIcon,
  ChartBarIcon,
  EyeIcon,
  PlayIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'

interface Exam {
  id: string
  title: string
  description: string
  duration_minutes: number
  max_score: number
  passing_score: number
  start_date: string
  end_date: string
  course: {
    id: string
    title: string
    teacher: {
      name: string
    }
  }
  attempt?: {
    id: string
    score?: number
    status: string
    started_at: string
    completed_at?: string
  }
}

export default function StudentExamsPage() {
  const { user } = useAuth()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [starting, setStarting] = useState(false)
  const [userData, setUserData] = useState({ name: '', avatar: '' })

  useEffect(() => {
    if (user?.id) {
      loadUserData()
      loadExams()
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

  const loadExams = async () => {
    try {
      console.log('Loading exams for user:', user!.id)
      const { data, error } = await getStudentExams(user!.id)
      if (error) {
        console.error('Error loading exams:', error)
        return
      }
      console.log('Loaded exams:', data)
      setExams(data || [])
    } catch (error) {
      console.error('Error loading exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartExam = async () => {
    if (!selectedExam) return

    setStarting(true)
    try {
      const { data, error } = await startExamAttempt(selectedExam.id, user!.id)
      if (error) {
        console.error('Error starting exam:', error)
        return
      }

      // Redirect to exam page
      window.location.href = `/dashboard/student/exam/${selectedExam.id}/attempt/${data.id}`
    } catch (error) {
      console.error('Error starting exam:', error)
    } finally {
      setStarting(false)
    }
  }

  const openViewDialog = (exam: Exam) => {
    setSelectedExam(exam)
    setShowViewDialog(true)
  }

  const openStartDialog = (exam: Exam) => {
    setSelectedExam(exam)
    setShowStartDialog(true)
  }

  const getExamStatus = (exam: Exam) => {
    const now = new Date()
    const startDate = new Date(exam.start_date)
    const endDate = new Date(exam.end_date)

    if (now < startDate) {
      return { status: 'upcoming', text: 'قريباً', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
    } else if (now > endDate) {
      return { status: 'ended', text: 'منتهي', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
    } else {
      if (exam.attempt) {
        if (exam.attempt.status === 'completed') {
          return { status: 'completed', text: 'مكتمل', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
        } else {
          return { status: 'in_progress', text: 'قيد التقدم', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' }
        }
      } else {
        return { status: 'available', text: 'متاح', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
      }
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours} ساعة ${mins > 0 ? `و ${mins} دقيقة` : ''}`
    }
    return `${mins} دقيقة`
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
            الامتحانات
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            عرض وإدارة جميع الامتحانات المتاحة
          </p>
        </div>

        {exams.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              لا توجد امتحانات متاحة
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              لم يتم نشر أي امتحانات بعد في الكورسات المسجلة
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => {
              const status = getExamStatus(exam)
              return (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        امتحان
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {exam.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {exam.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <BookOpenIcon className="w-4 h-4" />
                      <span>{exam.course.title}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <AcademicCapIcon className="w-4 h-4" />
                      <span>{exam.course.teacher.name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      <span>المدة: {formatDuration(exam.duration_minutes)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <ChartBarIcon className="w-4 h-4" />
                      <span>الدرجة القصوى: {exam.max_score}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="w-4 h-4" />
                      <span>يبدأ: {formatDate(exam.start_date)}</span>
                    </div>

                    {exam.attempt && exam.attempt.score !== null && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>الدرجة: {exam.attempt.score}/{exam.max_score}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {status.status === 'available' && (
                      <button
                        onClick={() => openStartDialog(exam)}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <PlayIcon className="w-4 h-4" />
                        بدء الامتحان
                      </button>
                    )}

                    {status.status === 'in_progress' && exam.attempt && (
                      <button
                        onClick={() => window.location.href = `/dashboard/student/exam/${exam.id}/attempt/${exam.attempt.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        متابعة الامتحان
                      </button>
                    )}

                    {status.status === 'completed' && exam.attempt && (
                      <button
                        onClick={() => window.location.href = `/dashboard/student/exam/${exam.id}/results`}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        عرض النتائج
                      </button>
                    )}

                    <ActionIcons
                      onView={() => openViewDialog(exam)}
                      viewTitle="عرض تفاصيل الامتحان"
                      showEdit={false}
                      showDelete={false}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* View Exam Dialog */}
        <Dialog
          isOpen={showViewDialog}
          onClose={() => setShowViewDialog(false)}
          title="تفاصيل الامتحان"
        >
          {selectedExam && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedExam.title}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    امتحان
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExamStatus(selectedExam).color}`}>
                    {getExamStatus(selectedExam).text}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {selectedExam.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <BookOpenIcon className="w-4 h-4" />
                  <span>الكورس: {selectedExam.course.title}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>المعلم: {selectedExam.course.teacher.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                  <span>المدة: {formatDuration(selectedExam.duration_minutes)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <ChartBarIcon className="w-4 h-4" />
                  <span>الدرجة القصوى: {selectedExam.max_score}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>درجة النجاح: {selectedExam.passing_score}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4" />
                  <span>يبدأ: {formatDate(selectedExam.start_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <XCircleIcon className="w-4 h-4" />
                  <span>ينتهي: {formatDate(selectedExam.end_date)}</span>
                </div>
              </div>

              {selectedExam.attempt && (
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    معلومات المحاولة:
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <span>الحالة: {selectedExam.attempt.status === 'completed' ? 'مكتمل' : 'قيد التقدم'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <span>بدأ في: {formatDate(selectedExam.attempt.started_at)}</span>
                    </div>
                    {selectedExam.attempt.completed_at && (
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <span>انتهى في: {formatDate(selectedExam.attempt.completed_at)}</span>
                      </div>
                    )}
                    {selectedExam.attempt.score !== null && (
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <span>الدرجة: {selectedExam.attempt.score}/{selectedExam.max_score}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <button
              onClick={() => setShowViewDialog(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            >
              إغلاق
            </button>
          </DialogFooter>
        </Dialog>

        {/* Start Exam Dialog */}
        <Dialog
          isOpen={showStartDialog}
          onClose={() => setShowStartDialog(false)}
          title="بدء الامتحان"
          maxWidth="max-w-md"
        >
          {selectedExam && (
            <div className="space-y-4">
              <div className="text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedExam.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  هل أنت مستعد لبدء الامتحان؟
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  تعليمات مهمة:
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• مدة الامتحان: {formatDuration(selectedExam.duration_minutes)}</li>
                  <li>• الدرجة القصوى: {selectedExam.max_score}</li>
                  <li>• درجة النجاح: {selectedExam.passing_score}</li>
                  <li>• لا يمكن إيقاف المؤقت بعد البدء</li>
                  <li>• تأكد من اتصال الإنترنت المستقر</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              onClick={handleStartExam}
              disabled={starting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {starting ? 'جاري البدء...' : 'بدء الامتحان'}
            </button>
            <button
              onClick={() => setShowStartDialog(false)}
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

