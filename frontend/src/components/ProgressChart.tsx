import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { GridPattern } from './GridPattern';

interface ProgressChartProps {
  theme: 'day' | 'night';
}

const weekData = [
  { day: 'Пн', hours: 2.5, completed: 3 },
  { day: 'Вт', hours: 3.2, completed: 4 },
  { day: 'Ср', hours: 1.8, completed: 2 },
  { day: 'Чт', hours: 4.1, completed: 5 },
  { day: 'Пт', hours: 3.5, completed: 4 },
  { day: 'Сб', hours: 5.2, completed: 6 },
  { day: 'Вс', hours: 2.9, completed: 3 },
];

export function ProgressChart({ theme }: ProgressChartProps) {
  const cardBg = theme === 'day' ? 'bg-white/60 border-white/80' : 'bg-indigo-900/40 border-indigo-800/40';
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  
  const maxHours = Math.max(...weekData.map(d => d.hours));
  
  return (
    <div className={`${cardBg} backdrop-blur-2xl border rounded-[32px] p-6 shadow-2xl relative overflow-hidden`}>
      <GridPattern theme={theme} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl ${textClass}`}>Активность за неделю</h3>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-600 rounded-[16px]">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+23%</span>
          </div>
        </div>

        {/* Chart */}
        <div className="flex items-end justify-between gap-2 h-48 mb-4">
          {weekData.map((data, index) => {
            const height = (data.hours / maxHours) * 100;
            return (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="w-full rounded-t-[12px] bg-gradient-to-t from-indigo-600 to-purple-600 relative group cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${
                    theme === 'day' ? 'bg-indigo-900 text-white' : 'bg-white text-indigo-900'
                  } px-3 py-2 rounded-[12px] text-sm whitespace-nowrap shadow-lg`}>
                    <div>{data.hours} часов</div>
                    <div>{data.completed} уроков</div>
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
            <div className={`text-2xl mb-1 ${textClass}`}>23.2ч</div>
            <div className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
              Всего часов
            </div>
          </div>
          <div className={`p-4 rounded-[20px] ${theme === 'day' ? 'bg-indigo-50' : 'bg-indigo-800/50'}`}>
            <div className={`text-2xl mb-1 ${textClass}`}>27</div>
            <div className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
              Уроков пройдено
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
