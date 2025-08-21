-- إصلاح سياسات الدروس للطلاب الملتحقين

-- حذف السياسات الموجودة أولاً
DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON lessons;
DROP POLICY IF EXISTS "Users can view lessons of their courses" ON lessons;

-- إنشاء السياسات الجديدة
-- السماح للجميع برؤية دروس الكورسات المنشورة
CREATE POLICY "Anyone can view lessons of published courses" ON lessons 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = lessons.course_id 
    AND courses.status = 'published'
  )
);

-- السماح للمعلمين برؤية دروس كورساتهم
CREATE POLICY "Users can view lessons of their courses" ON lessons 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = lessons.course_id 
    AND courses.teacher_id::text = auth.uid()::text
  )
);

-- السماح للطلاب برؤية دروس الكورسات الملتحقين بها
CREATE POLICY "Students can view lessons of enrolled courses" ON lessons 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM course_enrollments 
    WHERE course_enrollments.course_id = lessons.course_id 
    AND course_enrollments.student_id::text = auth.uid()::text
  )
);

-- السماح للمعلمين بإنشاء دروس في كورساتهم
CREATE POLICY "Authenticated users can create lessons" ON lessons 
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' 
  AND EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = lessons.course_id 
    AND courses.teacher_id::text = auth.uid()::text
  )
);

-- السماح للمعلمين بتحديث دروس كورساتهم
CREATE POLICY "Users can update lessons in their courses" ON lessons 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = lessons.course_id 
    AND courses.teacher_id::text = auth.uid()::text
  )
);

-- السماح للمعلمين بحذف دروس كورساتهم
CREATE POLICY "Users can delete lessons in their courses" ON lessons 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = lessons.course_id 
    AND courses.teacher_id::text = auth.uid()::text
  )
);
