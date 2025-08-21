import { supabase } from './supabase'

export interface Course {
  id: string
  title: string
  description: string
  teacher_id: string
  thumbnail_url?: string
  price: number
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  language: string
  status: 'draft' | 'published' | 'archived'
  is_free: boolean
  duration_hours: number
  total_lessons: number
  enrollment_count: number
  rating: number
  created_at: string
  updated_at: string
  teacher?: {
    name: string
    avatar_url?: string
  }
}

export interface Lesson {
  id: string
  course_id: string
  unit_id?: string
  title: string
  description: string
  video_url?: string
  content: string
  duration_minutes: number
  order_index: number
  is_free: boolean
  resources_urls?: string[]
  created_at: string
  updated_at: string
}

export interface CourseUnit {
  id: string
  course_id: string
  title: string
  description: string
  order_index: number
  created_at: string
}

export interface CourseEnrollment {
  id: string
  course_id: string
  student_id: string
  enrolled_at: string
  progress: number
  completed_at?: string
  certificate_url?: string
}

export interface LessonProgress {
  id: string
  lesson_id: string
  student_id: string
  is_completed: boolean
  watch_time_seconds: number
  completed_at?: string
  created_at: string
}

// Get all published courses
export const getPublishedCourses = async () => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        teacher:users(name, avatar_url)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching courses:', error)
    return { data: null, error }
  }
}

// Get courses by teacher
export const getCoursesByTeacher = async (teacherId: string) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching teacher courses:', error)
    return { data: null, error }
  }
}

// Get course by ID
export async function getCourseById(courseId: string) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (error) {
      console.error('Error getting course:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error getting course:', error)
    return { data: null, error }
  }
}

// Get course lessons
export async function getCourseLessons(courseId: string) {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error getting course lessons:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error getting course lessons:', error)
    return { data: null, error }
  }
}

// Get single lesson with course details
export const getLessonById = async (lessonId: string) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        course:courses(
          id,
          title,
          lessons(
            id,
            title,
            order_index
          )
        )
      `)
      .eq('id', lessonId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return { data: null, error }
  }
}

// Get course units
export const getCourseUnits = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('course_units')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching units:', error)
    return { data: null, error }
  }
}

// Create new course
export const createCourse = async (courseData: {
  title: string
  description: string
  teacher_id: string
  price: number
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  is_free: boolean
  thumbnail_url?: string
}) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert({
        ...courseData,
        status: 'draft',
        language: 'ar',
        duration_hours: 0,
        total_lessons: 0,
        enrollment_count: 0,
        rating: 0
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating course:', error)
    return { data: null, error }
  }
}

// Update course
export async function updateCourse(courseId: string, updates: Partial<Course>) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single()

    if (error) {
      console.error('Error updating course:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error updating course:', error)
    return { data: null, error }
  }
}

// Create lesson
export const createLesson = async (lessonData: Partial<Lesson>) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .insert([lessonData])
      .select()
      .single()

    if (error) throw error

    // Update course statistics after creating lesson
    if (data?.course_id) {
      await updateCourseStats(data.course_id)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error creating lesson:', error)
    return { data: null, error }
  }
}

// Update lesson
export const updateLesson = async (lessonId: string, updates: Partial<Lesson>) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', lessonId)
      .select()
      .single()

    if (error) throw error

    // Update course statistics after updating lesson
    if (data?.course_id) {
      await updateCourseStats(data.course_id)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error updating lesson:', error)
    return { data: null, error }
  }
}

// Enroll student in course
export const enrollInCourse = async (courseId: string, studentId: string) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollments')
      .insert({
        course_id: courseId,
        student_id: studentId,
        progress: 0
      })
      .select()
      .single()

    if (error) throw error

    // Update course statistics after enrollment
    await updateCourseStats(courseId)

    return { data, error: null }
  } catch (error) {
    console.error('Error enrolling in course:', error)
    return { data: null, error }
  }
}

// Get student enrollments
export const getStudentEnrollments = async (studentId: string) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        course:courses(
          *,
          teacher:users(name, avatar_url)
        )
      `)
      .eq('student_id', studentId)
      .order('enrolled_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return { data: null, error }
  }
}

