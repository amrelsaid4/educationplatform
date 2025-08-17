import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'teacher' | 'student'
          password_hash: string
          avatar_url?: string
          phone?: string
          bio?: string
          is_active: boolean
          email_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: 'admin' | 'teacher' | 'student'
          password_hash: string
          avatar_url?: string
          phone?: string
          bio?: string
          is_active?: boolean
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'teacher' | 'student'
          password_hash?: string
          avatar_url?: string
          phone?: string
          bio?: string
          is_active?: boolean
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description?: string
          teacher_id: string
          thumbnail_url?: string
          price: number
          level: 'beginner' | 'intermediate' | 'advanced'
          category?: string
          language: string
          status: 'draft' | 'published' | 'archived'
          is_free: boolean
          duration_hours: number
          total_lessons: number
          enrollment_count: number
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          teacher_id: string
          thumbnail_url?: string
          price?: number
          level?: 'beginner' | 'intermediate' | 'advanced'
          category?: string
          language?: string
          status?: 'draft' | 'published' | 'archived'
          is_free?: boolean
          duration_hours?: number
          total_lessons?: number
          enrollment_count?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          teacher_id?: string
          thumbnail_url?: string
          price?: number
          level?: 'beginner' | 'intermediate' | 'advanced'
          category?: string
          language?: string
          status?: 'draft' | 'published' | 'archived'
          is_free?: boolean
          duration_hours?: number
          total_lessons?: number
          enrollment_count?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      course_enrollments: {
        Row: {
          id: string
          course_id: string
          student_id: string
          enrolled_at: string
          progress: number
          completed_at?: string
          certificate_url?: string
        }
        Insert: {
          id?: string
          course_id: string
          student_id: string
          enrolled_at?: string
          progress?: number
          completed_at?: string
          certificate_url?: string
        }
        Update: {
          id?: string
          course_id?: string
          student_id?: string
          enrolled_at?: string
          progress?: number
          completed_at?: string
          certificate_url?: string
        }
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          unit_id?: string
          title: string
          description?: string
          video_url?: string
          content?: string
          duration_minutes: number
          order_index: number
          is_free: boolean
          resources_urls?: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          unit_id?: string
          title: string
          description?: string
          video_url?: string
          content?: string
          duration_minutes?: number
          order_index: number
          is_free?: boolean
          resources_urls?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          unit_id?: string
          title?: string
          description?: string
          video_url?: string
          content?: string
          duration_minutes?: number
          order_index?: number
          is_free?: boolean
          resources_urls?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
