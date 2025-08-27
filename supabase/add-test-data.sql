-- Add test data for testing the messaging system
-- This file adds sample students, courses, and enrollments for testing

-- First, let's check if we have any existing data
SELECT 'Current users count:' as info, COUNT(*) as count FROM users;
SELECT 'Current courses count:' as info, COUNT(*) as count FROM courses;
SELECT 'Current enrollments count:' as info, COUNT(*) as count FROM course_enrollments;

-- Add test students if they don't exist
INSERT INTO users (id, name, email, role) 
VALUES 
  ('test-student-1', 'أحمد محمد', 'ahmed@test.com', 'student'),
  ('test-student-2', 'فاطمة علي', 'fatima@test.com', 'student'),
  ('test-student-3', 'محمد حسن', 'mohamed@test.com', 'student')
ON CONFLICT (id) DO NOTHING;

-- Add test teacher if doesn't exist
INSERT INTO users (id, name, email, role) 
VALUES ('test-teacher-1', 'أستاذ تجريبي', 'teacher@test.com', 'teacher')
ON CONFLICT (id) DO NOTHING;

-- Add test course if doesn't exist
INSERT INTO courses (id, title, description, teacher_id, status, price) 
VALUES ('test-course-1', 'كورس تجريبي', 'كورس للاختبار فقط', 'test-teacher-1', 'published', 0)
ON CONFLICT (id) DO NOTHING;

