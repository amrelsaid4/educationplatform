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
} from "@heroicons/react/24/outline";

interface Assignment {
  id: string;
  title: string;
  description: string;
  assignment_type: string;
  max_score: number;
  due_date: string;
  is_published: boolean;
  course: {
    title: string;
  };
  _count: {
    submissions: number;
  };
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select(`
          *,
          course: courses(title),
          _count: assignment_submissions(count)
        `)
        .eq("teacher_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (assignmentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("assignments")
        .update({ is_published: !currentStatus })
        .eq("id", assignmentId);

      if (error) throw error;
      fetchAssignments();
    } catch (error) {
      console.error("Error updating assignment:", error);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الواجب؟")) return;

    try {
      const { error } = await supabase
        .from("assignments")
        .delete()
        .eq("id", assignmentId);

      if (error) throw error;
      fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
    }
  };

  const getAssignmentTypeText = (type: string) => {
    const types = {
      homework: "واجب منزلي",
      project: "مشروع",
      quiz: "اختبار قصير",
      exam: "امتحان",
    };
    return types[type as keyof typeof types] || type;
  };

  const getAssignmentTypeColor = (type: string) => {
    const colors = {
      homework: "bg-blue-100 text-blue-800",
      project: "bg-green-100 text-green-800",
      quiz: "bg-yellow-100 text-yellow-800",
      exam: "bg-red-100 text-red-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "all") return true;
    if (filter === "published") return assignment.is_published;
    if (filter === "draft") return !assignment.is_published;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الواجبات</h1>
          <p className="text-gray-600 dark:text-gray-400">إنشاء وإدارة الواجبات للطلاب</p>
        </div>
        <Link
          href="/dashboard/teacher/assignments/create"
          className="inline-flex items-center px-4 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#49BBBD]/90 transition-colors"
        >
          <PlusIcon className="h-5 w-5 ml-2" />
          إضافة واجب جديد
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
            جميع الواجبات
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

      {/* Assignments Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {assignment.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {assignment.description}
                </p>
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => handlePublishToggle(assignment.id, assignment.is_published)}
                  className={`px-2 py-1 text-xs rounded ${
                    assignment.is_published
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {assignment.is_published ? "منشور" : "مسودة"}
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <AcademicCapIcon className="h-4 w-4 ml-2" />
                {assignment.course.title}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className={`px-2 py-1 rounded text-xs ${getAssignmentTypeColor(assignment.assignment_type)}`}>
                  {getAssignmentTypeText(assignment.assignment_type)}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="h-4 w-4 ml-2" />
                تاريخ الاستحقاق: {new Date(assignment.due_date).toLocaleDateString("ar-EG")}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <ClockIcon className="h-4 w-4 ml-2" />
                الدرجة القصوى: {assignment.max_score}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {assignment._count.submissions} تسليم
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <Link
                  href={`/dashboard/teacher/assignments/${assignment.id}`}
                  className="p-2 text-gray-400 hover:text-[#49BBBD] transition-colors"
                >
                  <EyeIcon className="h-4 w-4" />
                </Link>
                <Link
                  href={`/dashboard/teacher/assignments/${assignment.id}/edit`}
                  className="p-2 text-gray-400 hover:text-[#49BBBD] transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(assignment.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <AcademicCapIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            لا توجد واجبات
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            ابدأ بإنشاء واجب جديد للطلاب
          </p>
          <Link
            href="/dashboard/teacher/assignments/create"
            className="inline-flex items-center px-4 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#49BBBD]/90 transition-colors"
          >
            <PlusIcon className="h-5 w-5 ml-2" />
            إضافة واجب جديد
          </Link>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
