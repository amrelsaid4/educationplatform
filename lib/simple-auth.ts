import { signIn, signUp, AuthUser, signOut } from './auth-utils'
import { supabase } from './supabase-config'

export interface Session {
  user: AuthUser
  token: string
  expiresAt: number
}

export const createSession = (user: AuthUser): Session => {
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  const token = btoa(JSON.stringify({ userId: user.id, expiresAt }))
  
  const session: Session = {
    user,
    token,
    expiresAt
  }
  
  return session
}

export const getSession = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return null
    }

    // Get user profile from users table
    let userProfile = null;
    try {
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
      userProfile = profileData;
    } catch (profileError) {
      console.log('Profile not found in users table, using auth metadata');
    }

    const user: AuthUser = {
      id: session.user.id,
      name: userProfile?.name || session.user.user_metadata?.name || '',
      email: session.user.email || '',
      role: userProfile?.role || session.user.user_metadata?.role || 'student'
    }

    return {
      user,
      token: session.access_token,
      expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + (24 * 60 * 60 * 1000)
    }
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

export const clearSession = async (): Promise<void> => {
  await signOut()
}

export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession()
  return session !== null
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const session = await getSession()
  return session?.user || null
}

// Authentication functions
export const loginUser = async (email: string, password: string) => {
  try {
    console.log('loginUser called with email:', email);
    const { user, error } = await signIn(email, password)
    
    if (error) {
      console.error('SignIn error in loginUser:', error);
      throw error
    }
    
    if (user) {
      console.log('User signed in successfully:', user);
      
      // Wait a bit for session to be established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const session = await getSession()
      console.log('Session retrieved:', session);
      
      return { success: true, user, session }
    }
    
    console.error('No user returned from signIn');
    throw new Error('فشل في تسجيل الدخول')
  } catch (error) {
    console.error('loginUser error:', error);
    return { success: false, error }
  }
}

export const registerUser = async (userData: {
  name: string
  email: string
  password: string
  role: 'admin' | 'teacher' | 'student'
  phone?: string
}) => {
  try {
    const { data, error } = await signUp(userData)
    
    if (error) {
      throw error
    }
    
    if (data) {
      // For development: Auto-login regardless of email confirmation
      console.log('Development mode: Auto-login after registration')
      const loginResult = await loginUser(userData.email, userData.password)
      return loginResult
    }
    
    throw new Error('فشل في إنشاء الحساب')
  } catch (error) {
    return { success: false, error }
  }
}

export const logoutUser = async (): Promise<void> => {
  await clearSession()
}
