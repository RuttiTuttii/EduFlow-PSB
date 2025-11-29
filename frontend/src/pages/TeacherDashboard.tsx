import { motion } from 'motion/react';
import { Users, BookOpen, CheckCircle, Clock, Plus, FileEdit, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { GridPattern } from '../components/GridPattern';
import type { User } from '../App';

interface TeacherDashboardProps {
  theme: 'day' | 'night';
  user: User | null;
  onLogout: () => void;
  onToggleTheme: () => void;
}

const courses = [
  {
    id: 1,
    title: 'Основы маркетинга',
    students: 45,
    pending: 12,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
  },
  {
    id: 2,
    title: 'Дизайн-мышление',
    students: 32,
    pending: 5,
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400',
  },
];

const stats = [
  { label: 'Всего студентов', value: '156', icon: Users, color: 'from-blue-500 to-cyan-500' },
  { label: 'Активных курсов', value: '8', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
  { label: 'На проверке', value: '23', icon: Clock, color: 'from-orange-500 to-red-500' },
  { label: 'Проверено', value: '145', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
];

export function TeacherDashboard({ theme, user, onLogout, onToggleTheme }: TeacherDashboardProps) {
  const navigate = useNavigate();
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' ? 'bg-white/60 border-white/80' : 'bg-indigo-900/40 border-indigo-800/40';

  return (
    <DashboardLayout
      theme={theme}
      user={user}
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      activePage="teacher-dashboard"
    >
      <div className="space-y-8">
        <div className={`${cardBg} backdrop-blur-2xl border rounded-[48px] p-8 shadow-2xl relative overflow-hidden`}>
          <GridPattern theme={theme} />
          <div className="relative z-10">
            <h1 className={`text-4xl mb-2 ${textClass}`}>
              Панель преподавателя 👨‍🏫
            </h1>
            <p className={`text-xl ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
              Управляйте курсами и отслеживайте прогресс студентов
            </p>
          </div>
        </div>

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

        {/* Quick Actions */}
        <div>
          <h2 className={`text-2xl mb-6 ${textClass}`}>Быстрые действия</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              onClick={() => navigate('/create-course')}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`${cardBg} backdrop-blur-2xl border rounded-[24px] p-6 shadow-xl relative overflow-hidden text-left`}
            >
              <GridPattern theme={theme} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-xl mb-2 ${textClass}`}>Создать курс</h3>
                <p className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  Добавить новый образовательный курс
                </p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/create-exam')}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`${cardBg} backdrop-blur-2xl border rounded-[24px] p-6 shadow-xl relative overflow-hidden text-left`}
            >
              <GridPattern theme={theme} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg">
                  <FileCheck className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-xl mb-2 ${textClass}`}>Создать тест</h3>
                <p className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  Добавить экзамен или тест
                </p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/grading')}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`${cardBg} backdrop-blur-2xl border rounded-[24px] p-6 shadow-xl relative overflow-hidden text-left`}
            >
              <GridPattern theme={theme} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 shadow-lg">
                  <FileEdit className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-xl mb-2 ${textClass}`}>Проверить работы</h3>
                <p className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  Оценить задания студентов
                </p>
              </div>
            </motion.button>
          </div>
        </div>

        <div>
          <h2 className={`text-3xl mb-6 ${textClass}`}>Мои курсы</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                whileHover={{ scale: 1.03, y: -10 }}
                onClick={() => navigate('/edit-course')}
                className={`${cardBg} backdrop-blur-2xl border rounded-[32px] overflow-hidden shadow-xl cursor-pointer group`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {course.pending > 0 && (
                    <div className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-[16px] text-sm font-medium shadow-lg">
                      {course.pending} на проверке
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className={`text-xl mb-3 ${textClass}`}>{course.title}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>
                      <Users className="w-4 h-4 inline mr-1" />
                      {course.students} студентов
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
