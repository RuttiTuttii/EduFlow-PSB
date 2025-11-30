import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, MessageSquare, Award, UserPlus, BookOpen, Check, XIcon, Loader2, Bell } from 'lucide-react';
import { GridPattern } from './GridPattern';
import { useState, useEffect } from 'react';
import { api } from '../api/client';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data: string | null;
  created_at: string;
}

interface Invitation {
  id: number;
  type: 'invite' | 'request';
  status: 'pending' | 'accepted' | 'declined';
  course_id: number;
  course_title: string;
  sender_id: number;
  sender_name: string;
  recipient_id: number;
  recipient_name: string;
  created_at: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'day' | 'night';
}

export function NotificationsModal({ isOpen, onClose, theme }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notifications' | 'invitations'>('notifications');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const cardBg = theme === 'day' ? 'bg-white/95' : 'bg-indigo-900/95';
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const itemBg = theme === 'day' ? 'bg-indigo-50 hover:bg-indigo-100' : 'bg-indigo-800/50 hover:bg-indigo-700/50';

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifs, invites] = await Promise.all([
        api.notifications.getAll(),
        api.invitations.getAll()
      ]);
      setNotifications(notifs);
      setInvitations(invites.filter((i: Invitation) => i.status === 'pending'));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleAcceptInvitation = async (id: number) => {
    setActionLoading(id);
    try {
      await api.invitations.accept(id);
      setInvitations(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineInvitation = async (id: number) => {
    setActionLoading(id);
    try {
      await api.invitations.decline(id);
      setInvitations(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Failed to decline invitation:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return { icon: CheckCircle, color: 'from-green-500 to-emerald-500' };
      case 'message':
        return { icon: MessageSquare, color: 'from-blue-500 to-cyan-500' };
      case 'achievement':
        return { icon: Award, color: 'from-purple-500 to-pink-500' };
      case 'invitation':
        return { icon: UserPlus, color: 'from-orange-500 to-amber-500' };
      case 'course':
        return { icon: BookOpen, color: 'from-indigo-500 to-violet-500' };
      default:
        return { icon: Bell, color: 'from-gray-500 to-slate-500' };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days === 1) return 'Вчера';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingInvitations = invitations.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -50 }}
            className={`fixed top-24 right-8 w-[420px] ${cardBg} backdrop-blur-2xl rounded-[32px] shadow-2xl z-50 overflow-hidden`}
          >
            <GridPattern theme={theme} />
            
            <div className="relative z-10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl ${textClass}`}>Уведомления</h2>
                <motion.button
                  onClick={onClose}
                  className={`p-2 rounded-[16px] ${
                    theme === 'day' ? 'hover:bg-indigo-100' : 'hover:bg-indigo-800/50'
                  } transition-colors`}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className={`w-5 h-5 ${textClass}`} />
                </motion.button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex-1 py-2 px-4 rounded-[12px] text-sm font-medium transition-all ${
                    activeTab === 'notifications'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : theme === 'day' ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-800/50 text-indigo-300'
                  }`}
                >
                  Уведомления
                  {unreadCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('invitations')}
                  className={`flex-1 py-2 px-4 rounded-[12px] text-sm font-medium transition-all ${
                    activeTab === 'invitations'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : theme === 'day' ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-800/50 text-indigo-300'
                  }`}
                >
                  Приглашения
                  {pendingInvitations > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                      {pendingInvitations}
                    </span>
                  )}
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
              ) : (
                <>
                  {activeTab === 'notifications' && (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className={`text-center py-8 ${theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'}`}>
                          <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Нет уведомлений</p>
                        </div>
                      ) : (
                        notifications.map((notification, index) => {
                          const { icon: Icon, color } = getNotificationIcon(notification.type);
                          return (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => !notification.read && markAsRead(notification.id)}
                              className={`p-4 rounded-[20px] ${itemBg} transition-all duration-300 cursor-pointer ${
                                !notification.read ? 'ring-2 ring-indigo-500/50' : ''
                              }`}
                            >
                              <div className="flex gap-3">
                                <div className={`w-10 h-10 rounded-[14px] bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h3 className={`mb-1 font-medium ${textClass}`}>{notification.title}</h3>
                                  <p className={`text-sm mb-2 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                                    {notification.message}
                                  </p>
                                  <span className={`text-xs ${theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'}`}>
                                    {formatTime(notification.created_at)}
                                  </span>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0 mt-2" />
                                )}
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {activeTab === 'invitations' && (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {invitations.length === 0 ? (
                        <div className={`text-center py-8 ${theme === 'day' ? 'text-indigo-400' : 'text-indigo-500'}`}>
                          <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Нет приглашений</p>
                        </div>
                      ) : (
                        invitations.map((invitation, index) => (
                          <motion.div
                            key={invitation.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-[20px] ${itemBg} transition-all duration-300`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-10 h-10 rounded-[14px] bg-gradient-to-br ${
                                invitation.type === 'invite' 
                                  ? 'from-orange-500 to-amber-500' 
                                  : 'from-blue-500 to-cyan-500'
                              } flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                {invitation.type === 'invite' ? (
                                  <UserPlus className="w-5 h-5 text-white" />
                                ) : (
                                  <BookOpen className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className={`mb-1 font-medium ${textClass}`}>
                                  {invitation.type === 'invite' 
                                    ? 'Приглашение на курс' 
                                    : 'Запрос на вступление'}
                                </h3>
                                <p className={`text-sm mb-2 ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                                  {invitation.type === 'invite' 
                                    ? `${invitation.sender_name} приглашает вас на курс "${invitation.course_title}"`
                                    : `${invitation.sender_name} хочет присоединиться к курсу "${invitation.course_title}"`}
                                </p>
                                <span className={`text-xs ${theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'}`}>
                                  {formatTime(invitation.created_at)}
                                </span>
                                
                                {/* Action buttons */}
                                <div className="flex gap-2 mt-3">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAcceptInvitation(invitation.id)}
                                    disabled={actionLoading === invitation.id}
                                    className="flex-1 py-2 px-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-[12px] text-sm font-medium flex items-center justify-center gap-1"
                                  >
                                    {actionLoading === invitation.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4" />
                                        Принять
                                      </>
                                    )}
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleDeclineInvitation(invitation.id)}
                                    disabled={actionLoading === invitation.id}
                                    className={`flex-1 py-2 px-3 ${
                                      theme === 'day' 
                                        ? 'bg-red-100 text-red-600' 
                                        : 'bg-red-900/30 text-red-400'
                                    } rounded-[12px] text-sm font-medium flex items-center justify-center gap-1`}
                                  >
                                    <XIcon className="w-4 h-4" />
                                    Отклонить
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'notifications' && notifications.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={markAllAsRead}
                  className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[20px] shadow-lg"
                >
                  Отметить все как прочитанные
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
