import { motion } from 'motion/react';
import { Bot, Send, Sparkles, Lightbulb, BookOpen, MessageCircle, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';
import type { User } from '../App';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

interface AIAssistantPageProps {
  theme: 'day' | 'night';
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

const suggestions = [
  { icon: Lightbulb, text: 'Помоги разобраться с концепцией ООП', color: 'from-yellow-500 to-orange-500' },
  { icon: BookOpen, text: 'Как лучше подготовиться к экзамену?', color: 'from-blue-500 to-cyan-500' },
  { icon: MessageCircle, text: 'Объясни что такое REST API простыми словами', color: 'from-purple-500 to-pink-500' },
];

export function AIAssistantPage({ theme, user, onNavigate, onLogout, onToggleTheme }: AIAssistantPageProps) {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: 'Привет! 👋 Я AI-помощник EduFlow. Я помогу тебе разобраться в учебном материале, но не буду давать готовых ответов на тесты и экзамены — моя задача научить тебя думать самостоятельно! 🎓\n\nЧем могу помочь?',
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' ? 'bg-white/95' : 'bg-indigo-900/95';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');
    setIsLoading(true);
    
    try {
      // Build context from conversation history
      const conversationContext = chatMessages
        .slice(-6) // Last 6 messages for context
        .map(m => `${m.sender === 'user' ? 'Студент' : 'AI'}: ${m.text}`)
        .join('\n');

      const response = await api.ai.help({
        question: currentMessage,
        topic: 'Общая помощь',
        context: conversationContext,
      });
      
      const aiResponse: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.response || 'Извините, не удалось получить ответ. Попробуйте ещё раз.',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorResponse: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        text: '😔 Упс, что-то пошло не так. Попробуй переформулировать вопрос или повторить позже.',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
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
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className={`max-w-[75%] ${
                  theme === 'day'
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-900 border-2 border-indigo-200'
                    : 'bg-gradient-to-br from-indigo-900/50 to-purple-900/50 text-white border-2 border-indigo-700'
                } rounded-[24px] px-6 py-4 shadow-lg`}>
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    <span className={theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}>
                      Думаю над ответом...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
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
              disabled={isLoading || !message.trim()}
              whileHover={{ scale: isLoading ? 1 : 1.05, boxShadow: '0 20px 60px rgba(99, 102, 241, 0.5)' }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              className={`px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-[24px] flex items-center gap-3 shadow-xl ${isLoading || !message.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
              <span className="text-lg">{isLoading ? 'Отправка...' : 'Отправить'}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
