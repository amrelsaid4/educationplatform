-- Fix exam_attempts table missing columns
-- Add missing columns to exam_attempts table

-- Check if completed_at column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_attempts' 
        AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE exam_attempts ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Check if time_spent_minutes column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_attempts' 
        AND column_name = 'time_spent_minutes'
    ) THEN
        ALTER TABLE exam_attempts ADD COLUMN time_spent_minutes INTEGER;
    END IF;
END $$;

-- Check if answers column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_attempts' 
        AND column_name = 'answers'
    ) THEN
        ALTER TABLE exam_attempts ADD COLUMN answers JSONB;
    END IF;
END $$;

-- Check if attempt_number column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_attempts' 
        AND column_name = 'attempt_number'
    ) THEN
        ALTER TABLE exam_attempts ADD COLUMN attempt_number INTEGER DEFAULT 1;
    END IF;
END $$;

-- Check if status column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exam_attempts' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE exam_attempts ADD COLUMN status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'));
    END IF;
END $$;

-- Add unique constraint if it doesn't exist
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

-- Update existing records to have proper status
UPDATE exam_attempts 
SET status = 'completed' 
WHERE completed_at IS NOT NULL AND status IS NULL;

UPDATE exam_attempts 
SET status = 'in_progress' 
WHERE completed_at IS NULL AND status IS NULL;

-- Set attempt_number for existing records
UPDATE exam_attempts 
SET attempt_number = 1 
WHERE attempt_number IS NULL;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student_id ON exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON exam_attempts(status);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_completed_at ON exam_attempts(completed_at);

-- Enable RLS if not already enabled
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can manage their own exam attempts" ON exam_attempts;
DROP POLICY IF EXISTS "Teachers can view attempts in their exams" ON exam_attempts;

-- Create policies
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
