import { motion } from 'motion/react';
import { CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useState } from 'react';
import type { User } from '../App';

interface GradingPageProps {
  theme: 'day' | 'night';
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

const submissions = [
  { 
    id: 1, 
    student: 'Иванова Анна Николаевна',
    group: 'Участник Тестирования',
    task: 'Задание',
    date: '21.05.2019 14:45',
    answer: 'Это процесс создания полезных, простых и приятных в использовании продуктов',
    status: 'pending'
  },
  {
    id: 2,
    student: 'Петров Иван',
    group: 'Студент-эксперт',
    task: 'Экзамен',
    date: '21.05.2019 14:55',
    answer: 'Таможку дизайнер ставит задачи по брендингу, рисованию логотипов и создание приятных',
    status: 'pending'
  },
];

export function GradingPage({ theme, user, onNavigate, onLogout, onToggleTheme }: GradingPageProps) {
  const [selectedSubmission, setSelectedSubmission] = useState(submissions[0]);
  const [comment, setComment] = useState('');
  
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' ? 'bg-white/95' : 'bg-indigo-900/95';

  return (
    <DashboardLayout
      theme={theme}
      user={user}
      onNavigate={onNavigate}
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      activePage="teacher-dashboard"
    >
      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-150px)]">
        {/* Submissions List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${cardBg} rounded-[32px] p-6 shadow-xl overflow-y-auto`}
        >
          <h2 className={`text-2xl mb-6 ${textClass}`}>Проверка заданий</h2>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <motion.div
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-[24px] cursor-pointer transition-all ${
                  selectedSubmission.id === submission.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : theme === 'day'
                    ? 'bg-indigo-50 hover:bg-indigo-100'
                    : 'bg-indigo-800/50 hover:bg-indigo-700/50'
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full ${
                    selectedSubmission.id === submission.id
                      ? 'bg-white/20'
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600'
                  } flex items-center justify-center text-white text-sm`}>
                    {submission.student.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm ${
                      selectedSubmission.id === submission.id ? 'text-white' : textClass
                    }`}>
                      {submission.student}
                    </div>
                    <div className={`text-xs ${
                      selectedSubmission.id === submission.id 
                        ? 'text-white/70' 
                        : theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'
                    }`}>
                      {submission.group}
                    </div>
                  </div>
                </div>
                <div className={`text-xs ${
                  selectedSubmission.id === submission.id 
                    ? 'text-white/70' 
                    : theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'
                }`}>
                  {submission.task} • {submission.date}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Grading Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 space-y-6 overflow-y-auto"
        >
          {/* Question */}
          <div className={`${cardBg} rounded-[32px] p-8 shadow-xl`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white text-2xl">
                ?
              </div>
              <h2 className={`text-2xl ${textClass}`}>ВОПРОС № 1</h2>
            </div>
            
            <h3 className={`text-xl mb-4 ${textClass}`}>Что такое UX-дизайн?</h3>
            <div className="text-sm text-gray-500 mb-2">? Подсказка</div>
          </div>

          {/* Answer */}
          <div className={`${cardBg} rounded-[32px] p-8 shadow-xl`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                {selectedSubmission.student.charAt(0)}
              </div>
              <div>
                <div className={textClass}>{selectedSubmission.student}</div>
                <div className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  Ответ студента • {selectedSubmission.date}
                </div>
              </div>
            </div>
            
            <p className={`text-lg leading-relaxed ${theme === 'day' ? 'text-indigo-700' : 'text-indigo-300'}`}>
              {selectedSubmission.answer}
            </p>
          </div>

          {/* Grading Actions */}
          <div className={`${cardBg} rounded-[32px] p-8 shadow-xl`}>
            <h3 className={`text-xl mb-6 ${textClass}`}>Оценка и комментарий</h3>
            
            <div className="flex gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white rounded-[24px] flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <CheckCircle className="w-6 h-6" />
                Принять
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-[24px] flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <MessageCircle className="w-6 h-6" />
                Уточнить
              </motion.button>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Финальный комментарий"
              className={`w-full h-32 p-4 rounded-[24px] mb-4 ${
                theme === 'day'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  : 'bg-indigo-800/50 border-indigo-700 text-white'
              } border-2 focus:outline-none focus:border-indigo-500 transition-all resize-none`}
            />

            <div className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}`}>
              Превосходящий ответ 👍
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
