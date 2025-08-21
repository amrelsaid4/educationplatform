'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { getStudentAchievements } from '@/lib/course-utils'
import { 
  TrophyIcon, 
  AcademicCapIcon, 
  StarIcon, 
  FireIcon,
  BookOpenIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Achievement {
  id: string
  achievement_type: string
  achievement_data?: any
  created_at: string
}

interface StudentAchievementsProps {
  userId: string
}

export default function StudentAchievements({ userId }: StudentAchievementsProps) {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAchievements()
  }, [userId])

  const loadAchievements = async () => {
    setLoading(true)
    try {
      const data = await getStudentAchievements(userId)
      setAchievements(data || [])
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAchievementInfo = (type: string) => {
    switch (type) {
      case 'course_completed':
        return {
          title: 'إكمال الكورس',
          description: 'أكملت كورس بنجاح',
          icon: AcademicCapIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20'
        }
      case 'lessons_watched':
        return {
          title: 'مشاهد نشط',
          description: 'شاهدت 10 دروس',
          icon: BookOpenIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-900/20'
        }
      case 'streak_7_days':
        return {
          title: 'أسبوع من التعلم',
          description: 'تعلمت لمدة 7 أيام متتالية',
          icon: FireIcon,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20'
        }
      case 'first_course':
        return {
          title: 'المبتدئ',
          description: 'أكملت أول كورس',
          icon: StarIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
        }
      case 'study_time':
        return {
          title: 'متعلم مجتهد',
          description: 'قضيت 50 ساعة في التعلم',
          icon: ClockIcon,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100 dark:bg-purple-900/20'
        }
      default:
        return {
          title: 'إنجاز جديد',
          description: 'حصلت على إنجاز جديد',
          icon: TrophyIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100 dark:bg-gray-700'
        }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <TrophyIcon className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            إنجازاتي
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({achievements.length})
          </span>
        </div>
      </div>

      <div className="p-6">
        {achievements.length === 0 ? (
          <div className="text-center py-8">
            <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لا توجد إنجازات بعد
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              ابدأ في التعلم لتحصل على إنجازاتك الأولى!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {achievements.map((achievement) => {
              const info = getAchievementInfo(achievement.achievement_type)
              const IconComponent = info.icon

              return (
                <div key={achievement.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-12 h-12 ${info.bgColor} rounded-full flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${info.color}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {info.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {info.description}
                    </p>
                    {achievement.achievement_data && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {achievement.achievement_data.courseName && (
                          <span>الكورس: {achievement.achievement_data.courseName}</span>
                        )}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(achievement.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Achievement Progress */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
            التقدم نحو الإنجازات القادمة
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <BookOpenIcon className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  شاهد 20 درس
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="w-8 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-500">40%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <ClockIcon className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  قض 100 ساعة في التعلم
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="w-12 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-500">60%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <FireIcon className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  تعلم لمدة 30 يوم متتالي
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="w-4 h-2 bg-orange-600 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-500">20%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
