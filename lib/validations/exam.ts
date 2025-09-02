import { z } from 'zod'

// Exam creation schema
export const examCreateSchema = z.object({
  title: z.string()
    .min(3, 'عنوان الاختبار يجب أن يكون على الأقل 3 أحرف')
    .max(255, 'عنوان الاختبار لا يمكن أن يتجاوز 255 حرف')
    .regex(/^[\u0600-\u06FF\s\w\-_()]+$/, 'عنوان الاختبار يجب أن يكون باللغة العربية أو الإنجليزية'),
  
  description: z.string()
    .min(10, 'وصف الاختبار يجب أن يكون على الأقل 10 أحرف')
    .max(2000, 'وصف الاختبار لا يمكن أن يتجاوز 2000 حرف'),
  
  course_id: z.string()
    .uuid('معرف الدورة غير صحيح'),
  
  exam_type: z.enum(['quiz', 'midterm', 'final', 'practice'], {
    errorMap: () => ({ message: 'نوع الاختبار غير صحيح' })
  }).default('quiz'),
  
  duration_minutes: z.number()
    .min(5, 'مدة الاختبار يجب أن تكون على الأقل 5 دقائق')
    .max(480, 'مدة الاختبار لا يمكن أن تتجاوز 8 ساعات'),
  
  max_score: z.number()
    .min(1, 'الدرجة القصوى يجب أن تكون على الأقل 1')
    .max(1000, 'الدرجة القصوى لا يمكن أن تتجاوز 1000'),
  
  passing_score: z.number()
    .min(0, 'درجة النجاح لا يمكن أن تكون سالبة')
    .max(1000, 'درجة النجاح لا يمكن أن تتجاوز 1000'),
  
  start_date: z.string()
    .datetime('تاريخ البداية غير صحيح')
    .refine((date) => new Date(date) > new Date(), {
      message: 'تاريخ البداية يجب أن يكون في المستقبل'
    }),
  
  end_date: z.string()
    .datetime('تاريخ النهاية غير صحيح'),
  
  is_published: z.boolean().default(false),
  
  allow_retakes: z.boolean().default(false),
  
  max_attempts: z.number()
    .min(1, 'عدد المحاولات يجب أن يكون على الأقل 1')
    .max(10, 'عدد المحاولات لا يمكن أن يتجاوز 10')
    .default(1),
  
  shuffle_questions: z.boolean().default(false),
  
  show_results_immediately: z.boolean().default(false),
  
  show_correct_answers: z.boolean().default(false),
  
  allow_review: z.boolean().default(true),
  
  time_limit_per_question: z.number()
    .min(0, 'الحد الزمني لكل سؤال لا يمكن أن يكون سالب')
    .max(60, 'الحد الزمني لكل سؤال لا يمكن أن يتجاوز 60 دقيقة')
    .optional(),
  
  instructions: z.string()
    .min(10, 'التعليمات يجب أن تكون على الأقل 10 أحرف')
    .max(5000, 'التعليمات لا يمكن أن تتجاوز 5000 حرف')
    .optional(),
  
  total_questions: z.number()
    .min(1, 'عدد الأسئلة يجب أن يكون على الأقل 1')
    .max(200, 'عدد الأسئلة لا يمكن أن يتجاوز 200'),
}).refine((data) => {
  return new Date(data.start_date) < new Date(data.end_date)
}, {
  message: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية",
  path: ["start_date"],
}).refine((data) => {
  return data.passing_score <= data.max_score
}, {
  message: "درجة النجاح يجب أن تكون أقل من أو تساوي الدرجة القصوى",
  path: ["passing_score"],
})

// Exam update schema
export const examUpdateSchema = examCreateSchema.partial().omit({ course_id: true })

