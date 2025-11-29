import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, MessageSquare, Award } from 'lucide-react';
import { GridPattern } from './GridPattern';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'day' | 'night';
}

const notifications = [
  {
    id: 1,
    type: 'success',
    icon: CheckCircle,
    title: 'Задание принято!',
    message: 'Ваше задание по маркетингу было проверено и принято',
    time: '5 минут назад',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 2,
    type: 'message',
    icon: MessageSquare,
    title: 'Новое сообщение',
    message: 'Мария Петрова ответила на ваш вопрос в чате',
    time: '1 час назад',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 3,
    type: 'achievement',
    icon: Award,
    title: 'Новое достижение!',
    message: 'Вы получили бейдж "Быстрый старт" за прохождение 5 курсов',
    time: '2 часа назад',
    color: 'from-purple-500 to-pink-500',
  },
];

export function NotificationsModal({ isOpen, onClose, theme }: NotificationsModalProps) {
  const cardBg = theme === 'day' ? 'bg-white/95' : 'bg-indigo-900/95';
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const itemBg = theme === 'day' ? 'bg-indigo-50 hover:bg-indigo-100' : 'bg-indigo-800/50 hover:bg-indigo-700/50';

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
            initial={{ opacity: 0, scale: 0.9, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -50 }}
            className={`fixed top-24 right-8 w-96 ${cardBg} backdrop-blur-2xl rounded-[32px] shadow-2xl z-50 overflow-hidden`}
          >
            <GridPattern theme={theme} />
            
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl ${textClass}`}>Уведомления</h2>
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

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-[20px] ${itemBg} transition-all duration-300 cursor-pointer`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-[14px] bg-gradient-to-br ${notification.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <notification.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`mb-1 ${textClass}`}>{notification.title}</h3>
                        <p className={`text-sm mb-2 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                          {notification.message}
                        </p>
                        <span className={`text-xs ${theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'}`}>
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[20px] shadow-lg"
              >
                Отметить все как прочитанные
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
