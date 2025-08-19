-- Setup Supabase Storage for course videos

-- Create course-videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos',
  true,
  104857600, -- 100MB
  ARRAY['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']
) ON CONFLICT (id) DO NOTHING;

-- Create course-thumbnails bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-thumbnails',
  'course-thumbnails',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create user-avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Policies for course-videos bucket
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

-- Policies for course-thumbnails bucket
CREATE POLICY "Allow authenticated uploads to course-thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' 
  AND bucket_id = 'course-thumbnails'
);

CREATE POLICY "Allow public read access to course-thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'course-thumbnails');

-- Policies for user-avatars bucket
CREATE POLICY "Allow authenticated uploads to user-avatars" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' 
  AND bucket_id = 'user-avatars'
);

CREATE POLICY "Allow public read access to user-avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');
