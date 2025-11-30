import { motion, AnimatePresence } from 'motion/react';
import { Search, Send, Trash2, UserPlus, X, Loader2, MessageSquare, Users } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import type { User } from '../App';

interface Conversation {
  conversation_id: number;
  user_id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  last_message: string | null;
  last_message_time: string | null;
  last_message_sender_id: number | null;
  unread_count: number;
}

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

interface AvailableUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}

interface MessengerPageProps {
  theme: 'day' | 'night';
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

export function MessengerPage({ theme, user, onLogout, onToggleTheme }: MessengerPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const cardBg = theme === 'day' 
    ? 'bg-white/80 border-indigo-200/60' 
    : 'bg-indigo-900/80 border-indigo-600/50';

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Refresh messages periodically
  useEffect(() => {
    if (!selectedConversation) return;
    const interval = setInterval(() => {
      loadMessages(selectedConversation.user_id);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await api.messages.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (userId: number) => {
    try {
      const data = await api.messages.getMessages(userId);
      setMessages(data);
      // Update unread count in conversations
      setConversations(prev => prev.map(c => 
        c.user_id === userId ? { ...c, unread_count: 0 } : c
      ));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.user_id);
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedConversation || isSending) return;
    
    setIsSending(true);
    const content = message;
    setMessage('');
    
    try {
      const newMessage = await api.messages.send(selectedConversation.user_id, content);
      setMessages(prev => [...prev, newMessage]);
      
      // Update conversation in list
      setConversations(prev => prev.map(c => 
        c.user_id === selectedConversation.user_id 
          ? { ...c, last_message: content, last_message_time: new Date().toISOString() }
          : c
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessage(content); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      await api.messages.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const openNewChatModal = async () => {
    setShowNewChatModal(true);
    setLoadingUsers(true);
    try {
      const users = await api.messages.getAvailableUsers();
      // Filter out users we already have conversations with
      const existingUserIds = new Set(conversations.map(c => c.user_id));
      setAvailableUsers(users.filter((u: AvailableUser) => !existingUserIds.has(u.id)));
    } catch (error) {
      console.error('Failed to load available users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const startNewConversation = async (targetUser: AvailableUser) => {
    try {
      await api.messages.createConversation(targetUser.id);
      const newConv: Conversation = {
        conversation_id: Date.now(),
        user_id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        avatar: targetUser.avatar,
        role: targetUser.role,
        last_message: null,
        last_message_time: null,
        last_message_sender_id: null,
        unread_count: 0,
      };
      setConversations(prev => [newConv, ...prev]);
      setSelectedConversation(newConv);
      setMessages([]);
      setShowNewChatModal(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Вчера';
    if (days < 7) return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <DashboardLayout
      theme={theme}
      user={user}
      onLogout={onLogout}
      onToggleTheme={onToggleTheme}
      activePage="messenger"
    >
      <div className="flex gap-6 h-[calc(100vh-220px)]">
        {/* Conversations List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`w-96 ${cardBg} backdrop-blur-xl border rounded-[32px] flex flex-col`}
          style={{ boxShadow: '0 8px 32px rgba(99, 102, 241, 0.12)' }}
        >
          {/* Header */}
          <div className="p-6 border-b border-inherit">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${textClass}`}>Сообщения</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={openNewChatModal}
                className="p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
              </motion.button>
            </div>
            
            <div className="relative">
              <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                theme === 'day' ? 'text-indigo-400' : 'text-indigo-400'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className={`w-full pl-5 pr-12 py-3 rounded-[20px] text-sm ${
                  theme === 'day'
                    ? 'bg-white/90 border-indigo-300 text-indigo-900'
                    : 'bg-indigo-800/70 border-indigo-600 text-white'
                } border-2 focus:outline-none focus:border-indigo-500 transition-all`}
                style={{ boxShadow: '0 2px 8px rgba(99, 102, 241, 0.08)' }}
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'}`}>
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Нет диалогов</p>
                <p className="text-sm mt-2">Начните новую переписку</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <motion.div
                  key={conv.user_id}
                  onClick={() => selectConversation(conv)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={`p-4 rounded-[24px] cursor-pointer transition-all ${
                    selectedConversation?.user_id === conv.user_id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : theme === 'day'
                      ? 'hover:bg-indigo-50'
                      : 'hover:bg-indigo-800/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full ${
                      selectedConversation?.user_id === conv.user_id
                        ? 'bg-white/20'
                        : 'bg-gradient-to-br from-indigo-600 to-purple-600'
                    } flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                      {conv.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold truncate ${
                          selectedConversation?.user_id === conv.user_id ? 'text-white' : textClass
                        }`}>
                          {conv.name}
                        </span>
                        <span className={`text-xs ${
                          selectedConversation?.user_id === conv.user_id 
                            ? 'text-white/80' 
                            : theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'
                        }`}>
                          {formatTime(conv.last_message_time)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm truncate ${
                          selectedConversation?.user_id === conv.user_id 
                            ? 'text-white/80' 
                            : theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'
                        }`}>
                          {conv.last_message || 'Нет сообщений'}
                        </span>
                        {conv.unread_count > 0 && (
                          <span className="ml-2 px-2.5 py-1 bg-pink-500 text-white text-xs font-bold rounded-full shadow-sm">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex-1 ${cardBg} backdrop-blur-xl border rounded-[32px] flex flex-col shadow-xl`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-inherit flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {selectedConversation.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={`font-bold text-lg ${textClass}`}>{selectedConversation.name}</div>
                    <div className={`text-sm ${theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'}`}>
                      {selectedConversation.role === 'teacher' ? 'Преподаватель' : 'Студент'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => {
                  const isOwnMessage = msg.sender_id === Number(user?.id);
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div className={`relative max-w-[70%] ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                          : theme === 'day'
                          ? 'bg-white/80 text-indigo-900 border border-indigo-200 shadow-sm'
                          : 'bg-indigo-800/50 text-white border border-indigo-700 shadow-sm'
                      } rounded-[24px] px-6 py-4`}>
                        <p className="break-words text-base leading-relaxed">{msg.content}</p>
                        <div className={`text-xs mt-2 ${
                          isOwnMessage ? 'text-white/70' : theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'
                        }`}>
                          {formatTime(msg.created_at)}
                        </div>
                        
                        {/* Delete button */}
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className={`absolute -top-2 ${isOwnMessage ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 p-2 rounded-full ${
                            theme === 'day' ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-400'
                          } transition-all hover:scale-110`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-6 border-t border-inherit">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Напишите сообщение..."
                    disabled={isSending}
                    className={`flex-1 px-6 py-4 rounded-[24px] ${
                      theme === 'day'
                        ? 'bg-white/90 border-indigo-300 text-indigo-900'
                        : 'bg-indigo-800/70 border-indigo-600 text-white'
                    } border-2 focus:outline-none focus:border-indigo-500 transition-all text-base`}
                    style={{ boxShadow: '0 2px 8px rgba(99, 102, 241, 0.08)' }}
                  />
                  <motion.button
                    onClick={sendMessage}
                    disabled={isSending || !message.trim()}
                    whileHover={{ scale: isSending ? 1 : 1.05 }}
                    whileTap={{ scale: isSending ? 1 : 0.95 }}
                    className={`px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] shadow-lg ${
                      isSending || !message.trim() ? 'opacity-50' : ''
                    }`}
                  >
                    {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <MessageSquare className={`w-20 h-20 mb-6 ${theme === 'day' ? 'text-indigo-300' : 'text-indigo-600'}`} />
              <h3 className={`text-2xl font-bold mb-3 ${textClass}`}>Выберите диалог</h3>
              <p className={`text-lg ${theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'}`}>
                Или начните новую переписку
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowNewChatModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${cardBg} backdrop-blur-xl border rounded-[24px] p-6 w-full max-w-md max-h-[80vh] flex flex-col`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${textClass}`}>Новый чат</h3>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  className={`p-2 rounded-full ${theme === 'day' ? 'hover:bg-indigo-100' : 'hover:bg-indigo-800'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className={`mb-4 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-400'}`}>
                {user?.role === 'teacher' 
                  ? 'Выберите студента для начала диалога'
                  : 'Выберите преподавателя для начала диалога'}
              </p>

              <div className="flex-1 overflow-y-auto space-y-2">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  </div>
                ) : availableUsers.length === 0 ? (
                  <div className={`text-center py-8 ${theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'}`}>
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Нет доступных пользователей</p>
                    <p className="text-sm">
                      {user?.role === 'teacher' 
                        ? 'На ваших курсах нет студентов'
                        : 'Вы не записаны на курсы'}
                    </p>
                  </div>
                ) : (
                  availableUsers.map((u) => (
                    <motion.button
                      key={u.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startNewConversation(u)}
                      className={`w-full p-3 rounded-[16px] flex items-center gap-3 text-left ${
                        theme === 'day' ? 'hover:bg-indigo-50' : 'hover:bg-indigo-800/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${textClass}`}>{u.name}</div>
                        <div className={`text-sm ${theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'}`}>
                          {u.role === 'teacher' ? 'Преподаватель' : 'Студент'}
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
