import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Trophy, Star, Target, Zap, Crown, BookOpen, Brain, Heart, Eye,
  Flame, Rocket, Wind, Cloud, Coffee, Radio, Dna, Lightbulb, Shield,
  Sword, Compass, Mountain, Waves, Sun, Moon, Layers, Code, Lock, Key,
  Bell, Gauge, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState, useRef } from 'react';
import { GridPattern } from './GridPattern';

interface AchievementsProps {
  theme: 'day' | 'night';
}

interface Achievement {
  id: number;
  icon: any;
  title: string;
  description: string;
  fullDescription: string;
  progress: number;
  unlocked: boolean;
  color: string;
}

const achievements: Achievement[] = [
  { id: 1, icon: Award, title: 'Быстрый старт', description: 'Завершите 5 курсов', fullDescription: 'Завершите свой первый курс на платформе. Это достижение разблокирует доступ к дополнительным материалам.', progress: 100, unlocked: true, color: 'from-yellow-500 to-orange-500' },
  { id: 2, icon: Trophy, title: 'Отличник', description: 'Получите 10 оценок "отлично"', fullDescription: 'Получите 10 высших оценок за ваши работы. Это признание вашего мастерства и усердия.', progress: 80, unlocked: true, color: 'from-blue-500 to-cyan-500' },
  { id: 3, icon: Star, title: 'Звезда', description: 'Наберите 1000 баллов', fullDescription: 'Накопите 1000 баллов через выполнение заданий и тестов. Требует постоянного участия.', progress: 65, unlocked: false, color: 'from-purple-500 to-pink-500' },
  { id: 4, icon: Target, title: 'Снайпер', description: 'Сдайте 20 заданий с первого раза', fullDescription: 'Безошибочное выполнение 20 заданий подряд. Это требует высокой концентрации и понимания материала.', progress: 45, unlocked: false, color: 'from-green-500 to-emerald-500' },
  { id: 5, icon: Zap, title: 'Молния', description: 'Завершите курс за неделю', fullDescription: 'Пройдите полный курс за 7 дней. Для продвинутых учеников, которые не боятся вызовов.', progress: 0, unlocked: false, color: 'from-yellow-500 to-red-500' },
  { id: 6, icon: Crown, title: 'Король знаний', description: 'Достигните высшего уровня', fullDescription: 'Достигните максимального уровня на платформе. Это требует огромного количества времени и усилий.', progress: 0, unlocked: false, color: 'from-indigo-500 to-purple-500' },
  { id: 7, icon: BookOpen, title: 'Читатель', description: 'Прочитайте все материалы курса', fullDescription: 'Изучите все теоретические материалы хотя бы одного курса полностью.', progress: 40, unlocked: false, color: 'from-amber-500 to-yellow-500' },
  { id: 8, icon: Brain, title: 'Мыслитель', description: 'Решите 100 задач', fullDescription: 'Решите 100 практических задач. Показывает вашу способность применять знания.', progress: 35, unlocked: false, color: 'from-pink-500 to-red-500' },
  { id: 9, icon: Heart, title: 'Помощник', description: 'Помогите 5 другим студентам', fullDescription: 'Помогите другим студентам разобраться в сложных темах. Соберите 5 отзывов благодарности.', progress: 20, unlocked: false, color: 'from-rose-500 to-pink-500' },
  { id: 10, icon: Eye, title: 'Наблюдатель', description: 'Посетите все вебинары месяца', fullDescription: 'Активно участвуйте во всех вебинарах в течение одного календарного месяца.', progress: 75, unlocked: false, color: 'from-cyan-500 to-blue-500' },
  { id: 11, icon: Flame, title: 'Огонь', description: 'Учитесь 30 дней подряд', fullDescription: 'Совершенствуйте свои навыки каждый день в течение месяца. Стабильность - ключ к успеху.', progress: 90, unlocked: false, color: 'from-orange-500 to-red-500' },
  { id: 12, icon: Rocket, title: 'Ракета', description: 'Прыгните на 5 уровней за месяц', fullDescription: 'Быстрый прогресс: поднимитесь на 5 уровней за 30 дней.', progress: 60, unlocked: false, color: 'from-red-500 to-pink-500' },
  { id: 13, icon: Wind, title: 'Ветер', description: 'Быстро пройдите тест', fullDescription: 'Завершите любой тест менее чем за 10 минут без ошибок.', progress: 50, unlocked: false, color: 'from-sky-500 to-cyan-500' },
  { id: 14, icon: Cloud, title: 'Облако', description: 'Загрузите свой проект', fullDescription: 'Поделитесь одним из своих проектов с сообществом для получения обратной связи.', progress: 0, unlocked: false, color: 'from-gray-400 to-blue-300' },
  { id: 15, icon: Coffee, title: 'Бодрячок', description: 'Учитесь с 6 до 9 утра', fullDescription: 'Активно занимайтесь в ранние утренние часы в течение 10 дней.', progress: 25, unlocked: false, color: 'from-amber-700 to-orange-600' },
  { id: 16, icon: Radio, title: 'Радио', description: 'Слушайте все подкасты', fullDescription: 'Прослушайте все эпизоды образовательного подкаста платформы.', progress: 45, unlocked: false, color: 'from-purple-500 to-blue-500' },
  { id: 17, icon: Dna, title: 'Генетик', description: 'Сдайте экзамен на науку', fullDescription: 'Получите высший балл на экзамене по естественным наукам.', progress: 0, unlocked: false, color: 'from-green-500 to-teal-500' },
  { id: 18, icon: Lightbulb, title: 'Изобретатель', description: 'Создайте свой проект', fullDescription: 'Разработайте и реализуйте собственный проект в рамках курса.', progress: 70, unlocked: false, color: 'from-yellow-400 to-yellow-600' },
  { id: 19, icon: Shield, title: 'Защитник', description: 'Ответьте на все вопросы', fullDescription: 'Полностью ответьте на все вопросы в форуме сообщества.', progress: 55, unlocked: false, color: 'from-blue-600 to-indigo-600' },
  { id: 20, icon: Sword, title: 'Боец', description: 'Выиграйте 10 соревнований', fullDescription: 'Возьмите первое место в 10 образовательных соревнованиях на платформе.', progress: 20, unlocked: false, color: 'from-red-600 to-orange-600' },
  { id: 21, icon: Compass, title: 'Навигатор', description: 'Посетите все разделы', fullDescription: 'Изучите каждый раздел и категорию на платформе.', progress: 85, unlocked: false, color: 'from-teal-500 to-green-500' },
  { id: 22, icon: Mountain, title: 'Альпинист', description: 'Преодолейте сложный курс', fullDescription: 'Завершите курс повышенной сложности с оценкой не менее 90%.', progress: 40, unlocked: false, color: 'from-gray-600 to-gray-800' },
  { id: 23, icon: Waves, title: 'Серфер', description: 'Пройдите волну заданий', fullDescription: 'Выполните 50 заданий за 1 неделю. Марафон активности!', progress: 65, unlocked: false, color: 'from-blue-400 to-cyan-400' },
  { id: 24, icon: Sun, title: 'Солнце', description: 'Учитесь каждый день с 12 до 3', fullDescription: 'Активно занимайтесь в послеобеденное время в течение 2 недель подряд.', progress: 30, unlocked: false, color: 'from-yellow-400 to-orange-400' },
  { id: 25, icon: Moon, title: 'Луна', description: 'Ночной совенок', fullDescription: 'Учитесь в ночное время (после 22:00) в течение 15 ночей.', progress: 55, unlocked: false, color: 'from-indigo-900 to-purple-900' },
  { id: 26, icon: Layers, title: 'Архитектор', description: 'Завершите 3 курса одновременно', fullDescription: 'Одновременно пройдите 3 курса и завершите их все.', progress: 10, unlocked: false, color: 'from-orange-500 to-red-500' },
  { id: 27, icon: Code, title: 'Кодер', description: 'Напишите 1000 строк кода', fullDescription: 'Создайте 1000 строк собственного кода в практических заданиях.', progress: 75, unlocked: false, color: 'from-green-600 to-emerald-600' },
  { id: 28, icon: Lock, title: 'Хранитель', description: 'Разгадайте 5 загадок', fullDescription: 'Решите 5 сложных логических головоломок и загадок.', progress: 40, unlocked: false, color: 'from-amber-600 to-yellow-600' },
  { id: 29, icon: Key, title: 'Ключница', description: 'Откройте секретный раздел', fullDescription: 'Найдите и откройте скрытый материал на платформе.', progress: 0, unlocked: false, color: 'from-yellow-500 to-amber-500' },
  { id: 30, icon: Bell, title: 'Звонарь', description: 'Будьте в сообществе 100 дней', fullDescription: 'Оставайтесь активным членом сообщества в течение 100 дней.', progress: 28, unlocked: false, color: 'from-purple-400 to-pink-400' },
];

