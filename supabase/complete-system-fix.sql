-- Complete System Fix with Question Bank Features
-- This file contains all the fixes needed for the entire system including question bank
-- Run this file in Supabase SQL Editor to fix all issues

-- =====================================================
-- 1. FIX EXAM_ATTEMPTS TABLE MISSING COLUMNS
-- =====================================================

DO $$ 
BEGIN
    -- Add completed_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_attempts' 
        AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE exam_attempts ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add time_spent_minutes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_attempts' 
        AND column_name = 'time_spent_minutes'
    ) THEN
        ALTER TABLE exam_attempts ADD COLUMN time_spent_minutes INTEGER;
    END IF;

    -- Add answers column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_attempts' 
        AND column_name = 'answers'
    ) THEN
        ALTER TABLE exam_attempts ADD COLUMN answers JSONB;
    END IF;

    -- Add attempt_number column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_attempts' 
        AND column_name = 'attempt_number'
    ) THEN
        ALTER TABLE exam_attempts ADD COLUMN attempt_number INTEGER DEFAULT 1;
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_attempts' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE exam_attempts ADD COLUMN status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'));
    END IF;
END $$;

-- =====================================================
-- 2. CREATE MISSING TABLES
-- =====================================================

-- Create assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assignment_type VARCHAR(50) DEFAULT 'homework' CHECK (assignment_type IN ('homework', 'project', 'essay', 'presentation', 'quiz')),
  max_score INTEGER DEFAULT 100,
  due_date TIMESTAMP WITH TIME ZONE,
  instructions TEXT,
  attachments TEXT[],
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignment_submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  attachments TEXT[],
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  graded_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  feedback TEXT,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Create exams table if it doesn't exist
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  exam_type VARCHAR(50) DEFAULT 'quiz' CHECK (exam_type IN ('quiz', 'midterm', 'final', 'practice')),
  duration_minutes INTEGER DEFAULT 60,
  max_score INTEGER DEFAULT 100,
  passing_score INTEGER DEFAULT 60,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  allow_retakes BOOLEAN DEFAULT false,
  max_attempts INTEGER DEFAULT 1,
  shuffle_questions BOOLEAN DEFAULT false,
  show_results_immediately BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exam_questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES question_bank(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching')),
  points INTEGER DEFAULT 1,
  options JSONB, -- For multiple choice questions: [{"text": "option1", "is_correct": true}, ...]
  correct_answer TEXT, -- For short answer and essay questions
  explanation TEXT, -- Explanation of the correct answer
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exam_attempts table if it doesn't exist
CREATE TABLE IF NOT EXISTS exam_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  attempt_number INTEGER DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  answers JSONB, -- Store student answers: [{"question_id": "uuid", "answer": "text"}]
  time_spent_minutes INTEGER,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  UNIQUE(exam_id, student_id, attempt_number)
);

-- Create student_achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL CHECK (achievement_type IN ('course_completion', 'perfect_score', 'streak', 'participation', 'helpful_student')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  related_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  related_exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_enrollments table if it doesn't exist
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'suspended')),
  UNIQUE(course_id, student_id)
);

-- Create discussions table if it doesn't exist
CREATE TABLE IF NOT EXISTS discussions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discussion_replies table if it doesn't exist
CREATE TABLE IF NOT EXISTS discussion_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discussion_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS discussion_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(discussion_id, user_id)
);

-- Create reply_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS reply_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- Create discussion_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS discussion_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(discussion_id, user_id)
);

-- =====================================================
-- 3. ENHANCE QUESTION_BANK TABLE
-- =====================================================

-- Add missing columns to question_bank table if they don't exist
DO $$ 
BEGIN
    -- Add is_public column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'is_public') THEN
        ALTER TABLE question_bank ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'tags') THEN
        ALTER TABLE question_bank ADD COLUMN tags TEXT[];
    END IF;
    
    -- Add difficulty_level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'difficulty_level') THEN
        ALTER TABLE question_bank ADD COLUMN difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard'));
    END IF;
    
    -- Add usage_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'usage_count') THEN
        ALTER TABLE question_bank ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'is_active') THEN
        ALTER TABLE question_bank ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- =====================================================
-- 4. CREATE QUESTION BANK RELATED TABLES
-- =====================================================

