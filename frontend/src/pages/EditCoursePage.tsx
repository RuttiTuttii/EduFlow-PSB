import { motion } from 'motion/react';
import { Save, Plus, X, Upload, Video, FileText, CheckSquare, Trash2, Eye } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { GridPattern } from '../components/GridPattern';
import { useState } from 'react';
import type { User } from '../App';

interface EditCoursePageProps {
  theme: 'day' | 'night';
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

interface Lesson {
  id: number;
  type: 'video' | 'text' | 'quiz';
  title: string;
  duration: string;
  published: boolean;
}

export function EditCoursePage({ theme, user, onNavigate, onLogout, onToggleTheme }: EditCoursePageProps) {
  const [courseName, setCourseName] = useState('Основы маркетинга');
  const [courseDescription, setCourseDescription] = useState('Изучите основы цифрового маркетинга');
  const [category, setCategory] = useState('marketing');
  const [lessons, setLessons] = useState<Lesson[]>([
    { id: 1, type: 'video', title: 'Введение в маркетинг', duration: '15 мин', published: true },
    { id: 2, type: 'video', title: 'Целевая аудитория', duration: '20 мин', published: true },
    { id: 3, type: 'quiz', title: 'Тест: Основы маркетинга', duration: '10 мин', published: false },
  ]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' ? 'bg-white/60 border-white/80' : 'bg-indigo-900/40 border-indigo-800/40';
  const inputBg = theme === 'day' ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-800/50 border-indigo-700';

  const togglePublished = (id: number) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, published: !l.published } : l));
  };

  const lessonTypeConfig = {
    video: { icon: Video, label: 'Видео урок', color: 'from-blue-500 to-cyan-500' },
    text: { icon: FileText, label: 'Текстовый урок', color: 'from-green-500 to-emerald-500' },
    quiz: { icon: CheckSquare, label: 'Тест/Задание', color: 'from-purple-500 to-pink-500' },
  };

  return (
    <DashboardLayout
      theme={theme}
      user={user}
      onNavigate={onNavigate}
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      activePage="teacher-dashboard"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className={`${cardBg} backdrop-blur-2xl border rounded-[48px] p-8 shadow-2xl relative overflow-hidden`}>
          <GridPattern theme={theme} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className={`text-4xl mb-2 ${textClass}`}>Редактирование курса</h1>
              <p className={`text-xl ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                {courseName}
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('course')}
                className={`flex items-center gap-2 px-6 py-3 rounded-[24px] ${
                  theme === 'day' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-800/50 text-indigo-200'
                } shadow-lg`}
              >
                <Eye className="w-5 h-5" />
                Предпросмотр
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteConfirm(true)}
                className={`flex items-center gap-2 px-6 py-3 rounded-[24px] ${
                  theme === 'day' ? 'bg-red-100 text-red-700' : 'bg-red-900/50 text-red-400'
                } shadow-lg`}
              >
                <Trash2 className="w-5 h-5" />
                Удалить
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-[24px] shadow-xl"
              >
                <Save className="w-5 h-5" />
                Сохранить
              </motion.button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${cardBg} backdrop-blur-2xl border rounded-[32px] p-8 shadow-2xl z-50 max-w-md`}
            >
              <GridPattern theme={theme} />
              <div className="relative z-10">
                <h3 className={`text-2xl mb-4 ${textClass}`}>Удалить курс?</h3>
                <p className={`mb-6 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  Это действие нельзя отменить. Все материалы и прогресс студентов будут удалены.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteConfirm(false)}
                    className={`flex-1 px-6 py-3 rounded-[20px] ${
                      theme === 'day' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-800/50 text-indigo-200'
                    }`}
                  >
                    Отмена
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      onNavigate('teacher-dashboard');
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-[20px]"
                  >
                    Удалить
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Студентов', value: '45', color: 'from-blue-500 to-cyan-500' },
            { label: 'Уроков', value: lessons.length, color: 'from-purple-500 to-pink-500' },
            { label: 'Опубликовано', value: lessons.filter(l => l.published).length, color: 'from-green-500 to-emerald-500' },
            { label: 'Черновики', value: lessons.filter(l => !l.published).length, color: 'from-orange-500 to-red-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`${cardBg} backdrop-blur-2xl border rounded-[24px] p-6 shadow-xl relative overflow-hidden`}
            >
              <GridPattern theme={theme} />
              <div className="relative z-10">
                <div className={`text-3xl mb-2 ${textClass}`}>{stat.value}</div>
                <div className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Course Info */}
        <div className={`${cardBg} backdrop-blur-2xl border rounded-[32px] p-8 shadow-2xl relative overflow-hidden`}>
          <GridPattern theme={theme} />
          <div className="relative z-10 space-y-6">
            <h2 className={`text-2xl mb-6 ${textClass}`}>Информация о курсе</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block mb-2 ${textClass}`}>Название курса</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-[20px] ${inputBg} ${textClass} border-2 focus:outline-none focus:border-indigo-500 transition-all`}
                />
              </div>

              <div>
                <label className={`block mb-2 ${textClass}`}>Категория</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-3 rounded-[20px] ${inputBg} ${textClass} border-2 focus:outline-none focus:border-indigo-500 transition-all`}
                >
                  <option value="marketing">Маркетинг</option>
                  <option value="design">Дизайн</option>
                  <option value="programming">Программирование</option>
                  <option value="business">Бизнес</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block mb-2 ${textClass}`}>Описание</label>
              <textarea
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 rounded-[20px] ${inputBg} ${textClass} border-2 focus:outline-none focus:border-indigo-500 transition-all resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className={`${cardBg} backdrop-blur-2xl border rounded-[32px] p-8 shadow-2xl relative overflow-hidden`}>
          <GridPattern theme={theme} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl ${textClass}`}>Уроки и материалы</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('create-course')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Добавить материал
              </motion.button>
            </div>

            <div className="space-y-3">
              {lessons.map((lesson, index) => {
                const config = lessonTypeConfig[lesson.type];
                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center gap-4 p-4 rounded-[20px] ${
                      theme === 'day' ? 'bg-white/80' : 'bg-indigo-800/50'
                    } cursor-pointer`}
                  >
                    <div className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <config.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`mb-1 ${textClass}`}>{lesson.title}</h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>
                          {config.label}
                        </span>
                        <span className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>
                          • {lesson.duration}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePublished(lesson.id);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`px-4 py-2 rounded-[12px] text-sm ${
                          lesson.published
                            ? 'bg-green-500 text-white'
                            : theme === 'day'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-orange-900/50 text-orange-400'
                        }`}
                      >
                        {lesson.published ? 'Опубликован' : 'Черновик'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-[12px] ${
                          theme === 'day' ? 'hover:bg-indigo-100' : 'hover:bg-indigo-700/50'
                        }`}
                      >
                        <FileText className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
