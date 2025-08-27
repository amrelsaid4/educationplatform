-- Fix Student Dashboard Database Issues (Clean Version - No Static Data)
-- Run this file in your Supabase SQL editor

-- Ensure student_achievements table exists with correct structure
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL, -- course_completed, lessons_watched, etc.
  achievement_data JSONB, -- Additional data about the achievement
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_achievements_user_id ON student_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_type ON student_achievements(achievement_type);

-- Enable RLS on student_achievements
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for student_achievements
DROP POLICY IF EXISTS "Users can view their own achievements" ON student_achievements;
CREATE POLICY "Users can view their own achievements" ON student_achievements
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own achievements" ON student_achievements;
CREATE POLICY "Users can insert their own achievements" ON student_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure assignments table exists
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assignment_type VARCHAR(50) DEFAULT 'homework' CHECK (assignment_type IN ('homework', 'project', 'quiz', 'exam')),
  max_score INTEGER DEFAULT 100,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  instructions TEXT,
  attachments TEXT[], -- Array of file URLs
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure assignment_submissions table exists
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  attachments TEXT[], -- Array of file URLs
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  score INTEGER,
  feedback TEXT,
  graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  graded_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late', 'overdue')),
  UNIQUE(assignment_id, student_id)
);

-- Ensure exams table exists
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  total_questions INTEGER DEFAULT 0,
  passing_score INTEGER DEFAULT 60,
  is_published BOOLEAN DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  allow_multiple_attempts BOOLEAN DEFAULT false,
  max_attempts INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure exam_questions table exists
CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching')),
  options JSONB, -- For multiple choice questions
  correct_answer TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure exam_attempts table exists
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_published ON assignments(is_published);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_exams_course_id ON exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exams_teacher_id ON exams(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student_id ON exam_attempts(student_id);

-- Enable RLS on all tables
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for assignments
DROP POLICY IF EXISTS "Teachers can manage their assignments" ON assignments;
CREATE POLICY "Teachers can manage their assignments" ON assignments
  FOR ALL USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Students can view published assignments" ON assignments;
CREATE POLICY "Students can view published assignments" ON assignments
  FOR SELECT USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE course_enrollments.course_id = assignments.course_id 
      AND course_enrollments.student_id = auth.uid()
    )
  );

-- Create policies for assignment_submissions
DROP POLICY IF EXISTS "Students can manage their submissions" ON assignment_submissions;
CREATE POLICY "Students can manage their submissions" ON assignment_submissions
  FOR ALL USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers can view submissions for their assignments" ON assignment_submissions;
CREATE POLICY "Teachers can view submissions for their assignments" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments 
      WHERE assignments.id = assignment_submissions.assignment_id 
      AND assignments.teacher_id = auth.uid()
    )
  );

-- Create policies for exams
DROP POLICY IF EXISTS "Teachers can manage their exams" ON exams;
CREATE POLICY "Teachers can manage their exams" ON exams
  FOR ALL USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Students can view published exams" ON exams;
CREATE POLICY "Students can view published exams" ON exams
  FOR SELECT USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM course_enrollments 
      WHERE course_enrollments.course_id = exams.course_id 
      AND course_enrollments.student_id = auth.uid()
    )
  );

-- Create policies for exam_questions
DROP POLICY IF EXISTS "Teachers can manage exam questions" ON exam_questions;
CREATE POLICY "Teachers can manage exam questions" ON exam_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM exams 
      WHERE exams.id = exam_questions.exam_id 
      AND exams.teacher_id = auth.uid()
    )
  );

-- Create policies for exam_attempts
DROP POLICY IF EXISTS "Students can manage their exam attempts" ON exam_attempts;
CREATE POLICY "Students can manage their exam attempts" ON exam_attempts
  FOR ALL USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers can view attempts for their exams" ON exam_attempts;
CREATE POLICY "Teachers can view attempts for their exams" ON exam_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM exams 
      WHERE exams.id = exam_attempts.exam_id 
      AND exams.teacher_id = auth.uid()
    )
  );

-- Verify all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('student_achievements', 'assignments', 'assignment_submissions', 'exams', 'exam_questions', 'exam_attempts') 
        THEN '✅ Created'
        ELSE '❌ Missing'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('student_achievements', 'assignments', 'assignment_submissions', 'exams', 'exam_questions', 'exam_attempts')
ORDER BY table_name;
