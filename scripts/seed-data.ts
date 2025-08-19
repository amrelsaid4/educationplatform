import { supabase } from '../lib/supabase'

// Sample data for courses
const sampleCourses = [
  {
    title: 'أساسيات البرمجة بلغة Python',
    description: 'تعلم أساسيات البرمجة باستخدام لغة Python من الصفر حتى الاحتراف',
    price: 199,
    level: 'beginner',
    category: 'البرمجة',
    is_free: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
    duration_hours: 20,
    total_lessons: 15,
    status: 'published'
  },
  {
    title: 'تطوير تطبيقات الويب باستخدام React',
    description: 'تعلم تطوير تطبيقات الويب الحديثة باستخدام مكتبة React',
    price: 299,
    level: 'intermediate',
    category: 'تطوير الويب',
    is_free: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    duration_hours: 25,
    total_lessons: 18,
    status: 'published'
  },
  {
    title: 'أساسيات الرياضيات للمبتدئين',
    description: 'دورة شاملة في أساسيات الرياضيات للمبتدئين',
    price: 0,
    level: 'beginner',
    category: 'الرياضيات',
    is_free: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
    duration_hours: 15,
    total_lessons: 12,
    status: 'published'
  },
  {
    title: 'تعلم اللغة الإنجليزية للمبتدئين',
    description: 'دورة شاملة لتعلم اللغة الإنجليزية من الصفر',
    price: 149,
    level: 'beginner',
    category: 'اللغات',
    is_free: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400',
    duration_hours: 30,
    total_lessons: 20,
    status: 'published'
  },
  {
    title: 'أساسيات الفيزياء',
    description: 'تعلم أساسيات الفيزياء بطريقة مبسطة ومفهومة',
    price: 0,
    level: 'beginner',
    category: 'العلوم',
    is_free: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    duration_hours: 18,
    total_lessons: 14,
    status: 'published'
  }
]

// Sample data for lessons
const sampleLessons = [
  // Python Course Lessons
  {
    title: 'مقدمة في البرمجة',
    description: 'تعرف على أساسيات البرمجة ومفاهيمها الأساسية',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content: 'في هذا الدرس سنتعرف على أساسيات البرمجة ومفاهيمها الأساسية...',
    duration_minutes: 45,
    order_index: 1,
    is_free: true
  },
  {
    title: 'تثبيت Python وبيئة التطوير',
    description: 'تعلم كيفية تثبيت Python وإعداد بيئة التطوير',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content: 'سنقوم بتثبيت Python وإعداد بيئة التطوير المناسبة...',
    duration_minutes: 30,
    order_index: 2,
    is_free: true
  },
  {
    title: 'المتغيرات وأنواع البيانات',
    description: 'تعلم المتغيرات وأنواع البيانات الأساسية في Python',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content: 'المتغيرات هي حاويات لتخزين البيانات...',
    duration_minutes: 60,
    order_index: 3,
    is_free: false
  },
  // React Course Lessons
  {
    title: 'مقدمة في React',
    description: 'تعرف على مكتبة React وأهميتها في تطوير الويب',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content: 'React هي مكتبة JavaScript مفتوحة المصدر...',
    duration_minutes: 50,
    order_index: 1,
    is_free: true
  },
  {
    title: 'إعداد مشروع React',
    description: 'تعلم كيفية إنشاء وإعداد مشروع React جديد',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content: 'سنقوم بإنشاء مشروع React جديد باستخدام Create React App...',
    duration_minutes: 40,
    order_index: 2,
    is_free: true
  },
  {
    title: 'المكونات (Components)',
    description: 'تعلم كيفية إنشاء واستخدام المكونات في React',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content: 'المكونات هي اللبنات الأساسية في React...',
    duration_minutes: 70,
    order_index: 3,
    is_free: false
  }
]

async function seedData() {
  try {
    console.log('بدء إضافة البيانات التجريبية...')

    // Get a teacher user (assuming there's at least one teacher)
    const { data: teachers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'teacher')
      .limit(1)

    if (!teachers || teachers.length === 0) {
      console.log('لا يوجد معلمين في النظام. يرجى إنشاء حساب معلم أولاً.')
      return
    }

    const teacherId = teachers[0].id

    // Insert courses
    for (const courseData of sampleCourses) {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          teacher_id: teacherId,
          language: 'ar',
          enrollment_count: Math.floor(Math.random() * 100) + 10,
          rating: (Math.random() * 2 + 3).toFixed(1) // Random rating between 3-5
        })
        .select()
        .single()

      if (courseError) {
        console.error('خطأ في إضافة الكورس:', courseError)
        continue
      }

      console.log(`تم إضافة الكورس: ${course.title}`)

      // Add lessons for this course
      const courseLessons = sampleLessons.slice(0, 3) // First 3 lessons for each course
      for (const lessonData of courseLessons) {
        const { error: lessonError } = await supabase
          .from('lessons')
          .insert({
            ...lessonData,
            course_id: course.id
          })

        if (lessonError) {
          console.error('خطأ في إضافة الدرس:', lessonError)
        }
      }

      console.log(`تم إضافة ${courseLessons.length} درس للكورس: ${course.title}`)
    }

    console.log('تم إضافة البيانات التجريبية بنجاح!')
  } catch (error) {
    console.error('خطأ في إضافة البيانات التجريبية:', error)
  }
}

// Run the seed function
seedData()