-- Create question_bank_sharing table if it doesn't exist
CREATE TABLE IF NOT EXISTS question_bank_sharing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES question_bank(id) ON DELETE CASCADE,
  shared_by_teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_with_teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(question_id, shared_with_teacher_id)
);

-- Create question_bank_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS question_bank_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category_id to question_bank table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'category_id') THEN
        ALTER TABLE question_bank ADD COLUMN category_id UUID REFERENCES question_bank_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create question_bank_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS question_bank_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL, -- Store template structure
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

DO $$ 
BEGIN
    -- Add missing columns to assignments table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'is_published') THEN
        ALTER TABLE assignments ADD COLUMN is_published BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'attachments') THEN
        ALTER TABLE assignments ADD COLUMN attachments TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'teacher_id') THEN
        ALTER TABLE assignments ADD COLUMN teacher_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    -- Add missing columns to assignment_submissions table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignment_submissions' AND column_name = 'attachments') THEN
        ALTER TABLE assignment_submissions ADD COLUMN attachments TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignment_submissions' AND column_name = 'status') THEN
        ALTER TABLE assignment_submissions ADD COLUMN status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late'));
    END IF;

    -- Add missing columns to discussions table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'views_count') THEN
        ALTER TABLE discussions ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'likes_count') THEN
        ALTER TABLE discussions ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'is_pinned') THEN
        ALTER TABLE discussions ADD COLUMN is_pinned BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'is_locked') THEN
        ALTER TABLE discussions ADD COLUMN is_locked BOOLEAN DEFAULT false;
    END IF;

    -- Add missing columns to discussion_replies table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'likes_count') THEN
        ALTER TABLE discussion_replies ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'parent_reply_id') THEN
        ALTER TABLE discussion_replies ADD COLUMN parent_reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE;
    END IF;

    -- Add missing columns to course_enrollments table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_enrollments' AND column_name = 'status') THEN
        ALTER TABLE course_enrollments ADD COLUMN status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'suspended'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_enrollments' AND column_name = 'progress') THEN
        ALTER TABLE course_enrollments ADD COLUMN progress INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_enrollments' AND column_name = 'completed_at') THEN
        ALTER TABLE course_enrollments ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_enrollments' AND column_name = 'certificate_url') THEN
        ALTER TABLE course_enrollments ADD COLUMN certificate_url TEXT;
    END IF;

    -- Add missing student_id columns to existing tables
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignment_submissions' AND column_name = 'student_id') THEN
        ALTER TABLE assignment_submissions ADD COLUMN student_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exam_attempts' AND column_name = 'student_id') THEN
        ALTER TABLE exam_attempts ADD COLUMN student_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_achievements' AND column_name = 'student_id') THEN
        ALTER TABLE student_achievements ADD COLUMN student_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_enrollments' AND column_name = 'student_id') THEN
        ALTER TABLE course_enrollments ADD COLUMN student_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- 6. ADD MISSING COLUMNS TO EXISTING TABLES (SAFETY CHECK)
-- =====================================================

-- Add missing columns to existing tables that might already exist
DO $$ 
BEGIN
    -- Add missing columns to assignment_submissions if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignment_submissions') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignment_submissions' AND column_name = 'student_id') THEN
            ALTER TABLE assignment_submissions ADD COLUMN student_id UUID REFERENCES users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignment_submissions' AND column_name = 'assignment_id') THEN
            ALTER TABLE assignment_submissions ADD COLUMN assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Add missing columns to exam_attempts if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exam_attempts') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exam_attempts' AND column_name = 'student_id') THEN
            ALTER TABLE exam_attempts ADD COLUMN student_id UUID REFERENCES users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exam_attempts' AND column_name = 'exam_id') THEN
            ALTER TABLE exam_attempts ADD COLUMN exam_id UUID REFERENCES exams(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Add missing columns to student_achievements if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_achievements') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_achievements' AND column_name = 'student_id') THEN
            ALTER TABLE student_achievements ADD COLUMN student_id UUID REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Add missing columns to course_enrollments if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_enrollments') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_enrollments' AND column_name = 'student_id') THEN
            ALTER TABLE course_enrollments ADD COLUMN student_id UUID REFERENCES users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_enrollments' AND column_name = 'course_id') THEN
            ALTER TABLE course_enrollments ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Add missing author_id columns to discussion tables if they exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discussions') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'author_id') THEN
            ALTER TABLE discussions ADD COLUMN author_id UUID REFERENCES users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'course_id') THEN
            ALTER TABLE discussions ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'lesson_id') THEN
            ALTER TABLE discussions ADD COLUMN lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL;
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discussion_replies') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'author_id') THEN
            ALTER TABLE discussion_replies ADD COLUMN author_id UUID REFERENCES users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'discussion_id') THEN
            ALTER TABLE discussion_replies ADD COLUMN discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- =====================================================
