import { motion } from 'motion/react';
import { BookOpen, TrendingUp, Award, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { GridPattern } from '../components/GridPattern';
import { Calendar } from '../components/Calendar';
import { Achievements } from '../components/Achievements';
import { ProgressChart } from '../components/ProgressChart';
import type { User } from '../App';

interface StudentDashboardProps {
  theme: 'day' | 'night';
  user: User | null;
  onLogout: () => void;
  onToggleTheme: () => void;
}

const courses = [
  {
    id: 1,
    title: 'Основы маркетинга',
    progress: 65,
    lessons: 12,
    completed: 8,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    category: 'Маркетинг',
  },
  {
    id: 2,
    title: 'Дизайн-мышление',
    progress: 30,
    lessons: 10,
    completed: 3,
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400',
    category: 'Дизайн',
  },
  {
    id: 3,
    title: 'Python для начинающих',
    progress: 90,
    lessons: 20,
    completed: 18,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
    category: 'Программирование',
  },
];

const stats = [
  { label: 'Курсов пройдено', value: '12', icon: Award, color: 'from-blue-500 to-cyan-500' },
  { label: 'Текущих курсов', value: '3', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
  { label: 'Часов обучения', value: '156', icon: Clock, color: 'from-green-500 to-emerald-500' },
  { label: 'Средний прогресс', value: '62%', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
];

export function StudentDashboard({ theme, user, onLogout, onToggleTheme }: StudentDashboardProps) {
  const navigate = useNavigate();
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' ? 'bg-white/60 border-white/80' : 'bg-indigo-900/40 border-indigo-800/40';

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
        <div className={`${cardBg} backdrop-blur-2xl border rounded-[48px] p-8 shadow-2xl relative overflow-hidden`}>
          <GridPattern theme={theme} />
          <div className="relative z-10">
            <h1 className={`text-4xl mb-2 ${textClass}`}>
              Добро пожаловать, {user?.name}! 
            </h1>
            <p className={`text-xl ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
              Продолжайте обучение и достигайте новых высот
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`${cardBg} backdrop-blur-2xl border rounded-[32px] p-6 shadow-xl relative overflow-hidden`}
            >
              <GridPattern theme={theme} />
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-[20px] bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className={`text-3xl mb-1 ${textClass}`}>{stat.value}</div>
                <div className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Courses */}
        <div>
          <h2 className={`text-3xl mb-6 ${textClass}`}>Мои курсы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                whileHover={{ scale: 1.03, y: -10 }}
                onClick={() => navigate('/course')}
                className={`${cardBg} backdrop-blur-2xl border rounded-[32px] overflow-hidden shadow-xl cursor-pointer group`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-[16px] text-sm font-medium text-indigo-900">
                    {course.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className={`text-xl mb-3 ${textClass}`}>{course.title}</h3>
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <span className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>
                      {course.completed} из {course.lessons} уроков
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className={`relative h-2 rounded-full overflow-hidden ${
                    theme === 'day' ? 'bg-indigo-100' : 'bg-indigo-800'
                  }`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                      className="absolute h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                    />
                  </div>
                  <div className={`text-sm mt-2 text-right ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                    {course.progress}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
