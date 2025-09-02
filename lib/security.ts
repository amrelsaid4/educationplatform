import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// CSRF token store
const csrfTokens = new Map<string, { token: string; expires: number }>()

// Security configuration
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // 100 requests per window
    SKIP_SUCCESSFUL_REQUESTS: false,
    SKIP_FAILED_REQUESTS: false,
  },
  
  // CSRF
  CSRF: {
    TOKEN_LENGTH: 32,
    EXPIRES_IN: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Headers
  HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
  
  // CORS
  CORS: {
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    EXPOSED_HEADERS: ['X-Total-Count'],
    CREDENTIALS: true,
    MAX_AGE: 86400, // 24 hours
  },
}

// Rate limiting middleware
export const rateLimit = async (request: NextRequest): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const windowStart = now - SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS
  
  // Get current rate limit data
  const current = rateLimitStore.get(ip)
  
  if (!current || current.resetTime < now) {
    // Reset or initialize
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS,
    })
    return {
      allowed: true,
      remaining: SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS - 1,
      resetTime: now + SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS,
    }
  }
  
  // Check if limit exceeded
  if (current.count >= SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    }
  }
  
  // Increment count
  current.count++
  rateLimitStore.set(ip, current)
  
  return {
    allowed: true,
    remaining: SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS - current.count,
    resetTime: current.resetTime,
  }
}

// Generate CSRF token
export const generateCSRFToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < SECURITY_CONFIG.CSRF.TOKEN_LENGTH; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// Create CSRF token
export const createCSRFToken = (sessionId: string): string => {
  const token = generateCSRFToken()
  const expires = Date.now() + SECURITY_CONFIG.CSRF.EXPIRES_IN
  
  csrfTokens.set(sessionId, { token, expires })
  
  // Clean up expired tokens
  for (const [id, data] of csrfTokens.entries()) {
    if (data.expires < Date.now()) {
      csrfTokens.delete(id)
    }
  }
  
  return token
}

// Validate CSRF token
export const validateCSRFToken = (sessionId: string, token: string): boolean => {
  const stored = csrfTokens.get(sessionId)
  
  if (!stored || stored.expires < Date.now()) {
    csrfTokens.delete(sessionId)
    return false
  }
  
  return stored.token === token
}

// Add security headers
export const addSecurityHeaders = (response: NextResponse): NextResponse => {
  Object.entries(SECURITY_CONFIG.HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// CORS middleware
export const corsMiddleware = (request: NextRequest): NextResponse | null => {
  const origin = request.headers.get('origin')
  const method = request.method
  
  // Check if origin is allowed
  if (origin && !SECURITY_CONFIG.CORS.ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  
  // Check if method is allowed
  if (!SECURITY_CONFIG.CORS.ALLOWED_METHODS.includes(method)) {
    return new NextResponse('Method Not Allowed', { status: 405 })
  }
  
  return null
}

// Authentication middleware
export const authMiddleware = async (request: NextRequest): Promise<{ user: any; error?: string }> => {
  try {
    const token = await getToken({ req: request })
    
    if (!token) {
      return { user: null, error: 'غير مصرح' }
    }
    
    return { user: token }
  } catch (error) {
    return { user: null, error: 'خطأ في المصادقة' }
  }
}

// Role-based access control
export const requireRole = (allowedRoles: string[]) => {
  return async (request: NextRequest): Promise<{ user: any; error?: string }> => {
    const { user, error } = await authMiddleware(request)
    
    if (error) {
      return { user: null, error }
    }
    
    if (!user || !allowedRoles.includes(user.role)) {
      return { user: null, error: 'غير مصرح لهذا الدور' }
    }
    
    return { user }
  }
}

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
}

// Validate file upload
export const validateFileUpload = (
  file: File,
  options: {
    maxSize?: number
    allowedTypes?: string[]
    allowedExtensions?: string[]
  } = {}
): { valid: boolean; error?: string } => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  } = options
  
  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: `حجم الملف يتجاوز الحد المسموح (${Math.round(maxSize / 1024 / 1024)}MB)` }
  }
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'نوع الملف غير مسموح' }
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedExtensions.includes(extension)) {
    return { valid: false, error: 'امتداد الملف غير مسموح' }
  }
  
  return { valid: true }
}

// SQL injection prevention
export const sanitizeSQL = (input: string): string => {
  return input
    .replace(/['";\\]/g, '') // Remove SQL special characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments
    .replace(/\*\//g, '')
}

// XSS prevention
export const escapeHTML = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Create secure response
export const createSecureResponse = (
  data: any,
  status: number = 200,
  options: {
    addCSRF?: boolean
    sessionId?: string
  } = {}
): NextResponse => {
  const response = NextResponse.json(data, { status })
  
  // Add security headers
  addSecurityHeaders(response)
  
  // Add CSRF token if requested
  if (options.addCSRF && options.sessionId) {
    const csrfToken = createCSRFToken(options.sessionId)
    response.headers.set('X-CSRF-Token', csrfToken)
  }
  
  return response
}

// Create error response
export const createErrorResponse = (
  message: string,
  status: number = 400,
  code?: string
): NextResponse => {
  const error = {
    error: true,
    message,
    code,
    timestamp: new Date().toISOString(),
  }
  
  return createSecureResponse(error, status)
}

// Validate request body size
export const validateBodySize = (request: NextRequest, maxSize: number = 1024 * 1024): boolean => {
  const contentLength = request.headers.get('content-length')
  if (contentLength) {
    return parseInt(contentLength) <= maxSize
  }
  return true
}

// Log security events
export const logSecurityEvent = (
  event: string,
  details: any,
  level: 'info' | 'warning' | 'error' = 'info'
): void => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    details,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
  }
  
  // In production, send to logging service
  console.log(`[SECURITY ${level.toUpperCase()}]`, logEntry)
}

// Clean up expired data
export const cleanupExpiredData = (): void => {
  const now = Date.now()
  
  // Clean up rate limit store
  for (const [ip, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(ip)
    }
  }
  
  // Clean up CSRF tokens
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (data.expires < now) {
      csrfTokens.delete(sessionId)
    }
  }
}

// Run cleanup every hour
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredData, 60 * 60 * 1000)
}