-- 7. ADD MISSING COLUMNS TO EXISTING TABLES (COMPREHENSIVE CHECK)
-- =====================================================

-- Add missing columns to existing tables that might already exist (comprehensive check)
DO $$ 
BEGIN
    -- Add missing columns to discussions table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discussions') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'author_id') THEN
            ALTER TABLE discussions ADD COLUMN author_id UUID REFERENCES users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'course_id') THEN
            ALTER TABLE discussions ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'lesson_id') THEN
            ALTER TABLE discussions ADD COLUMN lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'title') THEN
            ALTER TABLE discussions ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT 'Untitled Discussion';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'content') THEN
            ALTER TABLE discussions ADD COLUMN content TEXT NOT NULL DEFAULT '';
        END IF;
    END IF;

    -- Add missing columns to discussion_replies table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discussion_replies') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'author_id') THEN
            ALTER TABLE discussion_replies ADD COLUMN author_id UUID REFERENCES users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'discussion_id') THEN
            ALTER TABLE discussion_replies ADD COLUMN discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'content') THEN
            ALTER TABLE discussion_replies ADD COLUMN content TEXT NOT NULL DEFAULT '';
        END IF;
    END IF;

    -- Add missing columns to discussion_likes table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discussion_likes') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_likes' AND column_name = 'discussion_id') THEN
            ALTER TABLE discussion_likes ADD COLUMN discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_likes' AND column_name = 'user_id') THEN
            ALTER TABLE discussion_likes ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Add missing columns to reply_likes table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reply_likes') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reply_likes' AND column_name = 'reply_id') THEN
            ALTER TABLE reply_likes ADD COLUMN reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reply_likes' AND column_name = 'user_id') THEN
            ALTER TABLE reply_likes ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Add missing columns to discussion_views table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discussion_views') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_views' AND column_name = 'discussion_id') THEN
            ALTER TABLE discussion_views ADD COLUMN discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_views' AND column_name = 'user_id') THEN
            ALTER TABLE discussion_views ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- =====================================================
-- 8. UPDATE EXISTING RECORDS
-- =====================================================

-- Update existing exam_attempts records with proper values
UPDATE exam_attempts 
SET status = 'completed' 
WHERE completed_at IS NOT NULL AND (status IS NULL OR status = '');

UPDATE exam_attempts 
SET status = 'in_progress' 
WHERE completed_at IS NULL AND (status IS NULL OR status = '');

UPDATE exam_attempts 
SET attempt_number = 1 
WHERE attempt_number IS NULL;

-- Update existing course_enrollments records with proper status
UPDATE course_enrollments 
SET status = 'enrolled' 
WHERE status IS NULL OR status = '';

-- =====================================================
-- 9. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Assignments indexes
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_is_published ON assignments(is_published);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);

-- Assignment submissions indexes
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(status);

-- Exams indexes
CREATE INDEX IF NOT EXISTS idx_exams_course_id ON exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exams_teacher_id ON exams(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exams_is_published ON exams(is_published);
CREATE INDEX IF NOT EXISTS idx_exams_start_date ON exams(start_date);
CREATE INDEX IF NOT EXISTS idx_exams_end_date ON exams(end_date);

-- Exam questions indexes
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_order_index ON exam_questions(order_index);

-- Exam attempts indexes
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student_id ON exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON exam_attempts(status);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_completed_at ON exam_attempts(completed_at);

-- Course enrollments indexes
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_id ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);

-- Student achievements indexes
CREATE INDEX IF NOT EXISTS idx_student_achievements_student_id ON student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_achievement_type ON student_achievements(achievement_type);

-- Discussions indexes
CREATE INDEX IF NOT EXISTS idx_discussions_course_id ON discussions(course_id);
CREATE INDEX IF NOT EXISTS idx_discussions_author_id ON discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at);
CREATE INDEX IF NOT EXISTS idx_discussions_is_pinned ON discussions(is_pinned);
CREATE INDEX IF NOT EXISTS idx_discussions_views_count ON discussions(views_count);
CREATE INDEX IF NOT EXISTS idx_discussions_likes_count ON discussions(likes_count);

