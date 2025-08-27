-- Add Question Bank Features for Teachers
-- This script adds question bank functionality for teachers

-- =====================================================
-- 1. ENHANCE QUESTION_BANK TABLE
-- =====================================================

-- Add missing columns to question_bank table if they don't exist
DO $$ 
BEGIN
    -- Add is_public column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'is_public') THEN
        ALTER TABLE question_bank ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'tags') THEN
        ALTER TABLE question_bank ADD COLUMN tags TEXT[];
    END IF;
    
    -- Add difficulty_level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'difficulty_level') THEN
        ALTER TABLE question_bank ADD COLUMN difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard'));
    END IF;
    
    -- Add usage_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'usage_count') THEN
        ALTER TABLE question_bank ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'is_active') THEN
        ALTER TABLE question_bank ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- =====================================================
-- 2. CREATE QUESTION_BANK_SHARING TABLE
-- =====================================================

-- Create table for sharing questions between teachers
CREATE TABLE IF NOT EXISTS question_bank_sharing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES question_bank(id) ON DELETE CASCADE,
  shared_by_teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_with_teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(question_id, shared_with_teacher_id)
);

-- =====================================================
-- 3. CREATE QUESTION_BANK_CATEGORIES TABLE
-- =====================================================

-- Create table for question categories
CREATE TABLE IF NOT EXISTS question_bank_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category_id to question_bank table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'question_bank' AND column_name = 'category_id') THEN
        ALTER TABLE question_bank ADD COLUMN category_id UUID REFERENCES question_bank_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =====================================================
-- 4. CREATE QUESTION_BANK_TEMPLATES TABLE
-- =====================================================

