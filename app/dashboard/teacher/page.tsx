import DashboardLayout from "../../../components/layouts/DashboardLayout";
import { 
  BookOpenIcon, 
  UserGroupIcon, 
  PlusIcon,
  EyeIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon 
} from "@heroicons/react/24/outline";

const teacherData = {
  name: "د. سارة أحمد",
  avatar: undefined,
  stats: {
    totalCourses: 8,
    totalStudents: 247,
    pendingAssignments: 15,
    monthlyRevenue: 3250,
  },
  courses: [
    {
      id: 1,
      title: "الرياضيات المتقدمة",
      students: 45,
      progress: 75,
      status: "منشور",
      revenue: 1250,
    },
    {
      id: 2,
      title: "التفاضل والتكامل للمبتدئين",
      students: 78,
      progress: 100,
      status: "منشور",
      revenue: 2000,
    },
    {
      id: 3,
      title: "الجبر الخطي",
      students: 32,
      progress: 60,
      status: "مسودة",
      revenue: 0,
    },
  ],
  recentActivity: [
    {
      id: 1,
      type: "assignment",
      title: "مهمة جديدة من أحمد حسن",
      course: "الرياضيات المتقدمة",
      time: "منذ ساعتين",
    },
    {
      id: 2,
      type: "enrollment",
      title: "5 طلاب جدد تم تسجيلهم",
      course: "التفاضل والتكامل للمبتدئين",
      time: "منذ 4 ساعات",
    },
    {
      id: 3,
      type: "completion",
      title: "15 طالب أكملوا الدرس 3",
      course: "الرياضيات المتقدمة",
      time: "منذ 6 ساعات",
    },
  ],
  pendingReviews: [
    {
      id: 1,
      student: "أحمد حسن",
      assignment: "مجموعة مسائل التفاضل والتكامل 3",
      course: "الرياضيات المتقدمة",
      submittedAt: "2024-08-15",
    },
    {
      id: 2,
      student: "فاطمة علي",
      assignment: "اختبار المعادلات الخطية",
      course: "الرياضيات المتقدمة",
      submittedAt: "2024-08-15",
    },
    {
      id: 3,
      student: "عمر محمود",
      assignment: "تمارين التكامل",
      course: "التفاضل والتكامل للمبتدئين",
      submittedAt: "2024-08-14",
    },
  ]
};

export default function TeacherDashboard() {
  return (
    <DashboardLayout userRole="teacher" userName={teacherData.name} userAvatar={teacherData.avatar}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">مرحباً بك، {teacherData.name}!</h1>
              <p className="mt-1 text-gray-600">
                إدارة الكورسات ومتابعة تقدم الطلاب.
              </p>
            </div>
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg">
              <PlusIcon className="h-5 w-5 ml-2" />
              إنشاء كورس جديد
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">إجمالي الكورسات</p>
                  <p className="text-3xl font-bold mt-2">{teacherData.stats.totalCourses}</p>
                </div>
                <BookOpenIcon className="h-8 w-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">إجمالي الطلاب</p>
                  <p className="text-3xl font-bold mt-2">{teacherData.stats.totalStudents}</p>
                </div>
                <UserGroupIcon className="h-8 w-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">المراجعات المعلقة</p>
                  <p className="text-3xl font-bold mt-2">{teacherData.stats.pendingAssignments}</p>
                </div>
                <ClipboardDocumentCheckIcon className="h-8 w-8 text-orange-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">الإيرادات الشهرية</p>
                  <p className="text-3xl font-bold mt-2">${teacherData.stats.monthlyRevenue}</p>
                </div>
                                  <ArrowTrendingUpIcon className="h-8 w-8 text-purple-200" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* My Courses */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">كورساتي</h3>
                  <button className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
                    عرض الكل
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {teacherData.courses.map((course) => (
                      <div key={course.id} className="group border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {course.title}
                            </h4>
                            <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                <UserGroupIcon className="h-4 w-4 ml-1" />
                                {course.students} طالب
                              </div>
                              <div className="flex items-center">
                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                                  course.status === 'منشور' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {course.status}
                                </span>
                              </div>
                              <div className="flex items-center text-green-600 font-medium">
                                <CurrencyDollarIcon className="h-4 w-4 ml-1" />
                                ${course.revenue}
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 flex gap-2 mr-6">
                            <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                              <EyeIcon className="h-4 w-4 ml-1" />
                              عرض
                            </button>
                            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-200">
                              تحرير
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pending Reviews */}
              <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900">المراجعات المعلقة</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {teacherData.pendingReviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-r-4 border-orange-400 pr-4 py-3 bg-orange-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-900">{review.assignment}</h4>
                        <p className="text-xs text-gray-600 mt-1">{review.student}</p>
                        <p className="text-xs text-orange-600 mt-2 font-medium">تم التسليم: {review.submittedAt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900">النشاط الأخير</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {teacherData.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{activity.title}</h4>
                          <p className="text-xs text-gray-600">{activity.course}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
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