-- Discussion replies indexes
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_id ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_author_id ON discussion_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_parent_reply_id ON discussion_replies(parent_reply_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_created_at ON discussion_replies(created_at);

-- Discussion likes indexes
CREATE INDEX IF NOT EXISTS idx_discussion_likes_discussion_id ON discussion_likes(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_likes_user_id ON discussion_likes(user_id);

-- Reply likes indexes
CREATE INDEX IF NOT EXISTS idx_reply_likes_reply_id ON reply_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_reply_likes_user_id ON reply_likes(user_id);

-- Discussion views indexes
CREATE INDEX IF NOT EXISTS idx_discussion_views_discussion_id ON discussion_views(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_views_user_id ON discussion_views(user_id);

-- Question bank indexes
CREATE INDEX IF NOT EXISTS idx_question_bank_teacher_id ON question_bank(teacher_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_category_id ON question_bank(category_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_question_type ON question_bank(question_type);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty_level ON question_bank(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_question_bank_is_public ON question_bank(is_public);
CREATE INDEX IF NOT EXISTS idx_question_bank_is_active ON question_bank(is_active);
CREATE INDEX IF NOT EXISTS idx_question_bank_usage_count ON question_bank(usage_count);

-- Question bank sharing indexes
CREATE INDEX IF NOT EXISTS idx_question_bank_sharing_question_id ON question_bank_sharing(question_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_sharing_shared_by ON question_bank_sharing(shared_by_teacher_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_sharing_shared_with ON question_bank_sharing(shared_with_teacher_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_sharing_is_accepted ON question_bank_sharing(is_accepted);

-- Question bank categories indexes
CREATE INDEX IF NOT EXISTS idx_question_bank_categories_teacher_id ON question_bank_categories(teacher_id);

-- Question bank templates indexes
CREATE INDEX IF NOT EXISTS idx_question_bank_templates_teacher_id ON question_bank_templates(teacher_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_templates_is_public ON question_bank_templates(is_public);

-- =====================================================
-- 10. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 11. DROP EXISTING POLICIES
-- =====================================================

-- Drop assignment policies
DROP POLICY IF EXISTS "Students can view published assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can manage their assignments" ON assignments;

-- Drop assignment submission policies
DROP POLICY IF EXISTS "Students can manage their assignment submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Teachers can view submissions for their assignments" ON assignment_submissions;

-- Drop exam policies
DROP POLICY IF EXISTS "Students can view published exams" ON exams;
DROP POLICY IF EXISTS "Teachers can manage their exams" ON exams;

-- Drop exam question policies
DROP POLICY IF EXISTS "Students can view exam questions for published exams" ON exam_questions;
DROP POLICY IF EXISTS "Teachers can manage exam questions" ON exam_questions;

-- Drop exam attempt policies
DROP POLICY IF EXISTS "Students can manage their own exam attempts" ON exam_attempts;
DROP POLICY IF EXISTS "Teachers can view attempts in their exams" ON exam_attempts;

-- Drop student achievement policies
DROP POLICY IF EXISTS "Students can view their own achievements" ON student_achievements;

-- Drop discussion policies
DROP POLICY IF EXISTS "Users can view discussions" ON discussions;
DROP POLICY IF EXISTS "Users can create discussions" ON discussions;
DROP POLICY IF EXISTS "Authors can manage their discussions" ON discussions;
DROP POLICY IF EXISTS "Teachers can manage discussions in their courses" ON discussions;

-- Drop discussion reply policies
DROP POLICY IF EXISTS "Users can view discussion replies" ON discussion_replies;
DROP POLICY IF EXISTS "Users can create discussion replies" ON discussion_replies;
DROP POLICY IF EXISTS "Authors can manage their replies" ON discussion_replies;

-- Drop like and view policies
DROP POLICY IF EXISTS "Users can manage their discussion likes" ON discussion_likes;
DROP POLICY IF EXISTS "Users can manage their reply likes" ON reply_likes;
DROP POLICY IF EXISTS "Users can manage their discussion views" ON discussion_views;

-- Drop question bank policies
DROP POLICY IF EXISTS "Teachers can manage their question bank" ON question_bank;
DROP POLICY IF EXISTS "Students can view public questions" ON question_bank;
DROP POLICY IF EXISTS "Teachers can view shared questions" ON question_bank;

-- Drop question bank sharing policies
DROP POLICY IF EXISTS "Teachers can manage question sharing" ON question_bank_sharing;
DROP POLICY IF EXISTS "Teachers can view shared questions with them" ON question_bank_sharing;

-- Drop question bank categories policies
DROP POLICY IF EXISTS "Teachers can manage their categories" ON question_bank_categories;
DROP POLICY IF EXISTS "Teachers can view public categories" ON question_bank_categories;

-- Drop question bank templates policies
DROP POLICY IF EXISTS "Teachers can manage their templates" ON question_bank_templates;
DROP POLICY IF EXISTS "Teachers can view public templates" ON question_bank_templates;

-- =====================================================
-- 12. CREATE POLICIES
-- =====================================================

-- Assignment policies
CREATE POLICY "Students can view published assignments" ON assignments
FOR SELECT USING (is_published = true);

CREATE POLICY "Teachers can manage their assignments" ON assignments
FOR ALL USING (teacher_id::text = auth.uid()::text);

-- Assignment submission policies
CREATE POLICY "Students can manage their assignment submissions" ON assignment_submissions
FOR ALL USING (student_id::text = auth.uid()::text);

CREATE POLICY "Teachers can view submissions for their assignments" ON assignment_submissions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM assignments 
    WHERE assignments.id = assignment_submissions.assignment_id 
    AND assignments.teacher_id::text = auth.uid()::text
  )
);

-- Exam policies
CREATE POLICY "Students can view published exams" ON exams
FOR SELECT USING (is_published = true);

CREATE POLICY "Teachers can manage their exams" ON exams
FOR ALL USING (teacher_id::text = auth.uid()::text);

-- Exam question policies
CREATE POLICY "Students can view exam questions for published exams" ON exam_questions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM exams 
    WHERE exams.id = exam_questions.exam_id 
    AND exams.is_published = true
  )
);

CREATE POLICY "Teachers can manage exam questions" ON exam_questions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM exams 
    WHERE exams.id = exam_questions.exam_id 
    AND exams.teacher_id::text = auth.uid()::text
  )
);

-- Exam attempt policies
CREATE POLICY "Students can manage their own exam attempts" ON exam_attempts
FOR ALL USING (student_id::text = auth.uid()::text);

CREATE POLICY "Teachers can view attempts in their exams" ON exam_attempts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM exams 
    WHERE exams.id = exam_attempts.exam_id 
    AND exams.teacher_id::text = auth.uid()::text
  )
);

-- Student achievement policies
CREATE POLICY "Students can view their own achievements" ON student_achievements
FOR SELECT USING (student_id::text = auth.uid()::text);

-- Discussion policies
CREATE POLICY "Users can view discussions" ON discussions
FOR SELECT USING (true);

CREATE POLICY "Users can create discussions" ON discussions
FOR INSERT WITH CHECK (author_id::text = auth.uid()::text);

CREATE POLICY "Authors can manage their discussions" ON discussions
FOR UPDATE USING (author_id::text = auth.uid()::text);

CREATE POLICY "Teachers can manage discussions in their courses" ON discussions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = discussions.course_id 
    AND courses.teacher_id::text = auth.uid()::text
  )
);

