    -- Update schema with new tables and features
    -- Run this file in your Supabase SQL editor

    -- Assignments table (for student assignments)
    CREATE TABLE IF NOT EXISTS assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assignment_type VARCHAR(50) DEFAULT 'homework' CHECK (assignment_type IN ('homework', 'project', 'quiz', 'exam')),
    max_score INTEGER DEFAULT 100,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    instructions TEXT,
    attachments TEXT[], -- Array of file URLs
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Assignment submissions table
    CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    attachments TEXT[], -- Array of file URLs
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    score INTEGER,
    feedback TEXT,
    graded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late', 'overdue')),
    UNIQUE(assignment_id, student_id)
    );

    -- Exams table
    CREATE TABLE IF NOT EXISTS exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exam_type VARCHAR(50) DEFAULT 'quiz' CHECK (exam_type IN ('quiz', 'midterm', 'final', 'practice')),
    duration_minutes INTEGER DEFAULT 60,
    max_score INTEGER DEFAULT 100,
    passing_score INTEGER DEFAULT 60,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT false,
    allow_retakes BOOLEAN DEFAULT false,
    max_attempts INTEGER DEFAULT 1,
    shuffle_questions BOOLEAN DEFAULT false,
    show_results_immediately BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Exam questions table
    CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching')),
    points INTEGER DEFAULT 1,
    options JSONB, -- For multiple choice questions: [{"text": "option1", "is_correct": true}, ...]
    correct_answer TEXT, -- For short answer and essay questions
    explanation TEXT, -- Explanation of the correct answer
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Exam attempts table
    CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    attempt_number INTEGER DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    score INTEGER,
    answers JSONB, -- Store student answers: [{"question_id": "uuid", "answer": "text"}]
    time_spent_minutes INTEGER,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    UNIQUE(exam_id, student_id, attempt_number)
    );

    -- Question bank table
    CREATE TABLE IF NOT EXISTS question_bank (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching')),
    options JSONB, -- For multiple choice questions
    correct_answer TEXT,
    explanation TEXT,
    difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    tags TEXT[], -- Array of tags for easy searching
    is_public BOOLEAN DEFAULT false, -- Can be shared with other teachers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Messages table
    CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'direct' CHECK (message_type IN ('direct', 'announcement', 'notification')),
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL, -- For course-specific messages
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Notifications table
    CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'info' CHECK (notification_type IN ('info', 'success', 'warning', 'error')),
    related_type VARCHAR(50), -- 'course', 'assignment', 'exam', etc.
    related_id UUID, -- ID of the related entity
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Course reviews table
    CREATE TABLE IF NOT EXISTS course_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, student_id)
    );

    -- Course units table (for organizing lessons)
    CREATE TABLE IF NOT EXISTS course_units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Discussions table
    CREATE TABLE IF NOT EXISTS discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Discussion replies table
    CREATE TABLE IF NOT EXISTS discussion_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE, -- For nested replies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
    CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
    CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);
    CREATE INDEX IF NOT EXISTS idx_exams_course_id ON exams(course_id);
    CREATE INDEX IF NOT EXISTS idx_exams_teacher_id ON exams(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);
    CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON exam_attempts(exam_id);
    CREATE INDEX IF NOT EXISTS idx_exam_attempts_student_id ON exam_attempts(student_id);
    CREATE INDEX IF NOT EXISTS idx_question_bank_teacher_id ON question_bank(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_question_bank_category ON question_bank(category);
    CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews(course_id);
    CREATE INDEX IF NOT EXISTS idx_course_units_course_id ON course_units(course_id);
    CREATE INDEX IF NOT EXISTS idx_discussions_course_id ON discussions(course_id);
    CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_id ON discussion_replies(discussion_id);

    -- Enable RLS for new tables
    ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
    ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
    ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
    ALTER TABLE course_units ENABLE ROW LEVEL SECURITY;
    ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;

    -- RLS Policies for assignments
    CREATE POLICY "Teachers can manage assignments in their courses" ON assignments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM courses WHERE courses.id = assignments.course_id AND courses.teacher_id::text = auth.uid()::text)
    );

    CREATE POLICY "Students can view assignments in enrolled courses" ON assignments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM course_enrollments WHERE course_enrollments.course_id = assignments.course_id AND course_enrollments.student_id::text = auth.uid()::text)
    );

    -- RLS Policies for assignment submissions
    CREATE POLICY "Students can manage their own submissions" ON assignment_submissions
    FOR ALL USING (student_id::text = auth.uid()::text);

    CREATE POLICY "Teachers can view submissions in their courses" ON assignment_submissions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM assignments WHERE assignments.id = assignment_submissions.assignment_id AND assignments.teacher_id::text = auth.uid()::text)
    );

    -- RLS Policies for exams
    CREATE POLICY "Teachers can manage exams in their courses" ON exams
    FOR ALL USING (
        EXISTS (SELECT 1 FROM courses WHERE courses.id = exams.course_id AND courses.teacher_id::text = auth.uid()::text)
    );

    CREATE POLICY "Students can view exams in enrolled courses" ON exams
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM course_enrollments WHERE course_enrollments.course_id = exams.course_id AND course_enrollments.student_id::text = auth.uid()::text)
    );

    -- RLS Policies for exam questions
    CREATE POLICY "Teachers can manage questions in their exams" ON exam_questions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM exams WHERE exams.id = exam_questions.exam_id AND exams.teacher_id::text = auth.uid()::text)
    );

    -- RLS Policies for exam attempts
    CREATE POLICY "Students can manage their own exam attempts" ON exam_attempts
    FOR ALL USING (student_id::text = auth.uid()::text);

    CREATE POLICY "Teachers can view attempts in their exams" ON exam_attempts
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM exams WHERE exams.id = exam_attempts.exam_id AND exams.teacher_id::text = auth.uid()::text)
    );

    -- RLS Policies for question bank
    CREATE POLICY "Teachers can manage their own question bank" ON question_bank
    FOR ALL USING (teacher_id::text = auth.uid()::text);

    CREATE POLICY "Teachers can view public questions" ON question_bank
    FOR SELECT USING (is_public = true);

    -- RLS Policies for messages
    CREATE POLICY "Users can manage their own messages" ON messages
    FOR ALL USING (sender_id::text = auth.uid()::text OR recipient_id::text = auth.uid()::text);

    -- RLS Policies for notifications
    CREATE POLICY "Users can manage their own notifications" ON notifications
    FOR ALL USING (user_id::text = auth.uid()::text);

    -- RLS Policies for course reviews
    CREATE POLICY "Students can manage their own reviews" ON course_reviews
    FOR ALL USING (student_id::text = auth.uid()::text);

    CREATE POLICY "Anyone can view approved reviews" ON course_reviews
    FOR SELECT USING (is_approved = true);

    -- RLS Policies for course units
    CREATE POLICY "Teachers can manage units in their courses" ON course_units
    FOR ALL USING (
        EXISTS (SELECT 1 FROM courses WHERE courses.id = course_units.course_id AND courses.teacher_id::text = auth.uid()::text)
    );

    CREATE POLICY "Students can view units in enrolled courses" ON course_units
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM course_enrollments WHERE course_enrollments.course_id = course_units.course_id AND course_enrollments.student_id::text = auth.uid()::text)
    );

    -- RLS Policies for discussions
    CREATE POLICY "Users can manage discussions in enrolled courses" ON discussions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM course_enrollments WHERE course_enrollments.course_id = discussions.course_id AND course_enrollments.student_id::text = auth.uid()::text)
        OR
        EXISTS (SELECT 1 FROM courses WHERE courses.id = discussions.course_id AND courses.teacher_id::text = auth.uid()::text)
    );

    -- RLS Policies for discussion replies
    CREATE POLICY "Users can manage replies in enrolled courses" ON discussion_replies
    FOR ALL USING (
        EXISTS (SELECT 1 FROM discussions 
                JOIN course_enrollments ON course_enrollments.course_id = discussions.course_id 
                WHERE discussions.id = discussion_replies.discussion_id AND course_enrollments.student_id::text = auth.uid()::text)
        OR
        EXISTS (SELECT 1 FROM discussions 
                JOIN courses ON courses.id = discussions.course_id 
                WHERE discussions.id = discussion_replies.discussion_id AND courses.teacher_id::text = auth.uid()::text)
    );

    -- Add triggers for updated_at
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_question_bank_updated_at BEFORE UPDATE ON question_bank
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_course_reviews_updated_at BEFORE UPDATE ON course_reviews
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_course_units_updated_at BEFORE UPDATE ON course_units
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON discussions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_discussion_replies_updated_at BEFORE UPDATE ON discussion_replies
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
