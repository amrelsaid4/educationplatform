'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getCurrentUser } from '@/lib/auth-utils'
import { getStudentExams, startExamAttempt } from '@/lib/course-utils'
import { 
  AcademicCapIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Exam {
  id: string
  title: string
  description: string
  duration_minutes: number
  max_score: number
  passing_score: number
  start_date: string
  end_date: string
  allow_retakes: boolean
  max_attempts: number
  course: {
    id: string
    title: string
    teacher: {
      name: string
    }
  }
  attempts: {
    id: string
    started_at: string
    completed_at: string
    score: number
    status: string
  }[]
}

export default function StudentExamsPage() {
  const { user } = useAuth()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [startingExam, setStartingExam] = useState<string | null>(null)
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

  const handleStartExam = async (examId: string) => {
    setStartingExam(examId)
    try {
      const { data, error } = await startExamAttempt(examId, user!.id)
      if (error) {
        console.error('Error starting exam:', error)
        return
      }
      
      // Redirect to exam page
      window.location.href = `/dashboard/student/exam/${examId}/attempt/${data.id}`
    } catch (error) {
      console.error('Error starting exam:', error)
    } finally {
      setStartingExam(null)
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

  const isExamAvailable = (exam: Exam) => {
    const now = new Date()
    const startDate = new Date(exam.start_date)
    const endDate = new Date(exam.end_date)
    return now >= startDate && now <= endDate
  }

  const isExamExpired = (exam: Exam) => {
    const now = new Date()
    const endDate = new Date(exam.end_date)
    return now > endDate
  }

  const getExamStatus = (exam: Exam) => {
    if (isExamExpired(exam)) {
      return { status: 'expired', text: 'منتهي الصلاحية', color: 'text-red-600' }
    }
    if (isExamAvailable(exam)) {
      return { status: 'available', text: 'متاح', color: 'text-green-600' }
    }
    return { status: 'upcoming', text: 'قادم', color: 'text-blue-600' }
  }

  const getBestAttempt = (attempts: Exam['attempts']) => {
    if (!attempts || attempts.length === 0) return null
    return attempts.reduce((best, current) => 
      (current.score || 0) > (best.score || 0) ? current : best
    )
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
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
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
              const examStatus = getExamStatus(exam)
              const bestAttempt = getBestAttempt(exam.attempts)
                             const canTakeExam = isExamAvailable(exam) && 
                 (exam.allow_retakes || exam.attempts.length === 0) &&
                 (exam.max_attempts === 0 || exam.attempts.length < exam.max_attempts)

              return (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AcademicCapIcon className="w-5 h-5" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        امتحان
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${examStatus.color}`}>
                      {examStatus.text}
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
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>{exam.course.title}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <AcademicCapIcon className="w-4 h-4" />
                      <span>{exam.course.teacher.name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      <span>المدة: {exam.duration_minutes} دقيقة</span>
                    </div>

                                         <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                       <CheckCircleIcon className="w-4 h-4" />
                       <span>الدرجة القصوى: {exam.max_score}</span>
                     </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>الدرجة المطلوبة: {exam.passing_score}%</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>الفترة: {formatDate(exam.start_date)} - {formatDate(exam.end_date)}</span>
                    </div>

                    {bestAttempt && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>أفضل درجة: {bestAttempt.score || 0}%</span>
                      </div>
                    )}

                                         <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                       <span>المحاولات: {exam.attempts.length}/{exam.max_attempts > 0 ? exam.max_attempts : 'غير محدود'}</span>
                     </div>
                  </div>

                  <div className="space-y-2">
                    {canTakeExam ? (
                      <button
                        onClick={() => handleStartExam(exam.id)}
                        disabled={startingExam === exam.id}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {startingExam === exam.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            جاري البدء...
                          </>
                        ) : (
                          <>
                            <PlayIcon className="w-4 h-4" />
                            بدء الامتحان
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="text-center py-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                                                 <span className="text-sm text-gray-500 dark:text-gray-400">
                           {examStatus.status === 'expired' 
                             ? 'انتهت فترة الامتحان'
                             : exam.max_attempts > 0 && exam.attempts.length >= exam.max_attempts
                             ? 'تم استنفاذ المحاولات'
                             : 'لا يمكن إعادة المحاولة'
                           }
                         </span>
                      </div>
                    )}

                    {bestAttempt && (
                      <Link
                        href={`/dashboard/student/exam/${exam.id}/results`}
                        className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors text-center block"
                      >
                        عرض النتائج
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
