import { motion } from 'motion/react';
import { GraduationCap, User } from 'lucide-react';
import { Logo } from './Logo';

interface HeroProps {
  theme: 'day' | 'night';
  onNavigate: (page: string) => void;
}

export function Hero({ theme, onNavigate }: HeroProps) {
  const textClass = theme === 'day'
    ? 'text-indigo-900'
    : 'text-white';

  const subTextClass = theme === 'day'
    ? 'text-indigo-700'
    : 'text-indigo-200';

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        {/* Animated Logo */}
        <div className="flex justify-center mb-8">
          <Logo theme={theme} size="large" />
        </div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={`text-6xl md:text-8xl mb-6 ${textClass}`}
          style={{ fontFamily: 'Comfortaa, cursive' }}
        >
          EduFlow
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className={`text-2xl md:text-3xl mb-8 ${subTextClass}`}
        >
          Комфортная образовательная среда
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className={`text-lg md:text-xl mb-12 max-w-2xl mx-auto ${subTextClass}`}
        >
          Единая образовательная онлайн-среда где контент, задания, 
          коммуникация и аналитика работают как одна экосистема
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <motion.button
            onClick={() => onNavigate('login')}
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
            <span className="relative z-10 text-lg">Для студента</span>
          </motion.button>

          <motion.button
            onClick={() => onNavigate('login')}
            whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(236, 72, 153, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-[28px] flex items-center gap-3 transition-all duration-300 shadow-xl"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            <GraduationCap className="w-5 h-5 relative z-10" />
            <span className="relative z-10 text-lg">Для преподавателя</span>
          </motion.button>
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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
