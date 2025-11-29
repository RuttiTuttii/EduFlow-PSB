import { motion } from 'motion/react';

interface GridPatternProps {
  theme: 'day' | 'night';
}

export function GridPattern({ theme }: GridPatternProps) {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <motion.svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        animate={{
          x: [0, 40],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <defs>
          <pattern
            id="animated-grid"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={theme === 'day' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(129, 140, 248, 0.25)'}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="200%" height="100%" fill="url(#animated-grid)" />
      </motion.svg>
    </div>
  );
}
