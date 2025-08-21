-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(20),
    bio TEXT,
    location VARCHAR(255),
    website VARCHAR(255),
    specialization VARCHAR(255),
    experience_years INTEGER DEFAULT 0,
    education VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    thumbnail_url TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    category VARCHAR(100),
    language VARCHAR(50) DEFAULT 'Arabic',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_free BOOLEAN DEFAULT false,
    duration_hours INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    certificate_url TEXT,
    UNIQUE(course_id, student_id)
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    unit_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT,
    content TEXT,
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL,
    is_free BOOLEAN DEFAULT false,
    resources_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lesson_progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    watch_time_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lesson_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_student_id ON lesson_progress(student_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add missing columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS education VARCHAR(255);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic examples - adjust based on your needs)
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow authenticated users to view published courses
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (status = 'published');

-- Allow authenticated users to view their own courses (for teachers)
CREATE POLICY "Users can view their own courses" ON courses FOR SELECT USING (teacher_id::text = auth.uid()::text);

-- Allow authenticated users to create courses (they will be the teacher)
CREATE POLICY "Authenticated users can create courses" ON courses FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own courses
CREATE POLICY "Users can update their own courses" ON courses FOR UPDATE USING (teacher_id::text = auth.uid()::text);

CREATE POLICY "Students can view their enrollments" ON course_enrollments FOR SELECT USING (student_id::text = auth.uid()::text);
CREATE POLICY "Students can enroll in courses" ON course_enrollments FOR INSERT WITH CHECK (student_id::text = auth.uid()::text);

-- Allow viewing lessons of published courses
CREATE POLICY "Anyone can view lessons of published courses" ON lessons FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.status = 'published')
);

-- Allow viewing lessons of user's own courses
CREATE POLICY "Users can view lessons of their courses" ON lessons FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.teacher_id::text = auth.uid()::text)
);

-- Allow authenticated users to create lessons
CREATE POLICY "Authenticated users can create lessons" ON lessons FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update lessons in their courses
CREATE POLICY "Users can update lessons in their courses" ON lessons FOR UPDATE USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.teacher_id::text = auth.uid()::text)
);

CREATE POLICY "Students can view their own progress" ON lesson_progress FOR SELECT USING (student_id::text = auth.uid()::text);
CREATE POLICY "Students can update their own progress" ON lesson_progress FOR UPDATE USING (student_id::text = auth.uid()::text);
CREATE POLICY "Students can insert their own progress" ON lesson_progress FOR INSERT WITH CHECK (student_id::text = auth.uid()::text);

-- Lesson progress tracking
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Student notes
CREATE TABLE IF NOT EXISTS student_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method VARCHAR(50), -- stripe, paymob, fawry
  payment_intent_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments/Discussions
CREATE TABLE IF NOT EXISTS lesson_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES lesson_comments(id) ON DELETE CASCADE, -- For replies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course categories
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category_id to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES course_categories(id);

-- Student achievements/badges
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL, -- course_completed, lessons_watched, etc.
  achievement_data JSONB, -- Additional data about the achievement
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teacher analytics
CREATE TABLE IF NOT EXISTS teacher_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  total_students INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  average_completion_rate DECIMAL(5,2) DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, course_id, date)
);

-- Insert default categories
INSERT INTO course_categories (name, description, color) VALUES
  ('برمجة', 'دورات البرمجة والتطوير', '#3B82F6'),
  ('تصميم', 'دورات التصميم والفنون', '#10B981'),
  ('أعمال', 'دورات إدارة الأعمال والتسويق', '#F59E0B'),
  ('لغات', 'دورات تعلم اللغات', '#EF4444'),
  ('موسيقى', 'دورات الموسيقى والفنون الصوتية', '#8B5CF6'),
  ('رياضة', 'دورات اللياقة البدنية والصحة', '#06B6D4');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_notes_user_lesson ON student_notes(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_course ON payments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson ON lesson_comments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_teacher_analytics_teacher_date ON teacher_analytics(teacher_id, date);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_teacher_id ON tasks(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tasks_course_id ON tasks(course_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- RLS for tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policies for tasks
CREATE POLICY "Teachers can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = teacher_id);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  course_notifications BOOLEAN DEFAULT true,
  student_notifications BOOLEAN DEFAULT true,
  task_reminders BOOLEAN DEFAULT true,
  language VARCHAR(10) DEFAULT 'ar',
  theme VARCHAR(10) DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes for user_settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- RLS for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies for user_settings
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);
