import { motion } from 'motion/react';
import { Logo } from '../components/Logo';

interface LoadingPageProps {
  theme: 'day' | 'night';
}

export function LoadingPage({ theme }: LoadingPageProps) {
  const bgGradient = theme === 'day'
    ? 'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500'
    : 'bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950';

  return (
    <div className={`min-h-screen ${bgGradient} flex items-center justify-center`}>
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              theme === 'day' ? 'bg-white/30' : 'bg-indigo-400/30'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.5, 0.8],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with pulse animation */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Logo theme={theme} size="large" />
        </motion.div>

        {/* Brand name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-6xl mt-8 mb-4 ${
            theme === 'day' ? 'text-white' : 'text-white'
          }`}
          style={{ fontFamily: 'Comfortaa, cursive' }}
        >
          EduFlow
        </motion.h1>

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-xl ${
            theme === 'day' ? 'text-white/80' : 'text-indigo-200'
          }`}
        >
          Загрузка...
        </motion.p>

        {/* Loading bar */}
        <div className="mt-8 w-64 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </div>

        {/* Floating dots */}
        <div className="flex gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-white rounded-full"
              animate={{
                y: [0, -15, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
