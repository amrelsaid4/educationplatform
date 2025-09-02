-- Supabase Auth Setup
-- This file contains the necessary setup for Supabase Auth

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, password_hash, is_active, email_verified, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'مستخدم جديد'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    'supabase_auth_user',
    true,
    COALESCE(new.email_confirmed_at IS NOT NULL, false),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
BEGIN
  UPDATE public.users
  SET 
    name = COALESCE(new.raw_user_meta_data->>'name', users.name),
    email = COALESCE(new.email, users.email),
    role = COALESCE(new.raw_user_meta_data->>'role', users.role),
    email_verified = COALESCE(new.email_confirmed_at IS NOT NULL, users.email_verified),
    updated_at = now()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_update();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.courses TO anon, authenticated;
GRANT ALL ON public.course_enrollments TO anon, authenticated;
GRANT ALL ON public.lessons TO anon, authenticated;
GRANT ALL ON public.lesson_progress TO anon, authenticated;






