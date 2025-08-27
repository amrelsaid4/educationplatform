"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { createExamNotification } from "@/lib/notification-utils";
import {
  ArrowLeftIcon,
  PlusIcon,
  AcademicCapIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface Course {
  id: string;
  title: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options?: string[];
  correct_answer: string;
  points: number;
  order_index: number;
}

interface Exam {
  title: string;
  description: string;
  course_id: string;
  duration_minutes: number;
  total_points: number;
  passing_score: number;
  start_date: string;
  end_date: string;
  attempts_allowed: number;
  show_results: boolean;
  randomize_questions: boolean;
  questions: Question[];
}

export default function CreateExamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [exam, setExam] = useState<Exam>({
    title: "",
    description: "",
    course_id: "",
    duration_minutes: 60,
    total_points: 100,
    passing_score: 60,
    start_date: "",
    end_date: "",
    attempts_allowed: 1,
    show_results: true,
    randomize_questions: false,
    questions: [],
  });

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

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

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      question_text: "",
      question_type: "multiple_choice",
      options: ["", "", "", ""],
      correct_answer: "",
      points: 1,
      order_index: exam.questions.length,
    };
    setExam(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...exam.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setExam(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = exam.questions.filter((_, i) => i !== index);
    setExam(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Create exam
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .insert([{
          title: exam.title,
          description: exam.description,
          course_id: exam.course_id,
          teacher_id: user?.id,
          duration_minutes: exam.duration_minutes,
          total_points: exam.total_points,
          passing_score: exam.passing_score,
          start_date: exam.start_date,
          end_date: exam.end_date,
          attempts_allowed: exam.attempts_allowed,
          show_results: exam.show_results,
          randomize_questions: exam.randomize_questions,
        }])
        .select()
        .single();

      if (examError) throw examError;

      // Create questions
      if (exam.questions.length > 0) {
        const questionsData = exam.questions.map((question, index) => ({
          exam_id: examData.id,
          question_text: question.question_text,
          question_type: question.question_type,
          options: question.options,
          correct_answer: question.correct_answer,
          points: question.points,
          order_index: index,
        }));

        const { error: questionsError } = await supabase
          .from("exam_questions")
          .insert(questionsData);

        if (questionsError) throw questionsError;
      }

      // Create notifications for enrolled students
      await createExamNotification(
        user?.id || '',
        exam.title,
        exam.course_id,
        examData.id
      );

      router.push("/dashboard/teacher/exams");
    } catch (error) {
      console.error("Error creating exam:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof Exam, value: any) => {
    setExam(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout userRole="teacher" userName={user?.name || "المعلم"} userAvatar={user?.avatar_url}>
      <div className="p-6">
        <div className="flex items-center space-x-4 space-x-reverse mb-6">
          <Link
            href="/dashboard/teacher/exams"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              إنشاء امتحان جديد
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إنشاء امتحان شامل مع الأسئلة
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
          {/* Exam Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              معلومات الامتحان الأساسية
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  عنوان الامتحان *
                </label>
                <input
                  type="text"
                  required
                  value={exam.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="أدخل عنوان الامتحان"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الكورس *
                </label>
                <div className="relative">
                  <AcademicCapIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    required
                    value={exam.course_id}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  مدة الامتحان (دقائق) *
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="1"
                    value={exam.duration_minutes}
                    onChange={(e) => handleInputChange("duration_minutes", parseInt(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  إجمالي النقاط *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={exam.total_points}
                  onChange={(e) => handleInputChange("total_points", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  درجة النجاح *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={exam.passing_score}
                  onChange={(e) => handleInputChange("passing_score", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  عدد المحاولات المسموحة *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={exam.attempts_allowed}
                  onChange={(e) => handleInputChange("attempts_allowed", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                وصف الامتحان
              </label>
              <textarea
                value={exam.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="أدخل وصف الامتحان"
              />
            </div>
          </div>

          {/* Exam Dates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              مواعيد الامتحان
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تاريخ البداية *
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    required
                    value={exam.start_date}
                    onChange={(e) => handleInputChange("start_date", e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  تاريخ النهاية *
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    required
                    value={exam.end_date}
                    onChange={(e) => handleInputChange("end_date", e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show_results"
                  checked={exam.show_results}
                  onChange={(e) => handleInputChange("show_results", e.target.checked)}
                  className="h-4 w-4 text-[#49BBBD] focus:ring-[#49BBBD] border-gray-300 rounded"
                />
                <label htmlFor="show_results" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                  إظهار النتائج للطلاب
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="randomize_questions"
                  checked={exam.randomize_questions}
                  onChange={(e) => handleInputChange("randomize_questions", e.target.checked)}
                  className="h-4 w-4 text-[#49BBBD] focus:ring-[#49BBBD] border-gray-300 rounded"
                />
                <label htmlFor="randomize_questions" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                  ترتيب الأسئلة عشوائياً
                </label>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                أسئلة الامتحان
              </h2>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center px-3 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#49BBBD]/90 transition-colors"
              >
                <PlusIcon className="h-4 w-4 ml-2" />
                إضافة سؤال
              </button>
            </div>

            {exam.questions.length === 0 ? (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  لا توجد أسئلة. ابدأ بإضافة سؤال جديد.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {exam.questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        السؤال {index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        حذف
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          نوع السؤال
                        </label>
                        <select
                          value={question.question_type}
                          onChange={(e) => updateQuestion(index, "question_type", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="multiple_choice">اختيار من متعدد</option>
                          <option value="true_false">صح وخطأ</option>
                          <option value="essay">مقال</option>
                          <option value="fill_blank">ملء الفراغ</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          النقاط
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) => updateQuestion(index, "points", parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        نص السؤال *
                      </label>
                      <textarea
                        required
                        value={question.question_text}
                        onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="أدخل نص السؤال"
                      />
                    </div>

                    {question.question_type === "multiple_choice" && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          الخيارات
                        </label>
                        <div className="space-y-2">
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2 space-x-reverse">
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={question.correct_answer === option}
                                onChange={() => updateQuestion(index, "correct_answer", option)}
                                className="h-4 w-4 text-[#49BBBD] focus:ring-[#49BBBD] border-gray-300"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(question.options || [])];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuestion(index, "options", newOptions);
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder={`الخيار ${optionIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.question_type === "true_false" && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          الإجابة الصحيحة
                        </label>
                        <div className="flex space-x-4 space-x-reverse">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`correct-${index}`}
                              value="true"
                              checked={question.correct_answer === "true"}
                              onChange={(e) => updateQuestion(index, "correct_answer", e.target.value)}
                              className="h-4 w-4 text-[#49BBBD] focus:ring-[#49BBBD] border-gray-300 ml-2"
                            />
                            صح
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`correct-${index}`}
                              value="false"
                              checked={question.correct_answer === "false"}
                              onChange={(e) => updateQuestion(index, "correct_answer", e.target.value)}
                              className="h-4 w-4 text-[#49BBBD] focus:ring-[#49BBBD] border-gray-300 ml-2"
                            />
                            خطأ
                          </label>
                        </div>
                      </div>
                    )}

                    {(question.question_type === "essay" || question.question_type === "fill_blank") && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          الإجابة النموذجية
                        </label>
                        <textarea
                          value={question.correct_answer}
                          onChange={(e) => updateQuestion(index, "correct_answer", e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="أدخل الإجابة النموذجية"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 space-x-reverse">
            <button
              type="submit"
              disabled={saving || exam.questions.length === 0}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#49BBBD]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "جاري الحفظ..." : "إنشاء الامتحان"}
            </button>
            <Link
              href="/dashboard/teacher/exams"
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
