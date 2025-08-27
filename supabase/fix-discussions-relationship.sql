-- Fix Discussions Table Relationship Issue
-- This file fixes the relationship conflict in the discussions table

-- =====================================================
-- 1. FIX DISCUSSIONS TABLE RELATIONSHIP
-- =====================================================

-- First, let's check the current structure of discussions table
-- The issue is that we have both 'user_id' and 'author_id' pointing to users table
-- We need to standardize on one column

-- Drop the conflicting foreign key constraint for user_id
ALTER TABLE discussions DROP CONSTRAINT IF EXISTS discussions_user_id_fkey;

-- Remove the user_id column since we're using author_id
ALTER TABLE discussions DROP COLUMN IF EXISTS user_id;

-- Ensure author_id is properly set as NOT NULL
ALTER TABLE discussions ALTER COLUMN author_id SET NOT NULL;

-- Add unique constraint to prevent duplicate likes
ALTER TABLE discussion_likes ADD CONSTRAINT IF NOT EXISTS discussion_likes_unique UNIQUE (discussion_id, user_id);

-- Add unique constraint to prevent duplicate views
ALTER TABLE discussion_views ADD CONSTRAINT IF NOT EXISTS discussion_views_unique UNIQUE (discussion_id, user_id);

-- =====================================================
-- 2. CREATE SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample discussions (only if no discussions exist)
INSERT INTO discussions (id, course_id, title, content, author_id, views_count, likes_count) 
SELECT 
  gen_random_uuid(), 
  c.id, 
  'سؤال حول الدرس الثالث في البرمجة', 
  'أحتاج مساعدة في فهم مفهوم الـ loops في JavaScript. هل يمكن لأحد شرحه لي؟', 
  s.id, 
  15, 
  2
FROM courses c, users s 
WHERE s.role = 'student' 
AND NOT EXISTS (SELECT 1 FROM discussions LIMIT 1)
LIMIT 1;

INSERT INTO discussions (id, course_id, title, content, author_id, views_count, likes_count) 
SELECT 
  gen_random_uuid(), 
  c.id, 
  'مشاركة مشروعي النهائي', 
  'أريد مشاركة مشروعي النهائي معكم. هل يمكنكم إعطائي نصائح للتحسين؟', 
  s.id, 
  28, 
  8
FROM courses c, users s 
WHERE s.role = 'student' 
AND NOT EXISTS (SELECT 1 FROM discussions WHERE title = 'مشاركة مشروعي النهائي')
LIMIT 1;

-- Insert sample assignments (only if no assignments exist)
INSERT INTO assignments (id, course_id, teacher_id, title, description, assignment_type, max_score, due_date, instructions, is_published)
SELECT 
  gen_random_uuid(), 
  c.id, 
  t.id, 
  'واجب البرمجة الأساسية', 
  'قم بإنشاء برنامج بسيط باستخدام JavaScript', 
  'homework', 
  100, 
  NOW() + INTERVAL '7 days', 
  'اكتب كود JavaScript يقوم بحساب مجموع الأرقام من 1 إلى 10', 
  true
FROM courses c, users t 
WHERE t.role = 'teacher' 
AND NOT EXISTS (SELECT 1 FROM assignments LIMIT 1)
LIMIT 1;

-- Insert sample exams (only if no exams exist)
INSERT INTO exams (id, course_id, teacher_id, title, description, duration_minutes, max_score, passing_score, start_date, end_date, is_published)
SELECT 
  gen_random_uuid(), 
  c.id, 
  t.id, 
  'امتحان البرمجة الأساسية', 
  'امتحان في أساسيات البرمجة', 
  60, 
  100, 
  60, 
  NOW(), 
  NOW() + INTERVAL '30 days', 
  true
FROM courses c, users t 
WHERE t.role = 'teacher' 
AND NOT EXISTS (SELECT 1 FROM exams LIMIT 1)
LIMIT 1;

-- Insert sample question bank categories (only if no categories exist)
INSERT INTO question_bank_categories (id, teacher_id, name, description, color)
SELECT 
  gen_random_uuid(), 
  t.id, 
  'البرمجة الأساسية', 
  'أسئلة في أساسيات البرمجة', 
  '#3B82F6'
FROM users t 
WHERE t.role = 'teacher' 
AND NOT EXISTS (SELECT 1 FROM question_bank_categories WHERE name = 'البرمجة الأساسية')
LIMIT 1;

INSERT INTO question_bank_categories (id, teacher_id, name, description, color)
SELECT 
  gen_random_uuid(), 
  t.id, 
  'JavaScript', 
  'أسئلة في JavaScript', 
  '#10B981'
FROM users t 
WHERE t.role = 'teacher' 
AND NOT EXISTS (SELECT 1 FROM question_bank_categories WHERE name = 'JavaScript')
LIMIT 1;

-- Insert sample questions (only if no questions exist)
INSERT INTO question_bank (id, teacher_id, question_text, question_type, options, correct_answer, explanation, difficulty_level, tags, is_public, category_id)
SELECT 
  gen_random_uuid(), 
  t.id, 
  'ما هو نوع البيانات المستخدم لتخزين النصوص في JavaScript؟', 
  'multiple_choice', 
  '[{"text": "string", "is_correct": true}, {"text": "number", "is_correct": false}, {"text": "boolean", "is_correct": false}, {"text": "array", "is_correct": false}]', 
  'string', 
  'في JavaScript، يتم استخدام نوع البيانات string لتخزين النصوص', 
  'easy', 
  ARRAY['javascript', 'data-types'], 
  true, 
  qbc.id
FROM users t, question_bank_categories qbc
WHERE t.role = 'teacher' 
AND qbc.name = 'JavaScript'
AND NOT EXISTS (SELECT 1 FROM question_bank WHERE question_text LIKE '%نوع البيانات%')
LIMIT 1;

-- =====================================================
-- 3. VERIFICATION QUERIES
-- =====================================================

-- Check discussions table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'discussions' 
ORDER BY ordinal_position;

-- Check if discussions have proper author_id
SELECT id, title, author_id, 
       (SELECT name FROM users WHERE id = discussions.author_id) as author_name
FROM discussions 
LIMIT 5;

-- Count records in each table
SELECT 'discussions' as table_name, COUNT(*) as row_count FROM discussions
UNION ALL
SELECT 'assignments' as table_name, COUNT(*) as row_count FROM assignments
UNION ALL
SELECT 'exams' as table_name, COUNT(*) as row_count FROM exams
UNION ALL
SELECT 'question_bank' as table_name, COUNT(*) as row_count FROM question_bank
UNION ALL
SELECT 'question_bank_categories' as table_name, COUNT(*) as row_count FROM question_bank_categories;
