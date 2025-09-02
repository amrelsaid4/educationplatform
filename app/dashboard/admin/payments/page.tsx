'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from "../../../../components/layouts/DashboardLayout";
import ProtectedRoute from "../../../../components/auth/ProtectedRoute";
import { 
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BookOpenIcon
} from "@heroicons/react/24/outline";
import { supabase } from '../../../../lib/supabase'

interface Payment {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_gateway: string;
  transaction_id: string;
  status: string;
  paid_at: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
  course?: {
    title: string;
  };
}

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  pendingPayments: number;
  failedPayments: number;
  monthlyRevenue: number;
  revenueGrowth: number;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    pendingPayments: 0,
    failedPayments: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0
  })
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  useEffect(() => {
    loadPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [payments, searchTerm, statusFilter, dateFilter])

  const loadPayments = async () => {
    try {
      setLoading(true)
      
      // Get payments data
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          user:users(name, email),
          course:courses(title)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayments(data || [])
      
      // Get payment stats using RPC function
      const { data: paymentStats, error: statsError } = await supabase
        .rpc('get_payment_stats')
      
      if (statsError) {
        console.error('Error fetching payment stats:', statsError)
      }
      
      // Calculate stats with real data
      calculateStats(data || [], paymentStats)
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (paymentsData: Payment[], paymentStats?: any) => {
    const totalRevenue = paymentsData
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0)

    const totalTransactions = paymentsData.length
    const pendingPayments = paymentsData.filter(p => p.status === 'pending').length
    const failedPayments = paymentsData.filter(p => p.status === 'failed').length

    // Calculate monthly revenue
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyPayments = paymentsData.filter(p => {
      const paymentDate = new Date(p.created_at)
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear &&
             p.status === 'completed'
    })
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Use real growth data from RPC or calculate from payment stats
    const revenueGrowth = paymentStats?.growth?.growth || 0

    setStats({
      totalRevenue,
      totalTransactions,
      pendingPayments,
      failedPayments,
      monthlyRevenue,
      revenueGrowth
    })
  }

  const filterPayments = () => {
    let filtered = payments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.course?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(payment => 
        new Date(payment.created_at) >= filterDate
      )
    }

    setFilteredPayments(filtered)
  }

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status })
        .eq('id', paymentId)

      if (error) throw error
      await loadPayments()
    } catch (error) {
      console.error('Error updating payment status:', error)
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار'
      case 'completed': return 'مكتمل'
      case 'failed': return 'فشل'
      case 'refunded': return 'مسترد'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      case 'refunded': return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardLayout userRole="admin" userName="المدير">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
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
      <DashboardLayout userRole="admin" userName="المدير">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Header */}
            <div className="mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة المدفوعات</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  مراقبة وإدارة جميع المعاملات المالية في المنصة
                </p>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Revenue */}
              <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">إجمالي الإيرادات</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                    <div className="flex items-center mt-2">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 dark:text-green-400 ml-1" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        +{stats.revenueGrowth}%
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">من الشهر الماضي</span>
                    </div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              {/* Total Transactions */}
              <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">إجمالي المعاملات</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {stats.totalTransactions.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">جميع المعاملات</span>
                    </div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                    <BookOpenIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              {/* Pending Payments */}
              <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">المدفوعات المعلقة</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {stats.pendingPayments}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">في انتظار التأكيد</span>
                    </div>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-full">
                    <ClockIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* Monthly Revenue */}
              <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">إيرادات الشهر</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {formatCurrency(stats.monthlyRevenue)}
                    </p>
                    <div className="flex items-center mt-2">
                      <CalendarIcon className="h-4 w-4 text-purple-600 dark:text-purple-400 ml-1" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">هذا الشهر</span>
                    </div>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
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
                    placeholder="البحث في المدفوعات..."
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
                  <option value="pending">في الانتظار</option>
                  <option value="completed">مكتمل</option>
                  <option value="failed">فشل</option>
                  <option value="refunded">مسترد</option>
                </select>

                {/* Date Filter */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">جميع التواريخ</option>
                  <option value="today">اليوم</option>
                  <option value="week">آخر أسبوع</option>
                  <option value="month">آخر شهر</option>
                  <option value="year">آخر سنة</option>
                </select>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        المعاملة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        المستخدم
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        الكورس
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        المبلغ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        التاريخ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        إجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {payment.transaction_id || 'غير محدد'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {payment.payment_gateway}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <img
                                className="h-8 w-8 rounded-full"
                                src={`https://ui-avatars.com/api/?name=${payment.user?.name || 'Unknown'}&background=random`}
                                alt={payment.user?.name || 'Unknown'}
                              />
                            </div>
                            <div className="mr-3">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {payment.user?.name || 'غير محدد'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {payment.user?.email || 'غير محدد'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {payment.course?.title || 'غير محدد'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(payment.amount, payment.currency)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.payment_method}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                            {getStatusLabel(payment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedPayment(payment)
                                setShowPaymentModal(true)
                              }}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {payment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updatePaymentStatus(payment.id, 'completed')}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => updatePaymentStatus(payment.id, 'failed')}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                عرض {filteredPayments.length} من {payments.length} معاملة
              </div>
            </div>
          </div>
        </div>

        {/* Payment Details Modal */}
        {showPaymentModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">تفاصيل المعاملة</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">معلومات المعاملة</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">رقم المعاملة:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedPayment.transaction_id || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">المبلغ:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">طريقة الدفع:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedPayment.payment_method || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">بوابة الدفع:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedPayment.payment_gateway || 'غير محدد'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">معلومات المستخدم</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">الاسم:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedPayment.user?.name || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">البريد الإلكتروني:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedPayment.user?.email || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">الكورس:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {selectedPayment.course?.title || 'غير محدد'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">الحالة:</span>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mr-3 ${getStatusColor(selectedPayment.status)}`}>
                        {getStatusLabel(selectedPayment.status)}
                      </span>
                    </div>
                    {selectedPayment.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            updatePaymentStatus(selectedPayment.id, 'completed')
                            setShowPaymentModal(false)
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          تأكيد الدفع
                        </button>
                        <button
                          onClick={() => {
                            updatePaymentStatus(selectedPayment.id, 'failed')
                            setShowPaymentModal(false)
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          رفض الدفع
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
