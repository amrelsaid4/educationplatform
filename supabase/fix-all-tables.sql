-- Comprehensive fix for all tables in the system
-- This script ensures all tables exist with proper structure

-- 1. Create assignments table if it doesn't exist
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

-- 2. Create assignment_submissions table if it doesn't exist
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

-- 3. Create exams table if it doesn't exist
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

-- 4. Create exam_questions table if it doesn't exist
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

-- 5. Create exam_attempts table if it doesn't exist
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

-- 6. Create student_achievements table if it doesn't exist
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

-- 7. Add missing columns to existing tables
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

    -- Add missing columns to exam_attempts table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exam_attempts' AND column_name = 'completed_at') THEN
        ALTER TABLE exam_attempts ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exam_attempts' AND column_name = 'time_spent_minutes') THEN
        ALTER TABLE exam_attempts ADD COLUMN time_spent_minutes INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exam_attempts' AND column_name = 'answers') THEN
        ALTER TABLE exam_attempts ADD COLUMN answers JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exam_attempts' AND column_name = 'attempt_number') THEN
        ALTER TABLE exam_attempts ADD COLUMN attempt_number INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exam_attempts' AND column_name = 'status') THEN
        ALTER TABLE exam_attempts ADD COLUMN status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'));
    END IF;
END $$;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_is_published ON assignments(is_published);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON assignment_submissions(status);

CREATE INDEX IF NOT EXISTS idx_exams_course_id ON exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exams_teacher_id ON exams(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exams_is_published ON exams(is_published);
CREATE INDEX IF NOT EXISTS idx_exams_start_date ON exams(start_date);
CREATE INDEX IF NOT EXISTS idx_exams_end_date ON exams(end_date);

CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_order_index ON exam_questions(order_index);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student_id ON exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON exam_attempts(status);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_completed_at ON exam_attempts(completed_at);

CREATE INDEX IF NOT EXISTS idx_student_achievements_student_id ON student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_student_achievements_achievement_type ON student_achievements(achievement_type);

-- 9. Enable RLS on all tables
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

-- 10. Drop existing policies to recreate them
DROP POLICY IF EXISTS "Students can view published assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can manage their assignments" ON assignments;
DROP POLICY IF EXISTS "Students can manage their assignment submissions" ON assignment_submissions;
DROP POLICY IF EXISTS "Teachers can view submissions for their assignments" ON assignment_submissions;
DROP POLICY IF EXISTS "Students can view published exams" ON exams;
DROP POLICY IF EXISTS "Teachers can manage their exams" ON exams;
DROP POLICY IF EXISTS "Students can view exam questions for published exams" ON exam_questions;
DROP POLICY IF EXISTS "Teachers can manage exam questions" ON exam_questions;
DROP POLICY IF EXISTS "Students can manage their own exam attempts" ON exam_attempts;
DROP POLICY IF EXISTS "Teachers can view attempts in their exams" ON exam_attempts;
DROP POLICY IF EXISTS "Students can view their own achievements" ON student_achievements;

-- 11. Create policies for assignments
CREATE POLICY "Students can view published assignments" ON assignments
FOR SELECT USING (is_published = true);

CREATE POLICY "Teachers can manage their assignments" ON assignments
FOR ALL USING (teacher_id::text = auth.uid()::text);

-- 12. Create policies for assignment_submissions
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

-- 13. Create policies for exams
CREATE POLICY "Students can view published exams" ON exams
FOR SELECT USING (is_published = true);

CREATE POLICY "Teachers can manage their exams" ON exams
FOR ALL USING (teacher_id::text = auth.uid()::text);

-- 14. Create policies for exam_questions
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

-- 15. Create policies for exam_attempts
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

-- 16. Create policies for student_achievements
CREATE POLICY "Students can view their own achievements" ON student_achievements
FOR SELECT USING (student_id::text = auth.uid()::text);

-- 17. Grant necessary permissions
GRANT ALL ON assignments TO authenticated;
GRANT ALL ON assignment_submissions TO authenticated;
GRANT ALL ON exams TO authenticated;
GRANT ALL ON exam_questions TO authenticated;
GRANT ALL ON exam_attempts TO authenticated;
GRANT ALL ON student_achievements TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 18. Add some test data if tables are empty
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
