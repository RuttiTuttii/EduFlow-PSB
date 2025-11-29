import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { Package, MessageSquare, GitBranch, FileText, BookMarked, TrendingUp } from 'lucide-react';
import { GridPattern } from './GridPattern';
import { Tooltip } from './Tooltip';

interface FeaturesProps {
  theme: 'day' | 'night';
}

const features = [
  {
    icon: Package,
    title: 'SCORM',
    description: 'Полная поддержка стандарта SCORM для импорта готовых курсов',
    tooltip: '> импортируй готовые курсы! легко и быстро 📦',
  },
  {
    icon: MessageSquare,
    title: 'Чат',
    description: 'Встроенный мессенджер для общения преподавателей и студентов',
    tooltip: '> пиши сообщения прямо тут! никаких лишних приложений 💬',
  },
  {
    icon: GitBranch,
    title: 'Версионирование',
    description: 'История изменений всех заданий и возможность отката',
    tooltip: '> вся история сохранена! можно откатиться назад 🔄',
  },
  {
    icon: FileText,
    title: 'Тесты',
    description: 'Автоматизированная система создания и проверки тестов',
    tooltip: '> создавай тесты легко! проверка автоматическая ✍️',
  },
  {
    icon: BookMarked,
    title: 'Журнал',
    description: 'Электронный журнал с автоматическим подсчетом баллов',
    tooltip: '> все оценки в одном месте! подсчет автоматический 📖',
  },
  {
    icon: TrendingUp,
    title: 'Прогресс',
    description: 'Визуализация прогресса обучения в реальном времени',
    tooltip: '> смотри свой рост! красивые графики прогресса 📈',
  },
];

export function Features({ theme }: FeaturesProps) {
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
    <section id="features" ref={ref} className="max-w-6xl mx-auto">
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
              Все необходимые функции
            </h2>
            <p className={`text-xl ${subTextClass}`}>
              EduFlow предоставляет полный набор инструментов для современного образования
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Tooltip key={index} content={feature.tooltip} theme={theme}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={{ 
                    y: -10, 
                    scale: 1.05,
                  }}
                  className={`relative overflow-hidden backdrop-blur-xl rounded-[28px] p-6 ${cardClass} transition-all duration-500 cursor-pointer border border-transparent hover:border-indigo-400/50 shadow-lg hover:shadow-2xl`}
                >
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                      className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className={`text-xl mb-2 ${textClass}`}>
                      {feature.title}
                    </h3>
                    
                    <p className={`${subTextClass} text-sm leading-relaxed`}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </Tooltip>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
