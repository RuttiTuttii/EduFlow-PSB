import { motion } from 'motion/react';
import { Upload, Paperclip, Send } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useState } from 'react';
import type { User } from '../App';

interface AssignmentPageProps {
  theme: 'day' | 'night';
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

export function AssignmentPage({ theme, user, onNavigate, onLogout, onToggleTheme }: AssignmentPageProps) {
  const [answer, setAnswer] = useState('');
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' ? 'bg-white/95' : 'bg-indigo-900/95';

  return (
    <DashboardLayout
      theme={theme}
      user={user}
      onNavigate={onNavigate}
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      activePage="course"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Assignment Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardBg} rounded-[48px] p-8 shadow-xl`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xl">
              ?
            </div>
            <h1 className={`text-3xl ${textClass}`}>Уточните ответ</h1>
          </div>
          
          <div className={`text-xl mb-6 ${textClass}`}>Задание</div>
          <p className={`text-lg leading-relaxed ${theme === 'day' ? 'text-indigo-700' : 'text-indigo-300'}`}>
            Ваш конкурент за месяц запустил три вирусных ролика. Какую задачу он себе поставил? Чего он добивается?
          </p>
        </motion.div>

        {/* Previous Answers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className={`text-2xl ${textClass}`}>Предыдущие ответы</h2>
          
          <div className={`${cardBg} rounded-[32px] p-6 shadow-lg`}>
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className={`${textClass} mb-1`}>Ваш ответ • 28.06.2019 19:33</div>
                <p className={theme === 'day' ? 'text-indigo-700' : 'text-indigo-300'}>
                  Противодействует конкурентам - хочет заразить вирусами чьи-то компьютеры
                </p>
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-[32px] p-6 shadow-lg border-2 ${
            theme === 'day' ? 'border-orange-400' : 'border-orange-600'
          }`}>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-600 to-rose-600 flex items-center justify-center text-white">
                М
              </div>
              <div className="flex-1">
                <div className={`${textClass} mb-1`}>Комментарий тренера • 28.06.2019 19:56</div>
                <p className={theme === 'day' ? 'text-indigo-700' : 'text-indigo-300'}>
                  Возможно это было его вторичной целью, но исходя несколько другая. Скорректируйте ваш ответ
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Answer Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${cardBg} rounded-[48px] p-8 shadow-xl`}
        >
          <h2 className={`text-2xl mb-6 ${textClass}`}>Ваш новый ответ</h2>
          
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Работает над имиджем. Хочет получить прирост подписчиков"
            className={`w-full h-40 p-4 rounded-[24px] ${
              theme === 'day'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                : 'bg-indigo-800/50 border-indigo-700 text-white'
            } border-2 focus:outline-none focus:border-indigo-500 transition-all resize-none`}
          />

          <div className="text-sm text-gray-500 mt-2 mb-6">
            Нажмите, чтобы выбрать файлы для прикрепления к этот блоке
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-[24px] ${
                theme === 'day'
                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  : 'bg-indigo-800 text-indigo-200 hover:bg-indigo-700'
              } flex items-center gap-2 transition-colors`}
            >
              <Paperclip className="w-5 h-5" />
              Прикрепить файл
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(99, 102, 241, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] flex items-center gap-2 shadow-xl"
            >
              <Send className="w-5 h-5" />
              Отправить
            </motion.button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
