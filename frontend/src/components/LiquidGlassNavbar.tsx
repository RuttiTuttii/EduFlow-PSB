import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, User, BookOpen, LayoutDashboard, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { Logo } from './Logo';

interface NavItem {
  label: string;
  href?: string;
  action?: () => void;
  submenu?: { label: string; href?: string; action?: () => void }[];
}

interface LiquidGlassNavbarProps {
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

// Animated text component - letters fly up with blur then return
function AnimatedText({ 
  text, 
  className = '',
  isActive = false,
}: { 
  text: string; 
  className?: string;
  isActive?: boolean;
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      // Увеличиваем таймаут чтобы анимация успела завершиться для всех букв
      setTimeout(() => setIsAnimating(false), 800 + text.length * 30);
    }
  };

  return (
    <span 
      className={`inline-flex overflow-hidden ${className}`}
      onMouseEnter={triggerAnimation}
    >
      {text.split('').map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          className="inline-block"
          initial={false}
          animate={isAnimating ? {
            y: [0, -20, 0],
            opacity: [1, 0, 1],
            filter: ['blur(0px)', 'blur(8px)', 'blur(0px)'],
          } : {}}
          transition={{
            duration: 0.5,
            delay: index * 0.03,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{
            display: letter === ' ' ? 'inline' : 'inline-block',
            minWidth: letter === ' ' ? '0.25em' : undefined,
          }}
        >
          {letter}
        </motion.span>
      ))}
    </span>
  );
}

