import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GridPattern } from './GridPattern';
import { dashboardApi } from '../api/client';

interface ProgressChartProps {
  theme: 'day' | 'night';
}

interface DayData {
  day: string;
  date: string;
  hours: number;
  completed: number;
}

interface WeeklyActivityData {
  weekData: DayData[];
  totalHours: number;
  totalLessons: number;
  totalAssignments: number;
}

export function ProgressChart({ theme }: ProgressChartProps) {
  const cardBg = theme === 'day' 
    ? 'bg-white/70 border-white/50' 
    : 'bg-indigo-900/70 border-indigo-700/30';
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  
  const [activityData, setActivityData] = useState<WeeklyActivityData>({
    weekData: [],
    totalHours: 0,
    totalLessons: 0,
    totalAssignments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      try {
        const data = await dashboardApi.getWeeklyActivity();
        setActivityData(data);
      } catch (error) {
        console.error('Failed to load weekly activity:', error);
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, []);

  const maxHours = Math.max(...activityData.weekData.map(d => d.hours), 1);
  const totalCompleted = activityData.totalLessons + activityData.totalAssignments;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ scale: 1.01 }}
      className={`${cardBg} backdrop-blur-2xl border rounded-[32px] p-6 relative overflow-hidden`}
      style={{ boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)' }}
    >
      <GridPattern theme={theme} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-medium ${textClass}`}>Активность за неделю</h3>
          {activityData.totalHours > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-600 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Активно</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <p className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>Загрузка...</p>
          </div>
        ) : activityData.weekData.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <p className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>Нет данных об активности</p>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="flex items-end justify-between gap-2 h-48 mb-4">
              {activityData.weekData.map((data, index) => {
                const height = maxHours > 0 ? (data.hours / maxHours) * 100 : 0;
                return (
                  <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 5)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`w-full rounded-t-[12px] ${
                        data.hours > 0 
                          ? 'bg-gradient-to-t from-indigo-600 to-purple-600' 
                          : theme === 'day' ? 'bg-indigo-200' : 'bg-indigo-700/50'
                      } relative group cursor-pointer`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className={`absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
                        theme === 'day' ? 'bg-indigo-900 text-white' : 'bg-white text-indigo-900'
                      } px-3 py-2 rounded-[12px] text-sm whitespace-nowrap shadow-lg z-10`}>
                        <div>{data.hours}ч</div>
                        <div>{data.completed} выполнено</div>
                      </div>
                    </motion.div>
                    <span className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                      {data.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-[20px] ${theme === 'day' ? 'bg-indigo-50' : 'bg-indigo-800/50'}`}>
                <div className={`text-2xl mb-1 ${textClass}`}>{activityData.totalHours}ч</div>
                <div className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  Всего часов
                </div>
              </div>
              <div className={`p-4 rounded-[20px] ${theme === 'day' ? 'bg-indigo-50' : 'bg-indigo-800/50'}`}>
                <div className={`text-2xl mb-1 ${textClass}`}>{totalCompleted}</div>
                <div className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  Выполнено
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
