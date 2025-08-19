-- إصلاح Storage Policies للفيديوهات

-- حذف الـ policies الموجودة أولاً (إذا كانت موجودة)
DROP POLICY IF EXISTS "Allow authenticated uploads to course-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to course-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to course-videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from course-videos" ON storage.objects;

-- إنشاء الـ policies الجديدة
CREATE POLICY "Allow authenticated uploads to course-videos" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' 
  AND bucket_id = 'course-videos'
);

CREATE POLICY "Allow public read access to course-videos" ON storage.objects
FOR SELECT USING (bucket_id = 'course-videos');

CREATE POLICY "Allow authenticated updates to course-videos" ON storage.objects
FOR UPDATE USING (
  auth.role() = 'authenticated' 
  AND bucket_id = 'course-videos'
);

CREATE POLICY "Allow authenticated deletes from course-videos" ON storage.objects
FOR DELETE USING (
  auth.role() = 'authenticated' 
  AND bucket_id = 'course-videos'
);

-- التأكد من أن bucket موجود
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos',
  true,
  104857600, -- 100MB
  ARRAY['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']
) ON CONFLICT (id) DO NOTHING;
