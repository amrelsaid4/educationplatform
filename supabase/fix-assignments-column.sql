-- Fix missing is_published column in assignments table
-- Run this file in your Supabase SQL editor

-- Check if the column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'is_published'
    ) THEN
        ALTER TABLE assignments ADD COLUMN is_published BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Check if the column exists in exams table, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'exams' 
        AND column_name = 'is_published'
    ) THEN
        ALTER TABLE exams ADD COLUMN is_published BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create index for is_published if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_assignments_published ON assignments(is_published);
CREATE INDEX IF NOT EXISTS idx_exams_published ON exams(is_published);

-- Update existing assignments to be published by default
UPDATE assignments SET is_published = true WHERE is_published IS NULL;

-- Update existing exams to be published by default
UPDATE exams SET is_published = true WHERE is_published IS NULL;

-- Verify the fix
SELECT 
    table_name, 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name IN ('assignments', 'exams') 
AND column_name = 'is_published'
ORDER BY table_name;
