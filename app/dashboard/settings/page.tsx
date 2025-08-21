'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, CheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { getCurrentUser } from '../../../lib/auth-utils'
import DashboardLayout from '../../../components/layouts/DashboardLayout'
import { supabase } from '../../../lib/supabase'

interface UserSettings {
  id: string
  email_notifications: boolean
  course_notifications: boolean
  student_notifications: boolean
  task_reminders: boolean
  language: string
  theme: 'light' | 'dark' | 'auto'
  timezone: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    email_notifications: true,
    course_notifications: true,
    student_notifications: true,
    task_reminders: true,
    language: 'ar',
    theme: 'auto' as 'light' | 'dark' | 'auto',
    timezone: 'Asia/Riyadh'
  })

  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { user: userProfile } = await getCurrentUser(user.id)
        setCurrentUser(userProfile)
        
        // Get user settings from database
        const { data: settingsData, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error loading settings:', error)
        }
        
        if (settingsData) {
          setSettings(settingsData)
          setFormData({
            email_notifications: settingsData.email_notifications ?? true,
            course_notifications: settingsData.course_notifications ?? true,
            student_notifications: settingsData.student_notifications ?? true,
            task_reminders: settingsData.task_reminders ?? true,
            language: settingsData.language ?? 'ar',
            theme: settingsData.theme ?? 'auto',
            timezone: settingsData.timezone ?? 'Asia/Riyadh'
          })
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Upsert settings in database
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          email_notifications: formData.email_notifications,
          course_notifications: formData.course_notifications,
          student_notifications: formData.student_notifications,
          task_reminders: formData.task_reminders,
          language: formData.language,
          theme: formData.theme,
          timezone: formData.timezone
        })

      if (error) {
        console.error('Error updating settings:', error)
        alert('حدث خطأ أثناء حفظ الإعدادات')
        return
      }

      alert('تم حفظ الإعدادات بنجاح!')
    } catch (error) {
      console.error('Error updating settings:', error)
      alert('حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('كلمة المرور الجديدة غير متطابقة')
      return
    }

    if (passwordData.new_password.length < 6) {
      alert('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
      return
    }
    
    try {
      setSaving(true)
      
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      })

      if (error) {
        console.error('Error updating password:', error)
        alert('حدث خطأ أثناء تغيير كلمة المرور')
        return
      }

      alert('تم تغيير كلمة المرور بنجاح!')
      setPasswordData({
        new_password: '',
        confirm_password: ''
      })
    } catch (error) {
      console.error('Error updating password:', error)
      alert('حدث خطأ أثناء تغيير كلمة المرور')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
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
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="card">
                    <div className="space-y-6">
                      {[...Array(4)].map((_, j) => (
                        <div key={j}>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
            <div className="flex items-center mb-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-4"
              >
                <ArrowLeftIcon className="h-5 w-5 ml-1" />
                رجوع
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الإعدادات</h1>
            </div>
          </div>

          <div className="space-y-6">
            {/* Notification Settings */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                إعدادات الإشعارات
              </h2>
              
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        إشعارات البريد الإلكتروني
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        استلام إشعارات عبر البريد الإلكتروني
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="email_notifications"
                        checked={formData.email_notifications}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#49BBBD]/20 dark:peer-focus:ring-[#49BBBD]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#49BBBD]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        إشعارات الكورسات
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        إشعارات حول الكورسات الجديدة والتحديثات
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="course_notifications"
                        checked={formData.course_notifications}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#49BBBD]/20 dark:peer-focus:ring-[#49BBBD]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#49BBBD]"></div>
                    </label>
                  </div>

                  {currentUser?.role === 'teacher' && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            إشعارات الطلاب
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            إشعارات حول تسجيل الطلاب الجدد
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="student_notifications"
                            checked={formData.student_notifications}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#49BBBD]/20 dark:peer-focus:ring-[#49BBBD]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#49BBBD]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            تذكيرات المهام
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            تذكيرات بمواعيد استحقاق المهام
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="task_reminders"
                            checked={formData.task_reminders}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#49BBBD]/20 dark:peer-focus:ring-[#49BBBD]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#49BBBD]"></div>
                        </label>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      اللغة
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المظهر
                    </label>
                    <select
                      name="theme"
                      value={formData.theme}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
                    >
                      <option value="auto">تلقائي</option>
                      <option value="light">فاتح</option>
                      <option value="dark">داكن</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
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
                        حفظ الإعدادات
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Change */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                تغيير كلمة المرور
              </h2>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      كلمة المرور الجديدة
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
                        placeholder="كلمة المرور الجديدة"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent transition-all duration-200"
                        placeholder="تأكيد كلمة المرور"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        جاري التحديث...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        تغيير كلمة المرور
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
