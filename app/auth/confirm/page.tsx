"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const email = searchParams.get('email');
        const token = searchParams.get('token');

        if (!email) {
          setStatus('error');
          setMessage('رابط التأكيد غير صحيح');
          return;
        }

        // If we have a token, verify it
        if (token) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email'
          });

          if (error) {
            console.error('Confirmation error:', error);
            setStatus('error');
            
            if (error.message?.includes('already confirmed')) {
              setMessage('البريد الإلكتروني مؤكد بالفعل');
            } else if (error.message?.includes('expired')) {
              setMessage('رابط التأكيد منتهي الصلاحية');
            } else {
              setMessage('فشل في تأكيد البريد الإلكتروني');
            }
            return;
          }
        }

        // Update user profile in users table
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('users')
            .update({ email_verified: true })
            .eq('id', user.id);
        }

        setStatus('success');
        setMessage('تم تأكيد البريد الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);

      } catch (error) {
        console.error('Confirmation error:', error);
        setStatus('error');
        setMessage('حدث خطأ أثناء تأكيد البريد الإلكتروني');
      }
    };

    confirmEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#49BBBD]/10 via-white to-[#136CB5]/10 dark:from-[#000000] dark:via-[#136CB5]/20 dark:to-[#49BBBD]/20">
      <div className="flex w-full">
        {/* Left Side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/60 via-[#000000]/40 to-transparent"></div>
          <div className="relative z-20 flex items-center justify-center h-full">
            <div className="text-center text-white p-12 max-w-lg">
              <div className="mb-8">
                <div className="w-20 h-20 bg-[#49BBBD]/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-6xl font-black mb-6 leading-tight text-white drop-shadow-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                تأكيد البريد الإلكتروني
              </h1>
              <p className="text-2xl font-bold opacity-100 leading-relaxed text-[#E0F2FE] drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                خطوة واحدة للانضمام لمنصتنا
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Content */}
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
            </div>
            
            <div className="bg-white/90 dark:bg-[#000000]/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl border border-[#49BBBD]/20 dark:border-[#49BBBD]/30">
              {status === 'loading' && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#49BBBD] mx-auto mb-6"></div>
                  <h2 className="text-2xl font-bold text-[#000000] dark:text-white mb-4">
                    جاري تأكيد البريد الإلكتروني...
                  </h2>
                  <p className="text-lg text-[#136CB5] dark:text-gray-300">
                    يرجى الانتظار قليلاً
                  </p>
                </div>
              )}

              {status === 'success' && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#000000] dark:text-white mb-4">
                    تم التأكيد بنجاح!
                  </h2>
                  <p className="text-lg text-[#136CB5] dark:text-gray-300 mb-8">
                    {message}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    سيتم تحويلك لصفحة تسجيل الدخول تلقائياً...
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#000000] dark:text-white mb-4">
                    فشل في التأكيد
                  </h2>
                  <p className="text-lg text-[#136CB5] dark:text-gray-300 mb-8">
                    {message}
                  </p>
                  <div className="space-y-4">
                    <Link
                      href="/auth/login"
                      className="block w-full py-3 px-6 bg-gradient-to-r from-[#49BBBD] to-[#136CB5] text-white font-semibold rounded-xl hover:from-[#136CB5] hover:to-[#49BBBD] transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                    >
                      الذهاب لصفحة تسجيل الدخول
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block w-full py-3 px-6 border-2 border-[#49BBBD] text-[#49BBBD] font-semibold rounded-xl hover:bg-[#49BBBD] hover:text-white transition-all duration-300"
                    >
                      إنشاء حساب جديد
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
