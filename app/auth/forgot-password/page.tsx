"use client";

import { useState } from "react";
import Link from "next/link";
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim()) {
      setError("البريد الإلكتروني مطلوب");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setIsEmailSent(true);
    }, 1500);
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#49BBBD]/10 via-white to-[#136CB5]/10 dark:from-[#000000] dark:via-[#136CB5]/20 dark:to-[#49BBBD]/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-[#49BBBD] to-[#136CB5] mb-8 animate-bounce">
              <CheckCircleIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[#000000] dark:text-white mb-4 bg-gradient-to-r from-[#49BBBD] to-[#136CB5] bg-clip-text text-transparent">
              تم إرسال الرابط بنجاح
            </h2>
            <p className="text-[#136CB5] dark:text-gray-300 mb-6 text-lg">
              تحقق من بريدك الإلكتروني
            </p>
            <div className="bg-[#49BBBD]/10 dark:bg-[#49BBBD]/20 p-4 rounded-xl border border-[#49BBBD]/30 dark:border-[#49BBBD]/50 mb-8">
              <p className="text-[#136CB5] dark:text-[#49BBBD] font-medium">{email}</p>
            </div>
            <p className="text-sm text-[#136CB5]/70 dark:text-gray-400 mb-8 leading-relaxed">
              لم تتلق البريد الإلكتروني؟ تحقق من مجلد الرسائل المرفوضة أو{" "}
              <button
                onClick={() => setIsEmailSent(false)}
                className="text-[#49BBBD] hover:text-[#136CB5] dark:text-[#49BBBD] dark:hover:text-[#136CB5] font-semibold transition-colors underline decoration-2 underline-offset-2"
              >
                حاول مرة أخرى
              </button>
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-[#49BBBD] bg-[#49BBBD]/10 dark:bg-[#49BBBD]/20 hover:bg-[#49BBBD]/20 dark:hover:bg-[#49BBBD]/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#49BBBD] transition-all duration-200 transform hover:scale-105"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#49BBBD]/10 via-white to-[#136CB5]/10 dark:from-[#000000] dark:via-[#136CB5]/20 dark:to-[#49BBBD]/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center animate-fade-in">
          <div className="mx-auto h-16 w-auto flex justify-center mb-8">
            <Link href="/" className="text-4xl font-bold bg-gradient-to-r from-[#49BBBD] via-[#136CB5] to-[#49BBBD] bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
              EduPlatform
            </Link>
          </div>
          <h2 className="text-4xl font-bold text-[#000000] dark:text-white mb-4">
            نسيت كلمة المرور؟
          </h2>
          <p className="text-lg text-[#136CB5] dark:text-gray-300 leading-relaxed">
            أدخل عنوان بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور.
          </p>
        </div>
        
        <div className="bg-white/90 dark:bg-[#000000]/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-[#49BBBD]/20 dark:border-[#49BBBD]/30 animate-slide-up">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#000000] dark:text-gray-300 mb-3">
                البريد الإلكتروني
              </label>
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none relative block w-full px-5 py-4 pl-14 border-2 ${
                    error 
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20" 
                      : "border-[#49BBBD]/30 dark:border-[#49BBBD]/50 focus:ring-[#49BBBD]/20 focus:border-[#49BBBD] bg-white/80 dark:bg-[#000000]/80 group-hover:border-[#49BBBD]/50 dark:group-hover:border-[#49BBBD]/70"
                  } placeholder-[#136CB5]/60 dark:placeholder-gray-400 text-[#000000] dark:text-white rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 text-lg`}
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-6 w-6 text-[#136CB5]/60 dark:text-[#49BBBD]/60 group-hover:text-[#49BBBD] dark:group-hover:text-[#49BBBD] transition-colors duration-200" />
                </div>
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {error}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-[#49BBBD] to-[#136CB5] hover:from-[#49BBBD]/90 hover:to-[#136CB5]/90 focus:outline-none focus:ring-4 focus:ring-[#49BBBD]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    جاري الإرسال...
                  </div>
                ) : (
                  <>
                    <EnvelopeIcon className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                    إرسال رابط الإعادة
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center font-semibold text-[#49BBBD] hover:text-[#136CB5] dark:text-[#49BBBD] dark:hover:text-[#136CB5] transition-all duration-200 hover:scale-105"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                العودة لتسجيل الدخول
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
