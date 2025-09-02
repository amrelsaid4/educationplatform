import { z } from 'zod'

// Course creation schema
export const courseCreateSchema = z.object({
  title: z.string()
    .min(3, 'عنوان الدورة يجب أن يكون على الأقل 3 أحرف')
    .max(255, 'عنوان الدورة لا يمكن أن يتجاوز 255 حرف')
    .regex(/^[\u0600-\u06FF\s\w\-_()]+$/, 'عنوان الدورة يجب أن يكون باللغة العربية أو الإنجليزية'),
  
  description: z.string()
    .min(10, 'وصف الدورة يجب أن يكون على الأقل 10 أحرف')
    .max(2000, 'وصف الدورة لا يمكن أن يتجاوز 2000 حرف'),
  
  price: z.number()
    .min(0, 'سعر الدورة لا يمكن أن يكون سالب')
    .max(99999.99, 'سعر الدورة لا يمكن أن يتجاوز 99999.99'),
  
  level: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'يجب اختيار مستوى الدورة' })
  }),
  
  category: z.string()
    .min(2, 'التصنيف يجب أن يكون على الأقل حرفين')
    .max(100, 'التصنيف لا يمكن أن يتجاوز 100 حرف')
    .optional(),
  
  language: z.string()
    .default('Arabic')
    .min(2, 'اللغة يجب أن تكون على الأقل حرفين')
    .max(50, 'اللغة لا يمكن أن تتجاوز 50 حرف'),
  
  status: z.enum(['draft', 'published', 'archived'], {
    errorMap: () => ({ message: 'حالة الدورة غير صحيحة' })
  }).default('draft'),
  
  is_free: z.boolean().default(false),
  
  duration_hours: z.number()
    .min(0, 'مدة الدورة لا يمكن أن تكون سالبة')
    .max(1000, 'مدة الدورة لا يمكن أن تتجاوز 1000 ساعة'),
  
  total_lessons: z.number()
    .min(0, 'عدد الدروس لا يمكن أن يكون سالب')
    .max(500, 'عدد الدروس لا يمكن أن يتجاوز 500'),
  
  thumbnail_url: z.string()
    .url('رابط الصورة المصغرة غير صحيح')
    .optional(),
  
  category_id: z.string()
    .uuid('معرف التصنيف غير صحيح')
    .optional(),
})

// Course update schema
export const courseUpdateSchema = courseCreateSchema.partial()

// Lesson creation schema
export const lessonCreateSchema = z.object({
  course_id: z.string()
    .uuid('معرف الدورة غير صحيح'),
  
  unit_id: z.string()
    .uuid('معرف الوحدة غير صحيح')
    .optional(),
  
  title: z.string()
    .min(3, 'عنوان الدرس يجب أن يكون على الأقل 3 أحرف')
    .max(255, 'عنوان الدرس لا يمكن أن يتجاوز 255 حرف')
    .regex(/^[\u0600-\u06FF\s\w\-_()]+$/, 'عنوان الدرس يجب أن يكون باللغة العربية أو الإنجليزية'),
  
  description: z.string()
    .min(5, 'وصف الدرس يجب أن يكون على الأقل 5 أحرف')
    .max(1000, 'وصف الدرس لا يمكن أن يتجاوز 1000 حرف')
    .optional(),
  
  video_url: z.string()
    .url('رابط الفيديو غير صحيح')
    .optional(),
  
  content: z.string()
    .min(10, 'محتوى الدرس يجب أن يكون على الأقل 10 أحرف')
    .max(10000, 'محتوى الدرس لا يمكن أن يتجاوز 10000 حرف')
    .optional(),
  
  duration_minutes: z.number()
    .min(0, 'مدة الدرس لا يمكن أن تكون سالبة')
    .max(480, 'مدة الدرس لا يمكن أن تتجاوز 8 ساعات'),
  
  order_index: z.number()
    .min(0, 'ترتيب الدرس لا يمكن أن يكون سالب')
    .max(1000, 'ترتيب الدرس لا يمكن أن يتجاوز 1000'),
  
  is_free: z.boolean().default(false),
  
  resources_urls: z.array(z.string().url('رابط المورد غير صحيح'))
    .max(10, 'لا يمكن إضافة أكثر من 10 موارد')
    .optional(),
})

// Lesson update schema
export const lessonUpdateSchema = lessonCreateSchema.partial().omit({ course_id: true })

// Course enrollment schema
export const courseEnrollmentSchema = z.object({
  course_id: z.string()
    .uuid('معرف الدورة غير صحيح'),
  
  student_id: z.string()
    .uuid('معرف الطالب غير صحيح'),
})

// Course review schema
export const courseReviewSchema = z.object({
  course_id: z.string()
    .uuid('معرف الدورة غير صحيح'),
  
  rating: z.number()
    .min(1, 'التقييم يجب أن يكون على الأقل 1')
    .max(5, 'التقييم لا يمكن أن يتجاوز 5'),
  
  review_text: z.string()
    .min(10, 'نص التقييم يجب أن يكون على الأقل 10 أحرف')
    .max(1000, 'نص التقييم لا يمكن أن يتجاوز 1000 حرف')
    .optional(),
})

// Course search/filter schema
export const courseSearchSchema = z.object({
  query: z.string()
    .max(100, 'نص البحث لا يمكن أن يتجاوز 100 حرف')
    .optional(),
  
  category: z.string()
    .max(100, 'التصنيف لا يمكن أن يتجاوز 100 حرف')
    .optional(),
  
  level: z.enum(['beginner', 'intermediate', 'advanced'])
    .optional(),
  
  price_min: z.number()
    .min(0, 'الحد الأدنى للسعر لا يمكن أن يكون سالب')
    .optional(),
  
  price_max: z.number()
    .min(0, 'الحد الأقصى للسعر لا يمكن أن يكون سالب')
    .optional(),
  
  is_free: z.boolean().optional(),
  
  language: z.string()
    .max(50, 'اللغة لا يمكن أن تتجاوز 50 حرف')
    .optional(),
  
  sort_by: z.enum(['title', 'price', 'rating', 'created_at', 'enrollment_count'])
    .default('created_at'),
  
  sort_order: z.enum(['asc', 'desc'])
    .default('desc'),
  
  page: z.number()
    .min(1, 'رقم الصفحة يجب أن يكون على الأقل 1')
    .default(1),
  
  limit: z.number()
    .min(1, 'عدد العناصر في الصفحة يجب أن يكون على الأقل 1')
    .max(100, 'عدد العناصر في الصفحة لا يمكن أن يتجاوز 100')
    .default(12),
}).refine((data) => {
  if (data.price_min && data.price_max) {
    return data.price_min <= data.price_max
  }
  return true
}, {
  message: "الحد الأدنى للسعر يجب أن يكون أقل من أو يساوي الحد الأقصى",
  path: ["price_min"],
})

// Export types
export type CourseCreateInput = z.infer<typeof courseCreateSchema>
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>
export type LessonCreateInput = z.infer<typeof lessonCreateSchema>
export type LessonUpdateInput = z.infer<typeof lessonUpdateSchema>
export type CourseEnrollmentInput = z.infer<typeof courseEnrollmentSchema>
export type CourseReviewInput = z.infer<typeof courseReviewSchema>
export type CourseSearchInput = z.infer<typeof courseSearchSchema>