// Exam question schema
export const examQuestionSchema = z.object({
  exam_id: z.string()
    .uuid('معرف الاختبار غير صحيح'),
  
  question_text: z.string()
    .min(5, 'نص السؤال يجب أن يكون على الأقل 5 أحرف')
    .max(2000, 'نص السؤال لا يمكن أن يتجاوز 2000 حرف'),
  
  question_type: z.enum(['multiple_choice', 'true_false', 'short_answer', 'essay', 'matching'], {
    errorMap: () => ({ message: 'نوع السؤال غير صحيح' })
  }),
  
  points: z.number()
    .min(0.5, 'النقاط يجب أن تكون على الأقل 0.5')
    .max(100, 'النقاط لا يمكن أن تتجاوز 100'),
  
  options: z.array(z.object({
    text: z.string().min(1, 'نص الخيار مطلوب'),
    is_correct: z.boolean(),
    explanation: z.string().max(500, 'شرح الخيار لا يمكن أن يتجاوز 500 حرف').optional(),
  }))
    .min(2, 'يجب إضافة خيارين على الأقل')
    .max(10, 'لا يمكن إضافة أكثر من 10 خيارات')
    .optional(),
  
  correct_answer: z.string()
    .min(1, 'الإجابة الصحيحة مطلوبة')
    .max(1000, 'الإجابة الصحيحة لا يمكن أن تتجاوز 1000 حرف')
    .optional(),
  
  explanation: z.string()
    .max(1000, 'شرح الإجابة لا يمكن أن يتجاوز 1000 حرف')
    .optional(),
  
  order_index: z.number()
    .min(0, 'ترتيب السؤال لا يمكن أن يكون سالب')
    .max(1000, 'ترتيب السؤال لا يمكن أن يتجاوز 1000')
    .default(0),
  
  difficulty_level: z.enum(['easy', 'medium', 'hard'], {
    errorMap: () => ({ message: 'مستوى الصعوبة غير صحيح' })
  }).default('medium'),
  
  tags: z.array(z.string().min(1, 'الوسم مطلوب'))
    .max(10, 'لا يمكن إضافة أكثر من 10 وسوم')
    .optional(),
  
  image_url: z.string()
    .url('رابط الصورة غير صحيح')
    .optional(),
  
  audio_url: z.string()
    .url('رابط الصوت غير صحيح')
    .optional(),
}).refine((data) => {
  if (data.question_type === 'multiple_choice' || data.question_type === 'true_false') {
    return data.options && data.options.length >= 2
  }
  return true
}, {
  message: "الأسئلة متعددة الخيارات وصح وخطأ تحتاج إلى خيارات",
  path: ["options"],
}).refine((data) => {
  if (data.question_type === 'multiple_choice' || data.question_type === 'true_false') {
    return data.options && data.options.some(option => option.is_correct)
  }
  return true
}, {
  message: "يجب تحديد إجابة صحيحة واحدة على الأقل",
  path: ["options"],
})

// Exam attempt schema
export const examAttemptSchema = z.object({
  exam_id: z.string()
    .uuid('معرف الاختبار غير صحيح'),
  
  student_id: z.string()
    .uuid('معرف الطالب غير صحيح'),
  
  attempt_number: z.number()
    .min(1, 'رقم المحاولة يجب أن يكون على الأقل 1')
    .max(10, 'رقم المحاولة لا يمكن أن يتجاوز 10')
    .default(1),
  
  answers: z.array(z.object({
    question_id: z.string().uuid('معرف السؤال غير صحيح'),
    answer: z.string().min(1, 'الإجابة مطلوبة'),
    time_spent_seconds: z.number().min(0, 'الوقت المستغرق لا يمكن أن يكون سالب').optional(),
  }))
    .optional(),
  
  time_spent_minutes: z.number()
    .min(0, 'الوقت المستغرق لا يمكن أن يكون سالب')
    .optional(),
  
  status: z.enum(['in_progress', 'completed', 'abandoned'], {
    errorMap: () => ({ message: 'حالة المحاولة غير صحيحة' })
  }).default('in_progress'),
})

