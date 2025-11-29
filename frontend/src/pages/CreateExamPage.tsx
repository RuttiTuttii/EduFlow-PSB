import { motion } from 'motion/react';
import { Save, Plus, X, Clock, CheckCircle, Circle } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { GridPattern } from '../components/GridPattern';
import { useState } from 'react';
import type { User } from '../App';

interface CreateExamPageProps {
  theme: 'day' | 'night';
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

interface Question {
  id: number;
  question: string;
  type: 'single' | 'multiple' | 'text';
  options: string[];
  correctAnswers: number[];
  points: number;
}

export function CreateExamPage({ theme, user, onNavigate, onLogout, onToggleTheme }: CreateExamPageProps) {
  const [examName, setExamName] = useState('');
  const [timeLimit, setTimeLimit] = useState('60');
  const [passingScore, setPassingScore] = useState('70');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' ? 'bg-white/60 border-white/80' : 'bg-indigo-900/40 border-indigo-800/40';
  const inputBg = theme === 'day' ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-800/50 border-indigo-700';

  const addQuestion = (type: 'single' | 'multiple' | 'text') => {
    const newQuestion: Question = {
      id: questions.length + 1,
      question: '',
      type,
      options: type === 'text' ? [] : ['Вариант 1', 'Вариант 2'],
      correctAnswers: [],
      points: 10,
    };
    setQuestions([...questions, newQuestion]);
    setShowAddQuestion(false);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: number) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? { ...q, options: [...q.options, `Вариант ${q.options.length + 1}`] }
        : q
    ));
  };

  const toggleCorrectAnswer = (questionId: number, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      
      if (q.type === 'single') {
        return { ...q, correctAnswers: [optionIndex] };
      } else {
        const isSelected = q.correctAnswers.includes(optionIndex);
        return {
          ...q,
          correctAnswers: isSelected
            ? q.correctAnswers.filter(i => i !== optionIndex)
            : [...q.correctAnswers, optionIndex]
        };
      }
    }));
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <DashboardLayout
      theme={theme}
      user={user}
      onNavigate={onNavigate}
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      activePage="teacher-dashboard"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className={`${cardBg} backdrop-blur-2xl border rounded-[48px] p-8 shadow-2xl relative overflow-hidden`}>
          <GridPattern theme={theme} />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className={`text-4xl mb-2 ${textClass}`}>Создание экзамена/теста</h1>
              <p className={`text-xl ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                Создайте тест или экзамен для курса
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('teacher-dashboard')}
                className={`px-6 py-3 rounded-[24px] ${
                  theme === 'day' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-800/50 text-indigo-200'
                } shadow-lg`}
              >
                Отмена
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-[24px] shadow-xl"
              >
                <Save className="w-5 h-5" />
                Сохранить тест
              </motion.button>
            </div>
          </div>
        </div>

        {/* Exam Settings */}
        <div className={`${cardBg} backdrop-blur-2xl border rounded-[32px] p-8 shadow-2xl relative overflow-hidden`}>
          <GridPattern theme={theme} />
          <div className="relative z-10 space-y-6">
            <h2 className={`text-2xl mb-6 ${textClass}`}>Настройки теста</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={`block mb-2 ${textClass}`}>Название теста</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="Например: Итоговый экзамен"
                  className={`w-full px-4 py-3 rounded-[20px] ${inputBg} ${textClass} border-2 focus:outline-none focus:border-indigo-500 transition-all`}
                />
              </div>

              <div>
                <label className={`block mb-2 ${textClass}`}>Время на прохождение (мин)</label>
                <div className="relative">
                  <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'
                  }`} />
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-[20px] ${inputBg} ${textClass} border-2 focus:outline-none focus:border-indigo-500 transition-all`}
                  />
                </div>
              </div>

              <div>
                <label className={`block mb-2 ${textClass}`}>Проходной балл (%)</label>
                <input
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className={`w-full px-4 py-3 rounded-[20px] ${inputBg} ${textClass} border-2 focus:outline-none focus:border-indigo-500 transition-all`}
                />
              </div>
            </div>

            <div className={`p-6 rounded-[24px] bg-gradient-to-r ${
              theme === 'day' ? 'from-indigo-100 to-purple-100' : 'from-indigo-800/50 to-purple-800/50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                    Всего вопросов
                  </p>
                  <p className={`text-3xl ${textClass}`}>{questions.length}</p>
                </div>
                <div>
                  <p className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                    Общий балл
                  </p>
                  <p className={`text-3xl ${textClass}`}>{totalPoints}</p>
                </div>
                <div>
                  <p className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                    Время
                  </p>
                  <p className={`text-3xl ${textClass}`}>{timeLimit} мин</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className={`${cardBg} backdrop-blur-2xl border rounded-[32px] p-8 shadow-2xl relative overflow-hidden`}>
          <GridPattern theme={theme} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl ${textClass}`}>Вопросы</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddQuestion(!showAddQuestion)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Добавить вопрос
              </motion.button>
            </div>

            {/* Add Question Options */}
            {showAddQuestion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-3 gap-4 mb-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addQuestion('single')}
                  className={`p-6 rounded-[24px] ${
                    theme === 'day' ? 'bg-white/80' : 'bg-indigo-800/50'
                  } border-2 border-transparent hover:border-indigo-500 transition-all`}
                >
                  <Circle className={`w-12 h-12 mx-auto mb-3 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}`} />
                  <p className={textClass}>Один вариант</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addQuestion('multiple')}
                  className={`p-6 rounded-[24px] ${
                    theme === 'day' ? 'bg-white/80' : 'bg-indigo-800/50'
                  } border-2 border-transparent hover:border-indigo-500 transition-all`}
                >
                  <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}`} />
                  <p className={textClass}>Несколько вариантов</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addQuestion('text')}
                  className={`p-6 rounded-[24px] ${
                    theme === 'day' ? 'bg-white/80' : 'bg-indigo-800/50'
                  } border-2 border-transparent hover:border-indigo-500 transition-all`}
                >
                  <svg className={`w-12 h-12 mx-auto mb-3 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p className={textClass}>Текстовый ответ</p>
                </motion.button>
              </motion.div>
            )}

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}`}>
                <p className="text-lg">Вопросы ещё не добавлены</p>
                <p className="text-sm mt-2">Нажмите "Добавить вопрос" для начала</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, qIndex) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: qIndex * 0.1 }}
                    className={`p-6 rounded-[24px] ${
                      theme === 'day' ? 'bg-white/80' : 'bg-indigo-800/50'
                    } space-y-4`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-4 py-1 rounded-[12px] text-sm ${
                            theme === 'day' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-700 text-indigo-200'
                          }`}>
                            Вопрос {qIndex + 1}
                          </span>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => {
                              const updated = questions.map(q =>
                                q.id === question.id ? { ...q, points: parseInt(e.target.value) || 0 } : q
                              );
                              setQuestions(updated);
                            }}
                            className={`w-20 px-3 py-1 rounded-[12px] ${inputBg} ${textClass} text-sm border-2 focus:outline-none focus:border-indigo-500`}
                            placeholder="Баллы"
                          />
                        </div>
                        <textarea
                          value={question.question}
                          onChange={(e) => {
                            const updated = questions.map(q =>
                              q.id === question.id ? { ...q, question: e.target.value } : q
                            );
                            setQuestions(updated);
                          }}
                          placeholder="Введите текст вопроса..."
                          rows={2}
                          className={`w-full px-4 py-3 rounded-[16px] ${inputBg} ${textClass} border-2 focus:outline-none focus:border-indigo-500 resize-none`}
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeQuestion(question.id)}
                        className={`p-2 rounded-[12px] ${
                          theme === 'day' ? 'hover:bg-red-100 text-red-600' : 'hover:bg-red-900/50 text-red-400'
                        } transition-colors`}
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {question.type !== 'text' && (
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleCorrectAnswer(question.id, oIndex)}
                              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                question.correctAnswers.includes(oIndex)
                                  ? 'bg-green-500 border-green-500'
                                  : theme === 'day'
                                  ? 'border-indigo-300'
                                  : 'border-indigo-600'
                              }`}
                            >
                              {question.correctAnswers.includes(oIndex) && (
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </motion.button>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const updated = questions.map(q =>
                                  q.id === question.id
                                    ? { ...q, options: q.options.map((opt, i) => i === oIndex ? e.target.value : opt) }
                                    : q
                                );
                                setQuestions(updated);
                              }}
                              className={`flex-1 px-4 py-2 rounded-[12px] ${inputBg} ${textClass} border-2 focus:outline-none focus:border-indigo-500`}
                            />
                          </div>
                        ))}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => addOption(question.id)}
                          className={`w-full py-2 rounded-[12px] border-2 border-dashed ${
                            theme === 'day' ? 'border-indigo-300 hover:border-indigo-500' : 'border-indigo-700 hover:border-indigo-500'
                          } ${textClass} transition-all text-sm`}
                        >
                          + Добавить вариант
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
