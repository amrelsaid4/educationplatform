-- Quick fix for RLS policies - Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Teachers can view their own courses" ON courses;
DROP POLICY IF EXISTS "Teachers can insert their own courses" ON courses;
DROP POLICY IF EXISTS "Teachers can update their own courses" ON courses;
DROP POLICY IF EXISTS "Teachers can view lessons of their courses" ON lessons;
DROP POLICY IF EXISTS "Teachers can insert lessons in their courses" ON lessons;
DROP POLICY IF EXISTS "Teachers can update lessons in their courses" ON lessons;

-- Create new policies for courses
CREATE POLICY "Users can view their own courses" ON courses FOR SELECT USING (teacher_id::text = auth.uid()::text);
CREATE POLICY "Authenticated users can create courses" ON courses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own courses" ON courses FOR UPDATE USING (teacher_id::text = auth.uid()::text);

-- Create new policies for lessons
CREATE POLICY "Users can view lessons of their courses" ON lessons FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.teacher_id::text = auth.uid()::text)
);
CREATE POLICY "Authenticated users can create lessons" ON lessons FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update lessons in their courses" ON lessons FOR UPDATE USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.teacher_id::text = auth.uid()::text)
);