// Update lesson progress
export const updateLessonProgress = async (lessonId: string, studentId: string, progress: Partial<LessonProgress>) => {
  try {
    // Check if progress record exists
    const { data: existingProgress } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('student_id', studentId)
      .single()

    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from('lesson_progress')
        .update(progress)
        .eq('id', existingProgress.id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } else {
      // Create new progress record
      const { data, error } = await supabase
        .from('lesson_progress')
        .insert({
          lesson_id: lessonId,
          student_id: studentId,
          ...progress
        })
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    }
  } catch (error) {
    console.error('Error updating lesson progress:', error)
    return { data: null, error }
  }
}



// Delete lesson
export const deleteLesson = async (lessonId: string) => {
  try {
    // Get lesson info before deleting to know the course_id
    const { data: lessonData } = await supabase
      .from('lessons')
      .select('course_id')
      .eq('id', lessonId)
      .single()

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)

    if (error) throw error

    // Update course statistics after deleting lesson
    if (lessonData?.course_id) {
      await updateCourseStats(lessonData.course_id)
    }

    return { data: null, error: null }
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return { data: null, error }
  }
}

// Update course statistics
export async function updateCourseStats(courseId: string) {
  try {
    // Get current stats
    const { data: stats } = await getCourseStats(courseId)
    
    if (!stats) {
      return { data: null, error: new Error('Failed to get course stats') }
    }

    // Update course with new stats
    const { data, error } = await supabase
      .from('courses')
      .update({
        total_lessons: stats.total_lessons,
        total_duration: stats.total_duration
      })
      .eq('id', courseId)
      .select()
      .single()

    if (error) {
      console.error('Error updating course stats:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error updating course stats:', error)
    return { data: null, error }
  }
}

// Unenroll student from course
export const unenrollFromCourse = async (courseId: string, studentId: string) => {
  try {
    const { error } = await supabase
      .from('course_enrollments')
      .delete()
      .eq('course_id', courseId)
      .eq('student_id', studentId)

    if (error) throw error

    // Update course statistics after unenrollment
    await updateCourseStats(courseId)

    return { data: null, error: null }
  } catch (error) {
    console.error('Error unenrolling from course:', error)
    return { data: null, error }
  }
}

// Student progress tracking
export async function markLessonAsCompleted(userId: string, lessonId: string) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert({
      student_id: userId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
      is_completed: true
    })
    .select()

  if (error) {
    console.error('Error marking lesson as completed:', error)
    throw error
  }

  return data
}

export async function getLessonProgress(userId: string, lessonId: string) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('student_id', userId)
    .eq('lesson_id', lessonId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error getting lesson progress:', error)
    throw error
  }

  return data
}

export async function getCourseProgress(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select(`
      *,
      lessons!inner(course_id)
    `)
    .eq('student_id', userId)
    .eq('lessons.course_id', courseId)
    .eq('is_completed', true)

  if (error) {
    console.error('Error getting course progress:', error)
    throw error
  }

  return data
}

// Student notes functionality
export async function saveStudentNote(userId: string, lessonId: string, note: string) {
  const { data, error } = await supabase
    .from('student_notes')
    .upsert({
      student_id: userId,
      lesson_id: lessonId,
      note: note,
      updated_at: new Date().toISOString()
    })
    .select()

  if (error) {
    console.error('Error saving student note:', error)
    throw error
  }

  return data
}

export async function getStudentNote(userId: string, lessonId: string) {
  const { data, error } = await supabase
    .from('student_notes')
    .select('*')
    .eq('student_id', userId)
    .eq('lesson_id', lessonId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error getting student note:', error)
    throw error
  }

  return data
}

// Course completion percentage
export async function getCourseCompletionPercentage(userId: string, courseId: string) {
  // Get total lessons in course
  const { data: totalLessons, error: totalError } = await supabase
    .from('lessons')
    .select('id', { count: 'exact' })
    .eq('course_id', courseId)

  if (totalError) {
    console.error('Error getting total lessons:', totalError)
    throw totalError
  }

  // Get completed lessons
  const { data: completedLessons, error: completedError } = await supabase
    .from('lesson_progress')
    .select(`
      *,
      lessons!inner(course_id)
    `)
    .eq('student_id', userId)
    .eq('lessons.course_id', courseId)
    .eq('is_completed', true)

  if (completedError) {
    console.error('Error getting completed lessons:', completedError)
    throw completedError
  }

  const total = totalLessons?.length || 0
  const completed = completedLessons?.length || 0

  return total > 0 ? Math.round((completed / total) * 100) : 0
}

