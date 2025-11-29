import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import {
  Navigation,
  MessageCircleOff,
  EyeOff,
} from "lucide-react";
import { GridPattern } from "./GridPattern";
import { Tooltip } from "./Tooltip";

interface ProblemsProps {
  theme: "day" | "night";
}

const problems = [
  {
    icon: Navigation,
    title: "Сложная навигация",
    description:
      "Студенты теряются между различными платформами и инструментами, тратя время на поиск нужной информации вместо обучения.",
    tooltip:
      "> невыносимо! поэтому всё собрали в одном месте 😊",
  },
  {
    icon: MessageCircleOff,
    title: "Отсутствие обратной связи",
    description:
      "Преподаватели не успевают своевременно давать комментарии к работам, а студенты не понимают свои ошибки.",
    tooltip: "> с нами вы всегда будете на связи! обещаем 💬",
  },
  {
    icon: EyeOff,
    title: "Нет прозрачности",
    description:
      "Непонятно на каком этапе находится проверка задания, когда ожидать результаты и какой текущий прогресс обучения.",
    tooltip:
      "> полная прозрачность на каждом этапе! вы всё увидите 👀",
  },
];

export function Problems({ theme }: ProblemsProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerClass =
    theme === "day"
      ? "bg-white/60 border-white/80"
      : "bg-indigo-950/30 border-indigo-800/40";

  const textClass =
    theme === "day" ? "text-indigo-900" : "text-white";

  const subTextClass =
    theme === "day" ? "text-indigo-700" : "text-indigo-200";

  const cardClass =
    theme === "day"
      ? "bg-white/80 hover:bg-white/90"
      : "bg-indigo-900/40 hover:bg-indigo-900/60";

  return (
    <section
      id="problems"
      ref={ref}
      className="max-w-6xl mx-auto"
    >
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
            <h2
              className={`text-4xl md:text-5xl mb-4 ${textClass}`}
            >
              Проблемы онлайн-обучения
            </h2>
            <p className={`text-xl ${subTextClass}`}>
              С которыми сталкиваются студенты и преподаватели
              каждый день
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problems.map((problem, index) => (
              <Tooltip
                key={index}
                content={problem.tooltip}
                theme={theme}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + index * 0.15,
                  }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className={`relative overflow-hidden backdrop-blur-xl rounded-[32px] p-6 ${cardClass} transition-all duration-500 cursor-pointer border border-transparent hover:border-indigo-400/50 shadow-lg hover:shadow-2xl`}
                >
                  <div className="relative z-10">
                    <motion.div
                      className={`w-16 h-16 rounded-[20px] bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <problem.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    <h3 className={`text-xl mb-3 ${textClass}`}>
                      {problem.title}
                    </h3>

                    <p
                      className={`${subTextClass} text-sm leading-relaxed`}
                    >
                      {problem.description}
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