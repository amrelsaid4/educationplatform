'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getPublishedCourses, getStudentEnrollments, enrollInCourse } from '../../../../lib/course-utils'
import { supabase } from '../../../../lib/supabase'
import { getCurrentUser } from '../../../../lib/auth-utils'
import DashboardLayout from '../../../../components/layouts/DashboardLayout'

export default function StudentCoursesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])
  const [enrolled, setEnrolled] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      const { user: profile } = await getCurrentUser(user.id)
      setUser(profile)

      const [{ data: published }, { data: enrollments }] = await Promise.all([
        getPublishedCourses(),
        getStudentEnrollments(user.id)
      ])
      setCourses(published || [])
      setEnrolled((enrollments || []).map((e: any) => e.course_id))
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(courseId)
      const { error } = await enrollInCourse(courseId, user.id)
      if (error) {
        alert('فشل التسجيل في الكورس')
        return
      }
      setEnrolled(prev => [...prev, courseId])
      alert('تم التسجيل بنجاح')
    } finally {
      setEnrolling(null)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="student" userName={user?.name || ''} userAvatar={user?.avatar_url}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">جاري التحميل...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="student" userName={user?.name || ''} userAvatar={user?.avatar_url}>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">الكورسات المتاحة</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{course.description}</p>
              <div className="mt-4 flex items-center justify-between">
                {enrolled.includes(course.id) ? (
                  <Link href={`/courses/${course.id}`} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700">
                    الذهاب للكورس
                  </Link>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolling === course.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {enrolling === course.id ? '...' : 'تسجيل'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}




