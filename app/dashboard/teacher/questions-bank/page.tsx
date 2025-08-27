'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getCurrentUser } from '@/lib/auth-utils'
import { supabase } from '@/lib/supabase'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FilterIcon,
  TagIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  AcademicCapIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Question {
  id: string
  question_text: string
  question_type: string
  options?: any[]
  correct_answer?: string
  explanation?: string
  difficulty_level: string
  tags: string[]
  is_public: boolean
  is_active: boolean
  usage_count: number
  category?: {
    id: string
    name: string
    color: string
  }
  created_at: string
}

interface Category {
  id: string
  name: string
  description: string
  color: string
  question_count: number
}

export default function TeacherQuestionBankPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [userData, setUserData] = useState({ name: '', avatar: '' })

  useEffect(() => {
    if (user?.id) {
      loadUserData()
      loadQuestions()
      loadCategories()
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

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .select(`
          *,
          category:question_bank_categories(id, name, color)
        `)
        .eq('teacher_id', user!.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading questions:', error)
        return
      }

      setQuestions(data || [])
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('question_bank_categories')
        .select('*')
        .eq('teacher_id', user!.id)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error loading categories:', error)
        return
      }

      // Add question count to each category
      const categoriesWithCount = await Promise.all(
        (data || []).map(async (category) => {
          const { count } = await supabase
            .from('question_bank')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('teacher_id', user!.id)

          return {
            ...category,
            question_count: count || 0
          }
        })
      )

      setCategories(categoriesWithCount)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || question.category?.id === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty_level === selectedDifficulty
    const matchesType = selectedType === 'all' || question.question_type === selectedType

    return matchesSearch && matchesCategory && matchesDifficulty && matchesType
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'text-blue-600 bg-blue-100'
      case 'true_false': return 'text-purple-600 bg-purple-100'
      case 'short_answer': return 'text-orange-600 bg-orange-100'
      case 'essay': return 'text-indigo-600 bg-indigo-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'اختيار متعدد'
      case 'true_false': return 'صح وخطأ'
      case 'short_answer': return 'إجابة قصيرة'
      case 'essay': return 'مقال'
      default: return type
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={userData.name} userAvatar={userData.avatar}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="teacher" userName={userData.name} userAvatar={userData.avatar}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
        <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                بنك الأسئلة
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                إدارة وإنشاء الأسئلة للامتحانات والاختبارات
              </p>
        </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <TagIcon className="w-5 h-5" />
                إضافة فئة
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                إضافة سؤال
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <AcademicCapIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الأسئلة</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{questions.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <TagIcon className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">الفئات</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <EyeIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">الأسئلة العامة</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {questions.filter(q => q.is_public).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الاستخدام</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {questions.reduce((sum, q) => sum + q.usage_count, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
      </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في الأسئلة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
          </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">جميع الفئات</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.question_count})
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">جميع المستويات</option>
              <option value="easy">سهل</option>
              <option value="medium">متوسط</option>
              <option value="hard">صعب</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">جميع الأنواع</option>
              <option value="multiple_choice">اختيار متعدد</option>
              <option value="true_false">صح وخطأ</option>
              <option value="short_answer">إجابة قصيرة</option>
              <option value="essay">مقال</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedDifficulty('all')
                setSelectedType('all')
              }}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              مسح الفلاتر
            </button>
        </div>
      </div>

      {/* Questions List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center">
              <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد أسئلة
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedType !== 'all'
                  ? 'لا توجد أسئلة تطابق الفلاتر المحددة'
                  : 'ابدأ بإنشاء أول سؤال في بنك الأسئلة'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && selectedDifficulty === 'all' && selectedType === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  إضافة أول سؤال
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredQuestions.map((question) => (
                <div key={question.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {question.question_text}
                      </h3>
                      
                      {/* Tags and Meta */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {question.category && (
                          <span
                            className="px-2 py-1 text-xs rounded-full"
                            style={{
                              backgroundColor: `${question.category.color}20`,
                              color: question.category.color
                            }}
                          >
                            {question.category.name}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(question.difficulty_level)}`}>
                          {question.difficulty_level === 'easy' ? 'سهل' : 
                           question.difficulty_level === 'medium' ? 'متوسط' : 'صعب'}
                  </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(question.question_type)}`}>
                          {getTypeText(question.question_type)}
                  </span>
                  {question.is_public && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                      عام
                    </span>
                  )}
                        {!question.is_active && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
                            غير نشط
                          </span>
                        )}
                </div>

                      {/* Tags */}
                      {question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                    {question.tags.map((tag, index) => (
                      <span
                        key={index}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded"
                      >
                              #{tag}
                      </span>
                    ))}
                  </div>
                )}

                      {/* Usage Count */}
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <ChartBarIcon className="w-4 h-4 mr-1" />
                        تم استخدامها {question.usage_count} مرة
              </div>
            </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg transition-colors"
                        title="مشاركة"
                      >
                        <ShareIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900 rounded-lg transition-colors"
                        title="نسخ"
                      >
                        <DocumentDuplicateIcon className="w-5 h-5" />
                      </button>
                <button
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                        title="حذف"
                >
                        <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Question Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              إضافة سؤال جديد
            </h2>
            {/* Add form here */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                إلغاء
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                حفظ السؤال
              </button>
            </div>
          </div>
          </div>
      )}

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              إضافة فئة جديدة
            </h2>
            {/* Add form here */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                إلغاء
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                حفظ الفئة
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
