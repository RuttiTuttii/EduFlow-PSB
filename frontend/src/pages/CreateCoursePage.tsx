import { motion } from 'motion/react';
import { Save, Plus, X, Upload, Video, FileText, CheckSquare } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { GridPattern } from '../components/GridPattern';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { User } from '../App';

interface CreateCoursePageProps {
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
  content: string;
}

export function CreateCoursePage({ theme, user, onNavigate, onLogout, onToggleTheme }: CreateCoursePageProps) {
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [level, setLevel] = useState('beginner');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' ? 'bg-white/60 border-white/80' : 'bg-indigo-900/40 border-indigo-800/40';
  const inputBg = theme === 'day' ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-800/50 border-indigo-700';

  const addLesson = (type: 'video' | 'text' | 'quiz') => {
    const newLesson: Lesson = {
      id: Date.now(),
      type,
      title: `Новый урок ${lessons.length + 1}`,
      content: '',
    };
    setLessons([...lessons, newLesson]);
    setShowAddLesson(false);
  };

  const removeLesson = (id: number) => {
    setLessons(lessons.filter(lesson => lesson.id !== id));
  };

  const handleSave = async () => {
    if (!courseName.trim()) {
      setError('Введите название курса');
      return;
    }
    if (!courseDescription.trim()) {
      setError('Введите описание курса');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const course = await api.courses.create({
        title: courseName,
        description: courseDescription,
        level,
      });

      // TODO: Add lessons to the course via API
      // For now, just redirect to the course page
      navigate(`/course?id=${course.id}`);
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании курса');
    } finally {
      setSaving(false);
    }
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
              <h1 className={`text-4xl mb-2 ${textClass}`}>Создание курса</h1>
              <p className={`text-xl ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                Создайте новый образовательный курс
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/teacher-dashboard')}
                className={`px-6 py-3 rounded-[24px] ${
                  theme === 'day' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-800/50 text-indigo-200'
                } shadow-lg`}
              >
                Отмена
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-[24px] shadow-xl disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? 'Сохранение...' : 'Сохранить курс'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Course Info */}
        <div className={`${cardBg} backdrop-blur-2xl border rounded-[32px] p-8 shadow-2xl relative overflow-hidden`}>
          <GridPattern theme={theme} />
          <div className="relative z-10 space-y-6">
            <h2 className={`text-2xl mb-6 ${textClass}`}>Основная информация</h2>

            {error && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-[16px] text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block mb-2 ${textClass}`}>Название курса</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Например: Основы Python"
                  className={`w-full px-4 py-3 rounded-[20px] ${inputBg} ${textClass} border-2 focus:outline-none focus:border-indigo-500 transition-all`}
                />
              </div>

              <div>
                <label className={`block mb-2 ${textClass}`}>Уровень сложности</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className={`w-full px-4 py-3 rounded-[20px] ${inputBg} ${textClass} border-2 focus:outline-none focus:border-indigo-500 transition-all`}
                >
                  <option value="beginner">Начальный</option>
                  <option value="intermediate">Средний</option>
                  <option value="advanced">Продвинутый</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block mb-2 ${textClass}`}>Описание курса</label>
              <textarea
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="Расскажите о курсе, чему научатся студенты..."
                rows={4}
                className={`w-full px-4 py-3 rounded-[20px] ${inputBg} ${textClass} border-2 focus:outline-none focus:border-indigo-500 transition-all resize-none`}
              />
            </div>

            <div>
              <label className={`block mb-2 ${textClass}`}>Обложка курса</label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`border-2 border-dashed rounded-[20px] p-12 text-center cursor-pointer ${
                  theme === 'day' ? 'border-indigo-300 hover:border-indigo-500' : 'border-indigo-700 hover:border-indigo-500'
                } transition-all`}
              >
                <Upload className={`w-12 h-12 mx-auto mb-4 ${theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'}`} />
                <p className={textClass}>Нажмите или перетащите изображение</p>
                <p className={`text-sm mt-2 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}`}>
                  PNG, JPG до 5MB
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className={`${cardBg} backdrop-blur-2xl border rounded-[32px] p-8 shadow-2xl relative overflow-hidden`}>
          <GridPattern theme={theme} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl ${textClass}`}>Уроки курса</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddLesson(!showAddLesson)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Добавить урок
              </motion.button>
            </div>

            {/* Add Lesson Options */}
            {showAddLesson && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-3 gap-4 mb-6"
              >
                {(Object.entries(lessonTypeConfig) as [keyof typeof lessonTypeConfig, typeof lessonTypeConfig.video][]).map(([type, config]) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addLesson(type)}
                    className={`p-6 rounded-[24px] ${
                      theme === 'day' ? 'bg-white/80' : 'bg-indigo-800/50'
                    } border-2 border-transparent hover:border-indigo-500 transition-all`}
                  >
                    <div className={`w-14 h-14 mx-auto mb-3 rounded-[18px] bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                      <config.icon className="w-7 h-7 text-white" />
                    </div>
                    <p className={textClass}>{config.label}</p>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Lessons List */}
            {lessons.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}`}>
                <p className="text-lg">Уроки ещё не добавлены</p>
                <p className="text-sm mt-2">Нажмите "Добавить урок" для начала</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, index) => {
                  const config = lessonTypeConfig[lesson.type];
                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-[20px] ${
                        theme === 'day' ? 'bg-white/80' : 'bg-indigo-800/50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <config.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => {
                            const updated = lessons.map(l =>
                              l.id === lesson.id ? { ...l, title: e.target.value } : l
                            );
                            setLessons(updated);
                          }}
                          className={`w-full bg-transparent ${textClass} focus:outline-none`}
                        />
                        <p className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}`}>
                          {config.label}
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeLesson(lesson.id)}
                        className={`p-2 rounded-[12px] ${
                          theme === 'day' ? 'hover:bg-red-100 text-red-600' : 'hover:bg-red-900/50 text-red-400'
                        } transition-colors`}
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
