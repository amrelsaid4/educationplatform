'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getCurrentUser } from '@/lib/auth-utils'
import { supabase } from '@/lib/supabase'
import Dialog, { DialogFooter } from '@/components/ui/Dialog'
import ActionIcons from '@/components/ui/ActionIcons'
import { 
  BookOpenIcon, 
  AcademicCapIcon, 
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Question {
  id: string
  question_text: string
  question_type: string
  options: any[]
  correct_answer: string
  explanation: string
  difficulty_level: string
  tags: string[]
  usage_count: number
  teacher: {
    id: string
    name: string
  }
  category?: {
    id: string
    name: string
    color: string
  }
}

interface Category {
  id: string
  name: string
  description: string
  color: string
}

interface Teacher {
  id: string
  name: string
}

export default function StudentQuestionBankPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [userData, setUserData] = useState({ name: '', avatar: '' })
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedTeacher, setSelectedTeacher] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    if (user?.id) {
      loadUserData()
      loadQuestionBank()
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

  const loadQuestionBank = async () => {
    try {
      // Get enrolled courses
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', user!.id)
        .eq('status', 'enrolled')

      if (!enrollments || enrollments.length === 0) {
        setQuestions([])
        setLoading(false)
        return
      }

      const courseIds = enrollments.map(e => e.course_id)

      // Get questions from enrolled courses
      const { data: questionsData, error: questionsError } = await supabase
        .from('question_bank')
        .select(`
          id,
          question_text,
          question_type,
          options,
          correct_answer,
          explanation,
          difficulty_level,
          tags,
          usage_count,
          teacher_id,
          category_id,
          teacher:users!question_bank_teacher_id_fkey(id, name),
          category:question_bank_categories(id, name, color)
        `)
        .in('teacher_id', 
          supabase
            .from('courses')
            .select('teacher_id')
            .in('id', courseIds)
        )
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (questionsError) {
        console.error('Error loading questions:', questionsError)
        return
      }

      setQuestions(questionsData || [])

      // Get categories
      const { data: categoriesData } = await supabase
        .from('question_bank_categories')
        .select('*')
        .in('teacher_id', 
          supabase
            .from('courses')
            .select('teacher_id')
            .in('id', courseIds)
        )

      setCategories(categoriesData || [])

      // Get teachers
      const { data: teachersData } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'teacher')
        .in('id', 
          supabase
            .from('courses')
            .select('teacher_id')
            .in('id', courseIds)
        )

      setTeachers(teachersData || [])
    } catch (error) {
      console.error('Error loading question bank:', error)
    } finally {
      setLoading(false)
    }
  }

  const openViewDialog = (question: Question) => {
    setSelectedQuestion(question)
    setShowViewDialog(true)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedType('all')
    setSelectedLevel('all')
    setSelectedTeacher('all')
    setSelectedCategory('all')
  }

  const getQuestionTypeText = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'اختيار متعدد'
      case 'true_false':
        return 'صح وخطأ'
      case 'short_answer':
        return 'إجابة قصيرة'
      case 'essay':
        return 'مقال'
      default:
        return type
    }
  }

  const getDifficultyText = (level: string) => {
    switch (level) {
      case 'easy':
        return 'سهل'
      case 'medium':
        return 'متوسط'
      case 'hard':
        return 'صعب'
      default:
        return level
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = selectedType === 'all' || question.question_type === selectedType
    const matchesLevel = selectedLevel === 'all' || question.difficulty_level === selectedLevel
    const matchesTeacher = selectedTeacher === 'all' || question.teacher.id === selectedTeacher
    const matchesCategory = selectedCategory === 'all' || question.category?.id === selectedCategory

    return matchesSearch && matchesType && matchesLevel && matchesTeacher && matchesCategory
  })

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
            بنك الأسئلة
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            استكشف الأسئلة العامة من معلميك للتدريب والمراجعة
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <BookOpenIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">الدورات المسجلة</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {questions.length > 0 ? new Set(questions.map(q => q.teacher.id)).size : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <AcademicCapIcon className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">المعلمون</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {teachers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <TagIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">الأسئلة المتاحة</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {questions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <ChartBarIcon className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">الفئات</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {categories.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">الفلاتر</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">جميع الأنواع</option>
              <option value="multiple_choice">اختيار متعدد</option>
              <option value="true_false">صح وخطأ</option>
              <option value="short_answer">إجابة قصيرة</option>
              <option value="essay">مقال</option>
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">جميع المستويات</option>
              <option value="easy">سهل</option>
              <option value="medium">متوسط</option>
              <option value="hard">صعب</option>
            </select>

            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">جميع المعلمين</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">جميع الفئات</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            >
              مسح الفلاتر
            </button>
          </div>

          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في الأسئلة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              لا توجد أسئلة
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {questions.length === 0 
                ? 'لم يتم نشر أي أسئلة بعد في الكورسات المسجلة'
                : 'لا توجد نتائج تطابق الفلاتر المحددة'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {question.question_text}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span>{getQuestionTypeText(question.question_type)}</span>
                      <span>•</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty_level)}`}>
                        {getDifficultyText(question.difficulty_level)}
                      </span>
                      <span>•</span>
                      <span>{question.teacher.name}</span>
                      {question.category && (
                        <>
                          <span>•</span>
                          <span style={{ color: question.category.color }}>
                            {question.category.name}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <ChartBarIcon className="w-4 h-4" />
                        <span>تم استخدامها {question.usage_count} مرة</span>
                      </div>
                    </div>
                  </div>

                  <ActionIcons
                    onView={() => openViewDialog(question)}
                    viewTitle="عرض تفاصيل السؤال"
                    showEdit={false}
                    showDelete={false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Question Dialog */}
        <Dialog
          isOpen={showViewDialog}
          onClose={() => setShowViewDialog(false)}
          title="تفاصيل السؤال"
        >
          {selectedQuestion && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedQuestion.question_text}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span>{getQuestionTypeText(selectedQuestion.question_type)}</span>
                  <span>•</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(selectedQuestion.difficulty_level)}`}>
                    {getDifficultyText(selectedQuestion.difficulty_level)}
                  </span>
                  <span>•</span>
                  <span>بواسطة: {selectedQuestion.teacher.name}</span>
                </div>
              </div>

              {selectedQuestion.question_type === 'multiple_choice' && selectedQuestion.options && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">الخيارات:</h4>
                  <div className="space-y-2">
                    {selectedQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          option.is_correct
                            ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700'
                            : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                        }`}
                      >
                        <span className={`font-medium ${
                          option.is_correct
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {String.fromCharCode(65 + index)}. {option.text}
                        </span>
                        {option.is_correct && (
                          <span className="ml-2 text-green-600 dark:text-green-400">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedQuestion.question_type === 'true_false' && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">الإجابة الصحيحة:</h4>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900 dark:border-green-700">
                    <span className="font-medium text-green-800 dark:text-green-200">
                      {selectedQuestion.correct_answer === 'true' ? 'صح' : 'خطأ'}
                    </span>
                  </div>
                </div>
              )}

              {selectedQuestion.explanation && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">التوضيح:</h4>
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      {selectedQuestion.explanation}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>المعلم: {selectedQuestion.teacher.name}</span>
                </div>
                {selectedQuestion.category && (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <TagIcon className="w-4 h-4" />
                    <span style={{ color: selectedQuestion.category.color }}>
                      الفئة: {selectedQuestion.category.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <ChartBarIcon className="w-4 h-4" />
                  <span>الاستخدام: {selectedQuestion.usage_count} مرة</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                  <span>المستوى: {getDifficultyText(selectedQuestion.difficulty_level)}</span>
                </div>
              </div>

              {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">العلامات:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedQuestion.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      >
                        {tag}
                      </span>
                    ))}
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
      </div>
    </DashboardLayout>
  )
}