// Comments and discussions
export async function getLessonComments(lessonId: string) {
  const { data, error } = await supabase
    .from('lesson_comments')
    .select(`
      *,
      user_profiles!inner(name, avatar_url)
    `)
    .eq('lesson_id', lessonId)
    .is('parent_id', null) // Only top-level comments
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting lesson comments:', error)
    throw error
  }

  return data
}

export async function getCommentReplies(commentId: string) {
  const { data, error } = await supabase
    .from('lesson_comments')
    .select(`
      *,
      user_profiles!inner(name, avatar_url)
    `)
    .eq('parent_id', commentId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error getting comment replies:', error)
    throw error
  }

  return data
}

export async function addComment(lessonId: string, userId: string, content: string, parentId?: string) {
  const { data, error } = await supabase
    .from('lesson_comments')
    .insert({
      lesson_id: lessonId,
      student_id: userId,
      content: content,
      parent_id: parentId || null
    })
    .select(`
      *,
      user_profiles!inner(name, avatar_url)
    `)
    .single()

  if (error) {
    console.error('Error adding comment:', error)
    throw error
  }

  return data
}

export async function updateComment(commentId: string, content: string) {
  const { data, error } = await supabase
    .from('lesson_comments')
    .update({
      content: content,
      updated_at: new Date().toISOString()
    })
    .eq('id', commentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating comment:', error)
    throw error
  }

  return data
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from('lesson_comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}

// Course categories
export async function getCourseCategories() {
  const { data, error } = await supabase
    .from('course_categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error getting course categories:', error)
    throw error
  }

  return data
}

// Search courses
export async function searchCourses(query: string, categoryId?: string, level?: string) {
  let queryBuilder = supabase
    .from('courses')
    .select(`
      *,
      teacher:user_profiles!inner(name, avatar_url),
      category:course_categories(name, color),
      lessons(id)
    `)
    .ilike('title', `%${query}%`)

  if (categoryId) {
    queryBuilder = queryBuilder.eq('category_id', categoryId)
  }

  if (level) {
    queryBuilder = queryBuilder.eq('level', level)
  }

  const { data, error } = await queryBuilder.order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching courses:', error)
    throw error
  }

  return data
}

// Teacher analytics
export async function getTeacherAnalytics(teacherId: string, timeRange: 'week' | 'month' | 'year' = 'month') {
  try {
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, price, is_free, enrollment_count')
      .eq('teacher_id', teacherId)

    // Get enrollments in time range
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        course:courses(price, is_free, teacher_id)
      `)
      .eq('course.teacher_id', teacherId)
      .gte('enrolled_at', startDate.toISOString())

    // Calculate analytics
    const totalRevenue = courses?.reduce((sum, course) => {
      if (!course.is_free) {
        return sum + ((course.price || 0) * (course.enrollment_count || 0))
      }
      return sum
    }, 0) || 0

    const monthlyRevenue = enrollments?.reduce((sum, enrollment) => {
      const course = enrollment.course as any
      if (course && !course.is_free) {
        return sum + (course.price || 0)
      }
      return sum
    }, 0) || 0

    const totalStudents = courses?.reduce((sum, course) => sum + (course.enrollment_count || 0), 0) || 0

    // Get top performing course
    const topCourse = courses?.reduce((top, course) => {
      const revenue = course.is_free ? 0 : (course.price || 0) * (course.enrollment_count || 0)
      return revenue > (top.revenue || 0) ? { ...course, revenue } : top
    }, {} as any)

    const analytics = {
      totalRevenue,
      monthlyRevenue,
      totalStudents,
      activeStudents: totalStudents,
      totalCourses: courses?.length || 0,
      completedCourses: courses?.filter(c => c.enrollment_count > 0).length || 0,
      averageCompletionRate: 78, // Placeholder
      topPerformingCourse: {
        title: topCourse?.title || 'لا يوجد',
        revenue: topCourse?.revenue || 0,
        students: topCourse?.enrollment_count || 0
      },
      recentEnrollments: enrollments?.length || 0,
      revenueGrowth: 15.5, // Placeholder
      studentGrowth: 8.2 // Placeholder
    }

    return { data: analytics, error: null }
  } catch (error) {
    console.error('Error getting teacher analytics:', error)
    return { data: null, error }
  }
}

// Student achievements
export async function addStudentAchievement(userId: string, achievementType: string, achievementData?: any) {
  const { data, error } = await supabase
    .from('student_achievements')
    .insert({
      student_id: userId,
      achievement_type: achievementType,
      achievement_data: achievementData
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding student achievement:', error)
    throw error
  }

  return data
}

export async function getStudentAchievements(userId: string) {
  const { data, error } = await supabase
    .from('student_achievements')
    .select('*')
    .eq('student_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting student achievements:', error)
    throw error
  }

  return data
}

// Get dashboard statistics
export async function getDashboardStats(userRole: 'admin' | 'teacher' | 'student', userId?: string) {
  try {
    let stats = {
      totalCourses: 0,
      totalStudents: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      pendingReviews: 0,
      activeEnrollments: 0
    }

    if (userRole === 'teacher' && userId) {
      // Get teacher's courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id, enrollment_count, price, is_free')
        .eq('teacher_id', userId)

      if (courses) {
        stats.totalCourses = courses.length
        stats.totalStudents = courses.reduce((sum, course) => sum + (course.enrollment_count || 0), 0)
        stats.totalRevenue = courses.reduce((sum, course) => {
          if (!course.is_free) {
            return sum + ((course.price || 0) * (course.enrollment_count || 0))
          }
          return sum
        }, 0)
      }

      // Get monthly revenue (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: recentEnrollments } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses(price, is_free, teacher_id)
        `)
        .eq('course.teacher_id', userId)
        .gte('enrolled_at', thirtyDaysAgo.toISOString())

      if (recentEnrollments) {
        stats.monthlyRevenue = recentEnrollments.reduce((sum, enrollment) => {
          const course = enrollment.course as any
          if (course && !course.is_free) {
            return sum + (course.price || 0)
          }
          return sum
        }, 0)
      }

      // Get active enrollments
      const { count: activeEnrollments } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course.teacher_id', userId)
        .is('completed_at', null)

      stats.activeEnrollments = activeEnrollments || 0
    }

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return { data: null, error }
  }
}