-- Add test enrollments
INSERT INTO course_enrollments (id, course_id, student_id, enrolled_at) 
VALUES 
  ('test-enrollment-1', 'test-course-1', 'test-student-1', NOW()),
  ('test-enrollment-2', 'test-course-1', 'test-student-2', NOW()),
  ('test-enrollment-3', 'test-course-1', 'test-student-3', NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify the data was added
SELECT 'After adding test data:' as info;
SELECT 'Users count:' as info, COUNT(*) as count FROM users;
SELECT 'Courses count:' as info, COUNT(*) as count FROM courses;
SELECT 'Enrollments count:' as info, COUNT(*) as count FROM course_enrollments;

-- Show teacher's courses
SELECT 'Teacher courses:' as info;
SELECT c.id, c.title, c.teacher_id 
FROM courses c 
WHERE c.teacher_id = 'test-teacher-1';

-- Show students enrolled in teacher's courses
SELECT 'Students enrolled in teacher courses:' as info;
SELECT 
  u.id as student_id,
  u.name as student_name,
  u.email as student_email,
  c.title as course_title
FROM course_enrollments ce
JOIN users u ON ce.student_id = u.id
JOIN courses c ON ce.course_id = c.id
WHERE c.teacher_id = 'test-teacher-1';

-- Test the exact query that the frontend uses
SELECT 'Testing frontend query:' as info;
WITH teacher_courses AS (
  SELECT id FROM courses WHERE teacher_id = 'test-teacher-1'
)
SELECT 
  ce.student_id,
  u.id,
  u.name,
  u.email
FROM course_enrollments ce
JOIN users u ON ce.student_id = u.id
WHERE ce.course_id IN (SELECT id FROM teacher_courses);

-- Add test data for assignments and exams

-- First, let's add some test assignments
INSERT INTO assignments (
  id,
  title,
  description,
  course_id,
  teacher_id,
  assignment_type,
  max_score,
  due_date,
  instructions,
  is_published
) VALUES 
(
  gen_random_uuid(),
  'واجب البرمجة الأساسية',
  'واجب شامل على أساسيات البرمجة في JavaScript',
  (SELECT id FROM courses LIMIT 1),
  (SELECT id FROM users WHERE role = 'teacher' LIMIT 1),
  'homework',
  100,
  NOW() + INTERVAL '7 days',
  'قم بحل التمارين التالية:

1. اكتب دالة لحساب مجموع الأرقام من 1 إلى n
2. اكتب دالة للتحقق من أن الرقم أولي أم لا
3. اكتب دالة لعكس النص

يجب أن تكون الحلول واضحة ومعلقة بالكود.',
  true
),
(
  gen_random_uuid(),
  'مشروع تطوير الويب',
  'مشروع تطوير موقع ويب بسيط باستخدام HTML و CSS',
  (SELECT id FROM courses LIMIT 1),
  (SELECT id FROM users WHERE role = 'teacher' LIMIT 1),
  'project',
  150,
  NOW() + INTERVAL '14 days',
  'قم بتطوير موقع ويب بسيط يتضمن:

1. صفحة رئيسية مع قائمة تنقل
2. صفحة "حول" تحتوي على معلومات عنك
3. صفحة "اتصل بنا" مع نموذج اتصال
4. تصميم متجاوب يعمل على جميع الأجهزة

يجب أن يكون التصميم جميل ومتجاوب.',
  true
),
(
  gen_random_uuid(),
  'اختبار قواعد البيانات',
  'اختبار قصير على أساسيات قواعد البيانات',
  (SELECT id FROM courses LIMIT 1),
  (SELECT id FROM users WHERE role = 'teacher' LIMIT 1),
  'quiz',
  50,
  NOW() + INTERVAL '3 days',
  'أجب على الأسئلة التالية:

1. ما هو الفرق بين SELECT و INSERT؟
2. اشرح مفهوم المفاتيح الأساسية
3. ما هي أنواع العلاقات في قواعد البيانات؟

اكتب إجاباتك بشكل واضح ومفصل.',
  true
);

-- Now let's add some test exams
INSERT INTO exams (
  id,
  title,
  description,
  course_id,
  teacher_id,
  exam_type,
  duration_minutes,
  max_score,
  passing_score,
  start_date,
  end_date,
  is_published,
  allow_retakes,
  max_attempts
) VALUES 
(
  gen_random_uuid(),
  'امتحان منتصف الفصل - البرمجة',
  'امتحان شامل على المحتوى المغطى حتى الآن في دورة البرمجة',
  (SELECT id FROM courses LIMIT 1),
  (SELECT id FROM users WHERE role = 'teacher' LIMIT 1),
  'midterm',
  90,
  100,
  70,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '7 days',
  true,
  true,
  2
),
(
  gen_random_uuid(),
  'اختبار نهائي - تطوير الويب',
  'الاختبار النهائي لدورة تطوير الويب',
  (SELECT id FROM courses LIMIT 1),
  (SELECT id FROM users WHERE role = 'teacher' LIMIT 1),
  'final',
  120,
  100,
  60,
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '10 days',
  true,
  false,
  1
);

-- Add some exam questions
INSERT INTO exam_questions (
  id,
  exam_id,
  question_text,
  question_type,
  points,
  options,
  correct_answer,
  explanation
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM exams WHERE title LIKE '%منتصف الفصل%' LIMIT 1),
  'ما هو النوع الصحيح لتعريف متغير في JavaScript؟',
  'multiple_choice',
  10,
  '[{"text": "var x = 5;", "is_correct": true}, {"text": "int x = 5;", "is_correct": false}, {"text": "string x = 5;", "is_correct": false}, {"text": "number x = 5;", "is_correct": false}]',
  'var x = 5;',
  'في JavaScript، نستخدم var أو let أو const لتعريف المتغيرات، وليس أنواع البيانات الصريحة مثل int أو string.'
),
(
  gen_random_uuid(),
  (SELECT id FROM exams WHERE title LIKE '%منتصف الفصل%' LIMIT 1),
  'ما هي الدالة المستخدمة لطباعة النص في JavaScript؟',
  'multiple_choice',
  10,
  '[{"text": "print()", "is_correct": false}, {"text": "console.log()", "is_correct": true}, {"text": "echo()", "is_correct": false}, {"text": "printf()", "is_correct": false}]',
  'console.log()',
  'console.log() هي الدالة القياسية في JavaScript لطباعة النص في وحدة التحكم.'
),
(
  gen_random_uuid(),
  (SELECT id FROM exams WHERE title LIKE '%منتصف الفصل%' LIMIT 1),
  'اكتب دالة لحساب مجموع رقمين في JavaScript',
  'essay',
  20,
  NULL,
  'function add(a, b) { return a + b; }',
  'الدالة تأخذ معاملين وتعيد مجموعهما باستخدام عامل الجمع +.'
);

-- Make sure we have some course enrollments for testing
INSERT INTO course_enrollments (
  id,
  course_id,
  student_id,
  enrolled_at,
  progress
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM courses LIMIT 1),
  (SELECT id FROM users WHERE role = 'student' LIMIT 1),
  NOW(),
  25
)
ON CONFLICT (course_id, student_id) DO NOTHING;
