-- Fix notifications trigger issue
-- Run this file in your Supabase SQL editor

-- First, let's check if the notifications table exists and has the correct structure
DO $$
BEGIN
    -- Check if notifications table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notifications'
    ) THEN
        -- Create notifications table if it doesn't exist
        CREATE TABLE notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            notification_type VARCHAR(50) DEFAULT 'info' CHECK (notification_type IN ('info', 'success', 'warning', 'error')),
            related_type VARCHAR(50), -- 'course', 'assignment', 'exam', etc.
            related_id UUID, -- ID of the related entity
            is_read BOOLEAN DEFAULT false,
            read_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
        CREATE POLICY "Users can view their own notifications" ON notifications
            FOR SELECT USING (auth.uid() = user_id);
            
        DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
        CREATE POLICY "Users can update their own notifications" ON notifications
            FOR UPDATE USING (auth.uid() = user_id);
            
        DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
        CREATE POLICY "System can insert notifications" ON notifications
            FOR INSERT WITH CHECK (true);
            
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    END IF;
END $$;

-- Drop existing triggers and functions to recreate them correctly
DROP TRIGGER IF EXISTS trigger_create_assignment_notification ON assignments;
DROP TRIGGER IF EXISTS trigger_create_exam_notification ON exams;
DROP TRIGGER IF EXISTS trigger_create_payment_notification ON payments;

DROP FUNCTION IF EXISTS create_assignment_notification();
DROP FUNCTION IF EXISTS create_exam_notification();
DROP FUNCTION IF EXISTS create_payment_notification();

-- Create function to automatically create assignment notifications
CREATE OR REPLACE FUNCTION create_assignment_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notifications for all students enrolled in the course
    INSERT INTO notifications (user_id, title, message, notification_type, related_type, related_id)
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

-- Create function to automatically create exam notifications
CREATE OR REPLACE FUNCTION create_exam_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notifications for all students enrolled in the course
    INSERT INTO notifications (user_id, title, message, notification_type, related_type, related_id)
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

-- Create function to automatically create payment notifications
CREATE OR REPLACE FUNCTION create_payment_notification()
RETURNS TRIGGER AS $$
DECLARE
    course_title text;
BEGIN
    -- Get course title
    SELECT title INTO course_title FROM courses WHERE id = NEW.course_id;
    
    -- Create notification for the user
    INSERT INTO notifications (user_id, title, message, notification_type, related_type, related_id)
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

-- Create triggers
CREATE TRIGGER trigger_create_assignment_notification
    AFTER INSERT ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION create_assignment_notification();

CREATE TRIGGER trigger_create_exam_notification
    AFTER INSERT ON exams
    FOR EACH ROW
    EXECUTE FUNCTION create_exam_notification();

-- Only create payment trigger if payments table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'payments'
    ) THEN
        CREATE TRIGGER trigger_create_payment_notification
            AFTER INSERT ON payments
            FOR EACH ROW
            WHEN (NEW.status = 'completed')
            EXECUTE FUNCTION create_payment_notification();
    END IF;
END $$;

-- Verify the fix
SELECT 
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;
