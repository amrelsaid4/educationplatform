'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from "../../../../components/layouts/DashboardLayout";
import ProtectedRoute from "../../../../components/auth/ProtectedRoute";
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  StarIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import { supabase } from '../../../../lib/supabase'

interface Course {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  teacher?: {
    name: string;
    email: string;
  };
  thumbnail_url?: string;
  price: number;
  level: string;
  category: string;
  language: string;
  status: string;
  is_free: boolean;
  duration_hours: number;
  total_lessons: number;
  enrollment_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, searchTerm, statusFilter, categoryFilter])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          teacher:users(name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = courses

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter)
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter)
    }

    setFilteredCourses(filtered)
  }

  const updateCourseStatus = async (courseId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status })
        .eq('id', courseId)

      if (error) throw error
      await loadCourses()
    } catch (error) {
      console.error('Error updating course status:', error)
    }
  }

  const deleteCourses = async () => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .in('id', selectedCourses)

      if (error) throw error
      setSelectedCourses([])
      setShowDeleteModal(false)
      await loadCourses()
    } catch (error) {
      console.error('Error deleting courses:', error)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'مسودة'
      case 'published': return 'منشور'
      case 'archived': return 'مؤرشف'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'draft': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'archived': return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'مبتدئ'
      case 'intermediate': return 'متوسط'
      case 'advanced': return 'متقدم'
      default: return level
    }
  }

  const getCategories = () => {
    const categories = [...new Set(courses.map(course => course.category).filter(Boolean))]
    return categories
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout userRole="admin">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <DashboardLayout userRole="admin">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة الكورسات</h1>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    مراجعة وإدارة جميع الكورسات في المنصة
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCourse(null)
                    setShowCourseModal(true)
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  إضافة كورس جديد
                </button>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="البحث في الكورسات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="draft">مسودة</option>
                  <option value="published">منشور</option>
                  <option value="archived">مؤرشف</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">جميع الفئات</option>
                  {getCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Bulk Actions */}
                {selectedCourses.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                      حذف المحدد ({selectedCourses.length})
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div key={course.id} className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                  {/* Course Image */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpenIcon className="h-16 w-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                        {getStatusLabel(course.status)}
                      </span>
                    </div>
                    <div className="absolute top-4 left-4">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCourses([...selectedCourses, course.id])
                          } else {
                            setSelectedCourses(selectedCourses.filter(id => id !== course.id))
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <UserGroupIcon className="h-4 w-4 ml-1" />
                        <span>{course.enrollment_count} طالب</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <StarIcon className="h-4 w-4 ml-1 text-yellow-500" />
                        <span>{course.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <BookOpenIcon className="h-4 w-4 ml-1" />
                        <span>{course.total_lessons} درس</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <CurrencyDollarIcon className="h-4 w-4 ml-1" />
                        <span>{course.is_free ? 'مجاني' : `$${course.price}`}</span>
                      </div>
                    </div>

                    {/* Course Meta */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={`https://ui-avatars.com/api/?name=${course.teacher?.name || 'Unknown'}&background=random`}
                          alt={course.teacher?.name || 'Unknown'}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
                          {course.teacher?.name || 'غير محدد'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {getLevelLabel(course.level)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCourse(course)
                          setShowCourseModal(true)
                        }}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 ml-1 inline" />
                        عرض
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourse(course)
                          setShowCourseModal(true)
                        }}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourse(course)
                          setShowDeleteModal(true)
                        }}
                        className="px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                عرض {filteredCourses.length} من {courses.length} كورس
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 ml-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تأكيد الحذف</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                هل أنت متأكد من حذف {selectedCourses.length > 1 ? 'الكورسات المحددة' : 'هذا الكورس'}؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={deleteCourses}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course Modal */}
        {showCourseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedCourse ? 'تفاصيل الكورس' : 'إضافة كورس جديد'}
                </h3>
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {selectedCourse && (
                <div className="space-y-6">
                  {/* Course Header */}
                  <div className="flex items-start gap-6">
                    <div className="w-48 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {selectedCourse.thumbnail_url ? (
                        <img
                          src={selectedCourse.thumbnail_url}
                          alt={selectedCourse.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <BookOpenIcon className="h-12 w-12 text-white opacity-50" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedCourse.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {selectedCourse.description}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>المستوى: {getLevelLabel(selectedCourse.level)}</span>
                        <span>الفئة: {selectedCourse.category}</span>
                        <span>اللغة: {selectedCourse.language}</span>
                      </div>
                    </div>
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {selectedCourse.enrollment_count}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">الطلاب المسجلين</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {selectedCourse.total_lessons}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">عدد الدروس</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {selectedCourse.rating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">التقييم</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedCourse.is_free ? 'مجاني' : `$${selectedCourse.price}`}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">السعر</div>
                    </div>
                  </div>

                  {/* Course Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => updateCourseStatus(selectedCourse.id, 'published')}
                      disabled={selectedCourse.status === 'published'}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      نشر الكورس
                    </button>
                    <button
                      onClick={() => updateCourseStatus(selectedCourse.id, 'archived')}
                      disabled={selectedCourse.status === 'archived'}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      أرشفة الكورس
                    </button>
                    <button
                      onClick={() => setShowCourseModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
