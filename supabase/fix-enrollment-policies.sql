-- إصلاح policies التسجيل في الكورسات

-- حذف الـ policies الموجودة أولاً
DROP POLICY IF EXISTS "Students can enroll in courses" ON course_enrollments;
DROP POLICY IF EXISTS "Students can view their enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Teachers can view enrollments in their courses" ON course_enrollments;

-- إنشاء الـ policies الجديدة
CREATE POLICY "Students can enroll in courses" ON course_enrollments
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' 
  AND student_id::text = auth.uid()::text
);

CREATE POLICY "Students can view their enrollments" ON course_enrollments
FOR SELECT USING (
  auth.role() = 'authenticated' 
  AND student_id::text = auth.uid()::text
);

CREATE POLICY "Teachers can view enrollments in their courses" ON course_enrollments
FOR SELECT USING (
  auth.role() = 'authenticated' 
  AND EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_enrollments.course_id 
    AND courses.teacher_id::text = auth.uid()::text
  )
);

CREATE POLICY "Students can update their enrollments" ON course_enrollments
FOR UPDATE USING (
  auth.role() = 'authenticated' 
  AND student_id::text = auth.uid()::text
);
