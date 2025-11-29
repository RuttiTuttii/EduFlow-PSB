import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { BookOpen, FileCheck, MessageSquare, BarChart3 } from 'lucide-react';
import { GridPattern } from './GridPattern';
import { Tooltip } from './Tooltip';

interface SolutionProps {
  theme: 'day' | 'night';
}

const solutions = [
  {
    icon: BookOpen,
    title: 'Контент',
    description: 'Все учебные материалы в одном месте. SCORM-совместимость для интеграции с существующими курсами.',
    gradient: 'from-blue-500 to-cyan-500',
    tooltip: '> весь контент под рукой! учись когда угодно 📚',
  },
  {
    icon: FileCheck,
    title: 'Задания',
    description: 'Создание, загрузка и проверка заданий с системой версионирования и автоматическими тестами.',
    gradient: 'from-purple-500 to-pink-500',
    tooltip: '> сдавай работы легко! мы всё сохраним ✨',
  },
  {
    icon: MessageSquare,
    title: 'Коммуникация',
    description: 'Встроенный чат для быстрой связи, комментарии к работам и мгновенная обратная связь.',
    gradient: 'from-green-500 to-emerald-500',
    tooltip: '> общайся свободно! мы всегда на связи 💬',
  },
  {
    icon: BarChart3,
    title: 'Аналитика',
    description: 'Детальный журнал успеваемости, визуализация прогресса и автоматические отчеты.',
    gradient: 'from-orange-500 to-red-500',
    tooltip: '> следи за успехами! статистика в реальном времени 📊',
  },
];

export function Solution({ theme }: SolutionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerClass = theme === 'day'
    ? 'bg-white/60 border-white/80'
    : 'bg-indigo-950/30 border-indigo-800/40';

  const textClass = theme === 'day'
    ? 'text-indigo-900'
    : 'text-white';

  const subTextClass = theme === 'day'
    ? 'text-indigo-700'
    : 'text-indigo-200';

  const cardClass = theme === 'day'
    ? 'bg-white/80 hover:bg-white/90'
    : 'bg-indigo-900/40 hover:bg-indigo-900/60';

  return (
    <section id="solution" ref={ref} className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className={`relative overflow-hidden backdrop-blur-2xl border rounded-[48px] p-12 shadow-2xl ${containerClass}`}
      >
        <GridPattern theme={theme} />
        
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className={`text-4xl md:text-5xl mb-4 ${textClass}`}>
              Всё в одной экосистеме
            </h2>
            <p className={`text-xl ${subTextClass}`}>
              EduFlow объединяет все необходимые инструменты для эффективного обучения
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solutions.map((solution, index) => (
              <Tooltip key={index} content={solution.tooltip} theme={theme}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`relative overflow-hidden backdrop-blur-xl rounded-[32px] p-8 ${cardClass} transition-all duration-500 cursor-pointer border border-transparent hover:border-indigo-400/50 shadow-lg hover:shadow-2xl group`}
                >
                  <div className="relative z-10">
                    <motion.div
                      className={`w-20 h-20 rounded-[24px] bg-gradient-to-br ${solution.gradient} flex items-center justify-center mb-6 shadow-2xl`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <solution.icon className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <h3 className={`text-2xl mb-4 ${textClass}`}>
                      {solution.title}
                    </h3>
                    
                    <p className={`${subTextClass} leading-relaxed`}>
                      {solution.description}
                    </p>
                  </div>

                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </motion.div>
              </Tooltip>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
