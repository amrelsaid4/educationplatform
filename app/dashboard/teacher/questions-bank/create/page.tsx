"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  ArrowLeftIcon,
  PlusIcon,
  TagIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

interface Question {
  question_text: string;
  question_type: string;
  category: string;
  difficulty_level: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
  tags: string[];
  is_public: boolean;
}

export default function CreateQuestionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [question, setQuestion] = useState<Question>({
    question_text: "",
    question_type: "multiple_choice",
    category: "",
    difficulty_level: "medium",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
    tags: [],
    is_public: false,
  });

  const addTag = () => {
    if (newTag.trim() && !question.tags.includes(newTag.trim())) {
      setQuestion(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setQuestion(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const updateQuestion = (field: keyof Question, value: any) => {
    setQuestion(prev => ({ ...prev, [field]: value }));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    setQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const questionData = {
        teacher_id: user?.id,
        question_text: question.question_text,
        question_type: question.question_type,
        category: question.category,
        difficulty_level: question.difficulty_level,
        options: question.options,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        tags: question.tags,
        is_public: question.is_public,
      };

      const { error } = await supabase
        .from("question_bank")
        .insert([questionData]);

      if (error) throw error;

      router.push("/dashboard/teacher/questions-bank");
    } catch (error) {
      console.error("Error creating question:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout userRole="teacher" userName={user?.name || "المعلم"} userAvatar={user?.avatar_url}>
      <div className="p-6">
        <div className="flex items-center space-x-4 space-x-reverse mb-6">
          <Link
            href="/dashboard/teacher/questions-bank"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              إضافة سؤال جديد
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إنشاء سؤال جديد في بنك الأسئلة
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
          {/* Question Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              معلومات السؤال الأساسية
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نوع السؤال *
                </label>
                <select
                  required
                  value={question.question_type}
                  onChange={(e) => updateQuestion("question_type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="multiple_choice">اختيار من متعدد</option>
                  <option value="true_false">صح وخطأ</option>
                  <option value="short_answer">إجابة قصيرة</option>
                  <option value="essay">مقال</option>
                  <option value="matching">تطابق</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  مستوى الصعوبة *
                </label>
                <select
                  required
                  value={question.difficulty_level}
                  onChange={(e) => updateQuestion("difficulty_level", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="easy">سهل</option>
                  <option value="medium">متوسط</option>
                  <option value="hard">صعب</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الفئة
                </label>
                <input
                  type="text"
                  value={question.category}
                  onChange={(e) => updateQuestion("category", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="مثال: الرياضيات، العلوم، التاريخ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الكلمات المفتاحية
                </label>
                <div className="flex space-x-2 space-x-reverse">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="أدخل كلمة مفتاحية"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#49BBBD]/90 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
                {question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {question.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-[#49BBBD] text-white text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="mr-1 text-white hover:text-gray-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              محتوى السؤال
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نص السؤال *
              </label>
              <textarea
                required
                value={question.question_text}
                onChange={(e) => updateQuestion("question_text", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="أدخل نص السؤال"
              />
            </div>

            {question.question_type === "multiple_choice" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الخيارات *
                </label>
                <div className="space-y-3">
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="radio"
                        name="correct_answer"
                        value={option}
                        checked={question.correct_answer === option}
                        onChange={(e) => updateQuestion("correct_answer", e.target.value)}
                        className="h-4 w-4 text-[#49BBBD] focus:ring-[#49BBBD] border-gray-300"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={`الخيار ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {question.question_type === "true_false" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الإجابة الصحيحة *
                </label>
                <div className="flex space-x-4 space-x-reverse">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="correct_answer"
                      value="true"
                      checked={question.correct_answer === "true"}
                      onChange={(e) => updateQuestion("correct_answer", e.target.value)}
                      className="h-4 w-4 text-[#49BBBD] focus:ring-[#49BBBD] border-gray-300 ml-2"
                    />
                    صح
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="correct_answer"
                      value="false"
                      checked={question.correct_answer === "false"}
                      onChange={(e) => updateQuestion("correct_answer", e.target.value)}
                      className="h-4 w-4 text-[#49BBBD] focus:ring-[#49BBBD] border-gray-300 ml-2"
                    />
                    خطأ
                  </label>
                </div>
              </div>
            )}

            {(question.question_type === "short_answer" || question.question_type === "essay") && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الإجابة النموذجية *
                </label>
                <textarea
                  required
                  value={question.correct_answer}
                  onChange={(e) => updateQuestion("correct_answer", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="أدخل الإجابة النموذجية"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الشرح (اختياري)
              </label>
              <textarea
                value={question.explanation}
                onChange={(e) => updateQuestion("explanation", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="شرح الإجابة الصحيحة (اختياري)"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              الإعدادات
            </h2>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                checked={question.is_public}
                onChange={(e) => updateQuestion("is_public", e.target.checked)}
                className="h-4 w-4 text-[#49BBBD] focus:ring-[#49BBBD] border-gray-300 rounded"
              />
              <label htmlFor="is_public" className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                جعل السؤال عام (متاح للمعلمين الآخرين)
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 space-x-reverse">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-[#49BBBD] text-white rounded-lg hover:bg-[#49BBBD]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "جاري الحفظ..." : "إضافة السؤال"}
            </button>
            <Link
              href="/dashboard/teacher/questions-bank"
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

