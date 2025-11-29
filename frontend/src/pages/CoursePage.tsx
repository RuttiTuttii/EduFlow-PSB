import { motion } from 'motion/react';
import { Play, FileText, CheckCircle, Lock } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { VideoPlayer } from '../components/VideoPlayer';
import type { User } from '../App';

interface CoursePageProps {
  theme: 'day' | 'night';
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

const lessons = [
  { id: 1, title: 'Введение в маркетинг', type: 'video', duration: '15 мин', completed: true, locked: false },
  { id: 2, title: 'Целевая аудитория', type: 'video', duration: '20 мин', completed: true, locked: false },
  { id: 3, title: 'Задание: Анализ аудитории', type: 'assignment', duration: '30 мин', completed: false, locked: false },
  { id: 4, title: 'Маркетинговая стратегия', type: 'video', duration: '25 мин', completed: false, locked: false },
  { id: 5, title: 'Контент-маркетинг', type: 'video', duration: '18 мин', completed: false, locked: true },
];

export function CoursePage({ theme, user, onNavigate, onLogout, onToggleTheme }: CoursePageProps) {
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' ? 'bg-white/95' : 'bg-indigo-900/95';

  return (
    <DashboardLayout
      theme={theme}
      user={user}
      onNavigate={onNavigate}
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      activePage="course"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardBg} rounded-[48px] overflow-hidden shadow-xl`}
        >
          <div className="relative h-64">
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200"
              alt="Course"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h1 className="text-4xl mb-2">Основы маркетинга</h1>
              <p className="text-xl">Изучите основные концепции современного маркетинга</p>
            </div>
          </div>
          <div className="p-8 grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl text-indigo-600">12</div>
              <div className={theme === 'day' ? 'text-indigo-700' : 'text-indigo-300'}>Уроков</div>
            </div>
            <div>
              <div className="text-3xl text-purple-600">8</div>
              <div className={theme === 'day' ? 'text-indigo-700' : 'text-indigo-300'}>Завершено</div>
            </div>
            <div>
              <div className="text-3xl text-pink-600">67%</div>
              <div className={theme === 'day' ? 'text-indigo-700' : 'text-indigo-300'}>Прогресс</div>
            </div>
          </div>
        </motion.div>

        {/* Video Player */}
        <VideoPlayer theme={theme} title="Урок 2: Целевая аудитория" />

        {/* Lessons List */}
        <div>
          <h2 className={`text-3xl mb-6 ${textClass}`}>Содержание курса</h2>
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={!lesson.locked ? { scale: 1.02, x: 10 } : {}}
                onClick={() => !lesson.locked && lesson.type === 'assignment' && onNavigate('assignment')}
                className={`${cardBg} rounded-[32px] p-6 shadow-lg ${
                  lesson.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } group`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center ${
                    lesson.completed
                      ? 'bg-green-500'
                      : lesson.locked
                      ? 'bg-gray-400'
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600'
                  } shadow-lg`}>
                    {lesson.locked ? (
                      <Lock className="w-7 h-7 text-white" />
                    ) : lesson.completed ? (
                      <CheckCircle className="w-7 h-7 text-white" />
                    ) : lesson.type === 'video' ? (
                      <Play className="w-7 h-7 text-white" />
                    ) : (
                      <FileText className="w-7 h-7 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`text-xl mb-1 ${textClass}`}>{lesson.title}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>
                        {lesson.type === 'video' ? 'Видео' : 'Задание'}
                      </span>
                      <span className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>
                        {lesson.duration}
                      </span>
                    </div>
                  </div>

                  {!lesson.locked && !lesson.completed && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[20px]"
                    >
                      Начать
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
