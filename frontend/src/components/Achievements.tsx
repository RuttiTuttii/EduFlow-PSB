import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Trophy, Star, Target, Zap, Crown, BookOpen, GraduationCap,
  Flame, Rocket, Clock, Timer, CheckCircle, FileCheck, Files, Library,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { GridPattern } from './GridPattern';
import { dashboardApi } from '../api/client';

interface AchievementsProps {
  theme: 'day' | 'night';
}

interface Achievement {
  id: number;
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  requirement_type: string;
  requirement_value: number;
  progress: number;
  unlocked: boolean;
  unlocked_at?: string;
}

const iconMap: Record<string, any> = {
  Rocket, BookOpen, GraduationCap, Star, Crown, Award, Trophy, Library,
  Clock, Timer, Flame, Zap, CheckCircle, FileCheck, Files, Target
};

const colorMap: Record<string, string> = {
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-green-500 to-emerald-500',
  purple: 'from-purple-500 to-pink-500',
  yellow: 'from-yellow-500 to-orange-500',
  orange: 'from-orange-500 to-red-500',
  cyan: 'from-cyan-500 to-blue-500',
  pink: 'from-pink-500 to-rose-500',
  indigo: 'from-indigo-500 to-purple-500',
  teal: 'from-teal-500 to-cyan-500',
  red: 'from-red-500 to-orange-500',
};

export function Achievements({ theme }: AchievementsProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const cardBg = theme === 'day' 
    ? 'bg-white/70 border-white/50' 
    : 'bg-indigo-900/70 border-indigo-700/30';
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const itemBg = theme === 'day' ? 'bg-white/80' : 'bg-indigo-800/50';
  const modalBg = theme === 'day' ? 'bg-white' : 'bg-indigo-900';
  const buttonBg = theme === 'day' ? 'hover:bg-indigo-100' : 'hover:bg-indigo-800/50';

  useEffect(() => {
    async function loadAchievements() {
      try {
        const data = await dashboardApi.getAchievements();
        setAchievements(data);
      } catch (error) {
        console.error('Failed to load achievements:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const itemWidth = 176;
      const newScroll = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - itemWidth
        : scrollContainerRef.current.scrollLeft + itemWidth;
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
      
      setTimeout(checkScroll, 600);
    }
  };

  const getIcon = (iconName: string) => iconMap[iconName] || Award;
  const getColor = (colorName: string) => colorMap[colorName] || 'from-indigo-500 to-purple-500';

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${cardBg} backdrop-blur-2xl border rounded-[32px] p-6 relative overflow-hidden`}
        style={{ boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)' }}
      >
        <GridPattern theme={theme} />
        <div className="relative z-10 text-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 mx-auto mb-4 border-3 border-indigo-500 border-t-transparent rounded-full"
          />
          <p className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>Загрузка достижений...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`${cardBg} backdrop-blur-2xl border rounded-[32px] p-6 relative overflow-hidden`}
        style={{ boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)' }}
      >
        <GridPattern theme={theme} />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-2xl ${textClass}`}>Достижения</h3>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`p-2 rounded-[12px] ${buttonBg} transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                <ChevronLeft className={`w-5 h-5 ${textClass}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`p-2 rounded-[12px] ${buttonBg} transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                <ChevronRight className={`w-5 h-5 ${textClass}`} />
              </motion.button>
            </div>
          </div>

          {/* Контейнер с прокруткой */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="overflow-x-auto scrollbar-hide"
            style={{
              scrollBehavior: 'smooth',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <div className="flex gap-4 pb-2 min-w-max">
              {achievements.map((achievement, index) => {
                const Icon = getIcon(achievement.icon);
                const colorClass = getColor(achievement.color);
                return (
                  <motion.button
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ delay: index * 0.03, type: 'spring', stiffness: 100 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    onClick={() => setSelectedAchievement(achievement)}
                    className={`relative p-4 rounded-[20px] ${itemBg} ${
                      !achievement.unlocked && 'opacity-50 grayscale'
                    } transition-all duration-300 cursor-pointer flex-shrink-0 w-44 h-max`}
                  >
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-[18px] bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h4 className={`text-center mb-2 text-sm font-medium ${textClass}`}>{achievement.title}</h4>
                    <p className={`text-xs text-center mb-3 line-clamp-2 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                      {achievement.description}
                    </p>

                    {achievement.progress > 0 && (
                      <div className="space-y-1">
                        <div className={`h-1.5 ${theme === 'day' ? 'bg-indigo-100' : 'bg-indigo-900'} rounded-full overflow-hidden`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${achievement.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.03 + 0.3 }}
                            className={`h-full bg-gradient-to-r ${colorClass} rounded-full`}
                          />
                        </div>
                        <div className={`text-xs text-center ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}`}>
                          {achievement.progress}%
                        </div>
                      </div>
                    )}

                    {achievement.unlocked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.03 + 0.5, type: 'spring' }}
                        className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedAchievement && (() => {
          const SelectedIcon = getIcon(selectedAchievement.icon);
          const selectedColorClass = getColor(selectedAchievement.color);
          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedAchievement(null)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-[24px] shadow-2xl z-50 ${modalBg} border ${theme === 'day' ? 'border-white/20' : 'border-indigo-700/50'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-24 h-24 rounded-[18px] bg-gradient-to-br ${selectedColorClass} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <SelectedIcon className="w-12 h-12 text-white" />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAchievement(null)}
                    className={`p-2 rounded-full ${theme === 'day' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-indigo-800/50 hover:bg-indigo-700/50'}`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                <h2 className={`text-2xl font-bold mb-2 ${textClass}`}>{selectedAchievement.title}</h2>
                <p className={`text-sm mb-4 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  {selectedAchievement.description}
                </p>

                {selectedAchievement.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm font-medium ${textClass}`}>Прогресс</span>
                      <span className={`text-sm font-medium ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                        {selectedAchievement.progress}%
                      </span>
                    </div>
                    <div className={`h-2 ${theme === 'day' ? 'bg-indigo-100' : 'bg-indigo-900'} rounded-full overflow-hidden`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedAchievement.progress}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full bg-gradient-to-r ${selectedColorClass} rounded-full`}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {selectedAchievement.unlocked ? (
                    <div className="w-full py-3 bg-green-500 text-white rounded-[12px] text-center font-medium">
                      ✓ Разблокировано
                    </div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-[12px] text-center font-medium cursor-pointer"
                    >
                      Продолжить работу
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </>
  );
}
