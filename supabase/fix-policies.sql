-- Fix RLS policies for courses table
DROP POLICY IF EXISTS "Teachers can view their own courses" ON courses;
DROP POLICY IF EXISTS "Teachers can insert their own courses" ON courses;
DROP POLICY IF EXISTS "Teachers can update their own courses" ON courses;

-- Create new policies
CREATE POLICY "Users can view their own courses" ON courses FOR SELECT USING (teacher_id::text = auth.uid()::text);
CREATE POLICY "Authenticated users can create courses" ON courses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own courses" ON courses FOR UPDATE USING (teacher_id::text = auth.uid()::text);

-- Fix RLS policies for lessons table
DROP POLICY IF EXISTS "Teachers can view lessons of their courses" ON lessons;
DROP POLICY IF EXISTS "Teachers can insert lessons in their courses" ON lessons;
DROP POLICY IF EXISTS "Teachers can update lessons in their courses" ON lessons;

-- Create new policies
CREATE POLICY "Users can view lessons of their courses" ON lessons FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.teacher_id::text = auth.uid()::text)
);
CREATE POLICY "Authenticated users can create lessons" ON lessons FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update lessons in their courses" ON lessons FOR UPDATE USING (
    EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.teacher_id::text = auth.uid()::text)
);

-- Lesson progress policies
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" ON lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Student notes policies
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes" ON student_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON student_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON student_notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Payments policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Teachers can view payments for their courses
CREATE POLICY "Teachers can view course payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = payments.course_id 
      AND courses.teacher_id = auth.uid()
    )
  );

-- Lesson comments policies
ALTER TABLE lesson_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON lesson_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments" ON lesson_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON lesson_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON lesson_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Course categories policies
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON course_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON course_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Student achievements policies
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements" ON student_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Teacher analytics policies
ALTER TABLE teacher_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own analytics" ON teacher_analytics
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Admins can view all analytics" ON teacher_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );
