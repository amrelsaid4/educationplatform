"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  PlusIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  TrashIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

interface Message {
  id: string;
  subject: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender: {
    name: string;
    email: string;
  };
  recipient: {
    name: string;
    email: string;
  };
  course?: {
    title: string;
  };
}

export default function TeacherMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender: users!messages_sender_id_fkey(name, email),
          recipient: users!messages_recipient_id_fkey(name, email),
          course: courses(title)
        `)
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", messageId);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;

    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const getMessageTypeText = (type: string) => {
    const types = {
      direct: "رسالة مباشرة",
      announcement: "إعلان",
      notification: "إشعار",
    };
    return types[type as keyof typeof types] || type;
  };

  const getMessageTypeColor = (type: string) => {
    const colors = {
      direct: "bg-blue-100 text-blue-800",
      announcement: "bg-yellow-100 text-yellow-800",
      notification: "bg-green-100 text-green-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const filteredMessages = messages.filter((message) => {
    if (filter === "all") return true;
    if (filter === "unread") return !message.is_read;
    if (filter === "sent") return message.sender?.id === user?.id;
    if (filter === "received") return message.recipient?.id === user?.id;
    return true;
  });

  const unreadCount = messages.filter(m => !m.is_read && m.recipient?.id === user?.id).length;

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الرسائل</h1>
          <p className="text-gray-600 dark:text-gray-400">إدارة الرسائل والإعلانات</p>
        </div>
        <div className="flex space-x-4 space-x-reverse">
          <Link
            href="/dashboard/teacher/messages/compose"
            className="inline-flex items-center px-4 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#49BBBD]/90 transition-colors"
          >
            <PlusIcon className="h-5 w-5 ml-2" />
            رسالة جديدة
          </Link>
          <Link
            href="/dashboard/teacher/messages/announcement"
            className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            <BellIcon className="h-5 w-5 ml-2" />
            إعلان جديد
          </Link>
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
            جميع الرسائل
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
            onClick={() => setFilter("sent")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "sent"
                ? "bg-[#49BBBD] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            مرسلة
          </button>
          <button
            onClick={() => setFilter("received")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "received"
                ? "bg-[#49BBBD] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            مستلمة
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.map((message) => {
          const isSentByMe = message.sender?.id === user?.id;
          const isUnread = !message.is_read && !isSentByMe;

          return (
            <div
              key={message.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${
                isUnread ? "border-l-4 border-l-[#49BBBD]" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 space-x-reverse mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${getMessageTypeColor(message.message_type)}`}>
                      {getMessageTypeText(message.message_type)}
                    </span>
                    {isUnread && (
                      <span className="px-2 py-1 rounded text-xs bg-[#49BBBD] text-white">
                        جديد
                      </span>
                    )}
                    {isSentByMe && (
                      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                        مرسلة
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {message.subject || "بدون عنوان"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {message.content}
                  </p>
                                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 ml-1" />
                        {isSentByMe ? `إلى: ${message.recipient?.name || 'غير محدد'}` : `من: ${message.sender?.name || 'غير محدد'}`}
                      </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 ml-1" />
                      {new Date(message.created_at).toLocaleDateString("ar-EG")}
                    </div>
                    {message.course && (
                      <div className="text-[#49BBBD]">
                        {message.course.title}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  {isUnread && (
                    <button
                      onClick={() => handleMarkAsRead(message.id)}
                      className="p-2 text-gray-400 hover:text-[#49BBBD] transition-colors"
                      title="تحديد كمقروءة"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  )}
                  <Link
                    href={`/dashboard/teacher/messages/chat/${message.sender?.id === user?.id ? message.recipient?.id : message.sender?.id}`}
                    className="p-2 text-gray-400 hover:text-[#49BBBD] transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد رسائل
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            ابدأ بإرسال رسالة جديدة أو إعلان
          </p>
          <div className="flex justify-center space-x-4 space-x-reverse">
            <Link
              href="/dashboard/teacher/messages/compose"
              className="inline-flex items-center px-4 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#49BBBD]/90 transition-colors"
            >
              <PlusIcon className="h-5 w-5 ml-2" />
              رسالة جديدة
            </Link>
            <Link
              href="/dashboard/teacher/messages/announcement"
              className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <BellIcon className="h-5 w-5 ml-2" />
              إعلان جديد
            </Link>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
