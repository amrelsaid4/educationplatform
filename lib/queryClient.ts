import { QueryClient } from '@tanstack/react-query'

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time before data is considered stale
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Time before inactive queries are garbage collected
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Number of retries on error
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount
      refetchOnMount: true,
      
      // Keep previous data while fetching new data
      keepPreviousData: true,
      
      // Notify on background refetch
      notifyOnChangeProps: ['data', 'error', 'isLoading'],
    },
    
    mutations: {
      // Retry failed mutations
      retry: 1,
      
      // Retry delay for mutations
      retryDelay: 1000,
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
})

// Query keys factory for better organization
export const queryKeys = {
  // User queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
  },
  
  // Course queries
  courses: {
    all: ['courses'] as const,
    lists: () => [...queryKeys.courses.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.courses.lists(), filters] as const,
    details: () => [...queryKeys.courses.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.courses.details(), id] as const,
    lessons: (courseId: string) => [...queryKeys.courses.detail(courseId), 'lessons'] as const,
    enrollments: (courseId: string) => [...queryKeys.courses.detail(courseId), 'enrollments'] as const,
    reviews: (courseId: string) => [...queryKeys.courses.detail(courseId), 'reviews'] as const,
  },
  
  // Lesson queries
  lessons: {
    all: ['lessons'] as const,
    lists: () => [...queryKeys.lessons.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.lessons.lists(), filters] as const,
    details: () => [...queryKeys.lessons.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.lessons.details(), id] as const,
    progress: (lessonId: string) => [...queryKeys.lessons.detail(lessonId), 'progress'] as const,
  },
  
  // Assignment queries
  assignments: {
    all: ['assignments'] as const,
    lists: () => [...queryKeys.assignments.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.assignments.lists(), filters] as const,
    details: () => [...queryKeys.assignments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.assignments.details(), id] as const,
    submissions: (assignmentId: string) => [...queryKeys.assignments.detail(assignmentId), 'submissions'] as const,
  },
  
  // Exam queries
  exams: {
    all: ['exams'] as const,
    lists: () => [...queryKeys.exams.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.exams.lists(), filters] as const,
    details: () => [...queryKeys.exams.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.exams.details(), id] as const,
    questions: (examId: string) => [...queryKeys.exams.detail(examId), 'questions'] as const,
    attempts: (examId: string) => [...queryKeys.exams.detail(examId), 'attempts'] as const,
  },
  
  // Payment queries
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.payments.lists(), filters] as const,
    details: () => [...queryKeys.payments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.payments.details(), id] as const,
    stats: () => [...queryKeys.payments.all, 'stats'] as const,
  },
  
  // Message queries
  messages: {
    all: ['messages'] as const,
    lists: () => [...queryKeys.messages.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.messages.lists(), filters] as const,
    details: () => [...queryKeys.messages.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.messages.details(), id] as const,
    unread: () => [...queryKeys.messages.all, 'unread'] as const,
  },
  
  // Notification queries
  notifications: {
    all: ['notifications'] as const,
    lists: () => [...queryKeys.notifications.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.notifications.lists(), filters] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    count: () => [...queryKeys.notifications.all, 'count'] as const,
  },
  
  // Analytics queries
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    course: (courseId: string) => [...queryKeys.analytics.all, 'course', courseId] as const,
    user: (userId: string) => [...queryKeys.analytics.all, 'user', userId] as const,
  },
}

// Prefetch functions for better UX
export const prefetchQueries = {
  // Prefetch user profile
  userProfile: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.users.profile(),
      queryFn: async () => {
        // Implement user profile fetch
        const response = await fetch('/api/user/profile')
        if (!response.ok) throw new Error('Failed to fetch user profile')
        return response.json()
      },
    })
  },
  
  // Prefetch course list
  courseList: async (filters?: any) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.courses.list(filters),
      queryFn: async () => {
        const params = new URLSearchParams(filters)
        const response = await fetch(`/api/courses?${params}`)
        if (!response.ok) throw new Error('Failed to fetch courses')
        return response.json()
      },
    })
  },
  
  // Prefetch course details
  courseDetail: async (courseId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.courses.detail(courseId),
      queryFn: async () => {
        const response = await fetch(`/api/courses/${courseId}`)
        if (!response.ok) throw new Error('Failed to fetch course')
        return response.json()
      },
    })
  },
}

// Invalidate and refetch functions
export const invalidateQueries = {
  // Invalidate all user queries
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  
  // Invalidate all course queries
  courses: () => queryClient.invalidateQueries({ queryKey: queryKeys.courses.all }),
  
  // Invalidate specific course
  course: (courseId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(courseId) }),
  
  // Invalidate all lesson queries
  lessons: () => queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all }),
  
  // Invalidate all assignment queries
  assignments: () => queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all }),
  
  // Invalidate all exam queries
  exams: () => queryClient.invalidateQueries({ queryKey: queryKeys.exams.all }),
  
  // Invalidate all payment queries
  payments: () => queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
  
  // Invalidate all message queries
  messages: () => queryClient.invalidateQueries({ queryKey: queryKeys.messages.all }),
  
  // Invalidate all notification queries
  notifications: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
}

// Optimistic update helpers
export const optimisticUpdates = {
  // Optimistically update course enrollment
  courseEnrollment: (courseId: string, isEnrolled: boolean) => {
    queryClient.setQueryData(
      queryKeys.courses.detail(courseId),
      (old: any) => ({
        ...old,
        isEnrolled,
        enrollment_count: old.enrollment_count + (isEnrolled ? 1 : -1),
      })
    )
  },
  
  // Optimistically update lesson progress
  lessonProgress: (lessonId: string, isCompleted: boolean) => {
    queryClient.setQueryData(
      queryKeys.lessons.progress(lessonId),
      (old: any) => ({
        ...old,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
    )
  },
  
  // Optimistically update message read status
  messageRead: (messageId: string, isRead: boolean) => {
    queryClient.setQueryData(
      queryKeys.messages.detail(messageId),
      (old: any) => ({
        ...old,
        is_read: isRead,
        read_at: isRead ? new Date().toISOString() : null,
      })
    )
  },
}

// Error handling
export const handleQueryError = (error: any) => {
  console.error('Query error:', error)
  
  // You can implement custom error handling here
  // For example, show toast notifications, log to monitoring service, etc.
  
  if (error?.status === 401) {
    // Handle unauthorized error
    window.location.href = '/auth/login'
  } else if (error?.status === 403) {
    // Handle forbidden error
    console.error('Access denied')
  } else if (error?.status >= 500) {
    // Handle server error
    console.error('Server error')
  }
}

// Success handling
export const handleQuerySuccess = (data: any, queryKey: any[]) => {
  // You can implement custom success handling here
  // For example, analytics tracking, logging, etc.
  
  console.log('Query success:', queryKey, data)
}







