import { motion, AnimatePresence } from 'motion/react';
import { useState, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  theme: 'day' | 'night';
}

export function Tooltip({ children, content, theme }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-3 px-4 py-2 rounded-[16px] whitespace-nowrap ${
              theme === 'day'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-500 text-white'
            } backdrop-blur-sm shadow-lg z-50`}
            style={{
              boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
            }}
          >
            <div className="relative">
              <span className="text-sm">{content}</span>
              {/* Arrow */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent ${
                  theme === 'day'
                    ? 'border-t-indigo-600'
                    : 'border-t-indigo-500'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
