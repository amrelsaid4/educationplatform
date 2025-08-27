'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getCurrentUser } from '@/lib/auth-utils'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ExamResult {
  id: string
  exam_id: string
  student_id: string
  attempt_number: number
  started_at: string
  completed_at: string
  score: number
  answers: Array<{
    question_id: string
    answer: string
  }>
  time_spent_minutes: number
  status: string
}

interface Exam {
  id: string
  title: string
  description: string
  duration_minutes: number
  total_questions: number
  passing_score: number
  course: {
    id: string
    title: string
    teacher: {
      name: string
    }
  }
}

export default function ExamResultsPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const examId = params.examId as string

  const [exam, setExam] = useState<Exam | null>(null)
  const [results, setResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({ name: '', avatar: '', role: 'student' as 'student' | 'admin' | 'teacher' })

  useEffect(() => {
    if (user?.id && examId) {
      loadUserData()
      loadExamResults()
    }
  }, [user, examId])

  const loadUserData = async () => {
    try {
      const { user: userProfile } = await getCurrentUser(user!.id)
      setUserData({
        name: userProfile?.name || '',
        avatar: userProfile?.avatar_url || '',
        role: (userProfile?.role || 'student') as 'student' | 'admin' | 'teacher'
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const loadExamResults = async () => {
    try {
      // In a real app, you would fetch exam results from your API
      // For now, we'll simulate the data
      const mockExam: Exam = {
        id: examId,
        title: 'امتحان منتصف الفصل',
        description: 'امتحان شامل على المحتوى المغطى حتى الآن',
        duration_minutes: 60,
        total_questions: 20,
        passing_score: 70,
        course: {
          id: '1',
          title: 'مقدمة في البرمجة',
          teacher: {
            name: 'أحمد محمد'
          }
        }
      }

      const mockResults: ExamResult[] = [
        {
          id: '1',
          exam_id: examId,
          student_id: user!.id,
          attempt_number: 1,
          started_at: new Date(Date.now() - 3600000).toISOString(),
          completed_at: new Date().toISOString(),
          score: 85,
          answers: [],
          time_spent_minutes: 45,
          status: 'completed'
        }
      ]

      setExam(mockExam)
      setResults(mockResults)
    } catch (error) {
      console.error('Error loading exam results:', error)
    } finally {
      setLoading(false)
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

  const getScoreColor = (score: number, passingScore: number) => {
    if (score >= passingScore) {
      return 'text-green-600'
    } else if (score >= passingScore * 0.8) {
      return 'text-yellow-600'
    } else {
      return 'text-red-600'
    }
  }

  const getScoreMessage = (score: number, passingScore: number) => {
    if (score >= passingScore) {
      return 'أحسنت! لقد نجحت في الامتحان'
    } else if (score >= passingScore * 0.8) {
      return 'أداء جيد، لكن يمكنك التحسن أكثر'
    } else {
      return 'يحتاج إلى مزيد من الدراسة والمراجعة'
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole={userData.role} userName={userData.name} userAvatar={userData.avatar}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!exam || results.length === 0) {
    return (
      <DashboardLayout userRole={userData.role} userName={userData.name} userAvatar={userData.avatar}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">لا توجد نتائج</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              لم يتم العثور على نتائج لهذا الامتحان
            </p>
            <Link
              href="/dashboard/student/exams"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              العودة إلى الامتحانات
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const bestResult = results.reduce((best, current) => 
    (current.score || 0) > (best.score || 0) ? current : best
  )

  const isPassed = bestResult.score >= exam.passing_score

  return (
    <DashboardLayout userRole={userData.role} userName={userData.name} userAvatar={userData.avatar}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard/student/exams"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-500"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              العودة للامتحانات
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            نتائج الامتحان
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {exam.title} - {exam.course.title}
          </p>
        </div>

        {/* Exam Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                معلومات الامتحان
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {exam.total_questions} سؤال
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {exam.duration_minutes} دقيقة
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    الدرجة المطلوبة: {exam.passing_score}%
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                المدرس
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {exam.course.teacher.name}
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            نتائج المحاولات
          </h2>
          
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      result.score >= exam.passing_score 
                        ? 'bg-green-100 dark:bg-green-900/20' 
                        : 'bg-red-100 dark:bg-red-900/20'
                    }`}>
                      {result.score >= exam.passing_score ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        المحاولة {result.attempt_number}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {result.score >= exam.passing_score ? 'نجح' : 'فشل'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {result.score}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {result.score >= exam.passing_score ? 'مقبول' : 'غير مقبول'}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">تاريخ الإكمال:</span>
                    <br />
                    {formatDate(result.completed_at)}
                  </div>
                  <div>
                    <span className="font-medium">الوقت المستغرق:</span>
                    <br />
                    {result.time_spent_minutes} دقيقة
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>التقدم</span>
                    <span>{result.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        result.score >= exam.passing_score 
                          ? 'bg-green-500' 
                          : result.score >= exam.passing_score * 0.8 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${result.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            تحليل الأداء
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <ChartBarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                متوسط الدرجات
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)}%
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrophyIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                أفضل درجة
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {bestResult.score}%
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClockIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                متوسط الوقت
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(results.reduce((sum, r) => sum + r.time_spent_minutes, 0) / results.length)} د
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard/student/exams"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
          >
            العودة إلى الامتحانات
          </Link>
          
          <Link
            href={`/dashboard/student/courses/${exam.course.id}`}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors text-center"
          >
            العودة إلى الكورس
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
