import { motion } from 'motion/react';

interface LogoProps {
  theme: 'day' | 'night';
  size?: 'small' | 'large';
}

export function Logo({ theme, size = 'large' }: LogoProps) {
  const isLarge = size === 'large';
  const dimension = isLarge ? 120 : 50;
  
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Animated gradient background */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme === 'day' ? '#6366f1' : '#818cf8'}>
              <animate
                attributeName="stop-color"
                values={theme === 'day' ? '#6366f1;#8b5cf6;#6366f1' : '#818cf8;#a78bfa;#818cf8'}
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor={theme === 'day' ? '#8b5cf6' : '#a78bfa'}>
              <animate
                attributeName="stop-color"
                values={theme === 'day' ? '#8b5cf6;#d946ef;#8b5cf6' : '#a78bfa;#c084fc;#a78bfa'}
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer circle */}
        <motion.circle
          cx="60"
          cy="60"
          r="55"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        {/* Inner rotating circle */}
        <motion.circle
          cx="60"
          cy="60"
          r="45"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="10 5"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '60px 60px' }}
        />

        {/* E letter stylized as education symbol */}
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          filter="url(#glow)"
        >
          {/* Book icon */}
          <path
            d="M40 35 L40 85 L80 85 L80 35 Z"
            fill="url(#logoGradient)"
            opacity="0.3"
          />
          <path
            d="M35 35 L35 80 C35 82 36 85 40 85 L80 85 C82 85 85 83 85 80 L85 35 Z"
            stroke="url(#logoGradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Pages */}
          <motion.line
            x1="60"
            y1="35"
            x2="60"
            y2="85"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1 }}
          />
          <motion.line
            x1="45"
            y1="50"
            x2="75"
            y2="50"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          />
          <motion.line
            x1="45"
            y1="60"
            x2="75"
            y2="60"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          />
          <motion.line
            x1="45"
            y1="70"
            x2="75"
            y2="70"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          />
        </motion.g>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.circle
            key={i}
            cx={30 + (i * 12)}
            cy={20}
            r="2"
            fill="url(#logoGradient)"
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: [-20, 0, -20],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
    </motion.div>
  );
}
