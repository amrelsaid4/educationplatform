"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  ArrowLeftIcon,
  UserIcon,
  AcademicCapIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
}

interface Message {
  subject: string;
  content: string;
  message_type: string;
  recipient_id: string;
  course_id?: string;
}

export default function ComposeMessagePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState<Message>({
    subject: "",
    content: "",
    message_type: "direct",
    recipient_id: "",
    course_id: "",
  });

  useEffect(() => {
    if (user) {
      fetchStudents();
      fetchCourses();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      // First get the teacher's courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id")
        .eq("teacher_id", user?.id);

      if (coursesError) throw coursesError;

      if (!coursesData || coursesData.length === 0) {
        setStudents([]);
        return;
      }

      const courseIds = coursesData.map(course => course.id);

      // Then get students enrolled in these courses
      const { data, error } = await supabase
        .from("course_enrollments")
        .select(`
          student: users(id, name, email)
        `)
        .in("course_id", courseIds);

      if (error) throw error;

      // Remove duplicates and format
      const uniqueStudents = data?.reduce((acc: Student[], enrollment) => {
        const student = enrollment.student;
        if (student && !acc.find(s => s.id === student.id)) {
          acc.push(student);
        }
        return acc;
      }, []) || [];

      console.log('Found students:', uniqueStudents);
      setStudents(uniqueStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("teacher_id", user?.id)
        .order("title");

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const messageData = {
        subject: message.subject,
        content: message.content,
        message_type: message.message_type,
        sender_id: user?.id,
        recipient_id: message.recipient_id,
        course_id: message.course_id || null,
      };

      const { error } = await supabase
        .from("messages")
        .insert([messageData]);

      if (error) throw error;

      router.push("/dashboard/teacher/messages");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (field: keyof Message, value: any) => {
    setMessage(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout userRole="teacher" userName={user?.name || "المعلم"} userAvatar={user?.avatar_url}>
      <div className="p-6">
      <div className="flex items-center space-x-4 space-x-reverse mb-6">
        <Link
          href="/dashboard/teacher/messages"
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            إنشاء رسالة جديدة
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            إرسال رسالة إلى الطلاب
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Message Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            نوع الرسالة *
          </label>
          <select
            required
            value={message.message_type}
            onChange={(e) => handleInputChange("message_type", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="direct">رسالة مباشرة</option>
            <option value="announcement">إعلان</option>
            <option value="assignment">رسالة واجب</option>
            <option value="exam">رسالة امتحان</option>
          </select>
        </div>

        {/* Recipient */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            المستلم *
          </label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              required
              value={message.recipient_id}
              onChange={(e) => handleInputChange("recipient_id", e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">اختر الطالب</option>
              {students.length === 0 ? (
                <option value="" disabled>لا يوجد طلاب مسجلين في كورساتك</option>
              ) : (
                students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))
              )}
            </select>
          </div>
          {students.length === 0 && (
            <div className="mt-2">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                لا يوجد طلاب مسجلين في كورساتك حالياً. يجب أن يسجل الطلاب في كورساتك أولاً.
              </p>
              <button
                type="button"
                onClick={fetchStudents}
                className="text-sm text-[#49BBBD] hover:text-[#49BBBD]/80 underline"
              >
                تحديث قائمة الطلاب
              </button>
            </div>
          )}
        </div>

        {/* Course (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            الكورس (اختياري)
          </label>
          <div className="relative">
            <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={message.course_id || ""}
              onChange={(e) => handleInputChange("course_id", e.target.value || null)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">اختر الكورس (اختياري)</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            العنوان *
          </label>
          <input
            type="text"
            required
            value={message.subject}
            onChange={(e) => handleInputChange("subject", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="أدخل عنوان الرسالة"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            محتوى الرسالة *
          </label>
          <textarea
            required
            rows={8}
            value={message.content}
            onChange={(e) => handleInputChange("content", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="أدخل محتوى الرسالة"
          />
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4 space-x-reverse">
          <button
            type="submit"
            disabled={sending}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#49BBBD]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-4 w-4 ml-2" />
            {sending ? "جاري الإرسال..." : "إرسال الرسالة"}
          </button>
          <Link
            href="/dashboard/teacher/messages"
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            إلغاء
          </Link>
        </div>
      </form>
      </div>
    </DashboardLayout>
  );
}
