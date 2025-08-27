"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "@/lib/notification-utils";
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  related_type: string;
  related_id: string;
  is_read: boolean;
  created_at: string;
}

export default function TeacherNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await markNotificationAsRead(notificationId);
      if (result.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead(user?.id || '');
      if (result.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    const colors = {
      info: "bg-blue-50 border-blue-200",
      success: "bg-green-50 border-green-200",
      warning: "bg-yellow-50 border-yellow-200",
      error: "bg-red-50 border-red-200",
    };
    return colors[type as keyof typeof colors] || "bg-gray-50 border-gray-200";
  };

  const getRelatedTypeText = (type: string) => {
    const types = {
      course: "كورس",
      assignment: "واجب",
      exam: "امتحان",
      student: "طالب",
      payment: "دفع",
      system: "نظام",
    };
    return types[type as keyof typeof types] || type;
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.is_read;
    if (filter === "read") return notification.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
    <DashboardLayout userRole="teacher" userName={user?.user_metadata?.name || "المعلم"} userAvatar={user?.user_metadata?.avatar_url}>
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الإشعارات</h1>
          <p className="text-gray-600 dark:text-gray-400">إدارة الإشعارات والتنبيهات</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center px-4 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#49BBBD]/90 transition-colors"
          >
            <CheckIcon className="h-5 w-5 ml-2" />
            تحديد الكل كمقروء
          </button>
        )}
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
            جميع الإشعارات
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "unread"
                ? "bg-[#49BBBD] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            غير مقروءة ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "read"
                ? "bg-[#49BBBD] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            مقروءة
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${
              !notification.is_read ? "border-l-4 border-l-[#49BBBD]" : ""
            } ${getNotificationTypeColor(notification.notification_type)}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4 space-x-reverse">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationTypeIcon(notification.notification_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 space-x-reverse mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    {!notification.is_read && (
                      <span className="px-2 py-1 rounded text-xs bg-[#49BBBD] text-white">
                        جديد
                      </span>
                    )}
                    {notification.related_type && (
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                        {getRelatedTypeText(notification.related_type)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {notification.message}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4 ml-1" />
                    {new Date(notification.created_at).toLocaleDateString("ar-EG")} - {new Date(notification.created_at).toLocaleTimeString("ar-EG")}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                {!notification.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="p-2 text-gray-400 hover:text-[#49BBBD] transition-colors"
                    title="تحديد كمقروءة"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="حذف الإشعار"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <BellIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد إشعارات
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === "unread" 
              ? "جميع الإشعارات مقروءة" 
              : "ستظهر هنا الإشعارات الجديدة"
            }
          </p>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
