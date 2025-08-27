"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  AcademicCapIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface Assignment {
  id: string;
  title: string;
  description: string;
  assignment_type: string;
  max_score: number;
  due_date: string;
  instructions: string;
  is_published: boolean;
  created_at: string;
  course: {
    title: string;
  };
  lesson?: {
    title: string;
  };
}

interface Submission {
  id: string;
  submitted_at: string;
  score: number | null;
  feedback: string | null;
  student: {
    name: string;
    email: string;
  };
}

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && params.id) {
      fetchAssignment();
      fetchSubmissions();
    }
  }, [user, params.id]);

  const fetchAssignment = async () => {
    try {
      const { data, error } = await supabase
        .from("assignments")
        .select(`
          *,
          course: courses(title),
          lesson: lessons(title)
        `)
        .eq("id", params.id)
        .eq("teacher_id", user?.id)
        .single();

      if (error) throw error;
      setAssignment(data);
    } catch (error) {
      console.error("Error fetching assignment:", error);
      router.push("/dashboard/teacher/assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("assignment_submissions")
        .select(`
          *,
          student: users(name, email)
        `)
        .eq("assignment_id", params.id)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا الواجب؟")) return;

    try {
      const { error } = await supabase
        .from("assignments")
        .delete()
        .eq("id", params.id);

      if (error) throw error;
      router.push("/dashboard/teacher/assignments");
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

  if (loading) {
    return (
      <DashboardLayout userRole="teacher" userName={user?.name || "المعلم"} userAvatar={user?.avatar_url}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!assignment) {
    return (
      <DashboardLayout userRole="teacher" userName={user?.name || "المعلم"} userAvatar={user?.avatar_url}>
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              الواجب غير موجود
            </h2>
            <Link
              href="/dashboard/teacher/assignments"
              className="text-[#49BBBD] hover:underline"
            >
              العودة إلى الواجبات
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="teacher" userName={user?.name || "المعلم"} userAvatar={user?.avatar_url}>
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Link
            href="/dashboard/teacher/assignments"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {assignment.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              تفاصيل الواجب والطلاب المسجلين
            </p>
          </div>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <Link
            href={`/dashboard/teacher/assignments/${assignment.id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#49BBBD]/90 transition-colors"
          >
            <PencilIcon className="h-4 w-4 ml-2" />
            تعديل
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <TrashIcon className="h-4 w-4 ml-2" />
            حذف
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Assignment Details */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                تفاصيل الواجب
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm ${getAssignmentTypeColor(assignment.assignment_type)}`}>
                {getAssignmentTypeText(assignment.assignment_type)}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">الوصف</h3>
                <p className="text-gray-600 dark:text-gray-400">{assignment.description}</p>
              </div>

              {assignment.instructions && (
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">التعليمات</h3>
                  <p className="text-gray-600 dark:text-gray-400">{assignment.instructions}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <AcademicCapIcon className="h-4 w-4 ml-2" />
                  الكورس: {assignment.course.title}
                </div>
                {assignment.lesson && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <DocumentTextIcon className="h-4 w-4 ml-2" />
                    الدرس: {assignment.lesson.title}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4 ml-2" />
                  تاريخ الاستحقاق: {new Date(assignment.due_date).toLocaleDateString("ar-EG")}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <ClockIcon className="h-4 w-4 ml-2" />
                  الدرجة القصوى: {assignment.max_score}
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className={`px-2 py-1 rounded text-xs ${
                  assignment.is_published 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {assignment.is_published ? "منشور" : "مسودة"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              التسليمات ({submissions.length})
            </h2>

            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  لا توجد تسليمات بعد
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {submission.student.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {submission.student.email}
                        </p>
                      </div>
                      {submission.score !== null && (
                        <span className="text-sm font-medium text-[#49BBBD]">
                          {submission.score}/{assignment.max_score}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      تم التسليم: {new Date(submission.submitted_at).toLocaleDateString("ar-EG")}
                    </div>
                    {submission.feedback && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <strong>التعليق:</strong> {submission.feedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
