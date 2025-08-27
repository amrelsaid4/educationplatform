'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getCurrentUser } from '@/lib/auth-utils'
import { supabase } from '@/lib/supabase'
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  CalendarIcon,
  MapPinIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url?: string
  phone?: string
  bio?: string
  location?: string
  date_of_birth?: string
  created_at: string
}

export default function StudentProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    bio: '',
    location: ''
  })

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const { user: userProfile } = await getCurrentUser(user!.id)
      setProfile(userProfile)
      setEditForm({
        name: userProfile?.name || '',
        phone: userProfile?.phone || '',
        bio: userProfile?.bio || '',
        location: userProfile?.location || ''
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editForm.name,
          phone: editForm.phone,
          bio: editForm.bio,
          location: editForm.location,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) {
        console.error('Error updating profile:', error)
        return
      }

      setProfile(prev => prev ? { ...prev, ...editForm } : null)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      location: profile?.location || ''
    })
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={profile?.name || ''} userAvatar={profile?.avatar_url}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="student" userName={profile?.name || ''} userAvatar={profile?.avatar_url}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              الملف الشخصي
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              إدارة معلوماتك الشخصية والإعدادات
            </p>
          </div>

          {profile && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <img
                        src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=49BBBD&color=ffffff&size=120`}
                        alt={profile.name}
                        className="w-32 h-32 rounded-full mx-auto border-4 border-gray-200 dark:border-gray-600"
                      />
                      <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
                      {profile.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      طالب
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <EnvelopeIcon className="w-4 h-4" />
                      <span>{profile.email}</span>
                    </div>
                    
                    {profile.phone && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <PhoneIcon className="w-4 h-4" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    
                    {profile.location && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="w-4 h-4" />
                      <span>انضم في {formatDate(profile.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        المعلومات الشخصية
                      </h3>
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          تعديل
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            {saving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <CheckIcon className="w-4 h-4" />
                            )}
                            حفظ
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            إلغاء
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          الاسم الكامل
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-white">{profile.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          رقم الهاتف
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="أدخل رقم الهاتف"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-white">{profile.phone || 'غير محدد'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          الموقع
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.location}
                            onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="أدخل موقعك"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-white">{profile.location || 'غير محدد'}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          نبذة شخصية
                        </label>
                        {isEditing ? (
                          <textarea
                            value={editForm.bio}
                            onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="اكتب نبذة عن نفسك..."
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-white">{profile.bio || 'لا توجد نبذة شخصية'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      إحصائيات التعلم
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                          <AcademicCapIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">12</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">الكورسات المكتملة</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">156</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">الدروس المكتملة</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="bg-purple-100 dark:bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                          <UserIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white">89%</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">معدل النجاح</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
