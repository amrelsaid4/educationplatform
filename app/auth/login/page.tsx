"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { loginUser } from "@/lib/simple-auth";
import Image from "next/image";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const result = await loginUser(formData.email, formData.password);

      if (!result.success) {
        setError(result.error?.message || "فشل في تسجيل الدخول");
        setIsLoading(false);
        return;
      }

      if (result.user) {
        // Redirect based on user role
        switch (result.user.role) {
          case 'admin':
            router.push("/dashboard/admin");
            break;
          case 'teacher':
            router.push("/dashboard/teacher");
            break;
          case 'student':
            router.push("/dashboard/student");
            break;
          default:
            router.push("/dashboard/student");
        }
      }
    } catch (error) {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleDemoLogin = (email: string, password: string) => {
    setFormData({ email, password, remember: false });
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#49BBBD]/10 via-white to-[#136CB5]/10 dark:from-[#000000] dark:via-[#136CB5]/20 dark:to-[#49BBBD]/20">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="flex w-full">
        {/* Left Side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <Image
            src="/assets/images/login.jpeg"
            alt="Login"
            fill
            className="object-cover scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/40 via-transparent to-transparent"></div>
          <div className="relative z-20 flex items-center justify-center h-full">
            <div className="text-center text-white p-12 max-w-lg">
              <div className="mb-8">
                <div className="w-20 h-20 bg-[#49BBBD]/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">مرحباً بعودتك</h1>
              <p className="text-xl opacity-95 leading-relaxed">استعد لرحلة التعلم المثيرة مع منصتنا المتطورة</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-md w-full">
            <div className="text-center mb-12">
              <div className="mb-8">
                <Link href="/" className="inline-block">
                  <div className="text-4xl font-bold bg-gradient-to-r from-[#49BBBD] via-[#136CB5] to-[#49BBBD] bg-clip-text text-transparent">
                    منصة التعلم الرقمي
                  </div>
                </Link>
              </div>
              <h2 className="text-4xl font-bold text-[#000000] dark:text-white mb-4">
                مرحباً بعودتك
              </h2>
              <p className="text-lg text-[#136CB5] dark:text-gray-300">
                أو{" "}
                <Link
                  href="/auth/register"
                  className="font-semibold text-[#49BBBD] hover:text-[#136CB5] dark:text-[#49BBBD] dark:hover:text-[#136CB5] transition-colors underline decoration-2 underline-offset-4"
                >
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
            
            <div className="bg-white/90 dark:bg-[#000000]/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-[#49BBBD]/20 dark:border-[#49BBBD]/30">
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                </div>
              )}
              
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="email-address" className="block text-sm font-semibold text-[#000000] dark:text-gray-300">
                    البريد الإلكتروني
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-5 py-4 border-2 border-[#49BBBD]/30 dark:border-[#49BBBD]/50 placeholder-[#136CB5]/60 dark:placeholder-gray-400 text-[#000000] dark:text-white bg-white/80 dark:bg-[#000000]/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#49BBBD]/20 focus:border-[#49BBBD] transition-all duration-300 text-base shadow-sm hover:shadow-md"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-[#000000] dark:text-gray-300">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="w-full px-5 py-4 pr-14 border-2 border-[#49BBBD]/30 dark:border-[#49BBBD]/50 placeholder-[#136CB5]/60 dark:placeholder-gray-400 text-[#000000] dark:text-white bg-white/80 dark:bg-[#000000]/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#49BBBD]/20 focus:border-[#49BBBD] transition-all duration-300 text-base shadow-sm hover:shadow-md"
                      placeholder="أدخل كلمة المرور"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-6 w-6 text-[#136CB5] dark:text-gray-500 hover:text-[#49BBBD] dark:hover:text-[#49BBBD] transition-colors" />
                      ) : (
                        <EyeIcon className="h-6 w-6 text-[#136CB5] dark:text-gray-500 hover:text-[#49BBBD] dark:hover:text-[#49BBBD] transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember"
                      type="checkbox"
                      className="h-5 w-5 text-[#49BBBD] focus:ring-[#49BBBD] border-2 border-[#49BBBD]/50 dark:border-[#49BBBD]/70 rounded-lg bg-white dark:bg-[#000000] transition-colors"
                      checked={formData.remember}
                      onChange={handleChange}
                    />
                    <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-[#000000] dark:text-gray-300">
                      تذكرني
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      href="/auth/forgot-password"
                      className="font-semibold text-[#49BBBD] hover:text-[#136CB5] dark:text-[#49BBBD] dark:hover:text-[#136CB5] transition-colors hover:underline"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-[#49BBBD] via-[#136CB5] to-[#49BBBD] hover:from-[#136CB5] hover:via-[#49BBBD] hover:to-[#136CB5] focus:outline-none focus:ring-4 focus:ring-[#49BBBD]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      تسجيل الدخول...
                    </div>
                  ) : (
                    "تسجيل الدخول"
                  )}
                </button>

                <div className="mt-10">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-[#49BBBD]/30 dark:border-[#49BBBD]/50" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white/90 dark:bg-[#000000]/90 text-[#136CB5] dark:text-gray-400 font-medium">حسابات تجريبية</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4">
                    <button
                      type="button"
                      onClick={() => handleDemoLogin("admin@edu.com", "admin123")}
                      className="w-full inline-flex justify-center py-3 px-4 border-2 border-[#49BBBD]/30 dark:border-[#49BBBD]/50 rounded-xl shadow-sm bg-white/80 dark:bg-[#000000]/80 text-sm font-semibold text-[#000000] dark:text-gray-300 hover:bg-[#49BBBD]/10 dark:hover:bg-[#49BBBD]/20 hover:border-[#49BBBD] dark:hover:border-[#49BBBD] transition-all duration-300 hover:shadow-md"
                    >
                      مدير النظام
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin("teacher@edu.com", "teacher123")}
                      className="w-full inline-flex justify-center py-3 px-4 border-2 border-[#49BBBD]/30 dark:border-[#49BBBD]/50 rounded-xl shadow-sm bg-white/80 dark:bg-[#000000]/80 text-sm font-semibold text-[#000000] dark:text-gray-300 hover:bg-[#49BBBD]/10 dark:hover:bg-[#49BBBD]/20 hover:border-[#49BBBD] dark:hover:border-[#49BBBD] transition-all duration-300 hover:shadow-md"
                    >
                      معلم
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin("student@edu.com", "student123")}
                      className="w-full inline-flex justify-center py-3 px-4 border-2 border-[#49BBBD]/30 dark:border-[#49BBBD]/50 rounded-xl shadow-sm bg-white/80 dark:bg-[#000000]/80 text-sm font-semibold text-[#000000] dark:text-gray-300 hover:bg-[#49BBBD]/10 dark:hover:bg-[#49BBBD]/20 hover:border-[#49BBBD] dark:hover:border-[#49BBBD] transition-all duration-300 hover:shadow-md"
                    >
                      طالب
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
