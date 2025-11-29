import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { Play, Upload, Award } from "lucide-react";
import { GridPattern } from "./GridPattern";
import { Tooltip } from "./Tooltip";

interface ForStudentsProps {
  theme: "day" | "night";
}

const features = [
  {
    icon: Play,
    title: "Изучение материалов",
    description:
      "Просматривайте видео, читайте статьи и проходите интерактивные курсы в удобном формате.",
    tooltip: "> смотри и учись! всё в удобном формате 🎬",
  },
  {
    icon: Upload,
    title: "Загрузка заданий",
    description:
      "Отправляйте выполненные работы с автоматическим сохранением версий и историей изменений.",
    tooltip: "> загружай легко! всё сохраним автоматически 📤",
  },
  {
    icon: Award,
    title: "Получение оценок",
    description:
      "Моментально получайте результаты с подробными комментариями от преподавателей.",
    tooltip:
      "> получай оценки мгновенно! с подробными советами 🏆",
  },
];

export function ForStudents({ theme }: ForStudentsProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerClass =
    theme === "day"
      ? "bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border-blue-200/80"
      : "bg-gradient-to-br from-indigo-950/50 to-blue-950/50 border-indigo-700/60";

  const textClass =
    theme === "day" ? "text-indigo-900" : "text-white";

  const subTextClass =
    theme === "day" ? "text-indigo-700" : "text-indigo-200";

  const cardClass =
    theme === "day"
      ? "bg-white/70 hover:bg-white/90"
      : "bg-indigo-800/40 hover:bg-indigo-800/60";

  return (
    <section
      id="students"
      ref={ref}
      className="max-w-6xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8 }}
        className={`relative overflow-hidden backdrop-blur-2xl border rounded-[48px] p-12 shadow-2xl ${containerClass}`}
      >
        <GridPattern theme={theme} />

        <div className="relative z-10">
          <motion.h2
            className={`text-4xl md:text-5xl mb-8 ${textClass}`}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Для студентов
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Tooltip
                key={index}
                content={feature.tooltip}
                theme={theme}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + index * 0.1,
                  }}
                  whileHover={{ y: -10, scale: 1.03 }}
                  className={`p-6 rounded-[28px] ${cardClass} backdrop-blur-xl transition-all duration-500 cursor-pointer border border-transparent hover:border-blue-400/50 shadow-lg hover:shadow-2xl`}
                >
                  <motion.div
                    className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-4 shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>

                  <h3 className={`text-xl mb-3 ${textClass}`}>
                    {feature.title}
                  </h3>

                  <p
                    className={`${subTextClass} text-sm leading-relaxed`}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              </Tooltip>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}