import { supabase } from '../lib/supabase'

async function setupStorage() {
  try {
    console.log('Setting up Supabase Storage...')

    // Create course-videos bucket
    const { data: videosBucket, error: videosError } = await supabase.storage.createBucket('course-videos', {
      public: true,
      allowedMimeTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
      fileSizeLimit: 104857600 // 100MB
    })

    if (videosError) {
      if (videosError.message.includes('already exists')) {
        console.log('course-videos bucket already exists')
      } else {
        console.error('Error creating course-videos bucket:', videosError)
      }
    } else {
      console.log('Created course-videos bucket')
    }

    // Create course-thumbnails bucket
    const { data: thumbnailsBucket, error: thumbnailsError } = await supabase.storage.createBucket('course-thumbnails', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    })

    if (thumbnailsError) {
      if (thumbnailsError.message.includes('already exists')) {
        console.log('course-thumbnails bucket already exists')
      } else {
        console.error('Error creating course-thumbnails bucket:', thumbnailsError)
      }
    } else {
      console.log('Created course-thumbnails bucket')
    }

    // Create user-avatars bucket
    const { data: avatarsBucket, error: avatarsError } = await supabase.storage.createBucket('user-avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 2097152 // 2MB
    })

    if (avatarsError) {
      if (avatarsError.message.includes('already exists')) {
        console.log('user-avatars bucket already exists')
      } else {
        console.error('Error creating user-avatars bucket:', avatarsError)
      }
    } else {
      console.log('Created user-avatars bucket')
    }

    console.log('Storage setup completed!')
  } catch (error) {
    console.error('Error setting up storage:', error)
  }
}

setupStorage()
