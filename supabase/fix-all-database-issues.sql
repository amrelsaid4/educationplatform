-- Comprehensive database fix for all issues
-- This script will fix missing columns, tables, and policies

-- 1. Fix exam_attempts table missing columns
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

-- 2. Ensure exams table has all required columns
DO $$ 
BEGIN
    -- Add start_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'start_date'
    ) THEN
        ALTER TABLE exams ADD COLUMN start_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add end_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'end_date'
    ) THEN
        ALTER TABLE exams ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add is_published column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'is_published'
    ) THEN
        ALTER TABLE exams ADD COLUMN is_published BOOLEAN DEFAULT false;
    END IF;

    -- Add allow_retakes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'allow_retakes'
    ) THEN
        ALTER TABLE exams ADD COLUMN allow_retakes BOOLEAN DEFAULT false;
    END IF;

    -- Add max_attempts column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'max_attempts'
    ) THEN
        ALTER TABLE exams ADD COLUMN max_attempts INTEGER DEFAULT 1;
    END IF;

    -- Add shuffle_questions column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'shuffle_questions'
    ) THEN
        ALTER TABLE exams ADD COLUMN shuffle_questions BOOLEAN DEFAULT false;
    END IF;

    -- Add show_results_immediately column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'show_results_immediately'
    ) THEN
        ALTER TABLE exams ADD COLUMN show_results_immediately BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 3. Update existing records with proper values
UPDATE exam_attempts 
SET status = 'completed' 
WHERE completed_at IS NOT NULL AND (status IS NULL OR status = '');

UPDATE exam_attempts 
SET status = 'in_progress' 
WHERE completed_at IS NULL AND (status IS NULL OR status = '');

UPDATE exam_attempts 
SET attempt_number = 1 
WHERE attempt_number IS NULL;

-- 4. Add unique constraint for exam_attempts if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'exam_attempts_exam_id_student_id_attempt_number_key'
    ) THEN
        ALTER TABLE exam_attempts ADD CONSTRAINT exam_attempts_exam_id_student_id_attempt_number_key 
        UNIQUE(exam_id, student_id, attempt_number);
    END IF;
END $$;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student_id ON exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON exam_attempts(status);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_completed_at ON exam_attempts(completed_at);
CREATE INDEX IF NOT EXISTS idx_exams_course_id ON exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exams_teacher_id ON exams(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exams_is_published ON exams(is_published);
CREATE INDEX IF NOT EXISTS idx_exams_start_date ON exams(start_date);
CREATE INDEX IF NOT EXISTS idx_exams_end_date ON exams(end_date);

-- 6. Enable RLS on all tables
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies to recreate them
DROP POLICY IF EXISTS "Students can manage their own exam attempts" ON exam_attempts;
DROP POLICY IF EXISTS "Teachers can view attempts in their exams" ON exam_attempts;
DROP POLICY IF EXISTS "Students can view published exams" ON exams;
DROP POLICY IF EXISTS "Teachers can manage their exams" ON exams;
DROP POLICY IF EXISTS "Students can view exam questions for published exams" ON exam_questions;
DROP POLICY IF EXISTS "Teachers can manage exam questions" ON exam_questions;

-- 8. Create policies for exam_attempts
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

-- 9. Create policies for exams
CREATE POLICY "Students can view published exams" ON exams
FOR SELECT USING (is_published = true);

CREATE POLICY "Teachers can manage their exams" ON exams
FOR ALL USING (teacher_id::text = auth.uid()::text);

-- 10. Create policies for exam_questions
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

-- 11. Add some test data if tables are empty
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

-- 12. Grant necessary permissions
GRANT ALL ON exam_attempts TO authenticated;
GRANT ALL ON exams TO authenticated;
GRANT ALL ON exam_questions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