export function Achievements({ theme }: AchievementsProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const cardBg = theme === 'day' ? 'bg-white/60 border-white/80' : 'bg-indigo-900/40 border-indigo-800/40';
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const itemBg = theme === 'day' ? 'bg-white/80' : 'bg-indigo-800/50';
  const modalBg = theme === 'day' ? 'bg-white' : 'bg-indigo-900';
  const buttonBg = theme === 'day' ? 'hover:bg-indigo-100' : 'hover:bg-indigo-800/50';

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const itemWidth = 176; // w-44 (160px) + gap (16px)
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

  return (
    <>
      <div className={`${cardBg} backdrop-blur-2xl border rounded-[32px] p-6 shadow-2xl relative overflow-hidden`}>
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
              {achievements.map((achievement, index) => (
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
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-[18px] bg-gradient-to-br ${achievement.color} flex items-center justify-center shadow-lg`}>
                    <achievement.icon className="w-8 h-8 text-white" />
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
                          className={`h-full bg-gradient-to-r ${achievement.color} rounded-full`}
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
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedAchievement && (
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
                <div className={`w-24 h-24 rounded-[18px] bg-gradient-to-br ${selectedAchievement.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <selectedAchievement.icon className="w-12 h-12 text-white" />
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

              <div className={`p-4 rounded-[16px] mb-4 ${theme === 'day' ? 'bg-indigo-50' : 'bg-indigo-800/30'}`}>
                <p className={`text-sm ${textClass}`}>{selectedAchievement.fullDescription}</p>
              </div>

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
                      className={`h-full bg-gradient-to-r ${selectedAchievement.color} rounded-full`}
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
        )}
      </AnimatePresence>
    </>
  );
}
