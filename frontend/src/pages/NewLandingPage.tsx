import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { 
  GraduationCap, 
  User, 
  TrendingUp,
  Zap,
  Star,
  ChevronDown,
  Play,
  Upload,
  Award,
  CheckSquare,
  MessageCircle,
  PlusCircle,
  Package,
  GitBranch,
  FileText,
  BookMarked,
  BookOpen,
  FileCheck,
  BarChart3,
  Navigation,
  MessageCircleOff,
  EyeOff,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Sparkles
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { CloudBackground } from '../components/CloudBackground';
import { GridPattern } from '../components/GridPattern';
import { Tooltip } from '../components/Tooltip';
import { LiquidGlassNavbar } from '../components/LiquidGlassNavbar';

interface NewLandingPageProps {
  theme: 'day' | 'night';
  onNavigate: (page: string) => void;
  onToggleTheme: () => void;
  isAuthenticated?: boolean;
  user?: {
    name: string;
    role: string;
  } | null;
  onLogout?: () => void;
}

// Animated counter component
function AnimatedCounter({ value, suffix = '', theme }: { value: number; suffix?: string; theme: 'day' | 'night' }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const duration = 2000;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, isInView]);

  const textClass = theme === 'day' ? 'text-indigo-600' : 'text-indigo-300';

  return (
    <div ref={ref} className="text-center">
      <div className={`text-4xl md:text-5xl font-black ${textClass}`}>
        {count.toLocaleString()}{suffix}
      </div>
    </div>
  );
}

// Section wrapper component
function Section({ 
  children, 
  theme, 
  className = '',
  variant = 'default',
  id
}: { 
  children: React.ReactNode; 
  theme: 'day' | 'night'; 
  className?: string;
  variant?: 'default' | 'gradient-blue' | 'gradient-pink' | 'gradient-purple';
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const getContainerClass = () => {
    if (variant === 'gradient-blue') {
      return theme === 'day'
        ? 'bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border-blue-200/80'
        : 'bg-gradient-to-br from-indigo-950/50 to-blue-950/50 border-indigo-700/60';
    }
    if (variant === 'gradient-pink') {
      return theme === 'day'
        ? 'bg-gradient-to-br from-pink-50/90 to-rose-50/90 border-pink-200/80'
        : 'bg-gradient-to-br from-pink-950/50 to-rose-950/50 border-pink-700/60';
    }
    if (variant === 'gradient-purple') {
      return theme === 'day'
        ? 'bg-gradient-to-br from-purple-50/90 to-indigo-50/90 border-purple-200/80'
        : 'bg-gradient-to-br from-purple-950/50 to-indigo-950/50 border-purple-700/60';
    }
    return theme === 'day'
      ? 'bg-white/60 border-white/80'
      : 'bg-indigo-950/30 border-indigo-800/40';
  };

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className={`max-w-6xl mx-auto ${className}`}
    >
      <div className={`relative overflow-hidden backdrop-blur-2xl border rounded-[48px] p-8 md:p-12 shadow-2xl ${getContainerClass()}`}>
        <GridPattern theme={theme} />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.section>
  );
}

