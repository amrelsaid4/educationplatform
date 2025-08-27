'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getCurrentUser } from '@/lib/auth-utils'
import { 
  ChatBubbleLeftRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon
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
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    courseId: ''
  })
  const [userData, setUserData] = useState({ name: '', avatar: '' })

  useEffect(() => {
    if (user?.id) {
      loadUserData()
      loadDiscussions()
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

  const loadDiscussions = async () => {
    try {
      // In a real app, you would fetch discussions from your API
      // For now, we'll simulate the data
      const mockDiscussions: Discussion[] = [
        {
          id: '1',
          title: 'سؤال حول الدرس الثالث في البرمجة',
          content: 'أحتاج مساعدة في فهم مفهوم الـ loops في JavaScript. هل يمكن لأحد شرحه لي؟',
          author: {
            id: '1',
            name: 'أحمد محمد',
            avatar_url: undefined
          },
          course: {
            id: '1',
            title: 'مقدمة في البرمجة'
          },
          created_at: new Date(Date.now() - 3600000).toISOString(),
          replies_count: 3,
          views_count: 15,
          likes_count: 2,
          is_liked: false
        },
        {
          id: '2',
          title: 'مشاركة مشروعي النهائي',
          content: 'أريد مشاركة مشروعي النهائي معكم. هل يمكنكم إعطائي نصائح للتحسين؟',
          author: {
            id: '2',
            name: 'فاطمة علي',
            avatar_url: undefined
          },
          course: {
            id: '2',
            title: 'تطوير الويب'
          },
          created_at: new Date(Date.now() - 7200000).toISOString(),
          replies_count: 5,
          views_count: 28,
          likes_count: 8,
          is_liked: true
        }
      ]

      setDiscussions(mockDiscussions)
    } catch (error) {
      console.error('Error loading discussions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDiscussion = async () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) return

    try {
      // In a real app, you would submit the discussion to your API
      const discussion: Discussion = {
        id: Date.now().toString(),
        title: newDiscussion.title,
        content: newDiscussion.content,
        author: {
          id: user!.id,
          name: user!.name || 'مستخدم',
          avatar_url: user!.avatar_url
        },
        course: {
          id: newDiscussion.courseId || '1',
          title: 'مقدمة في البرمجة'
        },
        created_at: new Date().toISOString(),
        replies_count: 0,
        views_count: 0,
        likes_count: 0,
        is_liked: false
      }

      setDiscussions(prev => [discussion, ...prev])
      setShowNewDiscussion(false)
      setNewDiscussion({ title: '', content: '', courseId: '' })
    } catch (error) {
      console.error('Error creating discussion:', error)
    }
  }

  const handleLikeDiscussion = (discussionId: string) => {
    setDiscussions(prev => prev.map(discussion => {
      if (discussion.id === discussionId) {
        return {
          ...discussion,
          likes_count: discussion.is_liked ? discussion.likes_count - 1 : discussion.likes_count + 1,
          is_liked: !discussion.is_liked
        }
      }
      return discussion
    }))
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
              {searchTerm ? 'لا توجد نتائج للبحث' : 'ابدأ أول مناقشة في المجتمع'}
            </p>
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

                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            ))}
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
                    <PlusIcon className="w-6 h-6 rotate-45" />
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
                      الكورس (اختياري)
                    </label>
                    <select
                      value={newDiscussion.courseId}
                      onChange={(e) => setNewDiscussion(prev => ({ ...prev, courseId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">اختر الكورس</option>
                      <option value="1">مقدمة في البرمجة</option>
                      <option value="2">تطوير الويب</option>
                      <option value="3">قواعد البيانات</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCreateDiscussion}
                    disabled={!newDiscussion.title.trim() || !newDiscussion.content.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    نشر المناقشة
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
