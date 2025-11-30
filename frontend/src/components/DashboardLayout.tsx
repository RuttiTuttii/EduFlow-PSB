import { motion, AnimatePresence } from 'motion/react';
import {
  Home, BookOpen, MessageSquare, Bot, Search,
  LogOut, Menu, X, Bell, Settings, Sun, Moon
} from 'lucide-react';
import { useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { CloudBackground } from './CloudBackground';
import { NotificationsModal } from './NotificationsModal';
import { SettingsModal } from './SettingsModal';
import { Breadcrumbs } from './Breadcrumbs';
import { getBreadcrumbs } from '../utils/breadcrumbs';
import type { User as UserType } from '../App';

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

  const sidebarBg = theme === 'day'
    ? 'bg-white/70 border-white/50'
    : 'bg-indigo-900/70 border-indigo-700/30';

  const navBg = theme === 'day'
    ? 'bg-white/70 border-white/50'
    : 'bg-indigo-900/70 border-indigo-700/30';

  const textClass = theme === 'day'
    ? 'text-indigo-900'
    : 'text-white';

  const menuItems = [
    { id: user?.role === 'student' ? '/student-dashboard' : '/teacher-dashboard', icon: Home, label: 'Главная' },
    { id: '/course', icon: BookOpen, label: 'Курсы' },
    { id: '/messenger', icon: MessageSquare, label: 'Сообщения', badge: 3 },
    { id: '/ai-assistant', icon: Bot, label: 'AI Помощник' },
  ];

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

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative flex items-center">
              <Search className={`absolute left-5 w-5 h-5 z-10 ${
                theme === 'day' ? 'text-indigo-400' : 'text-indigo-400'
              }`} />
              <input
                type="text"
                placeholder="Поиск курсов, материалов..."
                className={`w-full pl-14 pr-6 py-3 rounded-full ${
                  theme === 'day'
                    ? 'bg-white/80 text-indigo-900 placeholder-indigo-400'
                    : 'bg-indigo-800/80 text-white placeholder-indigo-400'
                } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm`}
                style={{
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                }}
              />
            </div>
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