export function NewLandingPage({ 
  theme, 
  onNavigate, 
  onToggleTheme,
  isAuthenticated = false,
  user = null,
  onLogout,
}: NewLandingPageProps) {
  const { scrollYProgress } = useScroll();
  
  // Parallax for hero
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const subTextClass = theme === 'day' ? 'text-indigo-700' : 'text-indigo-200';
  const cardClass = theme === 'day' 
    ? 'bg-white/80 hover:bg-white/90' 
    : 'bg-indigo-900/40 hover:bg-indigo-900/60';

  // Data
  const stats = [
    { value: 50000, suffix: '+', label: 'Активных студентов' },
    { value: 1200, suffix: '+', label: 'Курсов' },
    { value: 98, suffix: '%', label: 'Довольных пользователей' },
    { value: 24, suffix: '/7', label: 'Поддержка' },
  ];

  const problems = [
    {
      icon: Navigation,
      title: 'Сложная навигация',
      description: 'Студенты теряются между различными платформами и инструментами.',
      tooltip: '> невыносимо! поэтому всё собрали в одном месте 😊',
    },
    {
      icon: MessageCircleOff,
      title: 'Отсутствие обратной связи',
      description: 'Преподаватели не успевают своевременно давать комментарии.',
      tooltip: '> с нами вы всегда будете на связи! обещаем 💬',
    },
    {
      icon: EyeOff,
      title: 'Нет прозрачности',
      description: 'Непонятно на каком этапе находится проверка задания.',
      tooltip: '> полная прозрачность на каждом этапе! 👀',
    },
  ];

  const solutions = [
    {
      icon: BookOpen,
      title: 'Контент',
      description: 'Все учебные материалы в одном месте. SCORM-совместимость.',
      gradient: 'from-blue-500 to-cyan-500',
      tooltip: '> весь контент под рукой! учись когда угодно 📚',
    },
    {
      icon: FileCheck,
      title: 'Задания',
      description: 'Создание и проверка заданий с системой версионирования.',
      gradient: 'from-purple-500 to-pink-500',
      tooltip: '> сдавай работы легко! мы всё сохраним ✨',
    },
    {
      icon: MessageCircle,
      title: 'Коммуникация',
      description: 'Встроенный чат и мгновенная обратная связь.',
      gradient: 'from-green-500 to-emerald-500',
      tooltip: '> общайся свободно! мы всегда на связи 💬',
    },
    {
      icon: BarChart3,
      title: 'Аналитика',
      description: 'Детальный журнал успеваемости и визуализация прогресса.',
      gradient: 'from-orange-500 to-red-500',
      tooltip: '> следи за успехами! статистика в реальном времени 📊',
    },
  ];

  const studentFeatures = [
    { icon: Play, title: 'Изучение материалов', description: 'Видео, статьи и интерактивные курсы', tooltip: '> смотри и учись! 🎬' },
    { icon: Upload, title: 'Загрузка заданий', description: 'Автоматическое сохранение версий', tooltip: '> загружай легко! 📤' },
    { icon: Award, title: 'Получение оценок', description: 'Результаты с подробными комментариями', tooltip: '> получай оценки мгновенно! 🏆' },
  ];

  const teacherFeatures = [
    { icon: CheckSquare, title: 'Проверка работ', description: 'Удобный интерфейс для быстрой проверки', tooltip: '> проверяй быстро! ✅' },
    { icon: MessageCircle, title: 'Комментарии', description: 'Детальные комментарии прямо в работах', tooltip: '> комментируй прямо в работе! 💭' },
    { icon: PlusCircle, title: 'Создание курсов', description: 'Конструктор с шаблонами и автопроверкой', tooltip: '> создавай курсы легко! 🎓' },
  ];

  const features = [
    { icon: Package, title: 'SCORM', description: 'Импорт готовых курсов', tooltip: '> импортируй легко! 📦' },
    { icon: MessageCircle, title: 'Чат', description: 'Встроенный мессенджер', tooltip: '> общайся прямо тут! 💬' },
    { icon: GitBranch, title: 'Версионирование', description: 'История изменений', tooltip: '> всё сохранено! 🔄' },
    { icon: FileText, title: 'Тесты', description: 'Автоматическая проверка', tooltip: '> создавай тесты легко! ✍️' },
    { icon: BookMarked, title: 'Журнал', description: 'Автоподсчёт баллов', tooltip: '> всё в одном месте! 📖' },
    { icon: TrendingUp, title: 'Прогресс', description: 'Визуализация в реальном времени', tooltip: '> смотри свой рост! 📈' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <CloudBackground theme={theme} />
      
      {/* Liquid Glass Navigation Bar */}
      <LiquidGlassNavbar
        theme={theme}
        onNavigate={onNavigate}
        onToggleTheme={onToggleTheme}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={onLogout}
      />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-20">
          {/* Badge - separate from parallax */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6"
          >
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              theme === 'day' 
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                : 'bg-indigo-900/50 text-indigo-300 border border-indigo-700'
            }`}>
              Новое поколение образования
            </span>
          </motion.div>

          {/* Logo - separate from parallax */}
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Logo theme={theme} size="large" />
          </motion.div>

          {/* Content with parallax */}
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="text-center"
          >
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className={`text-6xl md:text-8xl mb-6 ${textClass}`}
              style={{ fontFamily: 'Comfortaa, cursive' }}
            >
              EduFlow
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className={`text-2xl md:text-3xl mb-4 ${subTextClass}`}
            >
              Комфортная образовательная среда
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className={`text-lg md:text-xl mb-12 max-w-2xl mx-auto ${subTextClass}`}
            >
              Единая экосистема где контент, задания, коммуникация и аналитика работают вместе
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <motion.button
                onClick={() => onNavigate('register')}
                whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(99, 102, 241, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[28px] flex items-center gap-3 transition-all duration-300 shadow-xl"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <User className="w-5 h-5 relative z-10" />
                <span className="relative z-10 text-lg font-medium">Начать бесплатно</span>
              </motion.button>

              <motion.button
                onClick={() => onNavigate('login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-[28px] flex items-center gap-3 transition-all duration-300 border-2 ${
                  theme === 'day' 
                    ? 'border-indigo-300 text-indigo-700 hover:bg-indigo-50' 
                    : 'border-indigo-500 text-indigo-300 hover:bg-indigo-900/30'
                }`}
              >
                <span className="text-lg font-medium">Войти</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Floating elements */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="hidden lg:block absolute left-[10%] top-[30%]"
          >
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className={`w-16 h-16 rounded-2xl ${
                theme === 'day' ? 'bg-white/80 shadow-xl' : 'bg-indigo-900/60'
              } backdrop-blur-xl flex items-center justify-center border ${
                theme === 'day' ? 'border-indigo-100' : 'border-indigo-700'
              }`}
            >
              <BookOpen className={`w-8 h-8 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}`} />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="hidden lg:block absolute right-[10%] top-[25%]"
          >
            <motion.div
              animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className={`w-14 h-14 rounded-xl ${
                theme === 'day' ? 'bg-white/80 shadow-xl' : 'bg-indigo-900/60'
              } backdrop-blur-xl flex items-center justify-center border ${
                theme === 'day' ? 'border-amber-100' : 'border-amber-700'
              }`}
            >
              <Zap className={`w-7 h-7 ${theme === 'day' ? 'text-amber-500' : 'text-amber-400'}`} />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="hidden lg:block absolute left-[15%] bottom-[20%]"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className={`w-12 h-12 rounded-lg ${
                theme === 'day' ? 'bg-white/80 shadow-xl' : 'bg-indigo-900/60'
              } backdrop-blur-xl flex items-center justify-center border ${
                theme === 'day' ? 'border-emerald-100' : 'border-emerald-700'
              }`}
            >
              <Star className={`w-6 h-6 ${theme === 'day' ? 'text-emerald-500' : 'text-emerald-400'}`} />
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ 
              opacity: { delay: 1.5, duration: 0.6 },
              y: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }}
            className={`absolute bottom-12 left-1/2 -translate-x-1/2 ${subTextClass}`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm">Листайте вниз</span>
              <ChevronDown className="w-6 h-6" />
            </div>
          </motion.div>
        </section>

        <div className="px-4 space-y-8 pb-20">
          {/* Stats Section */}
          <Section theme={theme} variant="gradient-purple">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} theme={theme} />
                  <p className={`text-sm mt-2 ${subTextClass}`}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </Section>

          {/* Problems Section */}
          <Section theme={theme}>
            <div className="text-center mb-12">
              <h2 className={`text-4xl md:text-5xl mb-4 ${textClass}`}>
                Проблемы онлайн-обучения
              </h2>
              <p className={`text-xl ${subTextClass}`}>
                С которыми сталкиваются каждый день
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {problems.map((problem, index) => (
                <Tooltip key={index} content={problem.tooltip} theme={theme}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    whileHover={{ y: -10, scale: 1.03 }}
                    className={`relative overflow-hidden backdrop-blur-xl rounded-[32px] p-6 ${cardClass} transition-all duration-500 cursor-pointer border border-transparent hover:border-indigo-400/50 shadow-lg hover:shadow-2xl`}
                  >
                    <motion.div
                      className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <problem.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className={`text-xl mb-3 ${textClass}`}>{problem.title}</h3>
                    <p className={`${subTextClass} text-sm leading-relaxed`}>{problem.description}</p>
                  </motion.div>
                </Tooltip>
              ))}
            </div>
          </Section>

          {/* Solutions Section */}
          <Section theme={theme} id="features">
            <div className="text-center mb-12">
              <h2 className={`text-4xl md:text-5xl mb-4 ${textClass}`}>
                Всё в одной экосистеме
              </h2>
              <p className={`text-xl ${subTextClass}`}>
                EduFlow объединяет все инструменты для эффективного обучения
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {solutions.map((solution, index) => (
                <Tooltip key={index} content={solution.tooltip} theme={theme}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`relative overflow-hidden backdrop-blur-xl rounded-[32px] p-8 ${cardClass} transition-all duration-500 cursor-pointer border border-transparent hover:border-indigo-400/50 shadow-lg hover:shadow-2xl group`}
                  >
                    <motion.div
                      className={`w-20 h-20 rounded-[24px] bg-gradient-to-br ${solution.gradient} flex items-center justify-center mb-6 shadow-2xl`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <solution.icon className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className={`text-2xl mb-4 ${textClass}`}>{solution.title}</h3>
                    <p className={`${subTextClass} leading-relaxed`}>{solution.description}</p>
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </motion.div>
                </Tooltip>
              ))}
            </div>
          </Section>

          {/* For Students Section */}
          <Section theme={theme} variant="gradient-blue" id="students">
            <h2 className={`text-4xl md:text-5xl mb-8 ${textClass}`}>
              Для студентов
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {studentFeatures.map((feature, index) => (
                <Tooltip key={index} content={feature.tooltip} theme={theme}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.03 }}
                    className={`p-6 rounded-[28px] ${
                      theme === 'day' ? 'bg-white/70 hover:bg-white/90' : 'bg-indigo-800/40 hover:bg-indigo-800/60'
                    } backdrop-blur-xl transition-all duration-500 cursor-pointer border border-transparent hover:border-blue-400/50 shadow-lg hover:shadow-2xl`}
                  >
                    <motion.div
                      className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-4 shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <h3 className={`text-xl mb-3 ${textClass}`}>{feature.title}</h3>
                    <p className={`${subTextClass} text-sm leading-relaxed`}>{feature.description}</p>
                  </motion.div>
                </Tooltip>
              ))}
            </div>
          </Section>

          {/* For Teachers Section */}
          <Section theme={theme} variant="gradient-pink" id="teachers">
            <h2 className={`text-4xl md:text-5xl mb-8 ${theme === 'day' ? 'text-rose-900' : 'text-white'}`}>
              Для преподавателей
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teacherFeatures.map((feature, index) => (
                <Tooltip key={index} content={feature.tooltip} theme={theme}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.03 }}
                    className={`p-6 rounded-[28px] ${
                      theme === 'day' ? 'bg-white/70 hover:bg-white/90' : 'bg-rose-800/40 hover:bg-rose-800/60'
                    } backdrop-blur-xl transition-all duration-500 cursor-pointer border border-transparent hover:border-pink-400/50 shadow-lg hover:shadow-2xl`}
                  >
                    <motion.div
                      className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center mb-4 shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <h3 className={`text-xl mb-3 ${theme === 'day' ? 'text-rose-900' : 'text-white'}`}>{feature.title}</h3>
                    <p className={`${theme === 'day' ? 'text-rose-700' : 'text-rose-200'} text-sm leading-relaxed`}>{feature.description}</p>
                  </motion.div>
                </Tooltip>
              ))}
            </div>
          </Section>

          {/* Features Grid */}
          <Section theme={theme}>
            <div className="text-center mb-12">
              <h2 className={`text-4xl md:text-5xl mb-4 ${textClass}`}>
                Все необходимые функции
              </h2>
              <p className={`text-xl ${subTextClass}`}>
                Полный набор инструментов для современного образования
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Tooltip key={index} content={feature.tooltip} theme={theme}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.05 }}
                    className={`relative overflow-hidden backdrop-blur-xl rounded-[28px] p-6 ${cardClass} transition-all duration-500 cursor-pointer border border-transparent hover:border-indigo-400/50 shadow-lg hover:shadow-2xl`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <motion.div
                        className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className={`text-xl mb-2 ${textClass}`}>{feature.title}</h3>
                      <p className={`${subTextClass} text-sm`}>{feature.description}</p>
                    </div>
                  </motion.div>
                </Tooltip>
              ))}
            </div>
          </Section>

          {/* CTA Section */}
          <Section theme={theme} variant="gradient-purple" className="max-w-4xl">
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="inline-block mb-6"
              >
                <GraduationCap className={`w-16 h-16 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`} />
              </motion.div>
              
              <h2 className={`text-4xl md:text-5xl mb-6 ${textClass}`}>
                Готовы начать?
              </h2>
              
              <p className={`text-xl mb-12 ${subTextClass}`}>
                Присоединяйтесь к образовательной платформе нового поколения
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.button
                  onClick={() => onNavigate('register')}
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(99, 102, 241, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[28px] flex items-center justify-center gap-3 transition-all duration-300 shadow-xl"
                >
                  <User className="w-6 h-6" />
                  <span className="text-lg">Я студент</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>

                <motion.button
                  onClick={() => onNavigate('register')}
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(236, 72, 153, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden px-8 py-5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-[28px] flex items-center justify-center gap-3 transition-all duration-300 shadow-xl"
                >
                  <GraduationCap className="w-6 h-6" />
                  <span className="text-lg">Я преподаватель</span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <footer id="about" className="relative px-4 py-16 mt-8">
          <div className="max-w-6xl mx-auto">
            <div className={`backdrop-blur-2xl border rounded-[48px] p-12 shadow-2xl ${
              theme === 'day' ? 'bg-white/40 border-white/60' : 'bg-indigo-950/30 border-indigo-800/40'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Brand */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <Logo theme={theme} size="small" />
                    <h3 className={`text-3xl ${textClass}`} style={{ fontFamily: 'Comfortaa, cursive' }}>
                      EduFlow
                    </h3>
                  </div>
                  <p className={`${subTextClass} mb-6`}>
                    Комфортная образовательная среда для студентов и преподавателей
                  </p>
                  <div className="flex gap-4">
                    {[Github, Twitter, Linkedin].map((Icon, index) => (
                      <motion.a
                        key={index}
                        href="#"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center transition-all duration-300 shadow-lg"
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </motion.a>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div>
                  <h4 className={`text-xl mb-4 ${textClass}`}>Навигация</h4>
                  <ul className="space-y-3">
                    {['О платформе', 'Для студентов', 'Для преподавателей', 'Цены', 'Документация'].map((link) => (
                      <li key={link}>
                        <motion.a
                          href="#"
                          className={`${theme === 'day' ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-200'} transition-colors`}
                          whileHover={{ x: 5 }}
                        >
                          {link}
                        </motion.a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h4 className={`text-xl mb-4 ${textClass}`}>Контакты</h4>
                  <ul className="space-y-3">
                    <li className={`flex items-center gap-3 ${subTextClass}`}>
                      <Mail className="w-5 h-5" />
                      <span>support@eduflow.ru</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className={`mt-12 pt-8 border-t ${theme === 'day' ? 'border-indigo-200' : 'border-indigo-800'} text-center`}>
                <p className={subTextClass}>
                  © 2025 EduFlow. Все права защищены.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
