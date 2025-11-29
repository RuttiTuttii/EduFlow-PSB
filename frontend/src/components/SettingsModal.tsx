import { motion, AnimatePresence } from 'motion/react';
import { X, User, Bell, Lock, Palette, Globe } from 'lucide-react';
import { GridPattern } from './GridPattern';
import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'day' | 'night';
  onToggleTheme: () => void;
}

const sections = [
  { id: 'profile', icon: User, label: 'Профиль' },
  { id: 'notifications', icon: Bell, label: 'Уведомления' },
  { id: 'privacy', icon: Lock, label: 'Приватность' },
  { id: 'appearance', icon: Palette, label: 'Внешний вид' },
  { id: 'language', icon: Globe, label: 'Язык' },
];

export function SettingsModal({ isOpen, onClose, theme, onToggleTheme }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState('appearance');
  
  const cardBg = theme === 'day' ? 'bg-white/95' : 'bg-indigo-900/95';
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const itemBg = theme === 'day' ? 'bg-indigo-50' : 'bg-indigo-800/50';
  const activeItemBg = theme === 'day' ? 'bg-indigo-600' : 'bg-indigo-700';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-h-[600px] ${cardBg} backdrop-blur-2xl rounded-[32px] shadow-2xl z-50 overflow-hidden`}
          >
            <GridPattern theme={theme} />
            
            <div className="relative z-10 flex h-full">
              {/* Sidebar */}
              <div className={`w-64 border-r ${theme === 'day' ? 'border-indigo-200' : 'border-indigo-700/30'} p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl ${textClass}`}>Настройки</h2>
                  <motion.button
                    onClick={onClose}
                    className={`p-2 rounded-[16px] ${
                      theme === 'day' ? 'hover:bg-indigo-100' : 'hover:bg-indigo-800/50'
                    } transition-colors`}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className={`w-5 h-5 ${textClass}`} />
                  </motion.button>
                </div>

                <div className="space-y-2">
                  {sections.map((section) => (
                    <motion.button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] transition-all duration-300 ${
                        activeSection === section.id
                          ? `${activeItemBg} text-white shadow-lg`
                          : `${itemBg} ${textClass} hover:bg-opacity-80`
                      }`}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <section.icon className="w-5 h-5" />
                      <span>{section.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeSection === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-xl mb-4 ${textClass}`}>Внешний вид</h3>
                      <p className={`mb-6 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                        Настройте тему и внешний вид интерфейса
                      </p>
                    </div>

                    <div className={`p-4 rounded-[20px] ${itemBg}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`mb-1 ${textClass}`}>Тема</h4>
                          <p className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                            {theme === 'day' ? 'Светлая тема' : 'Темная тема'}
                          </p>
                        </div>
                        <motion.button
                          onClick={onToggleTheme}
                          className={`relative w-16 h-8 rounded-full ${
                            theme === 'day' ? 'bg-indigo-600' : 'bg-indigo-700'
                          } transition-colors`}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                            animate={{ left: theme === 'day' ? '4px' : '36px' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </motion.button>
                      </div>
                    </div>

                    <div className={`p-4 rounded-[20px] ${itemBg}`}>
                      <h4 className={`mb-3 ${textClass}`}>Акцентный цвет</h4>
                      <div className="grid grid-cols-6 gap-3">
                        {['indigo', 'purple', 'pink', 'blue', 'green', 'orange'].map((color) => (
                          <motion.button
                            key={color}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-10 h-10 rounded-full bg-gradient-to-br from-${color}-500 to-${color}-600 shadow-lg`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className={`text-xl mb-4 ${textClass}`}>Уведомления</h3>
                    {['Новые сообщения', 'Оценки заданий', 'Новые курсы', 'Напоминания'].map((item) => (
                      <div key={item} className={`p-4 rounded-[20px] ${itemBg} flex items-center justify-between`}>
                        <span className={textClass}>{item}</span>
                        <div className={`w-12 h-6 rounded-full ${activeItemBg}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
