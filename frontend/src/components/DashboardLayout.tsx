import { motion, AnimatePresence } from 'motion/react';
import {
  Home, BookOpen, MessageSquare, Bot, Search,
  LogOut, Menu, X, Bell, Settings, Sun, Moon, GraduationCap, ChevronRight
} from 'lucide-react';
import { useState, ReactNode, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { CloudBackground } from './CloudBackground';
import { NotificationsModal } from './NotificationsModal';
import { SettingsModal } from './SettingsModal';
import { Breadcrumbs } from './Breadcrumbs';
import { getBreadcrumbs } from '../utils/breadcrumbs';
import { api } from '../api/client';
import type { User as UserType } from '../App';

interface Course {
  id: number;
  title: string;
  description: string;
  level: string;
  teacher_name: string;
}

interface DashboardLayoutProps {
  theme: 'day' | 'night';
  user: UserType | null;
  children: ReactNode;
  onLogout: () => void;
  onToggleTheme: () => void;
  activePage?: string;
}

export function DashboardLayout({
  theme,
  user,
  children,
  onLogout,
  onToggleTheme,
  activePage = 'dashboard'
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load all courses for search
  useEffect(() => {
    api.courses.getAll().then(setAllCourses).catch(console.error);
  }, []);

  // Filter courses based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearching(true);
      const filtered = allCourses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      setShowSearchResults(true);
      setSearching(false);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, allCourses]);

  // Close search results on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sidebarBg = theme === 'day'
    ? 'bg-white/70 border-indigo-200/50'
    : 'bg-indigo-900/70 border-indigo-700/50';

  const navBg = theme === 'day'
    ? 'bg-white/70 border-white/50'
    : 'bg-indigo-900/70 border-indigo-700/30';

  const textClass = theme === 'day'
    ? 'text-indigo-900'
    : 'text-white';

  const menuItems = [
    { id: user?.role === 'student' ? '/student-dashboard' : '/teacher-dashboard', icon: Home, label: 'Главная' },
    { id: '/courses', icon: BookOpen, label: 'Курсы' },
    { id: '/messenger', icon: MessageSquare, label: 'Сообщения', badge: 3 },
    { id: '/ai-assistant', icon: Bot, label: 'AI Помощник' },
  ];

  const levelLabels: Record<string, { label: string; color: string }> = {
    beginner: { label: 'Начальный', color: 'from-green-500 to-emerald-500' },
    intermediate: { label: 'Средний', color: 'from-yellow-500 to-orange-500' },
    advanced: { label: 'Продвинутый', color: 'from-red-500 to-pink-500' },
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CloudBackground theme={theme} />
      
      {/* Modals */}
      <NotificationsModal 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)}
        theme={theme}
      />
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
      
      {/* Top Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-40 ${navBg} backdrop-blur-2xl border-b`}
        style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}
      >
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                theme === 'day'
                  ? 'bg-white/80 text-indigo-900'
                  : 'bg-indigo-800/80 text-white'
              } backdrop-blur-sm`}
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
            
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <Logo theme={theme} size="small" />
              <span className={`text-xl font-medium ${textClass}`} style={{ fontFamily: 'Comfortaa, cursive' }}>
                EduFlow
              </span>
            </button>
          </div>

          {/* Search with Popup Results */}
          <div className="flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className={`absolute left-5 w-5 h-5 z-10 ${
                theme === 'day' ? 'text-indigo-400' : 'text-indigo-400'
              }`} />
              <input
                type="text"
                placeholder="Поиск курсов, материалов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                className={`w-full pl-14 pr-6 py-3 rounded-[24px] ${
                  theme === 'day'
                    ? 'bg-white/90 text-indigo-900 placeholder-indigo-400 border-2 border-indigo-300'
                    : 'bg-indigo-800/90 text-white placeholder-indigo-400 border-2 border-indigo-600'
                } backdrop-blur-sm focus:outline-none focus:border-indigo-500 transition-all text-sm`}
                style={{
                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)',
                }}
              />
            </div>

            {/* Search Results Popup */}
            <AnimatePresence>
              {showSearchResults && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute top-full left-0 right-0 mt-2 ${
                    theme === 'day' 
                      ? 'bg-white/95 border-indigo-200' 
                      : 'bg-indigo-900/95 border-indigo-700'
                  } backdrop-blur-xl border-2 rounded-[24px] shadow-2xl overflow-hidden z-50`}
                  style={{ maxHeight: '400px', overflowY: 'auto' }}
                >
                  {searching ? (
                    <div className="p-6 text-center">
                      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-6 text-center">
                      <Search className={`w-12 h-12 mx-auto mb-3 ${
                        theme === 'day' ? 'text-indigo-300' : 'text-indigo-600'
                      }`} />
                      <p className={`text-lg font-medium ${textClass}`}>Ничего не найдено</p>
                      <p className={`text-sm ${theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'}`}>
                        Попробуйте другой запрос
                      </p>
                    </div>
                  ) : (
                    <div className="p-2">
                      <div className={`px-4 py-2 text-xs font-medium ${
                        theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'
                      }`}>
                        Найдено курсов: {searchResults.length}
                      </div>
                      {searchResults.map((course) => (
                        <motion.button
                          key={course.id}
                          onClick={() => {
                            navigate(`/course?id=${course.id}`);
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className={`w-full flex items-center gap-4 p-4 rounded-[16px] ${
                            theme === 'day'
                              ? 'hover:bg-indigo-50 text-left'
                              : 'hover:bg-indigo-800/50 text-left'
                          } transition-all`}
                          whileHover={{ x: 4 }}
                        >
                          <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0 ${
                            theme === 'day' ? 'bg-indigo-100' : 'bg-indigo-800'
                          }`}>
                            <BookOpen className={`w-6 h-6 ${
                              theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium truncate ${textClass}`}>
                              {course.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${
                                levelLabels[course.level]?.color || 'from-gray-500 to-gray-600'
                              } text-white`}>
                                {levelLabels[course.level]?.label || course.level}
                              </span>
                              <span className={`text-xs ${
                                theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'
                              }`}>
                                {course.teacher_name}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 flex-shrink-0 ${
                            theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'
                          }`} />
                        </motion.button>
                      ))}
                      <motion.button
                        onClick={() => {
                          navigate('/courses');
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className={`w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-[16px] ${
                          theme === 'day'
                            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            : 'bg-indigo-800 text-indigo-200 hover:bg-indigo-700'
                        } transition-all`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-sm font-medium">Смотреть все курсы</span>
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={onToggleTheme}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                theme === 'day'
                  ? 'bg-white/80 text-indigo-900'
                  : 'bg-indigo-800/80 text-white'
              } backdrop-blur-sm`}
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === 'day' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span className="text-sm font-medium hidden md:inline">{theme === 'day' ? 'Ночь' : 'День'}</span>
            </motion.button>

            <motion.button
              onClick={() => setNotificationsOpen(true)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full ${
                theme === 'day'
                  ? 'bg-white/80 text-indigo-900'
                  : 'bg-indigo-800/80 text-white'
              } backdrop-blur-sm`}
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-4 h-4" />
              <motion.span 
                className="w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                3
              </motion.span>
            </motion.button>

            <motion.button
              onClick={() => setSettingsOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                theme === 'day'
                  ? 'bg-white/80 text-indigo-900'
                  : 'bg-indigo-800/80 text-white'
              } backdrop-blur-sm`}
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-4 h-4" />
            </motion.button>

            <motion.div 
              className={`flex items-center gap-3 px-4 py-2 rounded-full ${
                theme === 'day'
                  ? 'bg-white/80 text-indigo-900'
                  : 'bg-indigo-800/80 text-white'
              } backdrop-blur-sm`}
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium`}>
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs opacity-70">{user?.role === 'student' ? 'Студент' : 'Преподаватель'}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed left-0 top-20 bottom-0 w-72 ${sidebarBg} backdrop-blur-2xl border-r z-30 overflow-y-auto`}
            style={{ boxShadow: '8px 0 32px rgba(0, 0, 0, 0.1)' }}
          >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`relative w-full flex items-center gap-3 px-5 py-3 rounded-full transition-all duration-300 ${
                  activePage === item.id
                    ? theme === 'day'
                      ? 'bg-white text-indigo-900 shadow-lg'
                      : 'bg-indigo-800 text-white shadow-lg'
                    : theme === 'day'
                    ? 'hover:bg-white/60 text-indigo-700'
                    : 'hover:bg-indigo-800/50 text-indigo-200'
                }`}
                style={{
                  boxShadow: activePage === item.id ? '0 4px 16px rgba(0, 0, 0, 0.1)' : 'none',
                }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-2 right-3 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            ))}

            <div className={`pt-4 mt-4 border-t ${theme === 'day' ? 'border-indigo-200/30' : 'border-indigo-700/30'}`}>
              <motion.button
                onClick={onLogout}
                className={`w-full flex items-center gap-3 px-5 py-3 rounded-full ${
                  theme === 'day'
                    ? 'hover:bg-red-50 text-red-600'
                    : 'hover:bg-red-900/30 text-red-400'
                } transition-all duration-300`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Выйти</span>
              </motion.button>
            </div>
          </nav>
        </motion.aside>
      )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`relative z-10 pt-24 transition-all duration-500 ease-out ${
          sidebarOpen ? 'pl-72' : 'pl-0'
        }`}
      >
        <div className="p-8">
          {activePage !== 'student-dashboard' && activePage !== 'teacher-dashboard' && (
            <Breadcrumbs
              theme={theme}
              items={getBreadcrumbs(activePage, user?.role)}
            />
          )}
          {children}
        </div>
      </motion.main>
    </div>
  );
}
