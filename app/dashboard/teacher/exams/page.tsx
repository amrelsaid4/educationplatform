"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  CalendarIcon,
  AcademicCapIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface Exam {
  id: string;
  title: string;
  description: string;
  exam_type: string;
  duration_minutes: number;
  max_score: number;
  start_date: string;
  end_date: string;
  is_published: boolean;
  course: {
    title: string;
  };
  _count: {
    attempts: number;
    questions: number;
  };
}

export default function TeacherExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExams();
    }
  }, [user]);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select(`
          *,
          course: courses(title),
          _count: exam_attempts(count),
          questions: exam_questions(count)
        `)
        .eq("teacher_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (examId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("exams")
        .update({ is_published: !currentStatus })
        .eq("id", examId);

      if (error) throw error;
      fetchExams();
    } catch (error) {
      console.error("Error updating exam:", error);
    }
  };

  const handleDelete = async (examId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الامتحان؟")) return;

    try {
      const { error } = await supabase
        .from("exams")
        .delete()
        .eq("id", examId);

      if (error) throw error;
      fetchExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
    }
  };

  const getExamTypeText = (type: string) => {
    const types = {
      quiz: "اختبار قصير",
      midterm: "امتحان منتصف الفصل",
      final: "امتحان نهائي",
      practice: "امتحان تدريبي",
    };
    return types[type as keyof typeof types] || type;
  };

  const getExamTypeColor = (type: string) => {
    const colors = {
      quiz: "bg-blue-100 text-blue-800",
      midterm: "bg-yellow-100 text-yellow-800",
      final: "bg-red-100 text-red-800",
      practice: "bg-green-100 text-green-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const startDate = new Date(exam.start_date);
    const endDate = new Date(exam.end_date);

    if (now < startDate) return { status: "upcoming", text: "قادم", color: "bg-blue-100 text-blue-800" };
    if (now >= startDate && now <= endDate) return { status: "active", text: "نشط", color: "bg-green-100 text-green-800" };
    return { status: "ended", text: "منتهي", color: "bg-gray-100 text-gray-800" };
  };

  const filteredExams = exams.filter((exam) => {
    if (filter === "all") return true;
    if (filter === "published") return exam.is_published;
    if (filter === "draft") return !exam.is_published;
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
    <DashboardLayout userRole="teacher" userName={user?.user_metadata?.name || "المعلم"} userAvatar={user?.user_metadata?.avatar_url}>
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الامتحانات</h1>
          <p className="text-gray-600 dark:text-gray-400">إنشاء وإدارة الامتحانات للطلاب</p>
        </div>
        <Link
          href="/dashboard/teacher/exams/create"
          className="inline-flex items-center px-4 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#49BBBD]/90 transition-colors"
        >
          <PlusIcon className="h-5 w-5 ml-2" />
          إضافة امتحان جديد
        </Link>
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
            جميع الامتحانات
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "published"
                ? "bg-[#49BBBD] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            منشورة
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === "draft"
                ? "bg-[#49BBBD] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            مسودات
          </button>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredExams.map((exam) => {
          const examStatus = getExamStatus(exam);
          return (
            <div
              key={exam.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {exam.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {exam.description}
                  </p>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  <span className={`px-2 py-1 text-xs rounded ${examStatus.color}`}>
                    {examStatus.text}
                  </span>
                  <button
                    onClick={() => handlePublishToggle(exam.id, exam.is_published)}
                    className={`px-2 py-1 text-xs rounded ${
                      exam.is_published
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {exam.is_published ? "منشور" : "مسودة"}
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <AcademicCapIcon className="h-4 w-4 ml-2" />
                  {exam.course.title}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span className={`px-2 py-1 rounded text-xs ${getExamTypeColor(exam.exam_type)}`}>
                    {getExamTypeText(exam.exam_type)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4 ml-2" />
                  من: {new Date(exam.start_date).toLocaleDateString("ar-EG")}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4 ml-2" />
                  إلى: {new Date(exam.end_date).toLocaleDateString("ar-EG")}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <ClockIcon className="h-4 w-4 ml-2" />
                  المدة: {exam.duration_minutes} دقيقة
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <span>الدرجة القصوى: {exam.max_score}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-4 space-x-reverse text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 ml-1" />
                    {exam._count.attempts} محاولة
                  </div>
                  <div>{exam._count.questions} سؤال</div>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  <Link
                    href={`/dashboard/teacher/exams/${exam.id}`}
                    className="p-2 text-gray-400 hover:text-[#49BBBD] transition-colors"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/dashboard/teacher/exams/${exam.id}/edit`}
                    className="p-2 text-gray-400 hover:text-[#49BBBD] transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(exam.id)}
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

      {filteredExams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <AcademicCapIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد امتحانات
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            ابدأ بإنشاء امتحان جديد للطلاب
          </p>
          <Link
            href="/dashboard/teacher/exams/create"
            className="inline-flex items-center px-4 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#49BBBD]/90 transition-colors"
          >
            <PlusIcon className="h-5 w-5 ml-2" />
            إضافة امتحان جديد
          </Link>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
