"use client";

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'teacher' | 'student')[];
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['admin', 'teacher', 'student'],
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
      return;
    }

    if (!loading && user && !allowedRoles.includes(user.role)) {
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'teacher':
          router.push('/dashboard/teacher');
          break;
        case 'student':
          router.push('/dashboard/student');
          break;
        default:
          router.push('/dashboard/student');
      }
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