// Get teacher tasks
export async function getTeacherTasks(teacherId: string) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        course:courses(id, title)
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting teacher tasks:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error getting teacher tasks:', error)
    return { data: null, error }
  }
}

// Get teacher students
export async function getTeacherStudents(teacherId: string) {
  try {
    // Get enrollments for teacher's courses
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        student:users(id, name, email, avatar_url),
        course:courses(id, title)
      `)
      .eq('course.teacher_id', teacherId)

    if (enrollmentsError) {
      console.error('Error getting enrollments:', enrollmentsError)
      return { data: null, error: enrollmentsError }
    }

    // Group by student and calculate stats
    const studentMap = new Map()
    
    enrollments?.forEach(enrollment => {
      const studentId = enrollment.student_id
      const student = enrollment.student as any
      
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: studentId,
          name: student.name,
          email: student.email,
          avatar_url: student.avatar_url,
          enrolled_courses: 0,
          completed_courses: 0,
          total_progress: 0,
          last_activity: enrollment.enrolled_at,
          status: 'active'
        })
      }
      
      const studentData = studentMap.get(studentId)
      studentData.enrolled_courses++
      
      // Calculate progress (simplified - you might want to add actual progress tracking)
      if (enrollment.completed_at) {
        studentData.completed_courses++
      }
      
      // Update last activity
      if (new Date(enrollment.enrolled_at) > new Date(studentData.last_activity)) {
        studentData.last_activity = enrollment.enrolled_at
      }
    })

    // Calculate total progress
    studentMap.forEach(student => {
      student.total_progress = student.enrolled_courses > 0 
        ? Math.round((student.completed_courses / student.enrolled_courses) * 100)
        : 0
    })

    const students = Array.from(studentMap.values())
    return { data: students, error: null }
  } catch (error) {
    console.error('Error getting teacher students:', error)
    return { data: null, error }
  }
}

// Get course statistics
export async function getCourseStats(courseId: string) {
  try {
    // Get course with lessons
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        lessons:lessons(id, duration_minutes)
      `)
      .eq('id', courseId)
      .single()

    if (courseError) {
      console.error('Error getting course stats:', courseError)
      return { data: null, error: courseError }
    }

    // Calculate total duration
    const totalDuration = course.lessons?.reduce((sum: number, lesson: any) => sum + (lesson.duration_minutes || 0), 0) || 0
    const totalHours = Math.round(totalDuration / 60 * 10) / 10 // Round to 1 decimal place

    const stats = {
      total_lessons: course.lessons?.length || 0,
      total_duration: totalHours,
      enrollment_count: course.enrollment_count || 0,
      completion_rate: 0 // You can calculate this based on actual completion data
    }

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error getting course stats:', error)
    return { data: null, error }
  }
}