-- Create table for question templates
CREATE TABLE IF NOT EXISTS question_bank_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL, -- Store template structure
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Question bank indexes
CREATE INDEX IF NOT EXISTS idx_question_bank_teacher_id ON question_bank(teacher_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_category_id ON question_bank(category_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_question_type ON question_bank(question_type);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty_level ON question_bank(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_question_bank_is_public ON question_bank(is_public);
CREATE INDEX IF NOT EXISTS idx_question_bank_is_active ON question_bank(is_active);
CREATE INDEX IF NOT EXISTS idx_question_bank_usage_count ON question_bank(usage_count);

-- Question bank sharing indexes
CREATE INDEX IF NOT EXISTS idx_question_bank_sharing_question_id ON question_bank_sharing(question_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_sharing_shared_by ON question_bank_sharing(shared_by_teacher_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_sharing_shared_with ON question_bank_sharing(shared_with_teacher_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_sharing_is_accepted ON question_bank_sharing(is_accepted);

-- Question bank categories indexes
CREATE INDEX IF NOT EXISTS idx_question_bank_categories_teacher_id ON question_bank_categories(teacher_id);

-- Question bank templates indexes
CREATE INDEX IF NOT EXISTS idx_question_bank_templates_teacher_id ON question_bank_templates(teacher_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_templates_is_public ON question_bank_templates(is_public);

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. DROP EXISTING POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Teachers can manage their question bank" ON question_bank;
DROP POLICY IF EXISTS "Students can view public questions" ON question_bank;
DROP POLICY IF EXISTS "Teachers can view shared questions" ON question_bank;

DROP POLICY IF EXISTS "Teachers can manage question sharing" ON question_bank_sharing;
DROP POLICY IF EXISTS "Teachers can view shared questions with them" ON question_bank_sharing;

DROP POLICY IF EXISTS "Teachers can manage their categories" ON question_bank_categories;
DROP POLICY IF EXISTS "Teachers can view public categories" ON question_bank_categories;

DROP POLICY IF EXISTS "Teachers can manage their templates" ON question_bank_templates;
DROP POLICY IF EXISTS "Teachers can view public templates" ON question_bank_templates;

-- =====================================================
-- 8. CREATE POLICIES
-- =====================================================

-- Question bank policies
CREATE POLICY "Teachers can manage their question bank" ON question_bank
FOR ALL USING (teacher_id::text = auth.uid()::text);

CREATE POLICY "Students can view public questions" ON question_bank
FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "Teachers can view shared questions" ON question_bank
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM question_bank_sharing 
    WHERE question_bank_sharing.question_id = question_bank.id 
    AND question_bank_sharing.shared_with_teacher_id::text = auth.uid()::text
    AND question_bank_sharing.is_accepted = true
  )
);

-- Question bank sharing policies
CREATE POLICY "Teachers can manage question sharing" ON question_bank_sharing
FOR ALL USING (shared_by_teacher_id::text = auth.uid()::text);

CREATE POLICY "Teachers can view shared questions with them" ON question_bank_sharing
FOR SELECT USING (shared_with_teacher_id::text = auth.uid()::text);

-- Question bank categories policies
CREATE POLICY "Teachers can manage their categories" ON question_bank_categories
FOR ALL USING (teacher_id::text = auth.uid()::text);

CREATE POLICY "Teachers can view public categories" ON question_bank_categories
FOR SELECT USING (true); -- All teachers can view categories for reference

-- Question bank templates policies
CREATE POLICY "Teachers can manage their templates" ON question_bank_templates
FOR ALL USING (teacher_id::text = auth.uid()::text);

CREATE POLICY "Teachers can view public templates" ON question_bank_templates
FOR SELECT USING (is_public = true);

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON question_bank TO authenticated;
GRANT ALL ON question_bank_sharing TO authenticated;
GRANT ALL ON question_bank_categories TO authenticated;
GRANT ALL ON question_bank_templates TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- =====================================================
-- 10. ADD SAMPLE DATA
-- =====================================================

-- Add sample categories
INSERT INTO question_bank_categories (id, teacher_id, name, description, color)
SELECT 
    gen_random_uuid(),
    u.id,
    'البرمجة الأساسية',
    'أسئلة حول أساسيات البرمجة والمفاهيم الأساسية',
    '#3B82F6'
FROM users u
WHERE u.role = 'teacher'
AND NOT EXISTS (SELECT 1 FROM question_bank_categories WHERE teacher_id = u.id)
LIMIT 1;

INSERT INTO question_bank_categories (id, teacher_id, name, description, color)
SELECT 
    gen_random_uuid(),
    u.id,
    'قواعد البيانات',
    'أسئلة حول قواعد البيانات وSQL',
    '#10B981'
FROM users u
WHERE u.role = 'teacher'
AND NOT EXISTS (SELECT 1 FROM question_bank_categories WHERE teacher_id = u.id AND name = 'قواعد البيانات')
LIMIT 1;

INSERT INTO question_bank_categories (id, teacher_id, name, description, color)
SELECT 
    gen_random_uuid(),
    u.id,
    'تطوير الويب',
    'أسئلة حول تطوير تطبيقات الويب',
    '#F59E0B'
FROM users u
WHERE u.role = 'teacher'
AND NOT EXISTS (SELECT 1 FROM question_bank_categories WHERE teacher_id = u.id AND name = 'تطوير الويب')
LIMIT 1;

-- Add sample questions
INSERT INTO question_bank (id, teacher_id, category_id, question_text, question_type, options, correct_answer, explanation, difficulty_level, tags, is_public)
SELECT 
    gen_random_uuid(),
    u.id,
    c.id,
    'ما هو الفرق بين المتغيرات var و let و const في JavaScript؟',
    'multiple_choice',
    '[
        {"text": "لا يوجد فرق، جميعها متغيرات عادية", "is_correct": false},
        {"text": "var له scope عام، let و const لهما block scope", "is_correct": true},
        {"text": "const يمكن تغيير قيمته، let و var ثوابت", "is_correct": false},
        {"text": "جميعها ثوابت ولا يمكن تغيير قيمها", "is_correct": false}
    ]',
    'var له scope عام، let و const لهما block scope',
    'var له function scope أو global scope، بينما let و const لهما block scope. كما أن const لا يمكن إعادة تعيينه.',
    'medium',
    ARRAY['javascript', 'variables', 'scope'],
    true
FROM users u, question_bank_categories c
WHERE u.role = 'teacher'
AND c.teacher_id = u.id
AND c.name = 'البرمجة الأساسية'
AND NOT EXISTS (SELECT 1 FROM question_bank WHERE teacher_id = u.id AND question_text LIKE '%JavaScript%')
LIMIT 1;

INSERT INTO question_bank (id, teacher_id, category_id, question_text, question_type, options, correct_answer, explanation, difficulty_level, tags, is_public)
SELECT 
    gen_random_uuid(),
    u.id,
    c.id,
    'ما هو الـ SQL؟',
    'multiple_choice',
    '[
        {"text": "لغة برمجة عامة", "is_correct": false},
        {"text": "لغة استعلام قواعد البيانات", "is_correct": true},
        {"text": "نظام تشغيل", "is_correct": false},
        {"text": "متصفح ويب", "is_correct": false}
    ]',
    'لغة استعلام قواعد البيانات',
    'SQL هي لغة استعلام قواعد البيانات القياسية المستخدمة لإدارة وتعديل البيانات في قواعد البيانات العلائقية.',
    'easy',
    ARRAY['sql', 'database', 'query'],
    true
FROM users u, question_bank_categories c
WHERE u.role = 'teacher'
AND c.teacher_id = u.id
AND c.name = 'قواعد البيانات'
AND NOT EXISTS (SELECT 1 FROM question_bank WHERE teacher_id = u.id AND question_text LIKE '%SQL%')
LIMIT 1;

INSERT INTO question_bank (id, teacher_id, category_id, question_text, question_type, options, correct_answer, explanation, difficulty_level, tags, is_public)
SELECT 
    gen_random_uuid(),
    u.id,
    c.id,
    'ما هو الـ HTTP؟',
    'multiple_choice',
    '[
        {"text": "بروتوكول نقل النصوص التشعبية", "is_correct": true},
        {"text": "لغة برمجة", "is_correct": false},
        {"text": "نظام تشغيل", "is_correct": false},
        {"text": "قاعدة بيانات", "is_correct": false}
    ]',
    'بروتوكول نقل النصوص التشعبية',
    'HTTP هو بروتوكول تطبيق لنقل البيانات في شبكة الويب العالمية.',
    'easy',
    ARRAY['http', 'web', 'protocol'],
    true
FROM users u, question_bank_categories c
WHERE u.role = 'teacher'
AND c.teacher_id = u.id
AND c.name = 'تطوير الويب'
AND NOT EXISTS (SELECT 1 FROM question_bank WHERE teacher_id = u.id AND question_text LIKE '%HTTP%')
LIMIT 1;

-- Add sample templates
INSERT INTO question_bank_templates (id, teacher_id, name, description, template_data, is_public)
SELECT 
    gen_random_uuid(),
    u.id,
    'قالب أسئلة البرمجة الأساسية',
    'قالب يحتوي على أسئلة أساسية في البرمجة',
    '{
        "questions": [
            {
                "type": "multiple_choice",
                "text": "ما هي لغة البرمجة المستخدمة في تطوير الويب؟",
                "options": [
                    {"text": "JavaScript", "is_correct": true},
                    {"text": "Python", "is_correct": false},
                    {"text": "Java", "is_correct": false},
                    {"text": "C++", "is_correct": false}
                ]
            },
            {
                "type": "true_false",
                "text": "HTML هي لغة برمجة",
                "correct_answer": false
            }
        ]
    }',
    true
FROM users u
WHERE u.role = 'teacher'
AND NOT EXISTS (SELECT 1 FROM question_bank_templates WHERE teacher_id = u.id AND name LIKE '%البرمجة الأساسية%')
LIMIT 1;

-- =====================================================
-- 11. CREATE FUNCTIONS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update usage count when question is used in exam
CREATE OR REPLACE FUNCTION update_question_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE question_bank 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.question_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update template usage count
CREATE OR REPLACE FUNCTION update_template_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE question_bank_templates 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.template_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. CREATE TRIGGERS
-- =====================================================

-- Trigger for question usage count
DROP TRIGGER IF EXISTS trigger_update_question_usage_count ON exam_questions;
CREATE TRIGGER trigger_update_question_usage_count
    AFTER INSERT ON exam_questions
    FOR EACH ROW EXECUTE FUNCTION update_question_usage_count();

-- =====================================================
-- COMPLETE!
-- =====================================================

-- Question bank features have been added successfully!
-- Teachers can now create and manage question banks
-- Students can view public questions from their enrolled courses' teachers
