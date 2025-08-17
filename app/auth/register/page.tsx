"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { registerUser } from "@/lib/simple-auth";
import Image from "next/image";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student" as "student" | "teacher",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError("يجب الموافقة على الشروط والأحكام");
      setIsLoading(false);
      return;
    }

    try {
      // Create user account
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (!result.success) {
        setError(result.error?.message || "فشل في إنشاء الحساب");
        setIsLoading(false);
        return;
      }

      if (result.user) {
        // Redirect based on role
        switch (result.user.role) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
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
            src="/assets/images/sign-up.jpeg"
            alt="Sign Up"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">انضم إلينا اليوم</h1>
              <p className="text-xl opacity-95 leading-relaxed">ابدأ رحلة التعلم مع منصتنا المتطورة</p>
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
                إنشاء حساب جديد
              </h2>
              <p className="text-lg text-[#136CB5] dark:text-gray-300">
                أو{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-[#49BBBD] hover:text-[#136CB5] dark:text-[#49BBBD] dark:hover:text-[#136CB5] transition-colors underline decoration-2 underline-offset-4"
                >
                  تسجيل الدخول إلى حسابك
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
                  <label htmlFor="name" className="block text-sm font-semibold text-[#000000] dark:text-gray-300">
                    الاسم الكامل
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-5 py-4 border-2 border-[#49BBBD]/30 dark:border-[#49BBBD]/50 placeholder-[#136CB5]/60 dark:placeholder-gray-400 text-[#000000] dark:text-white bg-white/80 dark:bg-[#000000]/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#49BBBD]/20 focus:border-[#49BBBD] transition-all duration-300 text-base shadow-sm hover:shadow-md"
                    placeholder="أدخل اسمك الكامل"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-[#000000] dark:text-gray-300">
                    البريد الإلكتروني
                  </label>
                  <input
                    id="email"
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
                  <label htmlFor="phone" className="block text-sm font-semibold text-[#000000] dark:text-gray-300">
                    رقم الهاتف
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    className="w-full px-5 py-4 border-2 border-[#49BBBD]/30 dark:border-[#49BBBD]/50 placeholder-[#136CB5]/60 dark:placeholder-gray-400 text-[#000000] dark:text-white bg-white/80 dark:bg-[#000000]/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#49BBBD]/20 focus:border-[#49BBBD] transition-all duration-300 text-base shadow-sm hover:shadow-md"
                    placeholder="أدخل رقم هاتفك"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="block text-sm font-semibold text-[#000000] dark:text-gray-300">
                    نوع الحساب
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    className="w-full px-5 py-4 border-2 border-[#49BBBD]/30 dark:border-[#49BBBD]/50 text-[#000000] dark:text-white bg-white/80 dark:bg-[#000000]/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#49BBBD]/20 focus:border-[#49BBBD] transition-all duration-300 text-base shadow-sm hover:shadow-md"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="student">طالب</option>
                    <option value="teacher">معلم</option>
                  </select>
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
                      autoComplete="new-password"
                      required
                      className="w-full px-5 py-4 pr-14 border-2 border-[#49BBBD]/30 dark:border-[#49BBBD]/50 placeholder-[#136CB5]/60 dark:placeholder-gray-400 text-[#000000] dark:text-white bg-white/80 dark:bg-[#000000]/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#49BBBD]/20 focus:border-[#49BBBD] transition-all duration-300 text-base shadow-sm hover:shadow-md"
                      placeholder="أنشئ كلمة مرور"
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

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#000000] dark:text-gray-300">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="w-full px-5 py-4 pr-14 border-2 border-[#49BBBD]/30 dark:border-[#49BBBD]/50 placeholder-[#136CB5]/60 dark:placeholder-gray-400 text-[#000000] dark:text-white bg-white/80 dark:bg-[#000000]/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#49BBBD]/20 focus:border-[#49BBBD] transition-all duration-300 text-base shadow-sm hover:shadow-md"
                      placeholder="أكد كلمة المرور"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-6 w-6 text-[#136CB5] dark:text-gray-500 hover:text-[#49BBBD] dark:hover:text-[#49BBBD] transition-colors" />
                      ) : (
                        <EyeIcon className="h-6 w-6 text-[#136CB5] dark:text-gray-500 hover:text-[#49BBBD] dark:hover:text-[#49BBBD] transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    className="h-5 w-5 text-[#49BBBD] focus:ring-[#49BBBD] border-2 border-[#49BBBD]/50 dark:border-[#49BBBD]/70 rounded-lg bg-white dark:bg-[#000000] transition-colors"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                  />
                  <label htmlFor="agreeToTerms" className="ml-3 block text-sm font-medium text-[#000000] dark:text-gray-300">
                    أوافق على{" "}
                    <Link href="/terms" className="text-[#49BBBD] hover:text-[#136CB5] dark:text-[#49BBBD] dark:hover:text-[#136CB5]">
                      الشروط والأحكام
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-[#49BBBD] via-[#136CB5] to-[#49BBBD] hover:from-[#136CB5] hover:via-[#49BBBD] hover:to-[#136CB5] focus:outline-none focus:ring-4 focus:ring-[#49BBBD]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      إنشاء الحساب...
                    </div>
                  ) : (
                    "إنشاء الحساب"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
