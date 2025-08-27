'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getCurrentUser } from '@/lib/auth-utils'
import { supabase } from '@/lib/supabase'
import { 
  ChatBubbleLeftRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Discussion {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar_url?: string
  }
  course: {
    id: string
    title: string
  }
  created_at: string
  replies_count: number
  views_count: number
  likes_count: number
  is_liked: boolean
}

export default function StudentCommunityPage() {
  const { user } = useAuth()
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewDiscussion, setShowNewDiscussion] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null)
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    courseId: ''
  })
  const [editDiscussion, setEditDiscussion] = useState({
    title: '',
    content: '',
    courseId: ''
  })
  const [userData, setUserData] = useState({ name: '', avatar: '' })
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadUserData()
      loadEnrolledCourses()
    }
  }, [user])

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      loadDiscussions()
    }
  }, [enrolledCourses])

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

  const loadEnrolledCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          course_id,
          courses (
            id,
            title
          )
        `)
        .eq('student_id', user!.id)
        .eq('status', 'enrolled')

      if (error) {
        console.error('Error loading enrolled courses:', error)
        return
      }

      setEnrolledCourses(data || [])
    } catch (error) {
      console.error('Error loading enrolled courses:', error)
    }
  }

  const loadDiscussions = async () => {
    try {
      const courseIds = enrolledCourses.map(enrollment => enrollment.course_id)
      
      if (courseIds.length === 0) {
        setDiscussions([])
        setLoading(false)
        return
      }

      // Get discussions with author and course information
      // Fixed: Use specific column names to avoid relationship conflicts
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          id,
          title,
          content,
          created_at,
          views_count,
          likes_count,
          course_id,
          author_id,
          author:users!discussions_author_id_fkey(id, name, avatar_url),
          course:courses(id, title)
        `)
        .in('course_id', courseIds)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading discussions:', error)
        return
      }

      // Get like status for current user
      const discussionsWithLikes = await Promise.all(
        (data || []).map(async (discussion) => {
          const { data: likeData } = await supabase
            .from('discussion_likes')
            .select('id')
            .eq('discussion_id', discussion.id)
            .eq('user_id', user!.id)
            .single()

          // Get replies count
          const { count: repliesCount } = await supabase
            .from('discussion_replies')
            .select('*', { count: 'exact', head: true })
            .eq('discussion_id', discussion.id)

          return {
            ...discussion,
            replies_count: repliesCount || 0,
            is_liked: !!likeData
          }
        })
      )

      setDiscussions(discussionsWithLikes)
    } catch (error) {
      console.error('Error loading discussions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDiscussion = async () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim() || !newDiscussion.courseId) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('discussions')
        .insert({
        title: newDiscussion.title,
        content: newDiscussion.content,
          course_id: newDiscussion.courseId,
          author_id: user!.id
        })
        .select(`
          id,
          title,
          content,
          created_at,
          views_count,
          likes_count,
          course_id,
          author_id,
          author:users!discussions_author_id_fkey(id, name, avatar_url),
          course:courses(id, title)
        `)
        .single()

      if (error) {
        console.error('Error creating discussion:', error)
        alert('فشل في إنشاء المناقشة')
        return
      }

      const newDiscussionWithLikes = {
        ...data,
        replies_count: 0,
        is_liked: false
      }

      setDiscussions(prev => [newDiscussionWithLikes, ...prev])
      setShowNewDiscussion(false)
      setNewDiscussion({ title: '', content: '', courseId: '' })
      alert('تم إنشاء المناقشة بنجاح')
    } catch (error) {
      console.error('Error creating discussion:', error)
      alert('فشل في إنشاء المناقشة')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditDiscussion = async () => {
    if (!selectedDiscussion || !editDiscussion.title.trim() || !editDiscussion.content.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('discussions')
        .update({
          title: editDiscussion.title,
          content: editDiscussion.content
        })
        .eq('id', selectedDiscussion.id)
        .eq('author_id', user!.id)

      if (error) {
        console.error('Error updating discussion:', error)
        alert('فشل في تحديث المناقشة')
        return
      }

      setDiscussions(prev => prev.map(d => 
        d.id === selectedDiscussion.id 
          ? { ...d, title: editDiscussion.title, content: editDiscussion.content }
          : d
      ))

      setShowEditDialog(false)
      setSelectedDiscussion(null)
      setEditDiscussion({ title: '', content: '', courseId: '' })
      alert('تم تحديث المناقشة بنجاح')
    } catch (error) {
      console.error('Error updating discussion:', error)
      alert('فشل في تحديث المناقشة')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDiscussion = async () => {
    if (!selectedDiscussion) return

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('discussions')
        .delete()
        .eq('id', selectedDiscussion.id)
        .eq('author_id', user!.id)

      if (error) {
        console.error('Error deleting discussion:', error)
        alert('فشل في حذف المناقشة')
        return
      }

      setDiscussions(prev => prev.filter(d => d.id !== selectedDiscussion.id))
      setShowDeleteDialog(false)
      setSelectedDiscussion(null)
      alert('تم حذف المناقشة بنجاح')
    } catch (error) {
      console.error('Error deleting discussion:', error)
      alert('فشل في حذف المناقشة')
    } finally {
      setDeleting(false)
    }
  }

  const handleLikeDiscussion = async (discussionId: string) => {
    try {
      const discussion = discussions.find(d => d.id === discussionId)
      if (!discussion) return

      if (discussion.is_liked) {
        // Unlike
        const { error } = await supabase
          .from('discussion_likes')
          .delete()
          .eq('discussion_id', discussionId)
          .eq('user_id', user!.id)

        if (error) {
          console.error('Error unliking discussion:', error)
          return
        }

        setDiscussions(prev => prev.map(d => 
          d.id === discussionId 
            ? { ...d, likes_count: d.likes_count - 1, is_liked: false }
            : d
        ))
      } else {
        // Like
        const { error } = await supabase
          .from('discussion_likes')
          .insert({
            discussion_id: discussionId,
            user_id: user!.id
          })

        if (error) {
          console.error('Error liking discussion:', error)
          return
        }

        setDiscussions(prev => prev.map(d => 
          d.id === discussionId 
            ? { ...d, likes_count: d.likes_count + 1, is_liked: true }
            : d
        ))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const openViewDialog = (discussion: Discussion) => {
    setSelectedDiscussion(discussion)
    setShowViewDialog(true)
  }

  const openEditDialog = (discussion: Discussion) => {
    setSelectedDiscussion(discussion)
    setEditDiscussion({
      title: discussion.title,
      content: discussion.content,
      courseId: discussion.course.id
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (discussion: Discussion) => {
    setSelectedDiscussion(discussion)
    setShowDeleteDialog(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return 'منذ دقائق'
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`
    } else {
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            المجتمع
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            شارك أسئلتك وناقش مع زملائك في التعلم
          </p>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المناقشات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <button
            onClick={() => setShowNewDiscussion(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            مناقشة جديدة
          </button>
        </div>

        {/* Discussions List */}
        {filteredDiscussions.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              لا توجد مناقشات
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {enrolledCourses.length === 0 
                ? 'يجب عليك التسجيل في دورات أولاً لرؤية المناقشات'
                : searchTerm 
                  ? 'لا توجد نتائج للبحث' 
                  : 'ابدأ أول مناقشة في المجتمع'
              }
            </p>
            {enrolledCourses.length === 0 && (
              <a
                href="/dashboard/student/courses"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                استكشف الدورات
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredDiscussions.map((discussion) => (
              <div
                key={discussion.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {discussion.author.avatar_url ? (
                      <img
                        src={discussion.author.avatar_url}
                        alt={discussion.author.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="w-10 h-10 text-gray-400" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {discussion.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{discussion.author.name}</span>
                        <span>•</span>
                        <span>{discussion.course.title}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{formatDate(discussion.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {discussion.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <button
                      onClick={() => handleLikeDiscussion(discussion.id)}
                      className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${
                        discussion.is_liked ? 'text-blue-600' : ''
                      }`}
                    >
                      <HeartIcon className={`w-4 h-4 ${discussion.is_liked ? 'fill-current' : ''}`} />
                      <span>{discussion.likes_count}</span>
                    </button>
                    
                    <div className="flex items-center gap-1">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      <span>{discussion.replies_count} رد</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{discussion.views_count} مشاهدة</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openViewDialog(discussion)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      title="عرض التفاصيل"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    
                    {discussion.author.id === user?.id && (
                      <>
                        <button
                          onClick={() => openEditDialog(discussion)}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded-lg transition-colors"
                          title="تعديل المناقشة"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => openDeleteDialog(discussion)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                          title="حذف المناقشة"
                        >
                          <TrashIcon className="w-4 h-4" />
                  </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Discussion Dialog */}
        {showViewDialog && selectedDiscussion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    تفاصيل المناقشة
                  </h2>
                  <button
                    onClick={() => setShowViewDialog(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedDiscussion.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span>بواسطة: {selectedDiscussion.author.name}</span>
                      <span>•</span>
                      <span>الكورس: {selectedDiscussion.course.title}</span>
                      <span>•</span>
                      <span>{formatDate(selectedDiscussion.created_at)}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {selectedDiscussion.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <HeartIcon className="w-4 h-4" />
                      <span>{selectedDiscussion.likes_count} إعجاب</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                      <span>{selectedDiscussion.replies_count} رد</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{selectedDiscussion.views_count} مشاهدة</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowViewDialog(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Discussion Dialog */}
        {showEditDialog && selectedDiscussion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    تعديل المناقشة
                  </h2>
                  <button
                    onClick={() => setShowEditDialog(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      العنوان
                    </label>
                    <input
                      type="text"
                      value={editDiscussion.title}
                      onChange={(e) => setEditDiscussion(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="اكتب عنوان المناقشة..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المحتوى
                    </label>
                    <textarea
                      value={editDiscussion.content}
                      onChange={(e) => setEditDiscussion(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="اكتب محتوى المناقشة..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleEditDiscussion}
                    disabled={submitting || !editDiscussion.title.trim() || !editDiscussion.content.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {submitting ? 'جاري التحديث...' : 'تحديث المناقشة'}
                  </button>
                  <button
                    onClick={() => setShowEditDialog(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Discussion Dialog */}
        {showDeleteDialog && selectedDiscussion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    حذف المناقشة
                  </h2>
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    هل أنت متأكد من حذف المناقشة "{selectedDiscussion.title}"؟
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    لا يمكن التراجع عن هذا الإجراء.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteDiscussion}
                    disabled={deleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {deleting ? 'جاري الحذف...' : 'حذف'}
                  </button>
                  <button
                    onClick={() => setShowDeleteDialog(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Discussion Modal */}
        {showNewDiscussion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    مناقشة جديدة
                  </h2>
                  <button
                    onClick={() => setShowNewDiscussion(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      العنوان
                    </label>
                    <input
                      type="text"
                      value={newDiscussion.title}
                      onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="اكتب عنوان المناقشة..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المحتوى
                    </label>
                    <textarea
                      value={newDiscussion.content}
                      onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="اكتب محتوى المناقشة..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الكورس *
                    </label>
                    <select
                      value={newDiscussion.courseId}
                      onChange={(e) => setNewDiscussion(prev => ({ ...prev, courseId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">اختر الكورس</option>
                      {enrolledCourses.map(enrollment => (
                        <option key={enrollment.course_id} value={enrollment.course_id}>
                          {enrollment.courses.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCreateDiscussion}
                    disabled={submitting || !newDiscussion.title.trim() || !newDiscussion.content.trim() || !newDiscussion.courseId}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {submitting ? 'جاري النشر...' : 'نشر المناقشة'}
                  </button>
                  <button
                    onClick={() => setShowNewDiscussion(false)}
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
