'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from "../../../../components/layouts/DashboardLayout";
import ProtectedRoute from "../../../../components/auth/ProtectedRoute";
import { 
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BookOpenIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { supabase } from '../../../../lib/supabase'

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    defaultLanguage: string;
    timezone: string;
    maintenanceMode: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  payment: {
    stripePublicKey: string;
    stripeSecretKey: string;
    paypalClientId: string;
    paypalSecret: string;
    defaultCurrency: string;
  };
  features: {
    enableRegistration: boolean;
    enableEmailVerification: boolean;
    enableTwoFactorAuth: boolean;
    enableSocialLogin: boolean;
    enableCourseReviews: boolean;
    enableDiscussions: boolean;
    enableNotifications: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireStrongPassword: boolean;
    enableCaptcha: boolean;
  };
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'منصة التعلم الرقمي',
      siteDescription: 'منصة تعليمية شاملة للتعلم عن بعد',
      siteUrl: 'https://example.com',
      defaultLanguage: 'ar',
      timezone: 'Asia/Riyadh',
      maintenanceMode: false
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@example.com',
      fromName: 'منصة التعلم الرقمي'
    },
    payment: {
      stripePublicKey: '',
      stripeSecretKey: '',
      paypalClientId: '',
      paypalSecret: '',
      defaultCurrency: 'USD'
    },
    features: {
      enableRegistration: true,
      enableEmailVerification: true,
      enableTwoFactorAuth: false,
      enableSocialLogin: true,
      enableCourseReviews: true,
      enableDiscussions: true,
      enableNotifications: true
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireStrongPassword: true,
      enableCaptcha: false
    }
  })
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      // In a real app, you would load settings from the database
      // For now, we'll use the default settings
      console.log('Loading settings...')
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      // In a real app, you would save settings to the database
      console.log('Saving settings:', settings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setShowSaveModal(false)
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const tabs = [
    { id: 'general', name: 'عام', icon: CogIcon },
    { id: 'email', name: 'البريد الإلكتروني', icon: BellIcon },
    { id: 'payment', name: 'المدفوعات', icon: CurrencyDollarIcon },
    { id: 'features', name: 'الميزات', icon: BookOpenIcon },
    { id: 'security', name: 'الأمان', icon: ShieldCheckIcon }
  ]

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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إعدادات النظام</h1>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    إدارة إعدادات المنصة والتكوين العام
                  </p>
                </div>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  حفظ الإعدادات
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === tab.id
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Icon className="h-5 w-5 ml-3" />
                          {tab.name}
                        </button>
                      )
                    })}
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                  {/* General Settings */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">الإعدادات العامة</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            اسم الموقع
                          </label>
                          <input
                            type="text"
                            value={settings.general.siteName}
                            onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            رابط الموقع
                          </label>
                          <input
                            type="url"
                            value={settings.general.siteUrl}
                            onChange={(e) => updateSetting('general', 'siteUrl', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            اللغة الافتراضية
                          </label>
                          <select
                            value={settings.general.defaultLanguage}
                            onChange={(e) => updateSetting('general', 'defaultLanguage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          >
                            <option value="ar">العربية</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            المنطقة الزمنية
                          </label>
                          <select
                            value={settings.general.timezone}
                            onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          >
                            <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                            <option value="Asia/Dubai">دبي (GMT+4)</option>
                            <option value="Europe/London">لندن (GMT+0)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          وصف الموقع
                        </label>
                        <textarea
                          value={settings.general.siteDescription}
                          onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.general.maintenanceMode}
                          onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
                          وضع الصيانة
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Email Settings */}
                  {activeTab === 'email' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">إعدادات البريد الإلكتروني</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            خادم SMTP
                          </label>
                          <input
                            type="text"
                            value={settings.email.smtpHost}
                            onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            المنفذ
                          </label>
                          <input
                            type="number"
                            value={settings.email.smtpPort}
                            onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            اسم المستخدم
                          </label>
                          <input
                            type="text"
                            value={settings.email.smtpUser}
                            onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            كلمة المرور
                          </label>
                          <input
                            type="password"
                            value={settings.email.smtpPassword}
                            onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            البريد الإلكتروني المرسل منه
                          </label>
                          <input
                            type="email"
                            value={settings.email.fromEmail}
                            onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            اسم المرسل
                          </label>
                          <input
                            type="text"
                            value={settings.email.fromName}
                            onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Settings */}
                  {activeTab === 'payment' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">إعدادات المدفوعات</h2>
                      
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Stripe</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                المفتاح العام
                              </label>
                              <input
                                type="text"
                                value={settings.payment.stripePublicKey}
                                onChange={(e) => updateSetting('payment', 'stripePublicKey', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                المفتاح السري
                              </label>
                              <input
                                type="password"
                                value={settings.payment.stripeSecretKey}
                                onChange={(e) => updateSetting('payment', 'stripeSecretKey', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">PayPal</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                معرف العميل
                              </label>
                              <input
                                type="text"
                                value={settings.payment.paypalClientId}
                                onChange={(e) => updateSetting('payment', 'paypalClientId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                المفتاح السري
                              </label>
                              <input
                                type="password"
                                value={settings.payment.paypalSecret}
                                onChange={(e) => updateSetting('payment', 'paypalSecret', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            العملة الافتراضية
                          </label>
                          <select
                            value={settings.payment.defaultCurrency}
                            onChange={(e) => updateSetting('payment', 'defaultCurrency', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          >
                            <option value="USD">الدولار الأمريكي (USD)</option>
                            <option value="EUR">اليورو (EUR)</option>
                            <option value="SAR">الريال السعودي (SAR)</option>
                            <option value="AED">الدرهم الإماراتي (AED)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Features Settings */}
                  {activeTab === 'features' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">إعدادات الميزات</h2>
                      
                      <div className="space-y-4">
                        {Object.entries(settings.features).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                {key === 'enableRegistration' && 'تمكين التسجيل'}
                                {key === 'enableEmailVerification' && 'التحقق من البريد الإلكتروني'}
                                {key === 'enableTwoFactorAuth' && 'المصادقة الثنائية'}
                                {key === 'enableSocialLogin' && 'تسجيل الدخول الاجتماعي'}
                                {key === 'enableCourseReviews' && 'تقييمات الكورسات'}
                                {key === 'enableDiscussions' && 'المناقشات'}
                                {key === 'enableNotifications' && 'الإشعارات'}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {key === 'enableRegistration' && 'السماح للمستخدمين الجدد بالتسجيل'}
                                {key === 'enableEmailVerification' && 'طلب التحقق من البريد الإلكتروني'}
                                {key === 'enableTwoFactorAuth' && 'تفعيل المصادقة الثنائية للأمان'}
                                {key === 'enableSocialLogin' && 'السماح بتسجيل الدخول عبر وسائل التواصل'}
                                {key === 'enableCourseReviews' && 'السماح للطلاب بتقييم الكورسات'}
                                {key === 'enableDiscussions' && 'تفعيل نظام المناقشات'}
                                {key === 'enableNotifications' && 'إرسال إشعارات للمستخدمين'}
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => updateSetting('features', key, e.target.checked)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Security Settings */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">إعدادات الأمان</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            مهلة الجلسة (دقائق)
                          </label>
                          <input
                            type="number"
                            value={settings.security.sessionTimeout}
                            onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            الحد الأقصى لمحاولات تسجيل الدخول
                          </label>
                          <input
                            type="number"
                            value={settings.security.maxLoginAttempts}
                            onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            الحد الأدنى لطول كلمة المرور
                          </label>
                          <input
                            type="number"
                            value={settings.security.passwordMinLength}
                            onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.security.requireStrongPassword}
                            onChange={(e) => updateSetting('security', 'requireStrongPassword', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
                            طلب كلمة مرور قوية
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.security.enableCaptcha}
                            onChange={(e) => updateSetting('security', 'enableCaptcha', e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
                            تفعيل CAPTCHA
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Confirmation Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 ml-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">تأكيد حفظ الإعدادات</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                هل أنت متأكد من حفظ هذه الإعدادات؟ قد تؤثر بعض التغييرات على عمل المنصة.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
