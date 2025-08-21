'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { getLessonComments, addComment, updateComment, deleteComment } from '@/lib/course-utils'
import { ChatBubbleLeftIcon, TrashIcon, PencilIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

interface Comment {
  id: string
  content: string
  created_at: string
  user_profiles: {
    name: string
    avatar_url?: string
  }
  user_id: string
}

interface CommentsProps {
  lessonId: string
}

export default function Comments({ lessonId }: CommentsProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [lessonId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const data = await getLessonComments(lessonId)
      setComments(data || [])
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user?.id) return

    setSubmitting(true)
    try {
      const comment = await addComment(lessonId, user.id, newComment.trim())
      setComments([comment, ...comments])
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      await updateComment(commentId, editContent.trim())
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: editContent.trim() }
          : comment
      ))
      setEditingComment(null)
      setEditContent('')
    } catch (error) {
      console.error('Error updating comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return

    try {
      await deleteComment(commentId)
      setComments(comments.filter(comment => comment.id !== commentId))
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id)
    setEditContent(comment.content)
  }

  const cancelEditing = () => {
    setEditingComment(null)
    setEditContent('')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'منذ دقائق'
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
    if (diffInHours < 48) return 'منذ يوم'
    return `منذ ${Math.floor(diffInHours / 24)} أيام`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <ChatBubbleLeftIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            المناقشات والتعليقات
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({comments.length})
          </span>
        </div>
      </div>

      {/* Add Comment */}
      {user && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name || ''}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="اكتب تعليقك هنا..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={3}
              />
              
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  اضغط Enter لإرسال التعليق
                </p>
                
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  {submitting ? 'جاري الإرسال...' : 'إرسال'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              لا توجد تعليقات بعد. كن أول من يعلق!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="flex-shrink-0">
                  {comment.user_profiles.avatar_url ? (
                    <img 
                      src={comment.user_profiles.avatar_url} 
                      alt={comment.user_profiles.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {comment.user_profiles.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    {editingComment === comment.id ? (
                      <div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleEditComment(comment.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                          >
                            حفظ
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 text-sm rounded transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {comment.user_profiles.name}
                      </span>
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                    
                                         {user?.id === comment.user_id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditing(comment)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
