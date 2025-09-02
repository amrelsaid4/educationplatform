import { supabase } from './supabase-config'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'teacher' | 'student'
  avatar_url?: string
}

// Rate limiting state
let lastSignUpAttempt = 0
const SIGNUP_COOLDOWN = 45000 // 45 seconds in milliseconds

export const signUp = async (userData: {
  name: string
  email: string
  password: string
  role: 'admin' | 'teacher' | 'student'
  phone?: string
}) => {
  try {
    // Check rate limiting
    const now = Date.now()
    const timeSinceLastAttempt = now - lastSignUpAttempt
    
    if (timeSinceLastAttempt < SIGNUP_COOLDOWN) {
      const remainingTime = Math.ceil((SIGNUP_COOLDOWN - timeSinceLastAttempt) / 1000)
      throw new Error(`يرجى الانتظار ${remainingTime} ثانية قبل المحاولة مرة أخرى`)
    }
    
    // Update last attempt time
    lastSignUpAttempt = now
    
    // Use Supabase Auth signUp with custom email confirmation
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
          phone: userData.phone
        },
        emailRedirectTo: undefined // Disable default email confirmation
      }
    })

    if (error) {
      console.error('Supabase Auth error:', error)
      
      // Handle specific errors in Arabic
      if (error.message?.includes('40 seconds') || error.message?.includes('Too Many Requests')) {
        throw new Error('يرجى الانتظار 40 ثانية قبل المحاولة مرة أخرى')
      }
      
      if (error.message?.includes('already registered')) {
        throw new Error('البريد الإلكتروني مستخدم بالفعل')
      }
      
      if (error.message?.includes('Invalid email')) {
        throw new Error('البريد الإلكتروني غير صحيح')
      }
      
      if (error.message?.includes('Password should be at least')) {
        throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      }
      
      throw new Error(error.message || 'فشل في إنشاء الحساب')
    }

    if (data.user) {
      // Create user profile in users table with the same UUID
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          is_active: true,
          email_verified: data.user.email_confirmed_at ? true : false,
          password_hash: 'supabase_auth_user' // Placeholder for Supabase Auth users
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Try to update existing user if insert fails
        if (profileError.code === '23505') { // Unique constraint violation
          const { error: updateError } = await supabase
            .from('users')
            .update({
              name: userData.name,
              role: userData.role,
              is_active: true,
              email_verified: data.user.email_confirmed_at ? true : false
            })
            .eq('id', data.user.id)
          
          if (updateError) {
            console.error('Profile update error:', updateError)
          }
        }
      }

      // Note: Supabase will send the default confirmation email
      // We can customize this later with Edge Functions if needed
      console.log('User created successfully. Confirmation email sent by Supabase.')

      // Return user data in expected format
      const user: AuthUser = {
        id: data.user.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      }

      return { data: user, error: null }
    }

    throw new Error('فشل في إنشاء الحساب')
  } catch (error) {
    console.error('SignUp error:', error)
    return { data: null, error }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    console.log('Attempting to sign in with email:', email)
    
    // Use Supabase Auth signIn
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Supabase Auth error:', error)
      
      // Handle specific error messages in Arabic
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      }
      
      if (error.message?.includes('Email not confirmed')) {
        console.log('Development mode: Skipping email confirmation requirement')
        // Continue with login even if email is not confirmed
      } else {
        throw new Error(error.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة')
      }
    }

    if (!data.user) {
      throw new Error('فشل في تسجيل الدخول - لم يتم العثور على المستخدم')
    }

    if (data.user) {
      // Get additional user data from users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        // If user profile doesn't exist, create it from auth data
        if (profileError.code === 'PGRST116') {
          console.log('Creating user profile from auth data')
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'مستخدم جديد',
              email: data.user.email || '',
              role: data.user.user_metadata?.role || 'student',
              is_active: true,
              email_verified: data.user.email_confirmed_at ? true : false,
              password_hash: 'supabase_auth_user'
            })
          
          if (!insertError) {
            console.log('User profile created successfully')
          } else {
            console.error('Error creating user profile:', insertError)
          }
        }
      }

      // Return user data in expected format
      const user: AuthUser = {
        id: data.user.id,
        name: userProfile?.name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'مستخدم جديد',
        email: data.user.email || '',
        role: userProfile?.role || data.user.user_metadata?.role || 'student'
      }

      console.log('User authenticated successfully:', user)
      return { user, error: null }
    }

    throw new Error('فشل في تسجيل الدخول')
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
      // If user not found in users table, try to get from auth
      if (error.code === 'PGRST116') {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          // Create user profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              name: authUser.user_metadata?.name || '',
              email: authUser.email || '',
              role: authUser.user_metadata?.role || 'student',
              is_active: true,
              email_verified: authUser.email_confirmed_at ? true : false,
              password_hash: 'supabase_auth_user'
            })
          
          if (!insertError) {
            return { 
              user: {
                id: authUser.id,
                name: authUser.user_metadata?.name || '',
                email: authUser.email || '',
                role: authUser.user_metadata?.role || 'student'
              }, 
              error: null 
            }
          }
        }
      }
      throw error
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error('SignOut error:', error)
    return { error }
  }
}

// Helper function to check if user exists in users table
export const checkUserInTable = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', userId)
      .single()

    if (error) {
      return { exists: false, user: null, error }
    }

    return { exists: true, user: data, error: null }
  } catch (error) {
    return { exists: false, user: null, error }
  }
}
