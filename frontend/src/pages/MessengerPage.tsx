import { motion } from 'motion/react';
import { Search, Send, Paperclip, Smile } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useState } from 'react';
import type { User } from '../App';

interface MessengerPageProps {
  theme: 'day' | 'night';
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

const chats = [
  { id: 1, name: 'Анна Иванова', lastMessage: 'Спасибо за помощь!', time: '14:30', unread: 2, avatar: 'А' },
  { id: 2, name: 'Группа "Маркетинг 101"', lastMessage: 'Завтра экзамен', time: '13:15', unread: 5, avatar: 'Г' },
  { id: 3, name: 'Петр Сидоров', lastMessage: 'Когда будут результаты?', time: 'Вчера', unread: 0, avatar: 'П' },
];

const messages = [
  { id: 1, sender: 'other', text: 'Здравствуйте! Не могу понять задание номер 3', time: '14:25', avatar: 'А' },
  { id: 2, sender: 'me', text: 'Привет! Что именно вызывает затруднения?', time: '14:27' },
  { id: 3, sender: 'other', text: 'Как правильно анализировать целевую аудиторию?', time: '14:28', avatar: 'А' },
  { id: 4, sender: 'me', text: 'Начните с демографических характеристик...', time: '14:29' },
];

export function MessengerPage({ theme, user, onNavigate, onLogout, onToggleTheme }: MessengerPageProps) {
  const [selectedChat, setSelectedChat] = useState(chats[0]);
  const [message, setMessage] = useState('');
  
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' ? 'bg-white/95' : 'bg-indigo-900/95';

  return (
    <DashboardLayout
      theme={theme}
      user={user}
      onNavigate={onNavigate}
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      activePage="messenger"
    >
      <div className="grid grid-cols-4 gap-6 h-[calc(100vh-150px)]">
        {/* Chats List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${cardBg} rounded-[32px] p-6 shadow-xl flex flex-col`}
        >
          <h2 className={`text-2xl mb-4 ${textClass}`}>Сообщения</h2>
          
          <div className="relative mb-4">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
              theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'
            }`} />
            <input
              type="text"
              placeholder="Поиск..."
              className={`w-full pl-12 pr-4 py-3 rounded-[20px] ${
                theme === 'day'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  : 'bg-indigo-800/50 border-indigo-700 text-white'
              } border-2 focus:outline-none focus:border-indigo-500 transition-all`}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                whileHover={{ scale: 1.02, x: 5 }}
                className={`p-4 rounded-[24px] cursor-pointer transition-all ${
                  selectedChat.id === chat.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : theme === 'day'
                    ? 'hover:bg-indigo-50'
                    : 'hover:bg-indigo-800/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-full ${
                    selectedChat.id === chat.id
                      ? 'bg-white/20'
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600'
                  } flex items-center justify-center text-white`}>
                    {chat.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`truncate ${
                      selectedChat.id === chat.id ? 'text-white' : textClass
                    }`}>
                      {chat.name}
                    </div>
                    <div className={`text-sm truncate ${
                      selectedChat.id === chat.id 
                        ? 'text-white/70' 
                        : theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'
                    }`}>
                      {chat.lastMessage}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${
                    selectedChat.id === chat.id 
                      ? 'text-white/70' 
                      : theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'
                  }`}>
                    {chat.time}
                  </span>
                  {chat.unread > 0 && (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                      {chat.unread}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`col-span-3 ${cardBg} rounded-[32px] shadow-xl flex flex-col`}
        >
          {/* Chat Header */}
          <div className="p-6 border-b border-indigo-700/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl">
                {selectedChat.avatar}
              </div>
              <div>
                <div className={`text-xl ${textClass}`}>{selectedChat.name}</div>
                <div className={`text-sm ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                  В сети
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} gap-3`}
              >
                {msg.sender === 'other' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                    {msg.avatar}
                  </div>
                )}
                <div className={`max-w-[70%] ${
                  msg.sender === 'me'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : theme === 'day'
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'bg-indigo-800/50 text-white'
                } rounded-[24px] px-6 py-3`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  <div className={`text-xs mt-2 ${
                    msg.sender === 'me' ? 'text-white/70' : theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'
                  }`}>
                    {msg.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-indigo-700/30">
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-3 rounded-[16px] ${
                  theme === 'day' ? 'hover:bg-indigo-100' : 'hover:bg-indigo-800'
                } transition-colors`}
              >
                <Paperclip className="w-6 h-6" />
              </motion.button>
              
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Введите сообщение..."
                className={`flex-1 px-6 py-3 rounded-[24px] ${
                  theme === 'day'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                    : 'bg-indigo-800/50 border-indigo-700 text-white'
                } border-2 focus:outline-none focus:border-indigo-500 transition-all`}
              />
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-3 rounded-[16px] ${
                  theme === 'day' ? 'hover:bg-indigo-100' : 'hover:bg-indigo-800'
                } transition-colors`}
              >
                <Smile className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(99, 102, 241, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] flex items-center gap-2 shadow-lg"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
