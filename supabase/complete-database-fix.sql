-- Complete Database Fix
-- This file contains all the fixes needed for the student dashboard
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
-- 3. ADD MISSING COLUMNS TO EXISTING TABLES
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
END $$;

-- =====================================================
-- 4. UPDATE EXISTING RECORDS
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

-- =====================================================
-- 5. CREATE INDEXES FOR BETTER PERFORMANCE
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

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY
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

-- =====================================================
-- 7. DROP EXISTING POLICIES
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

-- =====================================================
-- 8. CREATE POLICIES
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

-- =====================================================
-- 9. GRANT PERMISSIONS
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
GRANT USAGE ON SCHEMA public TO authenticated;

-- =====================================================
-- 10. ADD TEST DATA
-- =====================================================

-- Add test assignments
INSERT INTO assignments (id, title, description, course_id, teacher_id, assignment_type, max_score, due_date, instructions, is_published)
SELECT 
    gen_random_uuid(),
    'واجب منزلي تجريبي',
    'واجب منزلي تجريبي للدورة',
    c.id,
    c.teacher_id,
    'homework',
    100,
    NOW() + INTERVAL '7 days',
    'قم بحل جميع الأسئلة المطلوبة',
    true
FROM courses c
WHERE c.status = 'published'
AND NOT EXISTS (SELECT 1 FROM assignments WHERE assignments.course_id = c.id)
LIMIT 5;

-- Add test exams
INSERT INTO exams (id, title, description, course_id, teacher_id, exam_type, duration_minutes, max_score, passing_score, start_date, end_date, is_published)
SELECT 
    gen_random_uuid(),
    'امتحان تجريبي',
    'امتحان تجريبي للدورة',
    c.id,
    c.teacher_id,
    'quiz',
    60,
    100,
    60,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '30 days',
    true
FROM courses c
WHERE c.status = 'published'
AND NOT EXISTS (SELECT 1 FROM exams WHERE exams.course_id = c.id)
LIMIT 5;

-- Add test discussions
INSERT INTO discussions (id, title, content, course_id, author_id, views_count, likes_count, created_at)
SELECT 
    gen_random_uuid(),
    'سؤال حول الدرس الثالث في البرمجة',
    'أحتاج مساعدة في فهم مفهوم الـ loops في JavaScript. هل يمكن لأحد شرحه لي؟',
    c.id,
    u.id,
    15,
    2,
    NOW() - INTERVAL '1 hour'
FROM courses c, users u
WHERE c.status = 'published'
AND u.role = 'student'
AND NOT EXISTS (SELECT 1 FROM discussions WHERE discussions.course_id = c.id)
LIMIT 1;

INSERT INTO discussions (id, title, content, course_id, author_id, views_count, likes_count, created_at)
SELECT 
    gen_random_uuid(),
    'مشاركة مشروعي النهائي',
    'أريد مشاركة مشروعي النهائي معكم. هل يمكنكم إعطائي نصائح للتحسين؟',
    c.id,
    u.id,
    8,
    1,
    NOW() - INTERVAL '2 hours'
FROM courses c, users u
WHERE c.status = 'published'
AND u.role = 'student'
AND NOT EXISTS (SELECT 1 FROM discussions WHERE discussions.course_id = c.id)
LIMIT 1;

-- =====================================================
-- 11. CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Create functions to update counts
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

CREATE OR REPLACE FUNCTION update_discussion_views_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE discussions 
    SET views_count = views_count + 1 
    WHERE id = NEW.discussion_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_discussion_likes_count ON discussion_likes;
CREATE TRIGGER trigger_update_discussion_likes_count
    AFTER INSERT OR DELETE ON discussion_likes
    FOR EACH ROW EXECUTE FUNCTION update_discussion_likes_count();

DROP TRIGGER IF EXISTS trigger_update_reply_likes_count ON reply_likes;
CREATE TRIGGER trigger_update_reply_likes_count
    AFTER INSERT OR DELETE ON reply_likes
    FOR EACH ROW EXECUTE FUNCTION update_reply_likes_count();

DROP TRIGGER IF EXISTS trigger_update_discussion_views_count ON discussion_views;
CREATE TRIGGER trigger_update_discussion_views_count
    AFTER INSERT ON discussion_views
    FOR EACH ROW EXECUTE FUNCTION update_discussion_views_count();

-- =====================================================
-- COMPLETE!
-- =====================================================

-- All database issues have been fixed!
-- The student dashboard should now work properly.
