"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface Course {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  title: string;
}

interface Assignment {
  title: string;
  description: string;
  assignment_type: string;
  max_score: number;
  due_date: string;
  instructions: string;
  is_published: boolean;
  course_id: string;
  lesson_id?: string;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignment, setAssignment] = useState<Assignment>({
    title: "",
    description: "",
    assignment_type: "homework",
    max_score: 100,
    due_date: "",
    instructions: "",
    is_published: false,
    course_id: "",
    lesson_id: "",
  });

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    if (assignment.course_id) {
      fetchLessons(assignment.course_id);
    } else {
      setLessons([]);
    }
  }, [assignment.course_id]);

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

  const fetchLessons = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title")
        .eq("course_id", courseId)
        .order("title");

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const assignmentData = {
        title: assignment.title,
        description: assignment.description,
        assignment_type: assignment.assignment_type,
        max_score: assignment.max_score,
        due_date: assignment.due_date,
        instructions: assignment.instructions,
        is_published: assignment.is_published,
        course_id: assignment.course_id,
        lesson_id: assignment.lesson_id || null,
        teacher_id: user?.id,
      };

      const { error } = await supabase
        .from("assignments")
        .insert([assignmentData]);

      if (error) throw error;

      router.push("/dashboard/teacher/assignments");
    } catch (error) {
      console.error("Error creating assignment:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Assignment, value: any) => {
    setAssignment(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout userRole="teacher" userName={user?.name || "المعلم"} userAvatar={user?.avatar_url}>
      <div className="p-6">
      <div className="flex items-center space-x-4 space-x-reverse mb-6">
        <Link
          href="/dashboard/teacher/assignments"
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            إنشاء واجب جديد
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            إنشاء واجب جديد للطلاب
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            عنوان الواجب *
          </label>
          <input
            type="text"
            required
            value={assignment.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="أدخل عنوان الواجب"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            وصف الواجب *
          </label>
          <textarea
            required
            rows={4}
            value={assignment.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="أدخل وصف الواجب"
          />
        </div>

        {/* Course Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            الكورس *
          </label>
          <div className="relative">
            <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              required
              value={assignment.course_id}
              onChange={(e) => handleInputChange("course_id", e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">اختر الكورس</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lesson Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            الدرس (اختياري)
          </label>
          <div className="relative">
            <DocumentTextIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={assignment.lesson_id || ""}
              onChange={(e) => handleInputChange("lesson_id", e.target.value || null)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">اختر الدرس (اختياري)</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            نوع الواجب *
          </label>
          <select
            required
            value={assignment.assignment_type}
            onChange={(e) => handleInputChange("assignment_type", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="homework">واجب منزلي</option>
            <option value="project">مشروع</option>
            <option value="quiz">اختبار قصير</option>
            <option value="exam">امتحان</option>
          </select>
        </div>

        {/* Max Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            الدرجة القصوى *
          </label>
          <div className="relative">
            <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="number"
              required
              min="1"
              value={assignment.max_score}
              onChange={(e) => handleInputChange("max_score", parseInt(e.target.value))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="100"
            />
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            تاريخ الاستحقاق *
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              required
              value={assignment.due_date}
              onChange={(e) => handleInputChange("due_date", e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            التعليمات (اختياري)
          </label>
          <textarea
            rows={3}
            value={assignment.instructions}
            onChange={(e) => handleInputChange("instructions", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="أدخل التعليمات للطلاب"
          />
        </div>

        {/* Publish Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_published"
            checked={assignment.is_published}
            onChange={(e) => handleInputChange("is_published", e.target.checked)}
            className="h-4 w-4 text-[#49BBBD] focus:ring-[#49BBBD] border-gray-300 rounded"
          />
          <label htmlFor="is_published" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
            نشر الواجب للطلاب
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4 space-x-reverse">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#49BBBD] text-white py-2 px-4 rounded-lg hover:bg-[#49BBBD]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "جاري الحفظ..." : "إنشاء الواجب"}
          </button>
          <Link
            href="/dashboard/teacher/assignments"
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-center"
          >
            إلغاء
          </Link>
        </div>
      </form>
      </div>
    </DashboardLayout>
  );
}
