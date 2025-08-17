import DashboardLayout from "../../../components/layouts/DashboardLayout";
import { 
  BookOpenIcon, 
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon 
} from "@heroicons/react/24/outline";

const studentData = {
  name: "أحمد حسن",
  avatar: undefined,
  stats: {
    enrolledCourses: 4,
    completedAssignments: 12,
    pendingAssignments: 3,
    totalHoursLearned: 47,
  },
  recentCourses: [
    {
      id: 1,
      title: "الرياضيات المتقدمة",
      instructor: "د. سارة أحمد",
      progress: 75,
      nextLesson: "تقنيات التكامل",
      dueDate: "2024-08-15",
    },
    {
      id: 2,
      title: "أساسيات الفيزياء",
      instructor: "أ. محمد علي",
      progress: 45,
      nextLesson: "قوانين نيوتن",
      dueDate: "2024-08-20",
    },
    {
      id: 3,
      title: "أساسيات الكيمياء",
      instructor: "د. فاطمة نور",
      progress: 90,
      nextLesson: "الكيمياء العضوية",
      dueDate: "2024-08-18",
    },
  ],
  upcomingAssignments: [
    {
      id: 1,
      title: "مجموعة مسائل التفاضل والتكامل 3",
      course: "الرياضيات المتقدمة",
      dueDate: "2024-08-16",
      status: "pending",
    },
    {
      id: 2,
      title: "تقرير مختبر الفيزياء",
      course: "أساسيات الفيزياء",
      dueDate: "2024-08-18",
      status: "pending",
    },
    {
      id: 3,
      title: "اختبار الكيمياء",
      course: "أساسيات الكيمياء",
      dueDate: "2024-08-20",
      status: "pending",
    },
  ],
  achievements: [
    { name: "متعلم سريع", description: "أكمل 5 دروس في يوم واحد", icon: "⚡" },
    { name: "درجة كاملة", description: "حصل على 100% في اختبار الرياضيات", icon: "🎯" },
    { name: "المثابرة", description: "سلسلة تعلم لمدة 7 أيام", icon: "🔥" },
  ]
};

export default function StudentDashboard() {
  return (
    <DashboardLayout userRole="student" userName={studentData.name} userAvatar={studentData.avatar}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">مرحباً بك، {studentData.name}!</h1>
            <p className="mt-1 text-gray-600">
              تابع رحلة التعلم وراقب تقدمك.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">الكورسات المسجلة</p>
                  <p className="text-3xl font-bold mt-2">{studentData.stats.enrolledCourses}</p>
                </div>
                <BookOpenIcon className="h-8 w-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">المهام المكتملة</p>
                  <p className="text-3xl font-bold mt-2">{studentData.stats.completedAssignments}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">المهام المعلقة</p>
                  <p className="text-3xl font-bold mt-2">{studentData.stats.pendingAssignments}</p>
                </div>
                <ClockIcon className="h-8 w-8 text-orange-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">ساعات التعلم</p>
                  <p className="text-3xl font-bold mt-2">{studentData.stats.totalHoursLearned}ساعة</p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-purple-200" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Continue Learning */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900">تابع التعلم</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {studentData.recentCourses.map((course) => (
                      <div key={course.id} className="group border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {course.title}
                            </h4>
                            <p className="text-gray-600 mt-1">{course.instructor}</p>
                            <p className="text-sm text-gray-500 mt-1">الدرس التالي: {course.nextLesson}</p>
                            
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600">التقدم</span>
                                <span className="font-semibold text-indigo-600">{course.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <button className="mr-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg">
                            <PlayIcon className="h-4 w-4 ml-2" />
                            متابعة
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Assignments */}
              <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900">المهام القادمة</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {studentData.upcomingAssignments.map((assignment) => (
                      <div key={assignment.id} className="border-r-4 border-orange-400 pr-4 py-3 bg-orange-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-900">{assignment.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{assignment.course}</p>
                        <p className="text-xs text-orange-600 mt-2 font-medium">موعد التسليم: {assignment.dueDate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900">الإنجازات الأخيرة</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {studentData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3 space-x-reverse p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{achievement.name}</h4>
                          <p className="text-xs text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