// Exam search/filter schema
export const examSearchSchema = z.object({
  course_id: z.string()
    .uuid('معرف الدورة غير صحيح')
    .optional(),
  
  exam_type: z.enum(['quiz', 'midterm', 'final', 'practice'])
    .optional(),
  
  status: z.enum(['upcoming', 'active', 'completed', 'expired'])
    .optional(),
  
  is_published: z.boolean().optional(),
  
  start_date_from: z.string()
    .datetime('تاريخ البداية غير صحيح')
    .optional(),
  
  start_date_to: z.string()
    .datetime('تاريخ النهاية غير صحيح')
    .optional(),
  
  sort_by: z.enum(['title', 'start_date', 'created_at', 'max_score'])
    .default('start_date'),
  
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
  if (data.start_date_from && data.start_date_to) {
    return new Date(data.start_date_from) <= new Date(data.start_date_to)
  }
  return true
}, {
  message: "تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية",
  path: ["start_date_from"],
})

// Question bank schema
export const questionBankSchema = z.object({
  teacher_id: z.string()
    .uuid('معرف المعلم غير صحيح'),
  
  category: z.string()
    .min(2, 'التصنيف يجب أن يكون على الأقل حرفين')
    .max(100, 'التصنيف لا يمكن أن يتجاوز 100 حرف'),
  
  question_text: z.string()
    .min(5, 'نص السؤال يجب أن يكون على الأقل 5 أحرف')
    .max(2000, 'نص السؤال لا يمكن أن يتجاوز 2000 حرف'),
  
  question_type: z.enum(['multiple_choice', 'true_false', 'short_answer', 'essay', 'matching'], {
    errorMap: () => ({ message: 'نوع السؤال غير صحيح' })
  }),
  
  options: z.array(z.object({
    text: z.string().min(1, 'نص الخيار مطلوب'),
    is_correct: z.boolean(),
    explanation: z.string().max(500, 'شرح الخيار لا يمكن أن يتجاوز 500 حرف').optional(),
  }))
    .min(2, 'يجب إضافة خيارين على الأقل')
    .max(10, 'لا يمكن إضافة أكثر من 10 خيارات')
    .optional(),
  
  correct_answer: z.string()
    .min(1, 'الإجابة الصحيحة مطلوبة')
    .max(1000, 'الإجابة الصحيحة لا يمكن أن تتجاوز 1000 حرف')
    .optional(),
  
  explanation: z.string()
    .max(1000, 'شرح الإجابة لا يمكن أن يتجاوز 1000 حرف')
    .optional(),
  
  difficulty_level: z.enum(['easy', 'medium', 'hard'], {
    errorMap: () => ({ message: 'مستوى الصعوبة غير صحيح' })
  }).default('medium'),
  
  tags: z.array(z.string().min(1, 'الوسم مطلوب'))
    .max(10, 'لا يمكن إضافة أكثر من 10 وسوم')
    .optional(),
  
  is_public: z.boolean().default(false),
  
  image_url: z.string()
    .url('رابط الصورة غير صحيح')
    .optional(),
  
  audio_url: z.string()
    .url('رابط الصوت غير صحيح')
    .optional(),
}).refine((data) => {
  if (data.question_type === 'multiple_choice' || data.question_type === 'true_false') {
    return data.options && data.options.length >= 2
  }
  return true
}, {
  message: "الأسئلة متعددة الخيارات وصح وخطأ تحتاج إلى خيارات",
  path: ["options"],
}).refine((data) => {
  if (data.question_type === 'multiple_choice' || data.question_type === 'true_false') {
    return data.options && data.options.some(option => option.is_correct)
  }
  return true
}, {
  message: "يجب تحديد إجابة صحيحة واحدة على الأقل",
  path: ["options"],
})

// Export types
export type ExamCreateInput = z.infer<typeof examCreateSchema>
export type ExamUpdateInput = z.infer<typeof examUpdateSchema>
export type ExamQuestionInput = z.infer<typeof examQuestionSchema>
export type ExamAttemptInput = z.infer<typeof examAttemptSchema>
export type ExamSearchInput = z.infer<typeof examSearchSchema>
export type QuestionBankInput = z.infer<typeof questionBankSchema>

