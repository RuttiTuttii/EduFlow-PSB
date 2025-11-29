import { motion } from 'motion/react';
import { Bot, Send, Sparkles, Lightbulb, BookOpen, MessageCircle } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useState } from 'react';
import type { User } from '../App';

interface AIAssistantPageProps {
  theme: 'day' | 'night';
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

const suggestions = [
  { icon: Lightbulb, text: 'Объясни концепцию маркетинга простыми словами', color: 'from-yellow-500 to-orange-500' },
  { icon: BookOpen, text: 'Помоги с домашним заданием', color: 'from-blue-500 to-cyan-500' },
  { icon: MessageCircle, text: 'Как подготовиться к экзамену?', color: 'from-purple-500 to-pink-500' },
];

const messages = [
  { 
    id: 1, 
    sender: 'ai', 
    text: 'Здравствуйте! Я ваш AI-помощник в обучении. Чем могу помочь сегодня? 🤖', 
    time: '14:30' 
  },
  { 
    id: 2, 
    sender: 'user', 
    text: 'Расскажи про основные принципы UX-дизайна', 
    time: '14:31' 
  },
  { 
    id: 3, 
    sender: 'ai', 
    text: 'Конечно! Основные принципы UX-дизайна включают:\n\n1. **Понятность** - интерфейс должен быть интуитивно понятным\n2. **Эффективность** - пользователь должен быстро достигать целей\n3. **Привлекательность** - визуально приятный дизайн\n4. **Доступность** - удобство для всех категорий пользователей\n\nХотите узнать больше о каком-то конкретном принципе?', 
    time: '14:32' 
  },
];

export function AIAssistantPage({ theme, user, onNavigate, onLogout, onToggleTheme }: AIAssistantPageProps) {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState(messages);
  
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' ? 'bg-white/95' : 'bg-indigo-900/95';

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: chatMessages.length + 1,
      sender: 'user' as const,
      text: message,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: chatMessages.length + 2,
        sender: 'ai' as const,
        text: 'Отличный вопрос! Дайте мне минуту, чтобы подготовить подробный ответ...',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <DashboardLayout
      theme={theme}
      user={user}
      onNavigate={onNavigate}
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      activePage="ai-assistant"
    >
      <div className="max-w-5xl mx-auto h-[calc(100vh-150px)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardBg} rounded-[32px] p-6 shadow-xl mb-6`}
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg"
            >
              <Bot className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className={`text-3xl ${textClass}`}>AI Помощник</h1>
              <p className={`${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                Ваш персональный ассистент в обучении
              </p>
            </div>
          </div>
        </motion.div>

        {/* Suggestions (shown when no messages) */}
        {chatMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <h2 className={`text-xl mb-4 ${textClass}`}>Попробуйте спросить:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onClick={() => setMessage(suggestion.text)}
                  className={`${cardBg} rounded-[24px] p-6 shadow-lg text-left group`}
                >
                  <div className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${suggestion.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <suggestion.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className={textClass}>{suggestion.text}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex-1 ${cardBg} rounded-[32px] p-6 shadow-xl mb-6 overflow-y-auto`}
        >
          <div className="space-y-6">
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} gap-4`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[75%] ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : theme === 'day'
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-900 border-2 border-indigo-200'
                    : 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50 text-white border-2 border-indigo-700'
                } rounded-[24px] px-6 py-4 shadow-lg`}>
                  {msg.sender === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className={`w-4 h-4 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}`} />
                      <span className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}`}>
                        AI Assistant
                      </span>
                    </div>
                  )}
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                  <div className={`text-xs mt-2 ${
                    msg.sender === 'user' 
                      ? 'text-white/70' 
                      : theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'
                  }`}>
                    {msg.time}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardBg} rounded-[32px] p-6 shadow-xl`}
        >
          <div className="flex gap-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Задайте вопрос AI помощнику..."
              className={`flex-1 px-6 py-4 rounded-[24px] ${
                theme === 'day'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  : 'bg-indigo-800/50 border-indigo-700 text-white'
              } border-2 focus:outline-none focus:border-indigo-500 transition-all text-lg`}
            />
            
            <motion.button
              onClick={handleSend}
              whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(99, 102, 241, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-[24px] flex items-center gap-3 shadow-xl"
            >
              <Send className="w-6 h-6" />
              <span className="text-lg">Отправить</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
