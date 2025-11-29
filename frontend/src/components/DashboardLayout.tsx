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
    ? 'bg-white/60 border-indigo-200/50'
    : 'bg-indigo-900/40 border-indigo-800/40';

  const navBg = theme === 'day'
    ? 'bg-white/80 border-indigo-200/50'
    : 'bg-indigo-900/60 border-indigo-800/50';

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
      <nav className={`fixed top-0 left-0 right-0 z-40 ${navBg} backdrop-blur-2xl border-b shadow-lg`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-3 rounded-[20px] ${
                theme === 'day' ? 'hover:bg-indigo-100' : 'hover:bg-indigo-800/50'
              } transition-colors ${textClass}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
            
            <button onClick={() => navigate('/')} className="flex items-center gap-3">
              <Logo theme={theme} size="small" />
              <span className={`text-2xl ${textClass}`} style={{ fontFamily: 'Comfortaa, cursive' }}>
                EduFlow
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'
              }`} />
              <input
                type="text"
                placeholder="Поиск курсов, материалов..."
                className={`w-full pl-12 pr-4 py-3 rounded-[24px] ${
                  theme === 'day'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                    : 'bg-indigo-800/50 border-indigo-700 text-white'
                } border-2 focus:outline-none focus:border-indigo-500 transition-all`}
              />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onToggleTheme}
              className={`p-3 rounded-[20px] ${
                theme === 'day' ? 'hover:bg-indigo-100' : 'hover:bg-indigo-800/50'
              } transition-colors ${textClass}`}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'day' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </motion.button>

            <motion.button
              onClick={() => setNotificationsOpen(true)}
              className={`relative p-3 rounded-[20px] ${
                theme === 'day' ? 'hover:bg-indigo-100' : 'hover:bg-indigo-800/50'
              } transition-colors ${textClass}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell className="w-6 h-6" />
              <motion.span 
                className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                3
              </motion.span>
            </motion.button>

            <motion.button
              onClick={() => setSettingsOpen(true)}
              className={`p-3 rounded-[20px] ${
                theme === 'day' ? 'hover:bg-indigo-100' : 'hover:bg-indigo-800/50'
              } transition-colors ${textClass}`}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <Settings className="w-6 h-6" />
            </motion.button>

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg`}>
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className={`${textClass} hidden md:block`}>
                <div>{user?.name}</div>
                <div className="text-sm opacity-70">{user?.role === 'student' ? 'Студент' : 'Преподаватель'}</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar - removed AnimatePresence */}
      {sidebarOpen && (
        <aside
          className={`fixed left-0 top-20 bottom-0 w-72 ${sidebarBg} backdrop-blur-2xl border-r shadow-2xl z-30 overflow-y-auto transition-all duration-300`}
        >
          <nav className="p-6 space-y-2">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`relative w-full flex items-center gap-4 px-6 py-4 rounded-[24px] transition-all duration-300 ${
                  activePage === item.id
                    ? user?.role === 'student'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                    : theme === 'day'
                    ? 'hover:bg-white/80 text-indigo-700'
                    : 'hover:bg-indigo-800/50 text-indigo-200'
                }`}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-lg">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-3 right-3 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            ))}

            <div className={`pt-6 mt-6 border-t ${theme === 'day' ? 'border-indigo-200' : 'border-indigo-700/30'}`}>
              <motion.button
                onClick={onLogout}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[24px] ${
                  theme === 'day'
                    ? 'hover:bg-red-100 text-red-700'
                    : 'hover:bg-red-900/50 text-red-400'
                } transition-all duration-300`}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-6 h-6" />
                <span className="text-lg">Выйти</span>
              </motion.button>
            </div>
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <main 
        className={`relative z-10 pt-24 transition-all duration-300 ${
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
      </main>
    </div>
  );
}
