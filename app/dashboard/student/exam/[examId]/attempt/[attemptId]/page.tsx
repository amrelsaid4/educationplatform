'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { getExamQuestions, submitExamAttempt } from '@/lib/course-utils'
import { useParams, useRouter } from 'next/navigation'
import { 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface ExamQuestion {
  id: string
  question_text: string
  question_type: string
  options?: string[]
  correct_answer?: string
  points: number
  order_index: number
}

interface ExamAttempt {
  id: string
  exam_id: string
  student_id: string
  attempt_number: number
  started_at: string
  status: string
}

export default function ExamPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const examId = params.examId as string
  const attemptId = params.attemptId as string

  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

  useEffect(() => {
    if (user?.id && examId && attemptId) {
      loadExam()
    }
  }, [user, examId, attemptId])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLeft])

  const loadExam = async () => {
    try {
      const { data, error } = await getExamQuestions(examId)
      if (error) {
        console.error('Error loading exam questions:', error)
        return
      }

      setQuestions(data || [])
      
      // Set exam duration (assuming 60 minutes for now)
      setTimeLeft(60 * 60) // 60 minutes in seconds
    } catch (error) {
      console.error('Error loading exam:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmitExam = async () => {
    setSubmitting(true)
    try {
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: questionId,
        answer
      }))

      const timeSpentMinutes = Math.floor((60 * 60 - timeLeft) / 60)

      const { error } = await submitExamAttempt(attemptId, answersArray, timeSpentMinutes)
      if (error) {
        console.error('Error submitting exam:', error)
        return
      }

      // Redirect to results page
      router.push(`/dashboard/student/exam/${examId}/results`)
    } catch (error) {
      console.error('Error submitting exam:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getQuestionTypeText = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'اختيار من متعدد'
      case 'true_false':
        return 'صح أو خطأ'
      case 'short_answer':
        return 'إجابة قصيرة'
      case 'essay':
        return 'مقال'
      default:
        return 'سؤال'
    }
  }

  const renderQuestion = (question: ExamQuestion) => {
    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'true_false':
        return (
          <div className="space-y-3">
            {['صح', 'خطأ'].map((option) => (
              <label key={option} className="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'short_answer':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="اكتب إجابتك هنا..."
          />
        )

      case 'essay':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="اكتب مقالك هنا..."
          />
        )

      default:
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="اكتب إجابتك هنا..."
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            لا توجد أسئلة في هذا الامتحان
          </h2>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            العودة
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const answeredQuestions = Object.keys(answers).length
  const totalQuestions = questions.length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with timer */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => router.back()}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  الامتحان
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  السؤال {currentQuestionIndex + 1} من {totalQuestions}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse">
                <ClockIcon className="w-5 h-5 text-red-500" />
                <span className={`font-mono text-lg font-semibold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <button
                onClick={() => setShowConfirmSubmit(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                إنهاء الامتحان
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                التقدم: {answeredQuestions}/{totalQuestions} سؤال
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round((answeredQuestions / totalQuestions) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {getQuestionTypeText(currentQuestion.question_type)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentQuestion.points} نقطة
                </span>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentQuestion.question_text}
              </h2>
            </div>

            <div className="mb-6">
              {renderQuestion(currentQuestion)}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center space-x-2 space-x-reverse bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-50 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <ArrowRightIcon className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <div className="flex items-center space-x-2 space-x-reverse">
                {answers[currentQuestion.id] && (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {answers[currentQuestion.id] ? 'تم الإجابة' : 'لم يتم الإجابة'}
                </span>
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center space-x-2 space-x-reverse bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <span>التالي</span>
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              التنقل بين الأسئلة
            </h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : answers[questions[index].id]
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm submit modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                تأكيد إنهاء الامتحان
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              هل أنت متأكد من أنك تريد إنهاء الامتحان؟ لا يمكنك العودة بعد الإرسال.
            </p>

            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {submitting ? 'جاري الإرسال...' : 'إنهاء الامتحان'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