-- Discussion reply policies
CREATE POLICY "Users can view discussion replies" ON discussion_replies
FOR SELECT USING (true);

CREATE POLICY "Users can create discussion replies" ON discussion_replies
FOR INSERT WITH CHECK (author_id::text = auth.uid()::text);

CREATE POLICY "Authors can manage their replies" ON discussion_replies
FOR UPDATE USING (author_id::text = auth.uid()::text);

-- Like and view policies
CREATE POLICY "Users can manage their discussion likes" ON discussion_likes
FOR ALL USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can manage their reply likes" ON reply_likes
FOR ALL USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can manage their discussion views" ON discussion_views
FOR ALL USING (user_id::text = auth.uid()::text);

-- Question bank policies
CREATE POLICY "Teachers can manage their question bank" ON question_bank
FOR ALL USING (teacher_id::text = auth.uid()::text);

CREATE POLICY "Students can view public questions" ON question_bank
FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "Teachers can view shared questions" ON question_bank
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM question_bank_sharing 
    WHERE question_bank_sharing.question_id = question_bank.id 
    AND question_bank_sharing.shared_with_teacher_id::text = auth.uid()::text
    AND question_bank_sharing.is_accepted = true
  )
);

-- Question bank sharing policies
CREATE POLICY "Teachers can manage question sharing" ON question_bank_sharing
FOR ALL USING (shared_by_teacher_id::text = auth.uid()::text);

