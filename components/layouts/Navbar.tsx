"use client";

import React from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "../providers/ThemeProvider";

export default function Navbar() {
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary-500 transition-colors duration-300">
      {/* Curved bottom edge */}
      <div className="relative">
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white dark:bg-dark-900 rounded-t-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary-500 font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-white">
                TOTC
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/"
                className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                الرئيسية
              </Link>
              <Link
                href="/courses"
                className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                الدورات
              </Link>
              <Link
                href="/features"
                className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                الميزات
              </Link>
              <Link
                href="/about"
                className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                عنّا
              </Link>
              <Link
                href="/contact"
                className="text-white hover:text-gray-200 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                اتصل بنا
              </Link>
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-white hover:text-gray-200 hover:bg-white/20 transition-colors duration-200"
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            <Link
              href="/auth/login"
              className="px-6 py-2.5 rounded-full border-2 border-white text-white hover:bg-white hover:text-primary-500 px-3 py-2 text-sm font-medium transition-all duration-300"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2.5 rounded-full text-primary-500 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              اشتراك
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-white hover:text-gray-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {navbarOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden ${navbarOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary-600 border-t border-primary-400">
          <Link
            href="/"
            className="text-white hover:text-gray-200 block px-3 py-2 text-base font-medium transition-colors duration-200"
            onClick={() => setNavbarOpen(false)}
          >
            الرئيسية
          </Link>
          <Link
            href="/courses"
            className="text-white hover:text-gray-200 block px-3 py-2 text-base font-medium transition-colors duration-200"
            onClick={() => setNavbarOpen(false)}
          >
            الدورات
          </Link>
          <Link
            href="/features"
            className="text-white hover:text-gray-200 block px-3 py-2 text-base font-medium transition-colors duration-200"
            onClick={() => setNavbarOpen(false)}
          >
            الميزات
          </Link>
          <Link
            href="/about"
            className="text-white hover:text-gray-200 block px-3 py-2 text-base font-medium transition-colors duration-200"
            onClick={() => setNavbarOpen(false)}
          >
            عنّا
          </Link>
          <Link
            href="/contact"
            className="text-white hover:text-gray-200 block px-3 py-2 text-base font-medium transition-colors duration-200"
            onClick={() => setNavbarOpen(false)}
          >
            اتصل بنا
          </Link>
          <div className="pt-4 pb-3 border-t border-primary-400">
            <Link
              href="/auth/login"
              className="text-white hover:text-gray-200 block px-3 py-2 text-base font-medium transition-colors duration-200"
              onClick={() => setNavbarOpen(false)}
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/auth/register"
              className="text-primary-500 bg-white block px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-100 transition-all duration-200 mt-2"
              onClick={() => setNavbarOpen(false)}
            >
              اشتراك
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
