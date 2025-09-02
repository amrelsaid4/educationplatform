import { NextRequest, NextResponse } from 'next/server'

import { rateLimit, corsMiddleware, addSecurityHeaders, logSecurityEvent } from '@/lib/security'

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/api/courses',
  '/api/assignments',
  '/api/exams',
  '/api/payments',
  '/api/messages',
  '/api/notifications',
]

// Admin-only routes
const adminRoutes = [
  '/dashboard/admin',
  '/api/admin',
]

// Teacher-only routes
const teacherRoutes = [
  '/dashboard/teacher',
  '/api/teacher',
]

// Student-only routes
const studentRoutes = [
  '/dashboard/student',
  '/api/student',
]

// Public routes that don't need rate limiting
const publicRoutes = [
  '/',
  '/landing',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/api/auth',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Add security headers to all responses
  const response = NextResponse.next()
  addSecurityHeaders(response)
  
  // CORS check
  const corsResponse = corsMiddleware(request)
  if (corsResponse) {
    return corsResponse
  }
  
  // Rate limiting for non-public routes
  if (!publicRoutes.some(route => pathname.startsWith(route))) {
    const rateLimitResult = await rateLimit(request)
    
    if (!rateLimitResult.allowed) {
      logSecurityEvent('rate_limit_exceeded', {
        ip: request.ip || request.headers.get('x-forwarded-for'),
        pathname,
        userAgent: request.headers.get('user-agent'),
      }, 'warning')
      
      return NextResponse.json(
        {
          error: true,
          message: 'تم تجاوز الحد المسموح للطلبات. يرجى المحاولة لاحقاً.',
          code: 'RATE_LIMIT_EXCEEDED',
          resetTime: rateLimitResult.resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      )
    }
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '100')
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
  }
  
  // Authentication check for protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Check for Supabase session token
    // Detect any Supabase auth cookie dynamically to avoid hardcoding project-specific keys
    const allCookies = request.cookies.getAll()
    const dynamicSupabaseCookie = allCookies.find(c => /sb-.*-auth-token/.test(c.name))
    const supabaseToken = dynamicSupabaseCookie || request.cookies.get('supabase-auth-token')

    if (!supabaseToken) {
      logSecurityEvent('unauthorized_access', {
        pathname,
        ip: request.ip || request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
      }, 'warning')
      
      // Redirect to login for dashboard routes
      if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
      
      // Return 401 for API routes
      return NextResponse.json(
        {
          error: true,
          message: 'غير مصرح. يرجى تسجيل الدخول.',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      )
    }
  }
  
  // Role-based access control - temporarily disabled for development
  // TODO: Implement proper role checking with Supabase JWT tokens
  /*
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    const supabaseToken = request.cookies.get('sb-udanxufqfcwmqqfntyjs-auth-token') ||
                          request.cookies.get('supabase-auth-token')
    
    if (!supabaseToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    // TODO: Decode Supabase JWT token and check role
    // For now, allow access if token exists
  }
  */
  
  // Similar checks for teacher and student routes
  if (teacherRoutes.some(route => pathname.startsWith(route))) {
    // Implement teacher role check
  }
  
  if (studentRoutes.some(route => pathname.startsWith(route))) {
    // Implement student role check
  }
  
  // Validate request body size for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        {
          error: true,
          message: 'حجم الطلب كبير جداً',
          code: 'PAYLOAD_TOO_LARGE',
        },
        { status: 413 }
      )
    }
  }
  
  // Block suspicious requests
  const userAgent = request.headers.get('user-agent') || ''
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
  ]
  
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    logSecurityEvent('suspicious_user_agent', {
      userAgent,
      pathname,
      ip: request.ip || request.headers.get('x-forwarded-for'),
    }, 'warning')
    
    // You can choose to block or just log these requests
    // return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }
  
  // Block requests with suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-real-ip',
  ]
  
  for (const header of suspiciousHeaders) {
    if (request.headers.get(header)) {
      logSecurityEvent('suspicious_header', {
        header,
        value: request.headers.get(header),
        pathname,
        ip: request.ip || request.headers.get('x-forwarded-for'),
      }, 'warning')
    }
  }
  
  // Add request ID for tracking
  const requestId = crypto.randomUUID()
  response.headers.set('X-Request-ID', requestId)
  
  // Log successful requests (optional, for debugging)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${request.method} ${pathname} - ${requestId}`)
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
