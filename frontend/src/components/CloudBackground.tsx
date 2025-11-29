import { motion } from 'motion/react';

interface CloudBackgroundProps {
  theme: 'day' | 'night';
}

export function CloudBackground({ theme }: CloudBackgroundProps) {
  const clouds = [
    { id: 1, x: '10%', y: '15%', scale: 1, duration: 20 },
    { id: 2, x: '70%', y: '25%', scale: 0.8, duration: 25 },
    { id: 3, x: '30%', y: '60%', scale: 1.2, duration: 30 },
    { id: 4, x: '80%', y: '70%', scale: 0.9, duration: 22 },
    { id: 5, x: '5%', y: '85%', scale: 1.1, duration: 28 },
  ];

  const gradientClass = theme === 'day' 
    ? 'bg-gradient-to-b from-blue-300 via-blue-200 to-blue-100'
    : 'bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-800';

  return (
    <>
      <div className={`fixed inset-0 ${gradientClass} transition-all duration-1000`} />
      
      {/* Animated stars for night theme */}
      {theme === 'night' && (
        <div className="fixed inset-0 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Floating clouds */}
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="fixed pointer-events-none"
          style={{
            left: cloud.x,
            top: cloud.y,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div
            className={`w-32 h-16 rounded-full blur-sm ${
              theme === 'day' 
                ? 'bg-white/40' 
                : 'bg-indigo-400/10'
            }`}
            style={{
              transform: `scale(${cloud.scale})`,
              boxShadow: theme === 'day' 
                ? '0 4px 20px rgba(255, 255, 255, 0.5)'
                : '0 4px 20px rgba(129, 140, 248, 0.1)',
            }}
          />
        </motion.div>
      ))}
    </>
  );
}