export function LiquidGlassNavbar({
  theme,
  onNavigate,
  onToggleTheme,
  isAuthenticated = false,
  user = null,
  onLogout,
}: LiquidGlassNavbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [time, setTime] = useState(0);

  // Time-based animation for liquid effects
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 0.02);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Track mouse for shine effect
  const handleNavMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const subTextClass = theme === 'day' ? 'text-indigo-600' : 'text-indigo-300';

  // Navigation items based on auth state
  const getNavItems = (): NavItem[] => {
    if (isAuthenticated && user) {
      // Authenticated user navigation
      const dashboardPath = user.role === 'teacher' ? 'teacherDashboard' : 'studentDashboard';
      
      return [
        { 
          label: 'Дашборд', 
          action: () => onNavigate(dashboardPath),
        },
        { 
          label: 'Курсы', 
          action: () => onNavigate('courses'),
          submenu: [
            { label: '📚 Мои курсы', action: () => onNavigate('courses') },
            { label: '🔍 Каталог', action: () => onNavigate('catalog') },
            ...(user.role === 'teacher' ? [
              { label: '➕ Создать курс', action: () => onNavigate('createCourse') },
            ] : []),
          ]
        },
        { 
          label: 'Сообщения', 
          action: () => onNavigate('messenger'),
        },
        { label: 'О платформе', href: '#about' },
      ];
    } else {
      // Guest navigation
      return [
        { 
          label: 'Возможности', 
          href: '#features',
          submenu: [
            { label: '🎯 Все инструменты', href: '#features' },
            { label: '📚 Курсы', href: '#features' },
            { label: '💬 Общение', href: '#features' },
            { label: '📊 Аналитика', href: '#features' },
          ]
        },
        { 
          label: 'Для студентов', 
          href: '#students',
          submenu: [
            { label: '🎓 Обучение', href: '#students' },
            { label: '✅ Задания', href: '#students' },
            { label: '🏆 Достижения', href: '#students' },
          ]
        },
        { 
          label: 'Для преподавателей', 
          href: '#teachers',
          submenu: [
            { label: '📝 Создание курсов', href: '#teachers' },
            { label: '📈 Отслеживание', href: '#teachers' },
            { label: '🤖 AI помощник', href: '#teachers' },
          ]
        },
        { label: 'О нас', href: '#about' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* SVG Filters for Liquid Glass Effects */}
      <svg className="absolute w-0 h-0">
        <defs>
          {/* Liquid distortion filter */}
          <filter id="liquid-glass-nav" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.015" 
              numOctaves="3" 
              result="noise"
              seed="5"
            >
              <animate 
                attributeName="baseFrequency" 
                dur="20s" 
                values="0.015;0.02;0.015" 
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="noise" 
              scale="3" 
              xChannelSelector="R" 
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Liquid Glass Navigation Bar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100 }}
        className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
        onMouseMove={handleNavMouseMove}
      >
        <div className="max-w-6xl mx-auto relative">
          {/* Main liquid glass container */}
          <div 
            className="relative flex items-center justify-between px-6 py-3 rounded-[20px] overflow-hidden"
            style={{
              boxShadow: theme === 'day'
                ? `0 4px 24px rgba(99,102,241,0.15), 
                   0 8px 48px rgba(99,102,241,0.1),
                   inset 0 1px 1px rgba(255,255,255,0.8),
                   inset 0 -1px 1px rgba(99,102,241,0.1)`
                : `0 4px 24px rgba(0,0,0,0.3),
                   0 8px 48px rgba(99,102,241,0.2),
                   inset 0 1px 1px rgba(255,255,255,0.1),
                   inset 0 -1px 1px rgba(0,0,0,0.2)`,
            }}
          >
            {/* Base blur layer */}
            <div 
              className="absolute inset-0"
              style={{ 
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              }}
            />
            
            {/* Glass tint layer */}
            <div 
              className={`absolute inset-0 ${
                theme === 'day' 
                  ? 'bg-gradient-to-br from-white/70 via-white/50 to-indigo-100/60' 
                  : 'bg-gradient-to-br from-indigo-950/60 via-indigo-900/40 to-purple-950/50'
              }`}
            />

            {/* Rainbow refraction band */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(${90 + Math.sin(time) * 30}deg, 
                  transparent 0%, 
                  rgba(255,100,100,${0.05 + Math.sin(time) * 0.02}) 20%, 
                  rgba(255,255,100,${0.05 + Math.sin(time + 1) * 0.02}) 35%, 
                  rgba(100,255,100,${0.05 + Math.sin(time + 2) * 0.02}) 50%, 
                  rgba(100,200,255,${0.05 + Math.sin(time + 3) * 0.02}) 65%, 
                  rgba(200,100,255,${0.05 + Math.sin(time + 4) * 0.02}) 80%, 
                  transparent 100%)`,
                opacity: 0.6,
              }}
            />

            {/* Moving glare/shine following mouse */}
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-100"
              style={{
                background: theme === 'day'
                  ? `radial-gradient(ellipse 300px 150px at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.7), transparent 70%)`
                  : `radial-gradient(ellipse 300px 150px at ${mousePosition.x}% ${mousePosition.y}%, rgba(200,210,255,0.2), transparent 70%)`,
              }}
            />

            {/* Top fresnel highlight */}
            <div 
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: theme === 'day'
                  ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 80%, transparent 100%)'
                  : 'linear-gradient(90deg, transparent 0%, rgba(150,160,255,0.4) 20%, rgba(180,190,255,0.6) 50%, rgba(150,160,255,0.4) 80%, transparent 100%)',
              }}
            />

            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3 relative z-10 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => onNavigate('landing')}
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="relative"
              >
                <motion.div
                  className="absolute inset-0 rounded-full blur-lg"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    background: theme === 'day' 
                      ? 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)',
                  }}
                />
                <Logo theme={theme} size="small" />
              </motion.div>
              <span className={`text-xl font-bold ${textClass} drop-shadow-sm`} style={{ fontFamily: 'Comfortaa, cursive' }}>
                <AnimatedText text="EduFlow" />
              </span>
            </motion.div>

            {/* Nav Links with animated text */}
            <div className="hidden md:flex items-center gap-1 relative z-10">
              {navItems.map((item) => (
                <div 
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.submenu && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {/* Nav button */}
                  <motion.button
                    onClick={() => {
                      if (item.action) item.action();
                      else if (item.href && item.href.startsWith('#')) {
                        document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`relative px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 overflow-hidden ${
                      activeDropdown === item.label
                        ? theme === 'day' ? 'text-indigo-800' : 'text-white'
                        : subTextClass
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Button hover liquid background */}
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        background: theme === 'day'
                          ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(230,230,255,0.7) 100%)'
                          : 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.2) 100%)',
                        boxShadow: theme === 'day'
                          ? 'inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 8px rgba(99,102,241,0.15)'
                          : 'inset 0 1px 2px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    />
                    
                    {/* Shimmer sweep */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ x: '-100%', opacity: 0 }}
                      whileHover={{ x: '200%', opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                        width: '50%',
                      }}
                    />

                    <span className="relative z-10">
                      <AnimatedText text={item.label} />
                    </span>
                    {item.submenu && (
                      <motion.span
                        animate={{ rotate: activeDropdown === item.label ? 180 : 0 }}
                        transition={{ duration: 0.3, type: 'spring' }}
                        className="relative z-10"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.span>
                    )}
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {item.submenu && activeDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95, rotateX: -10 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2, type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute top-full left-0 mt-2 w-60 origin-top"
                        style={{ perspective: '1000px' }}
                      >
                        <div 
                          className="relative rounded-3xl overflow-hidden"
                          style={{
                            boxShadow: theme === 'day'
                              ? `0 10px 40px rgba(99,102,241,0.2), inset 0 1px 1px rgba(255,255,255,0.9)`
                              : `0 10px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)`,
                          }}
                        >
                          <div 
                            className="absolute inset-0"
                            style={{ 
                              backdropFilter: 'blur(24px) saturate(180%)',
                              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                            }}
                          />
                          <div className={`absolute inset-0 ${
                            theme === 'day' 
                              ? 'bg-white/80' 
                              : 'bg-indigo-900/80'
                          }`} />
                          
                          <div 
                            className="absolute top-0 left-0 right-0 h-[1px]"
                            style={{
                              background: theme === 'day'
                                ? 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)'
                                : 'linear-gradient(90deg, transparent, rgba(150,160,255,0.3), transparent)',
                            }}
                          />

                          <div className="relative z-10 p-3">
                            {item.submenu.map((subItem, idx) => (
                              <motion.button
                                key={subItem.label}
                                onClick={() => {
                                  if (subItem.action) subItem.action();
                                  setActiveDropdown(null);
                                }}
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05, duration: 0.2 }}
                                className={`w-full text-left px-4 py-2.5 rounded-full text-sm transition-all duration-200 group relative overflow-hidden ${
                                  theme === 'day' 
                                    ? 'text-indigo-700 hover:bg-white/60' 
                                    : 'text-indigo-200 hover:bg-indigo-800/50'
                                }`}
                                whileHover={{ x: 4 }}
                              >
                                <span className="relative z-10">
                                  <AnimatedText text={subItem.label} />
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right side - Auth buttons or user menu */}
            <div className="flex items-center gap-2 relative z-10">
              {/* Theme Toggle */}
              <motion.button
                onClick={onToggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full overflow-hidden ${
                  theme === 'day'
                    ? 'bg-white/80 text-indigo-900'
                    : 'bg-indigo-900/80 text-white'
                } backdrop-blur-sm`}
                style={{
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                }}
              >
                {theme === 'day' ? (
                  <>
                    <Moon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      <AnimatedText text="Ночь" />
                    </span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      <AnimatedText text="День" />
                    </span>
                  </>
                )}
              </motion.button>

              {isAuthenticated && user ? (
                // Authenticated user menu
                <div 
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('user')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full overflow-hidden ${
                      theme === 'day'
                        ? 'bg-white/80 text-indigo-900'
                        : 'bg-indigo-900/80 text-white'
                    } backdrop-blur-sm`}
                    style={{
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      <AnimatedText text={user.name.split(' ')[0]} />
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </motion.button>

                  {/* User dropdown */}
                  <AnimatePresence>
                    {activeDropdown === 'user' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-48 origin-top-right"
                      >
                        <div 
                          className="relative rounded-3xl overflow-hidden"
                          style={{
                            boxShadow: theme === 'day'
                              ? `0 10px 40px rgba(99,102,241,0.2)`
                              : `0 10px 40px rgba(0,0,0,0.4)`,
                          }}
                        >
                          <div 
                            className="absolute inset-0"
                            style={{ 
                              backdropFilter: 'blur(24px) saturate(180%)',
                              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                            }}
                          />
                          <div className={`absolute inset-0 ${
                            theme === 'day' 
                              ? 'bg-white/80' 
                              : 'bg-indigo-900/80'
                          }`} />

                          <div className="relative z-10 p-3">
                            <motion.button
                              onClick={() => {
                                onNavigate(user.role === 'teacher' ? 'teacherDashboard' : 'studentDashboard');
                                setActiveDropdown(null);
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-full text-sm flex items-center gap-3 ${
                                theme === 'day' ? 'text-indigo-700 hover:bg-white/60' : 'text-indigo-200 hover:bg-indigo-800/50'
                              }`}
                              whileHover={{ x: 4 }}
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              <AnimatedText text="Дашборд" />
                            </motion.button>
                            
                            <motion.button
                              onClick={() => {
                                onNavigate('courses');
                                setActiveDropdown(null);
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-full text-sm flex items-center gap-3 ${
                                theme === 'day' ? 'text-indigo-700 hover:bg-white/60' : 'text-indigo-200 hover:bg-indigo-800/50'
                              }`}
                              whileHover={{ x: 4 }}
                            >
                              <BookOpen className="w-4 h-4" />
                              <AnimatedText text="Мои курсы" />
                            </motion.button>
                            
                            <motion.button
                              onClick={() => {
                                onNavigate('settings');
                                setActiveDropdown(null);
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-full text-sm flex items-center gap-3 ${
                                theme === 'day' ? 'text-indigo-700 hover:bg-white/60' : 'text-indigo-200 hover:bg-indigo-800/50'
                              }`}
                              whileHover={{ x: 4 }}
                            >
                              <Settings className="w-4 h-4" />
                              <AnimatedText text="Настройки" />
                            </motion.button>

                            <div className={`my-2 mx-2 border-t ${theme === 'day' ? 'border-indigo-200/30' : 'border-indigo-700/30'}`} />

                            <motion.button
                              onClick={() => {
                                if (onLogout) onLogout();
                                setActiveDropdown(null);
                              }}
                              className={`w-full text-left px-4 py-2.5 rounded-full text-sm flex items-center gap-3 ${
                                theme === 'day' ? 'text-red-600 hover:bg-red-50/50' : 'text-red-400 hover:bg-red-900/20'
                              }`}
                              whileHover={{ x: 4 }}
                            >
                              <LogOut className="w-4 h-4" />
                              <AnimatedText text="Выйти" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Guest buttons
                <>
                  {/* Login Button */}
                  <motion.button
                    onClick={() => onNavigate('login')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full overflow-hidden ${
                      theme === 'day'
                        ? 'bg-white/80 text-indigo-900'
                        : 'bg-indigo-900/80 text-white'
                    } backdrop-blur-sm`}
                    style={{
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <span className="text-sm font-medium">
                      <AnimatedText text="Войти" />
                    </span>
                  </motion.button>

                  {/* Register CTA Button */}
                  <motion.button
                    onClick={() => onNavigate('register')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full overflow-hidden ${
                      theme === 'day'
                        ? 'bg-white/80 text-indigo-900'
                        : 'bg-indigo-900/80 text-white'
                    } backdrop-blur-sm`}
                    style={{
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <span className="text-sm font-medium">
                      <AnimatedText text="Регистрация" />
                    </span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      →
                    </motion.span>
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