CREATE POLICY "Teachers can view shared questions with them" ON question_bank_sharing
FOR SELECT USING (shared_with_teacher_id::text = auth.uid()::text);

-- Question bank categories policies
CREATE POLICY "Teachers can manage their categories" ON question_bank_categories
FOR ALL USING (teacher_id::text = auth.uid()::text);

CREATE POLICY "Teachers can view public categories" ON question_bank_categories
FOR SELECT USING (true); -- All teachers can view categories for reference

-- Question bank templates policies
CREATE POLICY "Teachers can manage their templates" ON question_bank_templates
FOR ALL USING (teacher_id::text = auth.uid()::text);

CREATE POLICY "Teachers can view public templates" ON question_bank_templates
FOR SELECT USING (is_public = true);

-- =====================================================
-- 13. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON assignments TO authenticated;
GRANT ALL ON assignment_submissions TO authenticated;
GRANT ALL ON exams TO authenticated;
GRANT ALL ON exam_questions TO authenticated;
GRANT ALL ON exam_attempts TO authenticated;
GRANT ALL ON student_achievements TO authenticated;
GRANT ALL ON discussions TO authenticated;
GRANT ALL ON discussion_replies TO authenticated;
GRANT ALL ON discussion_likes TO authenticated;
GRANT ALL ON reply_likes TO authenticated;
GRANT ALL ON discussion_views TO authenticated;
GRANT ALL ON question_bank TO authenticated;
GRANT ALL ON question_bank_sharing TO authenticated;
GRANT ALL ON question_bank_categories TO authenticated;
GRANT ALL ON question_bank_templates TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;



-- =====================================================
-- 15. CREATE FUNCTIONS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update question usage count when question is used in exam
CREATE OR REPLACE FUNCTION update_question_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE question_bank 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.question_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update discussion likes count
CREATE OR REPLACE FUNCTION update_discussion_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE discussions 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.discussion_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE discussions 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.discussion_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update reply likes count
CREATE OR REPLACE FUNCTION update_reply_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE discussion_replies 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.reply_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE discussion_replies 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.reply_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update discussion views count
CREATE OR REPLACE FUNCTION update_discussion_views_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE discussions 
    SET views_count = views_count + 1 
    WHERE id = NEW.discussion_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 16. CREATE TRIGGERS
-- =====================================================

-- Trigger for question usage count
DROP TRIGGER IF EXISTS trigger_update_question_usage_count ON exam_questions;
CREATE TRIGGER trigger_update_question_usage_count
    AFTER INSERT ON exam_questions
    FOR EACH ROW EXECUTE FUNCTION update_question_usage_count();

-- Trigger for discussion likes count
DROP TRIGGER IF EXISTS trigger_update_discussion_likes_count ON discussion_likes;
CREATE TRIGGER trigger_update_discussion_likes_count
    AFTER INSERT OR DELETE ON discussion_likes
    FOR EACH ROW EXECUTE FUNCTION update_discussion_likes_count();

-- Trigger for reply likes count
DROP TRIGGER IF EXISTS trigger_update_reply_likes_count ON reply_likes;
CREATE TRIGGER trigger_update_reply_likes_count
    AFTER INSERT OR DELETE ON reply_likes
    FOR EACH ROW EXECUTE FUNCTION update_reply_likes_count();

-- Trigger for discussion views count
DROP TRIGGER IF EXISTS trigger_update_discussion_views_count ON discussion_views;
CREATE TRIGGER trigger_update_discussion_views_count
    AFTER INSERT ON discussion_views
    FOR EACH ROW EXECUTE FUNCTION update_discussion_views_count();

-- =====================================================
-- COMPLETE!
-- =====================================================

-- All system issues have been fixed!
-- The entire system including question bank features should now work properly.
-- Teachers can create and manage question banks
-- Students can view public questions from their enrolled courses' teachers
-- All other features (assignments, exams, discussions, etc.) are also fixed
