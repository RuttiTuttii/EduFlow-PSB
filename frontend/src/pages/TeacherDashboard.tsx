import { motion } from 'motion/react';
import { Users, BookOpen, CheckCircle, Clock, Plus, FileEdit, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { GridPattern } from '../components/GridPattern';
import { dashboardApi } from '../api/client';
import type { User } from '../App';

interface TeacherDashboardProps {
  theme: 'day' | 'night';
  user: User | null;
  onLogout: () => void;
  onToggleTheme: () => void;
}

interface Stats {
  totalStudents: number;
  activeCourses: number;
  pendingSubmissions: number;
  gradedSubmissions: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  level: string;
  students_count: number;
  pending_count: number;
  created_at: string;
}

const defaultStats = [
  { label: 'Всего студентов', key: 'totalStudents', icon: Users, color: 'from-blue-500 to-cyan-500' },
  { label: 'Активных курсов', key: 'activeCourses', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
  { label: 'На проверке', key: 'pendingSubmissions', icon: Clock, color: 'from-orange-500 to-red-500' },
  { label: 'Проверено', key: 'gradedSubmissions', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
];

const defaultImages = [
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
];

export function TeacherDashboard({ theme, user, onLogout, onToggleTheme }: TeacherDashboardProps) {
  const navigate = useNavigate();
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' 
    ? 'bg-white/80 border-indigo-200/60' 
    : 'bg-indigo-900/80 border-indigo-600/50';

  const [stats, setStats] = useState<Stats>({ totalStudents: 0, activeCourses: 0, pendingSubmissions: 0, gradedSubmissions: 0 });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, coursesData] = await Promise.all([
          dashboardApi.getTeacherStats(),
          dashboardApi.getTeachingCourses(),
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

  const getStatsValue = (key: string) => {
    return stats[key as keyof Stats] || 0;
  };

  return (
    <DashboardLayout
      theme={theme}
      user={user}
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      activePage="teacher-dashboard"
    >
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className={`${cardBg} backdrop-blur-2xl backdrop-saturate-150 border rounded-[32px] p-8 relative overflow-hidden`}
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
              Панель преподавателя 👨‍🏫
            </motion.h1>
            <p className={`text-base ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
              Управляйте курсами и отслеживайте прогресс студентов
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {defaultStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -3 }}
              className={`${cardBg} backdrop-blur-2xl backdrop-saturate-150 border rounded-3xl p-5 relative overflow-hidden`}
              style={{
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.12)',
              }}
            >
              <GridPattern theme={theme} />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-md`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-2xl mb-0.5 font-medium ${textClass}`}>
                  {loading ? '...' : getStatsValue(stat.key)}
                </div>
                <div className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-2xl mb-4 font-medium ${textClass}`}
          >
            Быстрые действия
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              onClick={() => navigate('/create-course')}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.35 }}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={`${cardBg} backdrop-blur-2xl backdrop-saturate-150 border rounded-3xl p-5 relative overflow-hidden text-left`}
              style={{
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.12)',
              }}
            >
              <GridPattern theme={theme} />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 shadow-md">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg mb-1 font-medium ${textClass}`}>Создать курс</h3>
                <p className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  Добавить новый образовательный курс
                </p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/create-exam')}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.4 }}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={`${cardBg} backdrop-blur-2xl backdrop-saturate-150 border rounded-3xl p-5 relative overflow-hidden text-left`}
              style={{
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.12)',
              }}
            >
              <GridPattern theme={theme} />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 shadow-md">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg mb-1 font-medium ${textClass}`}>Создать тест</h3>
                <p className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  Добавить экзамен или тест
                </p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/grading')}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.45 }}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={`${cardBg} backdrop-blur-2xl backdrop-saturate-150 border rounded-3xl p-5 relative overflow-hidden text-left`}
              style={{
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.12)',
              }}
            >
              <GridPattern theme={theme} />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3 shadow-md">
                  <FileEdit className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg mb-1 font-medium ${textClass}`}>Проверить работы</h3>
                <p className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  Оценить задания студентов
                </p>
              </div>
            </motion.button>
          </div>
        </div>

        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className={`text-2xl mb-4 font-medium ${textClass}`}
          >
            Мои курсы
          </motion.h2>

          {loading ? (
            <div className={`text-center py-8 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
              Загрузка курсов...
            </div>
          ) : courses.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.55 }}
              className={`${cardBg} backdrop-blur-2xl backdrop-saturate-150 border rounded-3xl p-8 text-center`}
              style={{ boxShadow: '0 8px 32px rgba(99, 102, 241, 0.12)' }}
            >
              <BookOpen className={`w-16 h-16 mx-auto mb-4 ${theme === 'day' ? 'text-indigo-300' : 'text-indigo-600'}`} />
              <h3 className={`text-xl mb-2 font-medium ${textClass}`}>Пока нет курсов</h3>
              <p className={`mb-4 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                Создайте свой первый курс
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/create-course')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-medium shadow-lg"
              >
                Создать курс
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20, delay: index * 0.1 + 0.55 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => navigate(`/edit-course/${course.id}`)}
                  className={`${cardBg} backdrop-blur-2xl backdrop-saturate-150 border rounded-3xl overflow-hidden cursor-pointer group`}
                  style={{
                    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.12)',
                  }}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={course.thumbnail || defaultImages[index % defaultImages.length]} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {course.pending_count > 0 && (
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-medium shadow-md">
                        {course.pending_count} на проверке
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className={`text-lg mb-2 ${textClass}`}>{course.title}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>
                        <Users className="w-4 h-4 inline mr-1" />
                        {course.students_count} студентов
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
