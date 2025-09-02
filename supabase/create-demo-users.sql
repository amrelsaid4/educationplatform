-- Create demo users in Supabase Auth
-- This script should be run in the Supabase SQL editor

-- First, let's create the users in auth.users table
-- Note: In Supabase, you should create users through the Auth UI or API
-- This is just for reference

-- Demo Admin User (you need to create this through Supabase Auth UI)
-- Email: admin@edu.com
-- Password: admin123
-- Role: admin

-- Demo Teacher User (you need to create this through Supabase Auth UI)
-- Email: teacher@edu.com  
-- Password: teacher123
-- Role: teacher

-- Demo Student User (you need to create this through Supabase Auth UI)
-- Email: student@edu.com
-- Password: student123
-- Role: student

-- After creating users in Supabase Auth, run this to create profiles in our users table:

-- Create user profiles in our users table
INSERT INTO public.users (id, name, email, role, password_hash, is_active, email_verified, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', 'مستخدم جديد'),
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'student'),
  'supabase_auth_user',
  true,
  COALESCE(au.email_confirmed_at IS NOT NULL, false),
  now(),
  now()
FROM auth.users au
WHERE au.email IN ('admin@edu.com', 'teacher@edu.com', 'student@edu.com')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  email_verified = EXCLUDED.email_verified,
  updated_at = now();

-- Create demo courses
INSERT INTO courses (id, title, description, teacher_id, price, level, category, language, status, is_free, duration_hours, total_lessons, created_at, updated_at)
SELECT 
  '550e8400-e29b-41d4-a716-446655440101',
  'مقدمة في البرمجة',
  'دورة تعليمية شاملة في أساسيات البرمجة للمبتدئين',
  u.id,
  0,
  'beginner',
  'برمجة',
  'Arabic',
  'published',
  true,
  20,
  15,
  now(),
  now()
FROM users u
WHERE u.email = 'teacher@edu.com'
ON CONFLICT (id) DO NOTHING;

-- Create demo course enrollment
INSERT INTO course_enrollments (id, course_id, student_id, enrolled_at, progress)
SELECT 
  '550e8400-e29b-41d4-a716-446655440201',
  '550e8400-e29b-41d4-a716-446655440101',
  u.id,
  now(),
  0
FROM users u
WHERE u.email = 'student@edu.com'
ON CONFLICT (course_id, student_id) DO NOTHING;






