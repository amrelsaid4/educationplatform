// Common validation utilities
import { z } from 'zod'

// Export all validation schemas
export * from './user'
export * from './course'
export * from './assignment'
export * from './exam'

// Generic ID validation
export const idSchema = z.string().uuid('المعرف غير صحيح')

// Generic pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1, 'رقم الصفحة يجب أن يكون على الأقل 1').default(1),
  limit: z.number().min(1, 'عدد العناصر يجب أن يكون على الأقل 1').max(100, 'عدد العناصر لا يمكن أن يتجاوز 100').default(20),
})

// Generic search schema
export const searchSchema = z.object({
  query: z.string().max(100, 'نص البحث لا يمكن أن يتجاوز 100 حرف').optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
})

// Generic date range schema
export const dateRangeSchema = z.object({
  start_date: z.string().datetime('تاريخ البداية غير صحيح').optional(),
  end_date: z.string().datetime('تاريخ النهاية غير صحيح').optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date)
  }
  return true
}, {
  message: "تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية",
  path: ["start_date"],
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'يجب اختيار ملف' }),
  maxSize: z.number().min(1, 'الحد الأقصى لحجم الملف يجب أن يكون على الأقل 1 بايت').default(10 * 1024 * 1024), // 10MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']),
}).refine((data) => {
  return data.file.size <= data.maxSize
}, {
  message: "حجم الملف يتجاوز الحد المسموح",
  path: ["file"],
}).refine((data) => {
  return data.allowedTypes.includes(data.file.type)
}, {
  message: "نوع الملف غير مسموح",
  path: ["file"],
})

// URL validation
export const urlSchema = z.string().url('الرابط غير صحيح')

// Email validation
export const emailSchema = z.string().email('البريد الإلكتروني غير صحيح')

// Phone validation (Saudi Arabia)
export const phoneSchema = z.string().regex(/^(\+966|966|0)?5[0-9]{8}$/, 'رقم الهاتف غير صحيح')

// Password validation
export const passwordSchema = z.string()
  .min(8, 'كلمة المرور يجب أن تكون على الأقل 8 أحرف')
  .max(100, 'كلمة المرور طويلة جداً')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم')

// Arabic text validation
export const arabicTextSchema = z.string().regex(/^[\u0600-\u06FF\s]+$/, 'النص يجب أن يكون باللغة العربية')

// Mixed text validation (Arabic + English)
export const mixedTextSchema = z.string().regex(/^[\u0600-\u06FF\s\w\-_()]+$/, 'النص يجب أن يكون باللغة العربية أو الإنجليزية')

// Export types
export type PaginationInput = z.infer<typeof paginationSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
