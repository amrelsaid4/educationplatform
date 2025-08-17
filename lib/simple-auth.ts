import { signIn, signUp, AuthUser } from './auth-utils'

// Simple session management using localStorage
const SESSION_KEY = 'eduplatform_session'

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
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export const getSession = (): Session | null => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY)
    if (!sessionData) return null
    
    const session: Session = JSON.parse(sessionData)
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    
    return session
  } catch (error) {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY)
}

export const isAuthenticated = (): boolean => {
  return getSession() !== null
}

export const getCurrentUser = (): AuthUser | null => {
  const session = getSession()
  return session?.user || null
}

// Authentication functions
export const loginUser = async (email: string, password: string) => {
  try {
    const { user, error } = await signIn(email, password)
    
    if (error) {
      throw error
    }
    
    if (user) {
      const session = createSession(user)
      return { success: true, user, session }
    }
    
    throw new Error('فشل في تسجيل الدخول')
  } catch (error) {
    return { success: false, error }
  }
}

export const registerUser = async (userData: {
  name: string
  email: string
  password: string
  role: 'teacher' | 'student'
}) => {
  try {
    const { data, error } = await signUp(userData)
    
    if (error) {
      throw error
    }
    
    if (data) {
      // Auto-login after registration
      const loginResult = await loginUser(userData.email, userData.password)
      return loginResult
    }
    
    throw new Error('فشل في إنشاء الحساب')
  } catch (error) {
    return { success: false, error }
  }
}

export const logoutUser = (): void => {
  clearSession()
}
