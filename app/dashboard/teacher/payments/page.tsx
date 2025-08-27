"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { createPaymentNotification } from "@/lib/notification-utils";
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  course: {
    title: string;
  };
  student: {
    name: string;
    email: string;
  };
}

interface PaymentStats {
  totalRevenue: number;
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  monthlyRevenue: number;
  monthlyGrowth: number;
}

export default function TeacherPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalPayments: 0,
    pendingPayments: 0,
    completedPayments: 0,
    monthlyRevenue: 0,
    monthlyGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPayments();
      fetchStats();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      // First get the teacher's courses
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id")
        .eq("teacher_id", user?.id);

      if (coursesError) throw coursesError;

      if (!courses || courses.length === 0) {
        setPayments([]);
        setLoading(false);
        return;
      }

      const courseIds = courses.map(course => course.id);

      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          course: courses(title),
          student: users!payments_user_id_fkey(name, email)
        `)
        .in("course_id", courseIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // First get the teacher's courses
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id")
        .eq("teacher_id", user?.id);

      if (coursesError) throw coursesError;

      if (!courses || courses.length === 0) {
        setStats({
          totalRevenue: 0,
          totalPayments: 0,
          pendingPayments: 0,
          completedPayments: 0,
          monthlyRevenue: 0,
          monthlyGrowth: 0,
        });
        return;
      }

      const courseIds = courses.map(course => course.id);

      // Get total revenue
      const { data: totalData, error: totalError } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "completed")
        .in("course_id", courseIds);

      if (totalError) throw totalError;

      const totalRevenue = totalData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Get monthly revenue
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const { data: monthlyData, error: monthlyError } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "completed")
        .in("course_id", courseIds)
        .gte("created_at", new Date(currentYear, currentMonth, 1).toISOString())
        .lt("created_at", new Date(currentYear, currentMonth + 1, 1).toISOString());

      if (monthlyError) throw monthlyError;

      const monthlyRevenue = monthlyData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Get payment counts
      const { data: countData, error: countError } = await supabase
        .from("payments")
        .select("status")
        .in("course_id", courseIds);

      if (countError) throw countError;

      const totalPayments = countData?.length || 0;
      const completedPayments = countData?.filter(p => p.status === "completed").length || 0;
      const pendingPayments = countData?.filter(p => p.status === "pending").length || 0;

      setStats({
        totalRevenue,
        totalPayments,
        pendingPayments,
        completedPayments,
        monthlyRevenue,
        monthlyGrowth: 0, // You can calculate this based on previous month
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const getPaymentStatusText = (status: string) => {
    const statuses = {
      pending: "في الانتظار",
      completed: "مكتمل",
      failed: "فشل",
      refunded: "مسترد",
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getPaymentMethodText = (method: string) => {
    const methods = {
      stripe: "Stripe",
      paymob: "Paymob",
      fawry: "Fawry",
    };
    return methods[method as keyof typeof methods] || method;
  };

  const filteredPayments = payments.filter((payment) => {
    if (filter === "all") return true;
    if (filter === "completed") return payment.status === "completed";
    if (filter === "pending") return payment.status === "pending";
    if (filter === "failed") return payment.status === "failed";
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={user?.name || "المعلم"} userAvatar={user?.avatar_url}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="teacher" userName={user?.name || "المعلم"} userAvatar={user?.avatar_url}>
      <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">لوحة المدفوعات</h1>
        <p className="text-gray-600 dark:text-gray-400">إدارة الإيرادات والمدفوعات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">إيرادات الشهر</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.monthlyRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المدفوعات</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalPayments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="mr-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">المدفوعات المكتملة</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completedPayments}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-4 space-x-reverse">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "all"
                ? "bg-[#49BBBD] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            جميع المدفوعات
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "completed"
                ? "bg-[#49BBBD] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            مكتملة
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "pending"
                ? "bg-[#49BBBD] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            في الانتظار
          </button>
          <button
            onClick={() => setFilter("failed")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "failed"
                ? "bg-[#49BBBD] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            فاشلة
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الطالب
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
                  طريقة الدفع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.student.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {payment.student.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {payment.course.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${payment.amount.toFixed(2)} {payment.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(payment.status)}`}>
                      {getPaymentStatusText(payment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {getPaymentMethodText(payment.payment_method)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(payment.created_at).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-[#49BBBD] hover:text-[#49BBBD]/80">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <CurrencyDollarIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد مدفوعات
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            ستظهر هنا المدفوعات عندما يبدأ الطلاب في التسجيل في دوراتك
          </p>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
