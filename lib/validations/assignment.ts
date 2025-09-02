import { z } from 'zod'

// Assignment creation schema
export const assignmentCreateSchema = z.object({
  title: z.string()
    .min(3, 'عنوان الواجب يجب أن يكون على الأقل 3 أحرف')
    .max(255, 'عنوان الواجب لا يمكن أن يتجاوز 255 حرف')
    .regex(/^[\u0600-\u06FF\s\w\-_()]+$/, 'عنوان الواجب يجب أن يكون باللغة العربية أو الإنجليزية'),
  
  description: z.string()
    .min(10, 'وصف الواجب يجب أن يكون على الأقل 10 أحرف')
    .max(2000, 'وصف الواجب لا يمكن أن يتجاوز 2000 حرف'),
  
  course_id: z.string()
    .uuid('معرف الدورة غير صحيح'),
  
  lesson_id: z.string()
    .uuid('معرف الدرس غير صحيح')
    .optional(),
  
  assignment_type: z.enum(['homework', 'project', 'quiz', 'exam'], {
    errorMap: () => ({ message: 'نوع الواجب غير صحيح' })
  }).default('homework'),
  
  max_score: z.number()
    .min(1, 'الدرجة القصوى يجب أن تكون على الأقل 1')
    .max(1000, 'الدرجة القصوى لا يمكن أن تتجاوز 1000'),
  
  due_date: z.string()
    .datetime('تاريخ الاستحقاق غير صحيح')
    .refine((date) => new Date(date) > new Date(), {
      message: 'تاريخ الاستحقاق يجب أن يكون في المستقبل'
    }),
  
  instructions: z.string()
    .min(10, 'التعليمات يجب أن تكون على الأقل 10 أحرف')
    .max(5000, 'التعليمات لا يمكن أن تتجاوز 5000 حرف'),
  
  attachments: z.array(z.string().url('رابط المرفق غير صحيح'))
    .max(10, 'لا يمكن إضافة أكثر من 10 مرفقات')
    .optional(),
  
  is_published: z.boolean().default(false),
  
  allow_late_submission: z.boolean().default(false),
  
  late_penalty_percentage: z.number()
    .min(0, 'عقوبة التأخير لا يمكن أن تكون سالبة')
    .max(100, 'عقوبة التأخير لا يمكن أن تتجاوز 100%')
    .optional(),
  
  max_attempts: z.number()
    .min(1, 'عدد المحاولات يجب أن يكون على الأقل 1')
    .max(10, 'عدد المحاولات لا يمكن أن يتجاوز 10')
    .default(1),
  
  time_limit_minutes: z.number()
    .min(0, 'الحد الزمني لا يمكن أن يكون سالب')
    .max(1440, 'الحد الزمني لا يمكن أن يتجاوز 24 ساعة')
    .optional(),
  
  rubric: z.array(z.object({
    criterion: z.string().min(1, 'معيار التقييم مطلوب'),
    points: z.number().min(0, 'النقاط لا يمكن أن تكون سالبة'),
    description: z.string().optional(),
  }))
    .max(20, 'لا يمكن إضافة أكثر من 20 معيار تقييم')
    .optional(),
})

// Assignment update schema
export const assignmentUpdateSchema = assignmentCreateSchema.partial().omit({ course_id: true })

// Assignment submission schema
export const assignmentSubmissionSchema = z.object({
  assignment_id: z.string()
    .uuid('معرف الواجب غير صحيح'),
  
  content: z.string()
    .min(1, 'محتوى التسليم مطلوب')
    .max(10000, 'محتوى التسليم لا يمكن أن يتجاوز 10000 حرف'),
  
  attachments: z.array(z.string().url('رابط المرفق غير صحيح'))
    .max(10, 'لا يمكن إضافة أكثر من 10 مرفقات')
    .optional(),
  
  comments: z.string()
    .max(1000, 'التعليقات لا يمكن أن تتجاوز 1000 حرف')
    .optional(),
})

// Assignment grading schema
export const assignmentGradingSchema = z.object({
  submission_id: z.string()
    .uuid('معرف التسليم غير صحيح'),
  
  score: z.number()
    .min(0, 'الدرجة لا يمكن أن تكون سالبة')
    .max(1000, 'الدرجة لا يمكن أن تتجاوز 1000'),
  
  feedback: z.string()
    .min(1, 'التعليق مطلوب')
    .max(2000, 'التعليق لا يمكن أن يتجاوز 2000 حرف'),
  
  rubric_scores: z.array(z.object({
    criterion_id: z.string().min(1, 'معرف المعيار مطلوب'),
    points_earned: z.number().min(0, 'النقاط المكتسبة لا يمكن أن تكون سالبة'),
    feedback: z.string().max(500, 'التعليق على المعيار لا يمكن أن يتجاوز 500 حرف').optional(),
  }))
    .optional(),
  
  is_late: z.boolean().default(false),
  
  late_penalty_applied: z.number()
    .min(0, 'عقوبة التأخير المطبقة لا يمكن أن تكون سالبة')
    .optional(),
})

// Assignment search/filter schema
export const assignmentSearchSchema = z.object({
  course_id: z.string()
    .uuid('معرف الدورة غير صحيح')
    .optional(),
  
  assignment_type: z.enum(['homework', 'project', 'quiz', 'exam'])
    .optional(),
  
  status: z.enum(['upcoming', 'active', 'overdue', 'completed'])
    .optional(),
  
  is_published: z.boolean().optional(),
  
  due_date_from: z.string()
    .datetime('تاريخ البداية غير صحيح')
    .optional(),
  
  due_date_to: z.string()
    .datetime('تاريخ النهاية غير صحيح')
    .optional(),
  
  sort_by: z.enum(['title', 'due_date', 'created_at', 'max_score'])
    .default('due_date'),
  
  sort_order: z.enum(['asc', 'desc'])
    .default('asc'),
  
  page: z.number()
    .min(1, 'رقم الصفحة يجب أن يكون على الأقل 1')
    .default(1),
  
  limit: z.number()
    .min(1, 'عدد العناصر في الصفحة يجب أن يكون على الأقل 1')
    .max(100, 'عدد العناصر في الصفحة لا يمكن أن يتجاوز 100')
    .default(20),
}).refine((data) => {
  if (data.due_date_from && data.due_date_to) {
    return new Date(data.due_date_from) <= new Date(data.due_date_to)
  }
  return true
}, {
  message: "تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية",
  path: ["due_date_from"],
})

// Assignment bulk operations schema
export const assignmentBulkOperationSchema = z.object({
  assignment_ids: z.array(z.string().uuid('معرف الواجب غير صحيح'))
    .min(1, 'يجب اختيار واجب واحد على الأقل')
    .max(100, 'لا يمكن اختيار أكثر من 100 واجب'),
  
  operation: z.enum(['publish', 'unpublish', 'delete', 'duplicate'], {
    errorMap: () => ({ message: 'العملية غير صحيحة' })
  }),
  
  new_due_date: z.string()
    .datetime('التاريخ الجديد غير صحيح')
    .optional(),
})

// Export types
export type AssignmentCreateInput = z.infer<typeof assignmentCreateSchema>
export type AssignmentUpdateInput = z.infer<typeof assignmentUpdateSchema>
export type AssignmentSubmissionInput = z.infer<typeof assignmentSubmissionSchema>
export type AssignmentGradingInput = z.infer<typeof assignmentGradingSchema>
export type AssignmentSearchInput = z.infer<typeof assignmentSearchSchema>
export type AssignmentBulkOperationInput = z.infer<typeof assignmentBulkOperationSchema>

