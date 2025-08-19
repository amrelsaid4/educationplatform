"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { logoutUser } from "@/lib/simple-auth";
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
    { name: "كورساتي", href: "/dashboard/student/courses", icon: BookOpenIcon },
    { name: "المهام", href: "/dashboard/student/assignments", icon: ClipboardDocumentCheckIcon },
    { name: "المجتمع", href: "/dashboard/student/community", icon: ChatBubbleLeftRightIcon },
    { name: "الملف الشخصي", href: "/dashboard/student/profile", icon: UserIcon },
  ],
  teacher: [
    { name: "الرئيسية", href: "/dashboard/teacher", icon: HomeIcon },
    { name: "كورساتي", href: "/dashboard/teacher/courses", icon: BookOpenIcon },
    { name: "المهام", href: "/dashboard/teacher/assignments", icon: ClipboardDocumentCheckIcon },
    { name: "الطلاب", href: "/dashboard/teacher/students", icon: UserIcon },
    { name: "التحليلات", href: "/dashboard/teacher/analytics", icon: ChartBarIcon },
  ],
  admin: [
    { name: "الرئيسية", href: "/dashboard/admin", icon: HomeIcon },
    { name: "المستخدمون", href: "/dashboard/admin/users", icon: UserIcon },
    { name: "الكورسات", href: "/dashboard/admin/courses", icon: BookOpenIcon },
    { name: "التحليلات", href: "/dashboard/admin/analytics", icon: ChartBarIcon },
    { name: "الإعدادات", href: "/dashboard/admin/settings", icon: CogIcon },
  ],
};

export default function DashboardLayout({
  children,
  userRole,
  userName,
  userAvatar,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useAuth();

  const navigation = navigationItems[userRole];

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
            <Link href="/" className="text-xl font-bold text-teal-600 dark:text-teal-400">
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
                      ? "bg-teal-100 dark:bg-teal-900 text-teal-900 dark:text-teal-100"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <item.icon className="ml-4 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
              
              {/* Sign Out Button for Mobile */}
              <button
                onClick={handleSignOut}
                className="w-full text-right text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 group flex items-center px-2 py-2 text-base font-medium rounded-md"
              >
                <svg className="ml-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
            <Link href="/" className="text-xl font-bold text-teal-600 dark:text-teal-400">
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
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                      ? "bg-teal-100 dark:bg-teal-900 text-teal-900 dark:text-teal-100"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
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
            className="px-4 border-l border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 lg:hidden"
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
                  src={userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=49BBBD&color=ffffff`}
                  alt={userName}
                  width={32}
                  height={32}
                />
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{userName}</span>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              {/* Notifications */}
              <button
                type="button"
                className="bg-white dark:bg-gray-800 p-2 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
              >
                <BellIcon className="h-5 w-5" />
              </button>

              {/* Profile dropdown */}
              {userMenuOpen && (
                <div className="origin-top-left absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                  <Link
                    href={`/dashboard/${userRole}/profile`}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    الملف الشخصي
                  </Link>
                  <Link
                    href={`/dashboard/${userRole}/settings`}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    الإعدادات
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleSignOut();
                    }}
                    className="block w-full text-right px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}
