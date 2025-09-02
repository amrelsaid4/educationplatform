-- Create real users profiles in users table
-- This script creates user profiles for existing auth.users

-- First, let's check what users exist in auth.users
SELECT id, email, raw_user_meta_data FROM auth.users;

-- Create user profiles for existing auth users
INSERT INTO public.users (id, name, email, role, password_hash, is_active, email_verified, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', SPLIT_PART(au.email, '@', 1), 'مستخدم جديد'),
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'student'),
  'supabase_auth_user',
  true,
  COALESCE(au.email_confirmed_at IS NOT NULL, false),
  COALESCE(au.created_at, now()),
  now()
FROM auth.users au
WHERE au.email LIKE 'amrelsaid6288+%'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  email_verified = EXCLUDED.email_verified,
  updated_at = now();

-- Create user profiles for any other existing auth users
INSERT INTO public.users (id, name, email, role, password_hash, is_active, email_verified, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', SPLIT_PART(au.email, '@', 1), 'مستخدم جديد'),
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'student'),
  'supabase_auth_user',
  true,
  COALESCE(au.email_confirmed_at IS NOT NULL, false),
  COALESCE(au.created_at, now()),
  now()
FROM auth.users au
WHERE au.email NOT LIKE 'amrelsaid6288+%'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  email_verified = EXCLUDED.email_verified,
  updated_at = now();

-- Show created users
SELECT id, name, email, role, is_active, email_verified FROM public.users ORDER BY created_at DESC;






