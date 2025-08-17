import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'teacher' | 'student'
  avatar_url?: string
}

export const signUp = async (userData: {
  name: string
  email: string
  password: string
  role: 'teacher' | 'student'
}) => {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.email)
      .single()

    if (existingUser) {
      throw new Error('البريد الإلكتروني مستخدم بالفعل')
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(userData.password, saltRounds)
    
    // Insert user into database
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: userData.name,
        email: userData.email,
        password_hash: passwordHash,
        role: userData.role,
        is_active: true,
        email_verified: false
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('فشل في إنشاء الحساب')
    }

    return { data, error: null }
  } catch (error) {
    console.error('SignUp error:', error)
    return { data: null, error }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (userError || !user) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    }

    return { user, error: null }
  } catch (error) {
    console.error('SignIn error:', error)
    return { user: null, error }
  }
}

export const getCurrentUser = async (userId: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      throw error
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

export const signOut = async () => {
  // For now, just return success since we're not using Supabase Auth
  return { error: null }
}
