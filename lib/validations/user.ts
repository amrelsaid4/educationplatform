import { z } from 'zod'

// User registration schema
export const userRegistrationSchema = z.object({
  name: z.string()
    .min(2, 'الاسم يجب أن يكون على الأقل حرفين')
    .max(50, 'الاسم لا يمكن أن يتجاوز 50 حرف')
    .regex(/^[\u0600-\u06FF\s]+$/, 'الاسم يجب أن يكون باللغة العربية'),
  
  email: z.string()
    .email('البريد الإلكتروني غير صحيح')
    .min(5, 'البريد الإلكتروني قصير جداً')
    .max(100, 'البريد الإلكتروني طويل جداً'),
  
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون على الأقل 8 أحرف')
    .max(100, 'كلمة المرور طويلة جداً')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم'),
  
  confirmPassword: z.string(),
  role: z.enum(['student', 'teacher'], {
    errorMap: () => ({ message: 'يجب اختيار نوع المستخدم' })
  }),
  
  phone: z.string()
    .regex(/^(\+966|966|0)?5[0-9]{8}$/, 'رقم الهاتف غير صحيح')
    .optional(),
  
  bio: z.string()
    .max(500, 'النبذة لا يمكن أن تتجاوز 500 حرف')
    .optional(),
  
  location: z.string()
    .max(100, 'الموقع لا يمكن أن يتجاوز 100 حرف')
    .optional(),
  
  website: z.string()
    .url('رابط الموقع غير صحيح')
    .optional(),
  
  specialization: z.string()
    .max(100, 'التخصص لا يمكن أن يتجاوز 100 حرف')
    .optional(),
  
  experience_years: z.number()
    .min(0, 'سنوات الخبرة لا يمكن أن تكون سالبة')
    .max(50, 'سنوات الخبرة لا يمكن أن تتجاوز 50')
    .optional(),
  
  education: z.string()
    .max(200, 'المؤهل التعليمي لا يمكن أن يتجاوز 200 حرف')
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
})

// User login schema
export const userLoginSchema = z.object({
  email: z.string()
    .email('البريد الإلكتروني غير صحيح'),
  
  password: z.string()
    .min(1, 'كلمة المرور مطلوبة'),
})

// User profile update schema
export const userProfileUpdateSchema = z.object({
  name: z.string()
    .min(2, 'الاسم يجب أن يكون على الأقل حرفين')
    .max(50, 'الاسم لا يمكن أن يتجاوز 50 حرف')
    .regex(/^[\u0600-\u06FF\s]+$/, 'الاسم يجب أن يكون باللغة العربية')
    .optional(),
  
  phone: z.string()
    .regex(/^(\+966|966|0)?5[0-9]{8}$/, 'رقم الهاتف غير صحيح')
    .optional(),
  
  bio: z.string()
    .max(500, 'النبذة لا يمكن أن تتجاوز 500 حرف')
    .optional(),
  
  location: z.string()
    .max(100, 'الموقع لا يمكن أن يتجاوز 100 حرف')
    .optional(),
  
  website: z.string()
    .url('رابط الموقع غير صحيح')
    .optional(),
  
  specialization: z.string()
    .max(100, 'التخصص لا يمكن أن يتجاوز 100 حرف')
    .optional(),
  
  experience_years: z.number()
    .min(0, 'سنوات الخبرة لا يمكن أن تكون سالبة')
    .max(50, 'سنوات الخبرة لا يمكن أن تتجاوز 50')
    .optional(),
  
  education: z.string()
    .max(200, 'المؤهل التعليمي لا يمكن أن يتجاوز 200 حرف')
    .optional(),
  
  avatar_url: z.string()
    .url('رابط الصورة غير صحيح')
    .optional(),
})

// Password change schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string()
    .min(1, 'كلمة المرور الحالية مطلوبة'),
  
  newPassword: z.string()
    .min(8, 'كلمة المرور الجديدة يجب أن تكون على الأقل 8 أحرف')
    .max(100, 'كلمة المرور الجديدة طويلة جداً')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور الجديدة يجب أن تحتوي على حرف كبير وحرف صغير ورقم'),
  
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "كلمات المرور الجديدة غير متطابقة",
  path: ["confirmNewPassword"],
})

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('البريد الإلكتروني غير صحيح'),
})

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'رمز إعادة تعيين كلمة المرور مطلوب'),
  
  newPassword: z.string()
    .min(8, 'كلمة المرور الجديدة يجب أن تكون على الأقل 8 أحرف')
    .max(100, 'كلمة المرور الجديدة طويلة جداً')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور الجديدة يجب أن تحتوي على حرف كبير وحرف صغير ورقم'),
  
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "كلمات المرور الجديدة غير متطابقة",
  path: ["confirmNewPassword"],
})

// Export types
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>
export type UserLoginInput = z.infer<typeof userLoginSchema>
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

