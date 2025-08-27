-- Fix exam and notifications issues
-- This file contains SQL commands to fix the issues with exams, notifications, and payments

-- 1. Fix notifications table structure
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS read_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS notification_type character varying DEFAULT 'info' CHECK (notification_type IN ('info', 'success', 'warning', 'error'));

-- 2. Fix messages table structure
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS read_at timestamp with time zone;

-- 3. Fix exam_questions table structure
ALTER TABLE exam_questions 
ADD COLUMN IF NOT EXISTS options jsonb,
ADD COLUMN IF NOT EXISTS correct_answer text;

-- 4. Fix question_bank table structure
ALTER TABLE question_bank 
ADD COLUMN IF NOT EXISTS options jsonb,
ADD COLUMN IF NOT EXISTS correct_answer text,
ADD COLUMN IF NOT EXISTS explanation text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- 5. Fix payments table structure
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_teacher_id ON question_bank(teacher_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_id ON course_enrollments(student_id);

-- 7. Add RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- 8. Add RLS policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages they sent or received" ON messages;
CREATE POLICY "Users can view messages they sent or received" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can insert messages" ON messages;
CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update messages they sent" ON messages;
CREATE POLICY "Users can update messages they sent" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can delete messages they sent or received" ON messages;
CREATE POLICY "Users can delete messages they sent or received" ON messages
    FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- 9. Add RLS policies for exam_questions
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can manage exam questions" ON exam_questions;
CREATE POLICY "Teachers can manage exam questions" ON exam_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM exams 
            WHERE exams.id = exam_questions.exam_id 
            AND exams.teacher_id = auth.uid()
        )
    );

-- 10. Add RLS policies for question_bank
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can manage their own questions" ON question_bank;
CREATE POLICY "Teachers can manage their own questions" ON question_bank
    FOR ALL USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can view public questions" ON question_bank;
CREATE POLICY "Teachers can view public questions" ON question_bank
    FOR SELECT USING (is_public = true OR teacher_id = auth.uid());

-- 11. Add RLS policies for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can view payments for their courses" ON payments;
CREATE POLICY "Teachers can view payments for their courses" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courses 
            WHERE courses.id = payments.course_id 
            AND courses.teacher_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "System can insert payments" ON payments;
CREATE POLICY "System can insert payments" ON payments
    FOR INSERT WITH CHECK (true);

-- 12. Create function to automatically create notifications
CREATE OR REPLACE FUNCTION create_exam_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notifications for all students enrolled in the course
    INSERT INTO notifications (user_id, title, message, type, related_type, related_id)
    SELECT 
        ce.student_id,
        'امتحان جديد متاح',
        'تم إضافة امتحان جديد: ' || NEW.title,
        'info',
        'exam',
        NEW.id
    FROM course_enrollments ce
    WHERE ce.course_id = NEW.course_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Create trigger for exam notifications
DROP TRIGGER IF EXISTS trigger_create_exam_notification ON exams;
CREATE TRIGGER trigger_create_exam_notification
    AFTER INSERT ON exams
    FOR EACH ROW
    EXECUTE FUNCTION create_exam_notification();

-- 14. Create function to automatically create assignment notifications
CREATE OR REPLACE FUNCTION create_assignment_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notifications for all students enrolled in the course
    INSERT INTO notifications (user_id, title, message, type, related_type, related_id)
    SELECT 
        ce.student_id,
        'واجب جديد متاح',
        'تم إضافة واجب جديد: ' || NEW.title,
        'info',
        'assignment',
        NEW.id
    FROM course_enrollments ce
    WHERE ce.course_id = NEW.course_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 15. Create trigger for assignment notifications
DROP TRIGGER IF EXISTS trigger_create_assignment_notification ON assignments;
CREATE TRIGGER trigger_create_assignment_notification
    AFTER INSERT ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION create_assignment_notification();

-- 16. Create function to automatically create payment notifications
CREATE OR REPLACE FUNCTION create_payment_notification()
RETURNS TRIGGER AS $$
DECLARE
    course_title text;
BEGIN
    -- Get course title
    SELECT title INTO course_title FROM courses WHERE id = NEW.course_id;
    
    -- Create notification for the user
    INSERT INTO notifications (user_id, title, message, type, related_type, related_id)
    VALUES (
        NEW.user_id,
        'دفع ناجح',
        'تم إتمام الدفع بنجاح: ' || NEW.amount || '$ للكورس ' || COALESCE(course_title, 'غير محدد'),
        'success',
        'payment',
        NEW.id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 17. Create trigger for payment notifications
DROP TRIGGER IF EXISTS trigger_create_payment_notification ON payments;
CREATE TRIGGER trigger_create_payment_notification
    AFTER INSERT ON payments
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION create_payment_notification();

-- 18. Update existing data to fix any inconsistencies
UPDATE notifications SET notification_type = 'info' WHERE notification_type IS NULL;
UPDATE question_bank SET tags = '{}' WHERE tags IS NULL;
UPDATE question_bank SET is_public = false WHERE is_public IS NULL;

-- 19. Create view for teacher dashboard stats
CREATE OR REPLACE VIEW teacher_dashboard_stats AS
SELECT 
    c.teacher_id,
    COUNT(DISTINCT c.id) as total_courses,
    COUNT(DISTINCT ce.student_id) as total_students,
    COUNT(DISTINCT a.id) as total_assignments,
    COUNT(DISTINCT e.id) as total_exams,
    COALESCE(SUM(p.amount), 0) as total_revenue,
    COUNT(DISTINCT p.id) as total_payments
FROM courses c
LEFT JOIN course_enrollments ce ON c.id = ce.course_id
LEFT JOIN assignments a ON c.id = a.course_id
LEFT JOIN exams e ON c.id = e.course_id
LEFT JOIN payments p ON c.id = p.course_id AND p.status = 'completed'
GROUP BY c.teacher_id;

-- 20. Grant necessary permissions
GRANT SELECT ON teacher_dashboard_stats TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON exam_questions TO authenticated;
GRANT ALL ON question_bank TO authenticated;
GRANT ALL ON payments TO authenticated;

