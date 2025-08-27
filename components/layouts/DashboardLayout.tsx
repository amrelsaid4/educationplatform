"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { logoutUser } from "@/lib/simple-auth";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  CogIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: "admin" | "teacher" | "student";
  userName: string;
  userAvatar?: string;
}

const navigationItems = {
  student: [
    { name: "الرئيسية", href: "/dashboard/student", icon: HomeIcon },
    { name: "الكورسات المتاحة", href: "/courses", icon: BookOpenIcon },
    { name: "كورساتي", href: "/dashboard/student/courses", icon: BookOpenIcon },
    { name: "المهام", href: "/dashboard/student/assignments", icon: ClipboardDocumentCheckIcon },
    { name: "الامتحانات", href: "/dashboard/student/exams", icon: ClipboardDocumentCheckIcon },
    { name: "بنك الأسئلة", href: "/dashboard/student/question-bank", icon: ClipboardDocumentCheckIcon },
    { name: "المجتمع", href: "/dashboard/student/community", icon: ChatBubbleLeftRightIcon },
    { name: "الملف الشخصي", href: "/dashboard/student/profile", icon: UserIcon },
  ],
  teacher: [
    { name: "الرئيسية", href: "/dashboard/teacher", icon: HomeIcon },
    { name: "كورساتي", href: "/dashboard/teacher/courses", icon: BookOpenIcon },
    { name: "إضافة كورس جديد", href: "/dashboard/teacher/courses/create", icon: BookOpenIcon },
    { name: "الواجبات", href: "/dashboard/teacher/assignments", icon: ClipboardDocumentCheckIcon },
    { name: "الامتحانات", href: "/dashboard/teacher/exams", icon: ClipboardDocumentCheckIcon },
    { name: "بنك الأسئلة", href: "/dashboard/teacher/questions-bank", icon: ClipboardDocumentCheckIcon },
    { name: "المهام", href: "/dashboard/teacher/tasks", icon: ClipboardDocumentCheckIcon },
    { name: "الطلاب", href: "/dashboard/teacher/students", icon: UserIcon },
    { name: "الرسائل", href: "/dashboard/teacher/messages", icon: ChatBubbleLeftRightIcon },
    { name: "الإشعارات", href: "/dashboard/teacher/notifications", icon: BellIcon },
    { name: "المدفوعات", href: "/dashboard/teacher/payments", icon: ChartBarIcon },
    { name: "التحليلات", href: "/dashboard/teacher/analytics", icon: ChartBarIcon },
  ],
  admin: [
    { name: "الرئيسية", href: "/dashboard/admin", icon: HomeIcon },
    { name: "المستخدمون", href: "/dashboard/admin/users", icon: UserIcon },
    { name: "الكورسات", href: "/dashboard/admin/courses", icon: BookOpenIcon },
    { name: "جميع الكورسات", href: "/courses", icon: BookOpenIcon },
    { name: "التحليلات", href: "/dashboard/admin/analytics", icon: ChartBarIcon },
    { name: "الإعدادات", href: "/dashboard/admin/settings", icon: CogIcon },
  ],
};

export default function DashboardLayout({
  children,
  userRole = "student",
  userName = "",
  userAvatar,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useAuth();

  const navigation = navigationItems[userRole] || [];

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white dark:bg-gray-800">
          <div className="absolute top-0 left-0 -ml-12 pt-2">
            <button
              type="button"
              className="mr-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-shrink-0 flex items-center px-4">
            <Link href="/" className="text-xl font-bold text-[#49BBBD]">
              منصة التعلم الرقمي
            </Link>
          </div>
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? "bg-[#49BBBD]/10 text-[#49BBBD] border-r-2 border-[#49BBBD]"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md transition-all duration-200`}
                >
                  <item.icon className="ml-4 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
              
              {/* Sign Out Button for Mobile */}
              <button
                onClick={handleSignOut}
                className="w-full text-right text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#ef4444] group flex items-center px-2 py-2 text-base font-medium rounded-md transition-all duration-200"
              >
                <svg className="ml-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                تسجيل الخروج
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:right-0">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/" className="text-xl font-bold text-[#49BBBD]">
              منصة التعلم الرقمي
            </Link>
          </div>
          
          {/* Search bar in sidebar */}
          <div className="px-4 mt-6">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#49BBBD] focus:border-[#49BBBD] bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                placeholder="البحث في الكورسات والمهام..."
                type="search"
              />
            </div>
          </div>
          
          <div className="mt-6 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? "bg-[#49BBBD]/10 text-[#49BBBD] border-r-2 border-[#49BBBD]"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200`}
                >
                  <item.icon className="ml-3 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pr-64 flex flex-col flex-1">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="px-4 border-l border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#49BBBD] lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex items-center space-x-4 space-x-reverse">
              {/* User info */}
              <div className="flex items-center space-x-3 space-x-reverse">
                <Image
                  className="h-8 w-8 rounded-full"
                  src={userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=49BBBD&color=ffffff`}
                  alt={userName || 'User'}
                  width={32}
                  height={32}
                />
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{userName || 'User'}</span>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#49BBBD]"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              {/* Notifications */}
              <NotificationsDropdown />
            </div>
          </div>
        </div>

        {/* User dropdown menu */}
        {userMenuOpen && (
          <div className="absolute top-16 left-4 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
            <Link
              href="/dashboard/profile"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setUserMenuOpen(false)}
            >
              الملف الشخصي
            </Link>
            <Link
              href="/dashboard/settings"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setUserMenuOpen(false)}
            >
              الإعدادات
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-right px-4 py-2 text-sm text-[#ef4444] hover:bg-[#ef4444]/10"
            >
              تسجيل الخروج
            </button>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
