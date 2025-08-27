-- Add community and discussion tables
-- This script creates tables for community features

-- 1. Create discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create discussion_replies table
CREATE TABLE IF NOT EXISTS discussion_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create discussion_likes table
CREATE TABLE IF NOT EXISTS discussion_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(discussion_id, user_id)
);

-- 4. Create reply_likes table
CREATE TABLE IF NOT EXISTS reply_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- 5. Create discussion_views table
CREATE TABLE IF NOT EXISTS discussion_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(discussion_id, user_id)
);

-- 6. Add missing columns to existing tables if they don't exist
DO $$ 
BEGIN
    -- Add missing columns to discussions table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'views_count') THEN
        ALTER TABLE discussions ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'likes_count') THEN
        ALTER TABLE discussions ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'is_pinned') THEN
        ALTER TABLE discussions ADD COLUMN is_pinned BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussions' AND column_name = 'is_locked') THEN
        ALTER TABLE discussions ADD COLUMN is_locked BOOLEAN DEFAULT false;
    END IF;

    -- Add missing columns to discussion_replies table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'likes_count') THEN
        ALTER TABLE discussion_replies ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discussion_replies' AND column_name = 'parent_reply_id') THEN
        ALTER TABLE discussion_replies ADD COLUMN parent_reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discussions_course_id ON discussions(course_id);
CREATE INDEX IF NOT EXISTS idx_discussions_author_id ON discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at);
CREATE INDEX IF NOT EXISTS idx_discussions_is_pinned ON discussions(is_pinned);
CREATE INDEX IF NOT EXISTS idx_discussions_views_count ON discussions(views_count);
CREATE INDEX IF NOT EXISTS idx_discussions_likes_count ON discussions(likes_count);

CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_id ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_author_id ON discussion_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_parent_reply_id ON discussion_replies(parent_reply_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_created_at ON discussion_replies(created_at);

CREATE INDEX IF NOT EXISTS idx_discussion_likes_discussion_id ON discussion_likes(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_likes_user_id ON discussion_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_reply_likes_reply_id ON reply_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_reply_likes_user_id ON reply_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_discussion_views_discussion_id ON discussion_views(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_views_user_id ON discussion_views(user_id);

-- 8. Enable RLS on all tables
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_views ENABLE ROW LEVEL SECURITY;

-- 9. Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view discussions" ON discussions;
DROP POLICY IF EXISTS "Users can create discussions" ON discussions;
DROP POLICY IF EXISTS "Authors can manage their discussions" ON discussions;
DROP POLICY IF EXISTS "Teachers can manage discussions in their courses" ON discussions;

DROP POLICY IF EXISTS "Users can view discussion replies" ON discussion_replies;
DROP POLICY IF EXISTS "Users can create discussion replies" ON discussion_replies;
DROP POLICY IF EXISTS "Authors can manage their replies" ON discussion_replies;

DROP POLICY IF EXISTS "Users can manage their discussion likes" ON discussion_likes;
DROP POLICY IF EXISTS "Users can manage their reply likes" ON reply_likes;
DROP POLICY IF EXISTS "Users can manage their discussion views" ON discussion_views;

-- 10. Create policies for discussions
CREATE POLICY "Users can view discussions" ON discussions
FOR SELECT USING (true);

CREATE POLICY "Users can create discussions" ON discussions
FOR INSERT WITH CHECK (author_id::text = auth.uid()::text);

CREATE POLICY "Authors can manage their discussions" ON discussions
FOR UPDATE USING (author_id::text = auth.uid()::text);

CREATE POLICY "Teachers can manage discussions in their courses" ON discussions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = discussions.course_id 
    AND courses.teacher_id::text = auth.uid()::text
  )
);

-- 11. Create policies for discussion_replies
CREATE POLICY "Users can view discussion replies" ON discussion_replies
FOR SELECT USING (true);

CREATE POLICY "Users can create discussion replies" ON discussion_replies
FOR INSERT WITH CHECK (author_id::text = auth.uid()::text);

CREATE POLICY "Authors can manage their replies" ON discussion_replies
FOR UPDATE USING (author_id::text = auth.uid()::text);

-- 12. Create policies for likes and views
CREATE POLICY "Users can manage their discussion likes" ON discussion_likes
FOR ALL USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can manage their reply likes" ON reply_likes
FOR ALL USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can manage their discussion views" ON discussion_views
FOR ALL USING (user_id::text = auth.uid()::text);

-- 13. Grant necessary permissions
GRANT ALL ON discussions TO authenticated;
GRANT ALL ON discussion_replies TO authenticated;
GRANT ALL ON discussion_likes TO authenticated;
GRANT ALL ON reply_likes TO authenticated;
GRANT ALL ON discussion_views TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 14. Add some test data if tables are empty
INSERT INTO discussions (id, title, content, course_id, author_id, views_count, likes_count, created_at)
SELECT 
    gen_random_uuid(),
    'سؤال حول الدرس الثالث في البرمجة',
    'أحتاج مساعدة في فهم مفهوم الـ loops في JavaScript. هل يمكن لأحد شرحه لي؟',
    c.id,
    u.id,
    15,
    2,
    NOW() - INTERVAL '1 hour'
FROM courses c, users u
WHERE c.status = 'published'
AND u.role = 'student'
AND NOT EXISTS (SELECT 1 FROM discussions WHERE discussions.course_id = c.id)
LIMIT 1;

INSERT INTO discussions (id, title, content, course_id, author_id, views_count, likes_count, created_at)
SELECT 
    gen_random_uuid(),
    'مشاركة مشروعي النهائي',
    'أريد مشاركة مشروعي النهائي معكم. هل يمكنكم إعطائي نصائح للتحسين؟',
    c.id,
    u.id,
    8,
    1,
    NOW() - INTERVAL '2 hours'
FROM courses c, users u
WHERE c.status = 'published'
AND u.role = 'student'
AND NOT EXISTS (SELECT 1 FROM discussions WHERE discussions.course_id = c.id)
LIMIT 1;

-- 15. Create functions to update counts
CREATE OR REPLACE FUNCTION update_discussion_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE discussions 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.discussion_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE discussions 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.discussion_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_reply_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE discussion_replies 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.reply_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE discussion_replies 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.reply_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_discussion_views_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE discussions 
    SET views_count = views_count + 1 
    WHERE id = NEW.discussion_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 16. Create triggers
DROP TRIGGER IF EXISTS trigger_update_discussion_likes_count ON discussion_likes;
CREATE TRIGGER trigger_update_discussion_likes_count
    AFTER INSERT OR DELETE ON discussion_likes
    FOR EACH ROW EXECUTE FUNCTION update_discussion_likes_count();

DROP TRIGGER IF EXISTS trigger_update_reply_likes_count ON reply_likes;
CREATE TRIGGER trigger_update_reply_likes_count
    AFTER INSERT OR DELETE ON reply_likes
    FOR EACH ROW EXECUTE FUNCTION update_reply_likes_count();

DROP TRIGGER IF EXISTS trigger_update_discussion_views_count ON discussion_views;
CREATE TRIGGER trigger_update_discussion_views_count
    AFTER INSERT ON discussion_views
    FOR EACH ROW EXECUTE FUNCTION update_discussion_views_count();
