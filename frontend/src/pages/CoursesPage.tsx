import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Clock, Users, Search, Filter, ChevronRight, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { GridPattern } from '../components/GridPattern';
import { api } from '../api/client';
import type { User } from '../App';

interface CoursesPageProps {
  theme: 'day' | 'night';
  user: User | null;
  onLogout: () => void;
  onToggleTheme: () => void;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  level: string;
  teacher_name: string;
  created_at: string;
}

const levelLabels: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Начальный', color: 'from-green-500 to-emerald-500' },
  intermediate: { label: 'Средний', color: 'from-yellow-500 to-orange-500' },
  advanced: { label: 'Продвинутый', color: 'from-red-500 to-pink-500' },
};

const defaultImages = [
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
];

export function CoursesPage({ theme, user, onLogout, onToggleTheme }: CoursesPageProps) {
  const navigate = useNavigate();
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' 
    ? 'bg-white/70 border-white/50' 
    : 'bg-indigo-900/70 border-indigo-700/30';

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await api.courses.getAll();
        setCourses(data);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const handleEnroll = async (courseId: number) => {
    try {
      await api.courses.enroll(courseId);
      navigate(`/course?id=${courseId}`);
    } catch (error) {
      console.error('Failed to enroll:', error);
    }
  };

  return (
    <DashboardLayout
      theme={theme}
      user={user}
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      activePage="courses"
    >
      <div className="space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative overflow-hidden rounded-[32px] ${cardBg} backdrop-blur-xl border p-8`}
        >
          <GridPattern theme={theme} />
          <div className="relative z-10">
            <motion.h1 
              className={`text-4xl font-bold mb-2 ${textClass}`}
              style={{ fontFamily: 'Comfortaa, cursive' }}
            >
              Каталог курсов 📚
            </motion.h1>
            <p className={`text-lg ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
              Найдите курс, который поможет вам достичь целей
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-4"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
              theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'
            }`} />
            <input
              type="text"
              placeholder="Поиск курсов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-[24px] ${
                theme === 'day'
                  ? 'bg-white/80 border-indigo-200 text-indigo-900 placeholder-indigo-400'
                  : 'bg-indigo-800/50 border-indigo-700 text-white placeholder-indigo-400'
              } border-2 focus:outline-none focus:border-indigo-500 transition-all backdrop-blur-sm`}
            />
          </div>

          {/* Level Filter */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Все' },
              { key: 'beginner', label: 'Начальный' },
              { key: 'intermediate', label: 'Средний' },
              { key: 'advanced', label: 'Продвинутый' },
            ].map(level => (
              <motion.button
                key={level.key}
                onClick={() => setSelectedLevel(level.key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedLevel === level.key
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : theme === 'day'
                      ? 'bg-white/80 text-indigo-700 hover:bg-indigo-100'
                      : 'bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/50'
                }`}
              >
                {level.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center py-16 ${cardBg} backdrop-blur-xl border rounded-[32px]`}
          >
            <BookOpen className={`w-16 h-16 mx-auto mb-4 ${theme === 'day' ? 'text-indigo-300' : 'text-indigo-600'}`} />
            <h3 className={`text-2xl font-semibold mb-2 ${textClass}`}>Курсы не найдены</h3>
            <p className={`${theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}`}>
              Попробуйте изменить параметры поиска
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`relative overflow-hidden rounded-[24px] ${cardBg} backdrop-blur-xl border cursor-pointer group`}
                  onClick={() => navigate(`/course?id=${course.id}`)}
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.thumbnail || defaultImages[index % defaultImages.length]}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Level Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${
                        levelLabels[course.level]?.color || 'from-gray-500 to-gray-600'
                      }`}>
                        {levelLabels[course.level]?.label || course.level}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className={`text-xl font-semibold mb-2 ${textClass} line-clamp-2`}>
                      {course.title}
                    </h3>
                    <p className={`text-sm mb-4 line-clamp-2 ${
                      theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'
                    }`}>
                      {course.description}
                    </p>

                    {/* Teacher */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        theme === 'day' ? 'bg-indigo-100' : 'bg-indigo-800'
                      }`}>
                        <GraduationCap className={`w-4 h-4 ${
                          theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'
                        }`} />
                      </div>
                      <span className={`text-sm ${
                        theme === 'day' ? 'text-indigo-700' : 'text-indigo-300'
                      }`}>
                        {course.teacher_name}
                      </span>
                    </div>

                    {/* Action */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnroll(course.id);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-3 rounded-[16px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium flex items-center justify-center gap-2"
                    >
                      <span>Записаться</span>
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
