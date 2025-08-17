import Link from "next/link";
import { PlayIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-teal-900/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-900/50 dark:to-blue-900/10 -z-10" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-300/20 mb-8">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 dark:bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 dark:bg-blue-400"></span>
            </span>
            New: AI-powered course recommendations
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
            Transform Education with
            <span className="block bg-gradient-to-r from-blue-600 via-teal-600 to-orange-600 bg-clip-text text-transparent">
              EduPlatform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Empower teachers to create engaging courses, manage students effectively, 
            and build thriving educational communities. Join thousands of educators 
            revolutionizing online learning.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/auth/register"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl shadow-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
            >
              Start Teaching Today
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/demo"
              className="group inline-flex items-center px-6 py-4 text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <PlayIcon className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
              Watch Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">10K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Expert Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">1K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Available Courses</div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Trusted by leading educational institutions</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="h-8 w-auto text-gray-400 dark:text-gray-500">
                <svg viewBox="0 0 120 30" fill="currentColor">
                  <rect width="120" height="30" rx="4" fill="currentColor" opacity="0.1"/>
                  <text x="60" y="20" textAnchor="middle" fontSize="12" fill="currentColor">University A</text>
                </svg>
              </div>
              <div className="h-8 w-auto text-gray-400 dark:text-gray-500">
                <svg viewBox="0 0 120 30" fill="currentColor">
                  <rect width="120" height="30" rx="4" fill="currentColor" opacity="0.1"/>
                  <text x="60" y="20" textAnchor="middle" fontSize="12" fill="currentColor">College B</text>
                </svg>
              </div>
              <div className="h-8 w-auto text-gray-400 dark:text-gray-500">
                <svg viewBox="0 0 120 30" fill="currentColor">
                  <rect width="120" height="30" rx="4" fill="currentColor" opacity="0.1"/>
                  <text x="60" y="20" textAnchor="middle" fontSize="12" fill="currentColor">Institute C</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-300 dark:bg-blue-600/30 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-teal-300 dark:bg-teal-600/30 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-orange-300 dark:bg-orange-600/30 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </section>
  );
}
