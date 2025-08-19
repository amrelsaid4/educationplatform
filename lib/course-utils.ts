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

// Get single course with details
export const getCourseById = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        teacher:users(name, avatar_url)
      `)
      .eq('id', courseId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching course:', error)
    return { data: null, error }
  }
}

// Get course lessons
export const getCourseLessons = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching lessons:', error)
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
export const updateCourse = async (courseId: string, updates: Partial<Course>) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating course:', error)
    return { data: null, error }
  }
}

// Create lesson
export const createLesson = async (lessonData: {
  course_id: string
  title: string
  description: string
  video_url?: string
  content: string
  duration_minutes: number
  order_index: number
  is_free: boolean
  unit_id?: string
  resources_urls?: string[]
}) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .insert(lessonData)
      .select()
      .single()

    if (error) throw error
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

// Get lesson progress for student
export const getLessonProgress = async (lessonId: string, studentId: string) => {
  try {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('student_id', studentId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching lesson progress:', error)
    return { data: null, error }
  }
}

// Search courses
export const searchCourses = async (query: string) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        teacher:users(name, avatar_url)
      `)
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error searching courses:', error)
    return { data: null, error }
  }
}

// Get all users (for admin dashboard)
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { data: null, error }
  }
}

// Get dashboard stats
export const getDashboardStats = async (role: string, userId?: string) => {
  try {
    let stats = {}

    if (role === 'admin') {
      // Admin stats
      const [usersResult, coursesResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('courses').select('id', { count: 'exact' })
      ])

      stats = {
        totalUsers: usersResult.count || 0,
        totalCourses: coursesResult.count || 0
      }
    } else if (role === 'teacher' && userId) {
      // Teacher stats
      const [coursesResult, enrollmentsResult] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact' }).eq('teacher_id', userId),
        supabase.from('course_enrollments').select('id', { count: 'exact' })
          .in('course_id', 
            (await supabase.from('courses').select('id').eq('teacher_id', userId)).data?.map(c => c.id) || []
          )
      ])

      stats = {
        totalCourses: coursesResult.count || 0,
        totalStudents: enrollmentsResult.count || 0
      }
    } else if (role === 'student' && userId) {
      // Student stats
      const [enrollmentsResult, progressResult] = await Promise.all([
        supabase.from('course_enrollments').select('id', { count: 'exact' }).eq('student_id', userId),
        supabase.from('lesson_progress').select('id', { count: 'exact' }).eq('student_id', userId).eq('is_completed', true)
      ])

      stats = {
        enrolledCourses: enrollmentsResult.count || 0,
        completedLessons: progressResult.count || 0
      }
    }

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return { data: null, error }
  }
}

// Get lesson by ID
export async function getLessonById(lessonId: string) {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('id', lessonId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching lesson:', error)
    throw error
  }
}
