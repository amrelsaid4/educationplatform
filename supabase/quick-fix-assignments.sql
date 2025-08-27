-- Quick fix: Add missing assignment_type column to existing assignments table
-- Run this in Supabase SQL Editor if you have an existing assignments table

-- Check if the column exists first, then add it if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'assignment_type'
    ) THEN
        ALTER TABLE assignments 
        ADD COLUMN assignment_type VARCHAR(50) DEFAULT 'homework' 
        CHECK (assignment_type IN ('homework', 'project', 'quiz', 'exam'));
    END IF;
END $$;

-- Also check and add other missing columns if needed
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'max_score'
    ) THEN
        ALTER TABLE assignments 
        ADD COLUMN max_score INTEGER DEFAULT 100;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'instructions'
    ) THEN
        ALTER TABLE assignments 
        ADD COLUMN instructions TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assignments' 
        AND column_name = 'is_published'
    ) THEN
        ALTER TABLE assignments 
        ADD COLUMN is_published BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

