import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

interface ThemeToggleProps {
  theme: 'day' | 'night';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={`fixed top-8 right-8 z-50 flex items-center gap-2 px-6 py-3 rounded-full ${
        theme === 'day'
          ? 'bg-white/90 text-indigo-900'
          : 'bg-indigo-900/90 text-white'
      } backdrop-blur-sm shadow-lg transition-all duration-300`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      {theme === 'day' ? (
        <>
          <Moon className="w-5 h-5" />
          <span>Ночь</span>
        </>
      ) : (
        <>
          <Sun className="w-5 h-5" />
          <span>День</span>
        </>
      )}
    </motion.button>
  );
}
