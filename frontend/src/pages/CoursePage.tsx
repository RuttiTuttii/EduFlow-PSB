import { motion } from 'motion/react';
import { Play, FileText, CheckCircle, Lock, BookOpen, Clock, GraduationCap, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { GridPattern } from '../components/GridPattern';
import { api } from '../api/client';
import type { User } from '../App';

interface CoursePageProps {
  theme: 'day' | 'night';
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  order_num: number;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  level: string;
  teacher_name: string;
  lessons: Lesson[];
  assignments: Assignment[];
}

const levelLabels: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Начальный', color: 'from-green-500 to-emerald-500' },
  intermediate: { label: 'Средний', color: 'from-yellow-500 to-orange-500' },
  advanced: { label: 'Продвинутый', color: 'from-red-500 to-pink-500' },
};

const defaultImages = [
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800',
];

export function CoursePage({ theme, user, onNavigate, onLogout, onToggleTheme }: CoursePageProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get('id');
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' 
    ? 'bg-white/70 border-white/50' 
    : 'bg-indigo-900/70 border-indigo-700/30';

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) {
        setError('ID курса не указан');
        setLoading(false);
        return;
      }

      try {
        const data = await api.courses.getById(parseInt(courseId));
        setCourse(data);
        if (data.lessons?.length > 0) {
          setSelectedLesson(data.lessons[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Не удалось загрузить курс');
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <DashboardLayout theme={theme} user={user} onLogout={onLogout} onToggleTheme={onToggleTheme} activePage="course">
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout theme={theme} user={user} onLogout={onLogout} onToggleTheme={onToggleTheme} activePage="course">
        <div className={`text-center py-20 ${cardBg} backdrop-blur-xl border rounded-[32px]`}>
          <BookOpen className={`w-16 h-16 mx-auto mb-4 ${theme === 'day' ? 'text-indigo-300' : 'text-indigo-600'}`} />
          <h2 className={`text-2xl mb-2 ${textClass}`}>{error || 'Курс не найден'}</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/courses')}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full"
          >
            К списку курсов
          </motion.button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      theme={theme}
      user={user}
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      activePage="course"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardBg} backdrop-blur-xl border rounded-[32px] overflow-hidden`}
        >
          <div className="relative h-64">
            <img 
              src={course.thumbnail || defaultImages[course.id % defaultImages.length]}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            
            {/* Level badge */}
            <div className="absolute top-4 left-4">
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r ${
                levelLabels[course.level]?.color || 'from-gray-500 to-gray-600'
              }`}>
                {levelLabels[course.level]?.label || course.level}
              </span>
            </div>

            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Comfortaa, cursive' }}>
                {course.title}
              </h1>
              <p className="text-lg opacity-90">{course.description}</p>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className={`text-2xl font-bold ${textClass}`}>{course.lessons?.length || 0}</div>
                <div className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>Уроков</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center`}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className={`text-2xl font-bold ${textClass}`}>{course.assignments?.length || 0}</div>
                <div className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>Заданий</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center`}>
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className={`text-lg font-medium ${textClass} truncate`}>{course.teacher_name}</div>
                <div className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>Преподаватель</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lesson Content */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={selectedLesson.id}
                className={`${cardBg} backdrop-blur-xl border rounded-[32px] p-8`}
              >
                <GridPattern theme={theme} />
                <div className="relative z-10">
                  <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>
                    {selectedLesson.title}
                  </h2>
                  <div 
                    className={`prose prose-lg max-w-none ${theme === 'day' ? 'prose-indigo' : 'prose-invert'} ${textClass}`}
                    dangerouslySetInnerHTML={{ 
                      __html: selectedLesson.content
                        .replace(/\n/g, '<br>')
                        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-indigo-900/50 p-4 rounded-xl overflow-x-auto text-sm"><code>$2</code></pre>')
                        .replace(/`([^`]+)`/g, '<code class="bg-indigo-200 dark:bg-indigo-800 px-1 rounded text-sm">$1</code>')
                        .replace(/### (.*)/g, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
                        .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
                        .replace(/# (.*)/g, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <div className={`${cardBg} backdrop-blur-xl border rounded-[32px] p-8 text-center`}>
                <BookOpen className={`w-16 h-16 mx-auto mb-4 ${theme === 'day' ? 'text-indigo-300' : 'text-indigo-600'}`} />
                <p className={textClass}>Выберите урок из списка</p>
              </div>
            )}
          </div>

          {/* Sidebar: Lessons List */}
          <div className="space-y-4">
            <h3 className={`text-xl font-bold ${textClass}`}>Содержание курса</h3>
            
            {/* Lessons */}
            {course.lessons?.length > 0 ? (
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <motion.button
                    key={lesson.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left p-4 rounded-[20px] transition-all ${
                      selectedLesson?.id === lesson.id
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : `${cardBg} backdrop-blur-xl border hover:border-indigo-500`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedLesson?.id === lesson.id
                          ? 'bg-white/20'
                          : theme === 'day' ? 'bg-indigo-100' : 'bg-indigo-800'
                      }`}>
                        <Play className={`w-5 h-5 ${
                          selectedLesson?.id === lesson.id
                            ? 'text-white'
                            : theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${selectedLesson?.id === lesson.id ? 'text-white' : textClass}`}>
                          {lesson.title}
                        </div>
                        <div className={`text-xs ${
                          selectedLesson?.id === lesson.id
                            ? 'text-white/70'
                            : theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'
                        }`}>
                          Урок {lesson.order_num}
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${
                        selectedLesson?.id === lesson.id
                          ? 'text-white'
                          : theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'
                      }`} />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className={`${cardBg} backdrop-blur-xl border rounded-[20px] p-4 text-center`}>
                <p className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}>
                  Уроки пока не добавлены
                </p>
              </div>
            )}

            {/* Assignments */}
            {course.assignments?.length > 0 && (
              <>
                <h3 className={`text-xl font-bold mt-6 ${textClass}`}>Задания</h3>
                <div className="space-y-2">
                  {course.assignments.map((assignment, index) => (
                    <motion.button
                      key={assignment.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (course.lessons?.length || 0) * 0.05 + index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      onClick={() => navigate(`/assignment?id=${assignment.id}`)}
                      className={`w-full text-left p-4 rounded-[20px] ${cardBg} backdrop-blur-xl border hover:border-indigo-500 transition-all`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          theme === 'day' ? 'bg-pink-100' : 'bg-pink-900/50'
                        }`}>
                          <FileText className={`w-5 h-5 ${
                            theme === 'day' ? 'text-pink-600' : 'text-pink-300'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium truncate ${textClass}`}>{assignment.title}</div>
                          <div className={`text-xs ${theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'}`}>
                            До: {new Date(assignment.due_date).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 ${
                          theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'
                        }`} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
