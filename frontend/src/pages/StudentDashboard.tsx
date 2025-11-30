import { motion } from 'motion/react';
import { BookOpen, TrendingUp, Award, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { GridPattern } from '../components/GridPattern';
import { Calendar } from '../components/Calendar';
import { Achievements } from '../components/Achievements';
import { ProgressChart } from '../components/ProgressChart';
import { dashboardApi } from '../api/client';
import type { User } from '../App';

interface StudentDashboardProps {
  theme: 'day' | 'night';
  user: User | null;
  onLogout: () => void;
  onToggleTheme: () => void;
}

interface Stats {
  coursesCompleted: number;
  currentCourses: number;
  totalHours: number;
  averageProgress: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  level: string;
  progress: number;
  total_lessons: number;
  completed_lessons: number;
  teacher_name: string;
}

const defaultStats = [
  { label: 'Курсов пройдено', key: 'coursesCompleted', icon: Award, color: 'from-blue-500 to-cyan-500' },
  { label: 'Текущих курсов', key: 'currentCourses', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
  { label: 'Часов обучения', key: 'totalHours', icon: Clock, color: 'from-green-500 to-emerald-500' },
  { label: 'Средний прогресс', key: 'averageProgress', icon: TrendingUp, color: 'from-orange-500 to-red-500', suffix: '%' },
];

// Default images for courses without thumbnails
const defaultImages = [
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
];

export function StudentDashboard({ theme, user, onLogout, onToggleTheme }: StudentDashboardProps) {
  const navigate = useNavigate();
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' 
    ? 'bg-white/80 border-indigo-200/60' 
    : 'bg-indigo-900/80 border-indigo-600/50';

  const [stats, setStats] = useState<Stats>({ coursesCompleted: 0, currentCourses: 0, totalHours: 0, averageProgress: 0 });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, coursesData] = await Promise.all([
          dashboardApi.getStudentStats(),
          dashboardApi.getEnrolledCourses(),
        ]);
        setStats(statsData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getStatsValue = (key: string, suffix?: string) => {
    const value = stats[key as keyof Stats] || 0;
    return `${value}${suffix || ''}`;
  };

  return (
    <DashboardLayout
      theme={theme}
      user={user}
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      activePage="student-dashboard"
    >
      <div className="space-y-8">
        {/* Welcome */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${cardBg} backdrop-blur-2xl border rounded-[32px] p-8 relative overflow-hidden`}
          style={{ boxShadow: '0 8px 40px rgba(99, 102, 241, 0.15)' }}
        >
          <GridPattern theme={theme} />
          <div className="relative z-10">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-3xl mb-2 font-medium ${textClass}`}
            >
              Добро пожаловать, {user?.name}!
            </motion.h1>
            <p className={`text-base ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
              Продолжайте обучение и достигайте новых высот
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {defaultStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -3 }}
              className={`${cardBg} backdrop-blur-xl border rounded-3xl p-5 shadow-lg relative overflow-hidden`}
              style={{
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.12)',
              }}
            >
              <GridPattern theme={theme} />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-md`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-2xl mb-0.5 font-medium ${textClass}`}>
                  {loading ? '...' : getStatsValue(stat.key, stat.suffix)}
                </div>
                <div className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Courses */}
        <div>
          <h2 className={`text-2xl mb-4 ${textClass}`}>Мои курсы</h2>
          {loading ? (
            <div className={`text-center py-8 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
              Загрузка курсов...
            </div>
          ) : courses.length === 0 ? (
            <div className={`${cardBg} backdrop-blur-xl border rounded-3xl p-8 text-center`}>
              <BookOpen className={`w-16 h-16 mx-auto mb-4 ${theme === 'day' ? 'text-indigo-300' : 'text-indigo-600'}`} />
              <h3 className={`text-xl mb-2 ${textClass}`}>Пока нет курсов</h3>
              <p className={`mb-4 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                Запишитесь на курсы, чтобы начать обучение
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/courses')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-medium"
              >
                Найти курсы
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => navigate(`/course/${course.id}`)}
                  className={`${cardBg} backdrop-blur-xl border rounded-3xl overflow-hidden shadow-lg cursor-pointer group`}
                  style={{
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.12)',
                  }}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={course.thumbnail || defaultImages[index % defaultImages.length]} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-indigo-900">
                      {course.level}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className={`text-lg mb-2 ${textClass}`}>{course.title}</h3>
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <span className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>
                        {course.completed_lessons} из {course.total_lessons} уроков
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className={`relative h-1.5 rounded-full overflow-hidden ${
                      theme === 'day' ? 'bg-indigo-100' : 'bg-indigo-800'
                    }`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                        className="absolute h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      />
                    </div>
                    <div className={`text-xs mt-1.5 text-right ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                      {course.progress}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Chart */}
        <ProgressChart theme={theme} />

        {/* Calendar and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Calendar theme={theme} />
          <div className="space-y-6">
            <Achievements theme={theme} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
