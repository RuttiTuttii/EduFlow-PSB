import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { User, GraduationCap, ArrowRight } from 'lucide-react';
import { GridPattern } from './GridPattern';

interface CTAProps {
  theme: 'day' | 'night';
  onNavigate: (page: string) => void;
}

export function CTA({ theme, onNavigate }: CTAProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const containerClass = theme === 'day'
    ? 'bg-gradient-to-br from-indigo-50/90 to-purple-50/90 border-indigo-200/80'
    : 'bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border-indigo-700/60';

  const textClass = theme === 'day'
    ? 'text-indigo-900'
    : 'text-white';

  const subTextClass = theme === 'day'
    ? 'text-indigo-700'
    : 'text-indigo-200';

  return (
    <section id="cta" ref={ref} className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8 }}
        className={`relative overflow-hidden backdrop-blur-2xl border rounded-[48px] p-12 md:p-16 shadow-2xl ${containerClass}`}
      >
        <GridPattern theme={theme} />
        
        <div className="relative z-10 text-center">
          <motion.h2
            className={`text-4xl md:text-5xl mb-6 ${textClass}`}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Начать использовать
          </motion.h2>
          
          <motion.p
            className={`text-xl mb-12 ${subTextClass}`}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Присоединяйтесь к образовательной платформе нового поколения
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(99, 102, 241, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[28px] flex items-center justify-center gap-3 transition-all duration-300 shadow-xl"
            >
              <User className="w-6 h-6" />
              <span className="text-lg">Я студент</span>
              <motion.div
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
              
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(236, 72, 153, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden px-8 py-5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-[28px] flex items-center justify-center gap-3 transition-all duration-300 shadow-xl"
            >
              <GraduationCap className="w-6 h-6" />
              <span className="text-lg">Я преподаватель</span>
              <motion.div
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
              
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
