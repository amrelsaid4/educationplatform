'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, CameraIcon, CheckIcon } from '@heroicons/react/24/outline'
import { getCurrentUser } from '../../../lib/auth-utils'
import DashboardLayout from '../../../components/layouts/DashboardLayout'
import { supabase } from '../../../lib/supabase'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  avatar_url?: string
  bio?: string
  phone?: string
  location?: string
  website?: string
  specialization?: string
  experience_years?: number
  education?: string
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [editMode, setEditMode] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    location: '',
    website: '',
    specialization: '',
    experience_years: 0,
    education: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { user: userProfile } = await getCurrentUser(user.id)
        setCurrentUser(userProfile)
        
        // Get user profile from database
        const { data: profileData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('Error loading profile:', error)
          return
        }
        
        if (profileData) {
          setProfile(profileData)
          setFormData({
            name: profileData.name || '',
            email: profileData.email || '',
            bio: profileData.bio || '',
            phone: profileData.phone || '',
            location: profileData.location || '',
            website: profileData.website || '',
            specialization: profileData.specialization || '',
            experience_years: profileData.experience_years || 0,
            education: profileData.education || ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let avatarUrl = profile?.avatar_url

      // Upload new avatar if selected
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile)
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        }
      }

      // Update profile in database
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          bio: formData.bio,
          phone: formData.phone,
          location: formData.location,
          website: formData.website,
          specialization: formData.specialization,
          experience_years: formData.experience_years,
          education: formData.education,
          avatar_url: avatarUrl
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        alert('حدث خطأ أثناء تحديث الملف الشخصي')
        return
      }

      // Update email if changed
      if (formData.email !== profile?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        })
        
        if (emailError) {
          console.error('Error updating email:', emailError)
          alert('حدث خطأ أثناء تحديث البريد الإلكتروني')
        }
      }

      alert('تم تحديث الملف الشخصي بنجاح!')
      setEditMode(false)
      setAvatarFile(null)
      setAvatarPreview(null)
      await loadProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('حدث خطأ أثناء تحديث الملف الشخصي')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <DashboardLayout userRole={currentUser?.role || 'student'} userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
        <div className="py-6 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
              <div className="card">
                <div className="space-y-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i}>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={currentUser?.role || 'student'} userName={currentUser?.name || ''} userAvatar={currentUser?.avatar_url}>
      <div className="py-6 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-4"
                >
                  <ArrowLeftIcon className="h-5 w-5 ml-1" />
                  رجوع
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الملف الشخصي</h1>
              </div>
              <button
                onClick={() => setEditMode(!editMode)}
                className="btn-primary"
              >
                {editMode ? 'إلغاء التعديل' : 'تعديل الملف الشخصي'}
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6 space-x-reverse">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-[#49BBBD] to-[#06b6d4] flex items-center justify-center">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-2xl font-bold">
                        {profile?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {editMode && (
                    <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg cursor-pointer">
                      <CameraIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {profile?.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {profile?.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {profile?.role === 'teacher' ? 'مدرس' : profile?.role === 'student' ? 'طالب' : 'مدير'} • عضو منذ {new Date(profile?.created_at || '').toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200 disabled:opacity-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200 disabled:opacity-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الموقع
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الموقع الإلكتروني
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  />
                </div>

                {profile?.role === 'teacher' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        التخصص
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200 disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        سنوات الخبرة
                      </label>
                      <input
                        type="number"
                        name="experience_years"
                        value={formData.experience_years}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200 disabled:opacity-50"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المؤهل العلمي
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200 disabled:opacity-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نبذة عني
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200 disabled:opacity-50"
                    placeholder="اكتب نبذة مختصرة عن نفسك..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              {editMode && (
                <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="btn-secondary"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        حفظ التغييرات
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
