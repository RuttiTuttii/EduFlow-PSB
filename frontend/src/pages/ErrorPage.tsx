import { motion } from 'motion/react';
import { Home, Search, ArrowLeft, AlertTriangle } from 'lucide-react';
import { CloudBackground } from '../components/CloudBackground';
import { GridPattern } from '../components/GridPattern';
import { Logo } from '../components/Logo';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface ErrorPageProps {
  theme: 'day' | 'night';
  errorCode?: '404' | '403' | '500';
  onNavigate: (page: string) => void;
}

const errorMessages = {
  '404': {
    title: 'Страница не найдена',
    description: 'Похоже, вы заблудились в образовательном пространстве',
    emoji: '🔍',
  },
  '403': {
    title: 'Доступ запрещен',
    description: 'У вас нет прав для просмотра этой страницы',
    emoji: '🔒',
  },
  '500': {
    title: 'Ошибка сервера',
    description: 'Что-то пошло не так. Мы уже работаем над этим',
    emoji: '⚠️',
  },
};

export function ErrorPage({ theme, errorCode = '404', onNavigate }: ErrorPageProps) {
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' ? 'bg-white/60 border-white/80' : 'bg-indigo-900/40 border-indigo-800/40';
  const error = errorMessages[errorCode];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CloudBackground theme={theme} />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-16 h-16 rounded-[20px] ${
              theme === 'day' ? 'bg-indigo-200/30' : 'bg-indigo-700/20'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="absolute top-8 left-8">
          <Breadcrumbs 
            theme={theme}
            items={[
              { label: 'Главная', path: 'landing' },
              { label: `Ошибка ${errorCode}`, path: 'error' },
            ]}
            onNavigate={onNavigate}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`max-w-2xl w-full ${cardBg} backdrop-blur-2xl border rounded-[48px] p-12 shadow-2xl relative overflow-hidden`}
        >
          <GridPattern theme={theme} />

          <div className="relative z-10 text-center">
            {/* Logo */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center mb-6"
            >
              <Logo theme={theme} size="medium" />
            </motion.div>

            {/* Error Code */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <span className="text-8xl" style={{ fontFamily: 'Comfortaa, cursive' }}>
                {error.emoji}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-6xl mb-4 ${textClass}`}
              style={{ fontFamily: 'Comfortaa, cursive' }}
            >
              {errorCode}
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`text-3xl mb-4 ${textClass}`}
            >
              {error.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`text-xl mb-8 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}
            >
              {error.description}
            </motion.p>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                onClick={() => window.history.back()}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 px-8 py-4 rounded-[24px] ${
                  theme === 'day'
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    : 'bg-indigo-800/50 text-indigo-200 hover:bg-indigo-700/50'
                } transition-all duration-300 shadow-lg`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-lg">Назад</span>
              </motion.button>

              <motion.button
                onClick={() => onNavigate('landing')}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] shadow-xl"
              >
                <Home className="w-5 h-5" />
                <span className="text-lg">На главную</span>
              </motion.button>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8"
            >
              <div className="relative max-w-md mx-auto">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'
                }`} />
                <input
                  type="text"
                  placeholder="Поиск по сайту..."
                  className={`w-full pl-12 pr-4 py-3 rounded-[24px] ${
                    theme === 'day'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                      : 'bg-indigo-800/50 border-indigo-700 text-white'
                  } border-2 focus:outline-none focus:border-indigo-500 transition-all`}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
