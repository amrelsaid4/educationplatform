'use client';

import React, { useState } from 'react';
import { useTheme } from '../../components/providers/ThemeProvider';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  ArrowRight,
  PlayCircle,
  Star,
  StarHalf,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Calendar,
  Users,
  Award,
  BookOpen,
  GraduationCap,
  Video,
  MessageCircle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  ArrowLeft,
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openVideoDialog = () => {
    setIsVideoDialogOpen(true);
  };

  const closeVideoDialog = () => {
    setIsVideoDialogOpen(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  const navigateToLogin = () => {
    router.push('/auth/login');
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
  };

  const navigateToCourses = () => {
    router.push('/courses');
  };

  const stats = [
    { number: '15K+', label: 'طالب', icon: Users },
    { number: '75%', label: 'إجمالي النجاح', icon: Award },
    { number: '35', label: 'أسئلة رئيسية', icon: BookOpen },
    { number: '26', label: 'كبير الخبراء', icon: GraduationCap },
    { number: '16', label: 'سنوات الخبرة', icon: Calendar },
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'الفواتير والعقود عبر الإنترنت',
      description: 'تحكم بسيط وآمن في المعاملات المالية والقانونية لمؤسستك. أرسل فواتير وعقود مخصصة.',
      color: 'from-emerald-700 to-emerald-800'
    },
    {
      icon: Calendar,
      title: 'جدولة سهلة وتتبع الحضور',
      description: 'جدولة الفصول الدراسية وحجزها في حرم جامعي واحد أو عدة أحرم. احتفظ بسجلات مفصلة لحضور الطلاب.',
      color: 'from-amber-700 to-amber-800'
    },
    {
      icon: Users,
      title: 'تتبع العملاء',
      description: 'أتمتة وتتبع رسائل البريد الإلكتروني للأفراد أو المجموعات. يساعد النظام المدمج في TOTC على تنظيم مؤسستك.',
      color: 'from-rose-700 to-rose-800'
    }
  ];

  const testimonials = [
    {
      name: 'جلوريا روز',
      role: 'معلمة تصميم تجربة المستخدم',
      content: '"شكراً جزيلاً على مساعدتكم. هذا بالضبط ما كنت أبحث عنه. لن تندموا على ذلك. إنه حقاً يوفر علي الوقت والجهد. TOTC هو بالضبط ما كانت تفتقر إليه أعمالنا."',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'أحمد محمد',
      role: 'مدير مدرسة',
      content: '"منصة TOTC غيرت طريقة إدارتنا للفصول الدراسية. أصبح كل شيء أكثر تنظيماً وكفاءة. أنصح بها بشدة."',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    },
    {
      name: 'سارة أحمد',
      role: 'طالبة',
      content: '"التجربة التعليمية مع TOTC ممتازة. المنصة سهلة الاستخدام والتفاعل مع المعلمين أصبح أكثر سلاسة."',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
    }
  ];

  return (
    <div className={`font-sans antialiased transition-colors duration-300 ${theme === "dark"
      ? 'text-gray-100 bg-dark-900'
      : 'text-gray-800 bg-white'
      } overflow-x-hidden`} dir="rtl">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 shadow-lg" style={{ background: '#49BBBD' }}>
        {/* Curved bottom edge with enhanced styling */}
        <div className="relative">
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-white dark:bg-dark-900 rounded-t-full shadow-inner"></div>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/20 to-transparent rounded-t-full"></div>
        </div>

        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center relative z-10">
          {/* Logo with enhanced styling */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300">
              <span className="text-teal-600 text-2xl font-bold">T</span>
            </div>
            <span className="text-3xl font-bold text-white drop-shadow-lg">
              TOTC
            </span>
          </div>

          {/* Desktop Navigation with enhanced styling */}
          <div className="hidden lg:flex items-center space-x-12">
            <a href="#home" className="text-white hover:text-teal-200 transition-all duration-300 font-medium relative group">
              <span>الرئيسية</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#courses" className="text-white hover:text-teal-200 transition-all duration-300 font-medium relative group">
              <span>الدورات</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#features" className="text-white hover:text-teal-200 transition-all duration-300 font-medium relative group">
              <span>الميزات</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#about" className="text-white hover:text-teal-200 transition-all duration-300 font-medium relative group">
              <span>عنّا</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#contact" className="text-white hover:text-teal-200 transition-all duration-300 font-medium relative group">
              <span>اتصل بنا</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          {/* Auth Buttons & Theme Toggle with enhanced styling */}
          <div className="hidden lg:flex items-center space-x-6" style={{ flexDirection: 'row-reverse' }}>
            <button
              onClick={navigateToCourses}
              className="px-6 py-3 rounded-full border-2 border-white text-white hover:bg-white hover:text-teal-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              الكورسات
            </button>
            <button
              onClick={navigateToLogin}
              className="px-6 py-3 rounded-full border-2 border-white text-white hover:bg-white hover:text-teal-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              تسجيل الدخول
            </button>
            <button
              onClick={navigateToRegister}
              className="px-6 py-3 rounded-full text-teal-600 bg-white hover:bg-gray-50 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              اشتراك
            </button>
            <button
              onClick={toggleTheme}
              className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={toggleMenu} className="p-2 focus:outline-none text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-teal-400 shadow-xl" style={{ background: '#49BBBD' }}>
            <div className="px-4 pt-2 pb-4 space-y-2">
              <a href="#home" onClick={toggleMenu} className="block py-2 font-medium text-white hover:text-gray-200 transition-colors duration-300">
                الرئيسية
              </a>
              <a href="#courses" onClick={toggleMenu} className="block py-2 font-medium text-white hover:text-gray-200 transition-colors duration-300">
                الدورات
              </a>
              <button
                onClick={() => { navigateToCourses(); toggleMenu(); }}
                className="block w-full text-right py-2 font-medium text-white hover:text-gray-200 transition-colors duration-300"
              >
                الكورسات المتاحة
              </button>
              <a href="#features" onClick={toggleMenu} className="block py-2 font-medium text-white hover:text-gray-200 transition-colors duration-300">
                الميزات
              </a>
              <a href="#about" onClick={toggleMenu} className="block py-2 font-medium text-white hover:text-gray-200 transition-colors duration-300">
                عنّا
              </a>
              <a href="#contact" onClick={toggleMenu} className="block py-2 font-medium text-white hover:text-gray-200 transition-colors duration-300">
                اتصل بنا
              </a>
              <div className="pt-4 space-y-2">
                <button
                  onClick={navigateToCourses}
                  className="w-full px-6 py-2.5 rounded-full border-2 border-white text-white hover:bg-white hover:text-teal-600 transition-all duration-300 font-medium"
                >
                  الكورسات
                </button>
                <button
                  onClick={navigateToLogin}
                  className="w-full px-6 py-2.5 rounded-full border-2 border-white text-white hover:bg-white hover:text-teal-600 transition-all duration-300 font-medium"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={navigateToRegister}
                  className="w-full px-6 py-2.5 rounded-full text-teal-600 bg-white hover:bg-gray-100 transition-all duration-300 font-medium"
                >
                  اشتراك
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section with enhanced design */}
        <section
          id="home"
          className="relative py-20 lg:py-32 overflow-hidden"
          style={{ background: '#49BBBD' }}
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-12 lg:space-y-0 lg:space-x-12">
              {/* Text Content with enhanced styling */}
              <div className="lg:w-1/2 text-center lg:text-right">
                <h1 className="text-5xl lg:text-7xl xl:text-8xl font-extrabold leading-tight mb-8 text-white drop-shadow-2xl">
                  <span style={{ color: '#252641' }}>
                    الدراسة عبر الإنترنت
                  </span>
                  <br />
                  <span className="text-white">الآن أسهل بكثير</span>
                </h1>
                <p className="text-xl lg:text-2xl mb-10 leading-relaxed text-teal-100 drop-shadow-lg">
                  TOTC هي منصة شيقة ستعلمك بطريقة تفاعلية ومتقدمة
                </p>
                <div className="flex flex-col sm:flex-row space-y-8 sm:space-y-0 sm:space-x-12 items-center justify-center lg:justify-evenly">
                  <button
                    onClick={navigateToRegister}
                    className="px-8 py-4 rounded-full text-teal-600 bg-white hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl font-bold text-lg border-2 border-white"
                  >
                    انضم مجاناً
                  </button>
                  <button onClick={openVideoDialog} className="px-8 py-4 rounded-full border-3 border-white text-white hover:bg-white hover:text-teal-600 transition-all duration-300 flex items-center space-x-3 font-bold text-lg shadow-2xl hover:shadow-3xl">
                    <PlayCircle size={24} />
                    <span>شاهد كيف يعمل</span>
                  </button>
                </div>
              </div>

              {/* Video Section with enhanced styling */}
              <div className="relative w-full lg:w-1/2 flex justify-center lg:justify-evenly">
                <div className="relative">
                  {/* Video with enhanced styling */}
                  <video
                    src="/assets/video/3969453-uhd_3840_2160_25fps.mp4"
                    className="w-full h-auto max-h-[50vh] lg:max-h-[80vh] transition-transform duration-500 rounded-2xl lg:rounded-3xl object-cover shadow-xl lg:shadow-2xl border-2 lg:border-4 border-white/20"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />

                  {/* Enhanced Floating Cards */}
                  <div className="absolute -top-4 -left-4 lg:-top-8 lg:-left-8 p-3 lg:p-6 rounded-xl lg:rounded-3xl shadow-lg lg:shadow-2xl bg-white/30 backdrop-blur-xl border border-white/50 transform -rotate-2 lg:-rotate-3 hover:rotate-0 transition-all duration-500 animate-bounce hover:scale-105">
                    <div className="flex items-center space-x-2 lg:space-x-4">
                      <div className="w-6 h-6 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <Users size={12} className="lg:w-6 lg:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xs lg:text-base font-bold text-white drop-shadow-lg">250K طالب مساعد</h3>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 -right-4 lg:top-12 lg:-right-12 p-3 lg:p-6 rounded-xl lg:rounded-3xl shadow-lg lg:shadow-2xl bg-white/30 backdrop-blur-xl border border-white/50 transform rotate-2 lg:rotate-3 hover:rotate-0 transition-all duration-500 animate-bounce hover:scale-105" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center space-x-2 lg:space-x-4">
                      <div className="w-6 h-6 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <MessageCircle size={12} className="lg:w-6 lg:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xs lg:text-base font-bold text-white drop-shadow-lg">تهانينا</h3>
                        <p className="text-xs lg:text-sm text-white/90 drop-shadow-lg">تم إكمال تسجيلك</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -left-4 lg:-bottom-4 lg:-left-12 p-3 lg:p-6 rounded-xl lg:rounded-3xl shadow-lg lg:shadow-2xl bg-white/30 backdrop-blur-xl border border-white/50 transform -rotate-2 lg:-rotate-3 hover:rotate-0 transition-all duration-500 animate-bounce hover:scale-105" style={{ animationDelay: '1s' }}>
                    <div className="flex items-center space-x-2 lg:space-x-4">
                      <div className="w-6 h-6 lg:w-12 lg:h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                        <Users size={12} className="lg:w-6 lg:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xs lg:text-base font-bold text-white drop-shadow-lg">فصل تجربة المستخدم</h3>
                        <p className="text-xs lg:text-sm text-white/90 drop-shadow-lg">اليوم في 12:00 مساءً</p>
                        <button className="mt-2 lg:mt-3 text-xs lg:text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 px-3 lg:px-4 py-1 lg:py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                          انضم الآن
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Successes Section - Exact Design Match */}
        <section className={`py-24 transition-colors duration-300 ${theme === "dark" ? 'bg-dark-800' : 'bg-white'}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className={`text-4xl lg:text-5xl font-bold mb-6 transition-colors duration-300 ${theme === "dark" ? 'text-white' : 'text-gray-900'}`}>
                نجاحاتنا
              </h2>
              <p className={`text-xl max-w-3xl mx-auto transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-600'}`}>
                نحن نفخر بإنجازاتنا وأثرنا في مجال التعليم الرقمي
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-6xl lg:text-7xl font-normal mb-2" style={{ background: 'linear-gradient(135deg, #136CB5 0%, #49BBBD 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {stat.number}
                  </div>
                  <div className={`text-base lg:text-lg font-medium transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-600'}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={`py-20 transition-colors duration-300 ${theme === "dark" ? 'bg-dark-900' : 'bg-white'
          }`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6" style={{ color: '#00CBB8' }}>
                برنامج سحابي شامل
              </h2>
              <p className={`text-lg max-w-3xl mx-auto pb-10 transition-colors duration-300 ${theme === "dark" ? 'text-white' : ''}`} style={theme === "dark" ? {} : { color: '#2F327D' }}>
                TOTC هو برنامج سحابي شامل يجمع جميع الأدوات اللازمة لتشغيل مدرسة أو مكتب ناجح
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className={`rounded-3xl shadow-lg p-10 h-96 transform group-hover:scale-105 transition-all duration-300 border ${theme === "dark"
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                    } relative`}>
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center absolute -top-10 left-1/2 transform -translate-x-1/2 group-hover:scale-110 transition-transform duration-300`}
                      style={{
                        background: index === 0 ? '#00CBB8' :
                          index === 1 ? '#5B72EE' :
                            '#29B9E7'
                      }}>
                      <feature.icon size={40} className="text-white" />
                    </div>
                    <div className="pt-16 text-center">
                      <h3 className={`text-xl font-bold mb-6 transition-colors duration-300 ${theme === "dark" ? 'text-white' : 'text-gray-900'
                        }`}>{feature.title}</h3>
                      <p className={`leading-relaxed transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-600'
                        }`}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What is TOTC Section */}
        <section className={`py-20 transition-colors duration-300 ${theme === "dark" ? 'bg-dark-800' : 'bg-gray-50'
          }`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`text-4xl lg:text-5xl font-bold mb-6 transition-colors duration-300 ${theme === "dark" ? 'text-white' : ''}`} style={theme === "dark" ? {} : { color: '#2F327D' }}>
                ما هو <span style={{ color: '#00CBB8' }}>TOTC</span>؟
              </h2>
              <p className={`text-lg max-w-4xl mx-auto leading-relaxed transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : ''}`} style={theme === "dark" ? {} : { color: '#2F327D' }}>
                TOTC هو منصة تسمح للمعلمين بإنشاء فصول دراسية عبر الإنترنت حيث يمكنهم تخزين المواد التعليمية عبر الإنترنت؛ إدارة الواجبات والاختبارات والامتحانات؛ مراقبة المواعيد النهائية؛ تصحيح النتائج وتقديم التغذية الراجعة للطلاب كل ذلك في مكان واحد.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* FOR INSTRUCTORS Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/assets/images/teatcher.jpeg"
                  alt="معلم في الفصل"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute top-6 left-6">
                  <h3 className="text-2xl font-bold text-white uppercase">للمعلمين</h3>
                </div>
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  <button className="px-8 py-4 bg-gray-300 text-gray-900 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300">
                    ابدأ فصلاً دراسياً اليوم
                  </button>
                </div>
              </div>

              {/* FOR STUDENTS Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/assets/images/student.jpeg"
                  alt="طلاب يدرسون"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute top-6 left-6">
                  <h3 className="text-2xl font-bold text-white uppercase">للطلاب</h3>
                </div>
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  <button className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-semibold hover:bg-teal-700 transition-all duration-300">
                    أدخل رمز الوصول
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Everything you can do in a physical classroom Section */}
        <section className={`py-20 transition-colors duration-300 ${theme === "dark" ? 'bg-dark-800' : 'bg-gray-50'
          }`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="text-right">
                <h3 className={`text-3xl lg:text-4xl font-bold mb-6 transition-colors duration-300 ${theme === "dark" ? 'text-white' : 'text-gray-900'}`}>
                  كل ما يمكنك فعله في الفصل الدراسي التقليدي، يمكنك فعله مع <span style={{ color: '#00CBB8' }}>TOTC</span>
                </h3>
                <p className={`text-lg leading-relaxed mb-8 transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-600'}`}>
                  برنامج إدارة المدرسة من TOTC يساعد المدارس التقليدية والعبر الإنترنت في إدارة الجدولة والحضور والمدفوعات والفصول الدراسية الافتراضية كل ذلك في نظام سحابي واحد آمن.
                </p>
                <a href="#" className={`inline-block font-semibold text-lg underline transition-colors duration-300 ${theme === "dark" ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'}`}>
                  تعرف على المزيد
                </a>
              </div>

              {/* Video Section */}
              <div className="relative">
                <video
                  src="/assets/video/4495519-uhd_3840_2160_25fps.mp4"
                  className="w-full h-80 rounded-2xl object-cover shadow-2xl"
                  autoPlay
                  muted
                  loop
                  playsInline
                />


                {/* Decorative Shapes */}
                <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-green-200 rounded-3xl opacity-60 -z-10"></div>
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-200 rounded-2xl opacity-60 -z-10"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Features Section - Exact Design Match */}
        <section className={`py-24 transition-colors duration-300 ${theme === "dark" ? 'bg-dark-800' : 'bg-white'}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className={`text-4xl lg:text-5xl font-bold mb-6 transition-colors duration-300 ${theme === "dark" ? 'text-white' : ''}`}>
                <span style={theme === "dark" ? { color: '#ffffff' } : { color: '#252641' }}>ميزاتنا</span>
              </h2>
              <p className={`text-xl max-w-3xl mx-auto transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-600'}`}>
                هذه الميزة الاستثنائية جداً، يمكن أن تجعل أنشطة التعلم أكثر كفاءة
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Column - Image */}
              <div className="relative flex justify-center">
                <div className="relative">
                  {/* Main Image */}
                  <img
                    src="/assets/images/Our Features.png"
                    alt="Our Features Interface"
                    className="w-full h-auto"
                  />

                  {/* Decorative Shapes */}
                  <div className="absolute -top-8 -left-8 w-32 h-32 bg-teal-400 rounded-full opacity-80 -z-10"></div>
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-300 rounded-full opacity-80 -z-10"></div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-orange-400 rounded-full opacity-80 -z-10"></div>
                </div>
              </div>

              {/* Right Column - Text Content */}
              <div className="text-right">
                <h3 className={`text-3xl lg:text-4xl font-bold mb-8 transition-colors duration-300 ${theme === "dark" ? 'text-white' : ''}`}>
                  <span style={theme === "dark" ? { color: '#ffffff' } : { color: '#252641' }}>واجهة مستخدم مصممة</span>
                  <br />
                  <span style={{ color: '#00CBB8' }}>للفصول الدراسية</span>
                </h3>

                <div className="space-y-8">
                  {/* Feature 1 */}
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                      </div>
                    </div>
                    <div>
                      <p className={`text-lg leading-relaxed transition-colors duration-300 ${theme === "dark" ? 'text-gray-200' : 'text-gray-700'}`}>
                        المعلمون لا يضيعون في العرض الشبكي ولديهم مساحة منصة مخصصة
                      </p>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                        <div className="w-2 h-2 bg-white rounded-sm ml-1"></div>
                        <div className="w-2 h-2 bg-white rounded-sm"></div>
                      </div>
                    </div>
                    <div>
                      <p className={`text-lg leading-relaxed transition-colors duration-300 ${theme === "dark" ? 'text-gray-200' : 'text-gray-700'}`}>
                        المساعدون والمقدمون يمكن نقلهم إلى مقدمة الفصل
                      </p>
                    </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full mx-1"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <p className={`text-lg leading-relaxed transition-colors duration-300 ${theme === "dark" ? 'text-gray-200' : 'text-gray-700'}`}>
                        يمكن للمعلمين رؤية جميع الطلاب وبيانات الفصل في وقت واحد
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Tools Section */}
        <section className={`py-20 transition-colors duration-300 ${theme === "dark" ? 'bg-dark-900' : 'bg-white'
          }`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* First Row - Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              {/* Left Image - Tools */}
              <div className="relative flex justify-center">
                <div className="relative">
                  <img
                    src="/assets/images/Tools.png"
                    alt="Tools Interface"
                    className="w-96 h-auto"
                  />
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center">
                    <BookOpen size={24} className="text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Right Text - Tools */}
              <div className="text-right">
                <h2 className={`text-4xl font-bold mb-6 transition-colors duration-300 ${theme === "dark" ? 'text-white' : ''}`} style={theme === "dark" ? {} : { fontFamily: 'Poppins, sans-serif', fontWeight: 600, lineHeight: '160%' }}>
                  <span style={{ color: '#00CBB8' }}>أدوات للمعلمين</span>
                  <br />
                  <span style={theme === "dark" ? { color: '#ffffff' } : { color: '#2E327D' }}>والمتعلمين</span>
                </h2>
                <p className={`text-lg leading-relaxed transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-700'}`}>
                  لدى Class مجموعة ديناميكية من أدوات التدريس المصممة للنشر والاستخدام أثناء الفصل. يمكن للمعلمين توزيع الواجبات في الوقت الفعلي للطلاب لإكمالها وتقديمها.
                </p>
              </div>
            </div>

            {/* Second Row - Quizzes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Text - Quizzes */}
              <div className="text-right">
                <h2 className={`text-4xl font-bold mb-6 transition-colors duration-300 ${theme === "dark" ? 'text-white' : ''}`} style={theme === "dark" ? {} : { fontFamily: 'Poppins, sans-serif', fontWeight: 600, lineHeight: '160%' }}>
                  <span style={theme === "dark" ? { color: '#ffffff' } : { color: '#2E327D' }}>التقييمات،</span>
                  <br />
                  <span style={{ color: '#00CBB8' }}>الاختبارات القصيرة، الاختبارات</span>
                </h2>
                <p className={`text-lg leading-relaxed transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-700'}`}>
                  أطلق المهام والاختبارات والاختبارات القصيرة بسهولة. يتم إدخال نتائج الطلاب تلقائياً في دفتر الدرجات عبر الإنترنت.
                </p>
              </div>

              {/* Right Image - Quizzes */}
              <div className="relative flex justify-center">
                <div className="relative">
                  <img
                    src="/assets/images/Quizzes.png"
                    alt="Quizzes Interface"
                    className="w-96 h-auto"
                  />
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center">
                    <CheckCircle size={24} className="text-white" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                    <Award size={20} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Class Management Tools Section */}
        <section className={`py-20 transition-colors duration-300 ${theme === "dark" ? 'bg-dark-900' : 'bg-gray-50'
          }`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* First Row - GradeBook */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              {/* Left Image - GradeBook */}
              <div className="relative flex justify-center">
                <div className="relative">
                  <img
                    src="/assets/images/Management.png"
                    alt="GradeBook Interface"
                    className="w-full h-auto"
                  />
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center">
                    <Star size={24} className="text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center">
                    <BookOpen size={20} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Right Text - GradeBook */}
              <div className="text-right">
                <h2 className={`text-4xl font-bold mb-6 transition-colors duration-300 ${theme === "dark" ? 'text-white' : ''}`} style={theme === "dark" ? {} : { fontFamily: 'Poppins, sans-serif', fontWeight: 600, lineHeight: '160%' }}>
                  <span style={theme === "dark" ? { color: '#ffffff' } : { color: '#2E327D' }}>أدوات إدارة الفصول الدراسية</span>
                  <br />
                  <span style={{ color: '#00CBB8' }}>للمعلمين</span>
                </h2>
                <p className={`text-lg leading-relaxed transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-700'}`}>
                  يوفر "الفصل" أدوات لمساعدتك في تشغيل وإدارة الفصل مثل قائمة الطلاب والحضور والمزيد. مع دفتر الدرجات، يمكن للمعلمين مراجعة وتقييم الاختبارات والاختبارات القصيرة في الوقت الفعلي.
                </p>
              </div>
            </div>

            {/* Second Row - Private Discussions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Text - Private Discussions */}
              <div className="text-right">
                <h2 className={`text-4xl font-bold mb-6 transition-colors duration-300 ${theme === "dark" ? 'text-white' : ''}`} style={theme === "dark" ? {} : { fontFamily: 'Poppins, sans-serif', fontWeight: 600, lineHeight: '160%' }}>
                  <span style={theme === "dark" ? { color: '#ffffff' } : { color: '#2E327D' }}>المناقشات</span>
                  <br />
                  <span style={{ color: '#00CBB8' }}>واحد لواحد</span>
                </h2>
                <p className={`text-lg leading-relaxed transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-700'}`}>
                  يمكن للمعلمين والمساعدين التحدث مع الطلاب بشكل خاص دون مغادرة بيئة Zoom.
                </p>
              </div>

              {/* Right Image - Private Discussions */}
              <div className="relative flex justify-center">
                <div className="relative">
                  <img
                    src="/assets/images/Discussions.png"
                    alt="Private Discussions Interface"
                    className="w-full h-auto"
                  />
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center">
                    <Users size={24} className="text-white" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center">
                    <X size={20} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Testimonials Section */}
        <section className={`py-20 transition-colors duration-300 ${theme === "dark" ? 'bg-dark-800' : 'bg-gray-50'
          }`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* First Row - Testimonial */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              {/* Left Image - Testimonial */}
              <div className="relative flex justify-center">
                <div className="relative">
                  <img
                    src="/assets/images/Mask Group.png"
                    alt="Testimonial Interface"
                    className="w-96 h-auto"
                  />

                  {/* Testimonial Card Overlay */}
                  <div className="absolute bottom-[-100px] right-8 bg-white rounded-2xl p-6 shadow-lg max-w-xs">
                    <p className="text-sm text-gray-700 mb-4 italic">
                      "شكراً جزيلاً على مساعدتكم. هذا بالضبط ما كنت أبحث عنه. لن تندموا على ذلك. إنه حقاً يوفر علي الوقت والجهد. TOTC هو بالضبط ما كانت تفتقر إليه أعمالنا."
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">جلوريا روز</h4>
                        <p className="text-sm text-gray-500">معلمة تصميم تجربة المستخدم</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className="text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">12 تقييم على Yelp</p>
                  </div>
                </div>
              </div>

              {/* Right Text - Testimonial */}
              <div className="text-right">
                <div className="flex items-center space-x-4 space-x-reverse mb-4">
                  <ArrowLeft className='align-center'></ArrowLeft>
                  <h2 className="text-2xl font-semibold text-primary-500">آراء العملاء</h2>
                </div>
                <h3 className={`text-4xl font-bold mb-6 transition-colors duration-300 ${theme === "dark" ? 'text-white' : ''}`} style={theme === "dark" ? {} : { fontFamily: 'Poppins, sans-serif', fontWeight: 600, lineHeight: '160%' }}>
                  <span style={theme === "dark" ? { color: '#ffffff' } : { color: '#2E327D' }} >ماذا</span>
                  <span> </span>
                  <span style={{ color: '#00CBB8' }}>يقولون؟</span>
                </h3>
                <p className={`text-lg leading-relaxed mb-4 transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-700'}`}>
                  حصل TOTC على أكثر من 100 ألف تقييم إيجابي من مستخدمينا حول العالم.
                </p>
                <p className={`text-lg leading-relaxed mb-6 transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-700'}`}>
                  بعض الطلاب والمعلمين تم مساعدتهم بشكل كبير من قبل TOTC.
                </p>
                <p className={`text-lg leading-relaxed mb-8 transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-700'}`}>
                  هل أنت أيضاً؟ يرجى إعطاء تقييمك
                </p>
                <button className="px-6 py-3 rounded-full text-primary-500 border-2 border-primary-500 hover:bg-primary-50 transition-all duration-300 font-semibold flex items-center space-x-2 space-x-reverse">
                  <span>اكتب تقييمك</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Latest News Section */}
        <section className={`py-20 transition-colors duration-300 ${theme === "dark" ? 'bg-dark-900' : 'bg-white'
          }`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`text-3xl lg:text-4xl font-bold mb-4 transition-colors duration-300 ${theme === "dark" ? 'text-white' : 'text-gray-900'
                }`}>
                آخر الأخبار والموارد
              </h2>
              <p className={`text-lg max-w-3xl mx-auto transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-600'
                }`}>
                شاهد التطورات التي حدثت لـ TOTC في العالم
              </p>
            </div>

            {/* First Row - Image Left, Text Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              {/* Left Image - Video Conference */}
              <div className="relative flex justify-center">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                    alt="Video Conference Interface"
                    className="w-80 h-auto"
                  />
                </div>
              </div>

              {/* Right Text - Main News */}
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-primary-500 text-white text-xs font-semibold rounded-full mb-4">
                  أخبار
                </span>
                <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${theme === "dark" ? 'text-white' : ''}`} style={theme === "dark" ? {} : { fontFamily: 'Poppins, sans-serif', fontWeight: 600, lineHeight: '160%' }}>
                  <span style={theme === "dark" ? { color: '#ffffff' } : { color: '#2E327D' }}>Class يضيف 30 مليون دولار</span>
                  <br />
                  <span style={{ color: '#00CBB8' }}>إلى ميزانيته العمومية</span>
                </h3>
                <p className={`text-lg leading-relaxed mb-6 transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-700'}`}>
                  لحل تعليمي متوافق مع Zoom
                </p>
                <p className={`text-base leading-relaxed transition-colors duration-300 ${theme === "dark" ? 'text-gray-400' : 'text-gray-600'}`}>
                  Class، الذي تم إطلاقه منذ أقل من عام من قبل مايكل تشيسن المؤسس المشارك لـ Blackboard، يتكامل حصرياً مع Zoom لتوفير حل تعليمي متقدم.
                </p>
              </div>
            </div>

            {/* Second Row - Text Left, Image Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Text - Second News */}
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full mb-4">
                  بيان صحفي
                </span>
                <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${theme === "dark" ? 'text-white' : ''}`} style={theme === "dark" ? {} : { fontFamily: 'Poppins, sans-serif', fontWeight: 600, lineHeight: '160%' }}>
                  <span style={theme === "dark" ? { color: '#ffffff' } : { color: '#2E327D' }}>TOTC يغلق جولة تمويل</span>
                  <br />
                  <span style={{ color: '#00CBB8' }}>بقيمة 30 مليون دولار</span>
                </h3>
                <p className={`text-lg leading-relaxed mb-6 transition-colors duration-300 ${theme === "dark" ? 'text-gray-300' : 'text-gray-700'}`}>
                  لتلبية الطلب المتزايد على منصات التعلم الرقمي
                </p>
                <p className={`text-base leading-relaxed transition-colors duration-300 ${theme === "dark" ? 'text-gray-400' : 'text-gray-600'}`}>
                  TOTC يغلق جولة تمويل بقيمة 30 مليون دولار لتلبية الطلب المتزايد على منصات التعلم الرقمي.
                </p>
              </div>

              {/* Right Image - Second News */}
              <div className="relative flex justify-center">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop"
                    alt="Funding News Interface"
                    className="w-80 h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-16 transition-colors duration-300 ${theme === "dark" ? 'bg-gradient-to-br from-dark-900 to-dark-800' : 'bg-gradient-to-br from-gray-900 to-gray-800'}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              {/* Left - Logo and Tagline */}
              <div className="text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6">
                  <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">T</span>
                  </div>
                  <span className="text-3xl font-bold text-white">TOTC</span>
                </div>
                <p className="text-lg leading-relaxed text-gray-300">
                  فئة افتراضية لـ Zoom
                </p>
              </div>

              {/* Center - Newsletter */}
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4 text-white">اشترك للحصول على نشرتنا الإخبارية</h3>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="بريدك الإلكتروني"
                    className={`flex-1 px-4 py-3 rounded-lg border transition-colors duration-300 focus:outline-none focus:border-primary-500 ${theme === "dark"
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                  />
                  <button className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors duration-300">
                    اشتراك
                  </button>
                </div>
              </div>

              {/* Right - Social Media */}
              <div className="text-center lg:text-left">
                <h3 className="text-xl font-bold mb-4 text-white">تابعنا</h3>
                <div className="flex justify-center lg:justify-start space-x-4 space-x-reverse">
                  <a href="#" className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-300">
                    <Facebook size={20} />
                  </a>
                  <a href="#" className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-300">
                    <Twitter size={20} />
                  </a>
                  <a href="#" className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-300">
                    <Instagram size={20} />
                  </a>
                  <a href="#" className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-300">
                    <Linkedin size={20} />
                  </a>
                </div>
              </div>
            </div>

            <div className={`border-t mt-12 pt-8 transition-colors duration-300 ${theme === "dark" ? 'border-gray-700' : 'border-gray-600'}`}>
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-400">
                  <a href="#" className="hover:text-white transition-colors duration-300">الوظائف</a>
                  <span>|</span>
                  <a href="#" className="hover:text-white transition-colors duration-300">سياسة الخصوصية</a>
                  <span>|</span>
                  <a href="#" className="hover:text-white transition-colors duration-300">الشروط والأحكام</a>
                </div>
                <p className="text-sm text-gray-400">
                  © 2025 TOTC. جميع الحقوق محفوظة.
                </p>
              </div>
            </div>
          </div>
        </footer>

        {/* Video Dialog */}
        {isVideoDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Close Button */}
              <button
                onClick={closeVideoDialog}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 shadow-lg"
              >
                <X size={24} />
              </button>

              {/* Video */}
              <video
                src="/assets/video/5183278-hd_1920_1080_30fps.mp4"
                className="w-full h-auto"
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandingPage;