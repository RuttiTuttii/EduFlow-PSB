/// <reference types="vite/client" />

// In production, use relative path /api, in development use full URL
const API_URL = import.meta.env.VITE_API_URL || '/api';

let authToken: string | null = localStorage.getItem('authToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      authToken = null;
      refreshToken = null;
      return false;
    }

    const data = await response.json();
    authToken = data.authToken;
    if (authToken) localStorage.setItem('authToken', authToken);
    return true;
  } catch {
    return false;
  }
}

async function apiCall(
  endpoint: string,
  options: RequestOptions = {}
): Promise<any> {
  const { requiresAuth = true, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});
  headers.set('Content-Type', 'application/json');

  if (requiresAuth && authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // If unauthorized and we have a refresh token, try to refresh
  if (response.status === 401 && refreshToken && requiresAuth) {
    if (await refreshAccessToken()) {
      headers.set('Authorization', `Bearer ${authToken}`);
      response = await fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API error: ${response.statusText}`);
  }

  return response.json();
}

// Auth endpoints
export const authApi = {
  register: (email: string, password: string, name: string, role: string = 'student') =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
      requiresAuth: false,
    }),

  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requiresAuth: false,
    }),

  setTokens: (token: string | null, refresh: string | null) => {
    authToken = token;
    refreshToken = refresh;
    if (token) localStorage.setItem('authToken', token);
    if (refresh) localStorage.setItem('refreshToken', refresh);
  },

  getTokens: () => ({ authToken, refreshToken }),

  logout: () => {
    authToken = null;
    refreshToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  },
};

// Courses endpoints
export const coursesApi = {
  getAll: () => apiCall('/courses', { requiresAuth: false }),
  getById: (id: number) => apiCall(`/courses/${id}`, { requiresAuth: false }),
  create: (title: string, description: string, level: string) =>
    apiCall('/courses', {
      method: 'POST',
      body: JSON.stringify({ title, description, level }),
    }),
  update: (id: number, data: any) =>
    apiCall(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiCall(`/courses/${id}`, { method: 'DELETE' }),
  enroll: (id: number) =>
    apiCall(`/courses/${id}/enroll`, { method: 'POST' }),
};

// Assignments endpoints
export const assignmentsApi = {
  getByCourse: (courseId: number) =>
    apiCall(`/assignments/course/${courseId}`, { requiresAuth: false }),
  create: (course_id: number, lesson_id: number, title: string, description: string, due_date: string) =>
    apiCall('/assignments', {
      method: 'POST',
      body: JSON.stringify({ course_id, lesson_id, title, description, due_date }),
    }),
  submit: (id: number, content: string) =>
    apiCall(`/assignments/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  grade: (id: number, grade: number, feedback: string) =>
    apiCall(`/assignments/${id}/grade`, {
      method: 'POST',
      body: JSON.stringify({ grade, feedback }),
    }),
};

// Exams endpoints
export const examsApi = {
  getByCourse: (courseId: number) =>
    apiCall(`/exams/course/${courseId}`, { requiresAuth: false }),
  getById: (id: number) =>
    apiCall(`/exams/${id}`, { requiresAuth: false }),
  create: (course_id: number, title: string, description: string, duration: number, total_points: number) =>
    apiCall('/exams', {
      method: 'POST',
      body: JSON.stringify({ course_id, title, description, duration, total_points }),
    }),
  addQuestion: (examId: number, question: string, type: string, options: string[], correct_answer: string, points: number) =>
    apiCall(`/exams/${examId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ question, type, options, correct_answer, points }),
    }),
  start: (id: number) =>
    apiCall(`/exams/${id}/start`, { method: 'POST' }),
  submit: (attemptId: number, answers: Record<string, string>) =>
    apiCall(`/exams/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
};

// Messages endpoints
export const messagesApi = {
  getConversations: () =>
    apiCall('/messages/conversations'),
  createConversation: (user_id: number) =>
    apiCall('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify({ user_id }),
    }),
  getAvailableUsers: () =>
    apiCall('/messages/available-users'),
  getMessages: (userId: number) =>
    apiCall(`/messages/direct/${userId}`),
  getUnreadCount: () =>
    apiCall('/messages/unread/count'),
  send: (recipientId: number, content: string) =>
    apiCall('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content }),
    }),
  deleteMessage: (messageId: number) =>
    apiCall(`/messages/${messageId}`, { method: 'DELETE' }),
  getUnreadCount: () =>
    apiCall('/messages/unread'),
  
  // Notifications
  getNotifications: () =>
    apiCall('/messages/notifications'),
  getNotificationsUnread: () =>
    apiCall('/messages/notifications/unread'),
  markNotificationRead: (id: number) =>
    apiCall(`/messages/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () =>
    apiCall('/messages/notifications/read-all', { method: 'PUT' }),
  deleteNotification: (id: number) =>
    apiCall(`/messages/notifications/${id}`, { method: 'DELETE' }),
  
  // Course invitations
  getInvitations: () =>
    apiCall('/messages/invitations'),
  inviteStudent: (course_id: number, student_email: string, message?: string) =>
    apiCall('/messages/invitations/invite', {
      method: 'POST',
      body: JSON.stringify({ course_id, student_email, message }),
    }),
  requestCourse: (course_id: number, message?: string) =>
    apiCall('/messages/invitations/request', {
      method: 'POST',
      body: JSON.stringify({ course_id, message }),
    }),
  acceptInvitation: (id: number) =>
    apiCall(`/messages/invitations/${id}/accept`, { method: 'POST' }),
  declineInvitation: (id: number) =>
    apiCall(`/messages/invitations/${id}/decline`, { method: 'POST' }),
};

// AI endpoints
export const aiApi = {
  getHelp: (question: string, topic?: string, context?: string, useContext?: boolean) =>
    apiCall('/ai/help', {
      method: 'POST',
      body: JSON.stringify({ question, topic, context, useContext }),
    }),
  analyzeSubmission: (submission: string, rubric?: string) =>
    apiCall('/ai/analyze-submission', {
      method: 'POST',
      body: JSON.stringify({ submission, rubric }),
    }),
  generateQuestions: (topic: string, count?: number, difficulty?: string) =>
    apiCall('/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify({ topic, count, difficulty }),
    }),
  explainConcept: (concept: string, level?: string) =>
    apiCall('/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ concept, level }),
    }),
  // New AI tools
  getTemplates: () => apiCall('/ai/templates'),
  createDebtPlan: () =>
    apiCall('/ai/create-debt-plan', { method: 'POST' }),
  getRecommendations: () =>
    apiCall('/ai/recommendations', { method: 'POST' }),
  examPrep: (examId?: number, daysUntilExam?: number) =>
    apiCall('/ai/exam-prep', {
      method: 'POST',
      body: JSON.stringify({ examId, daysUntilExam }),
    }),
  summarize: (topic: string, content?: string) =>
    apiCall('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ topic, content }),
    }),
  getContext: () => apiCall('/ai/context'),
  
  // AI Chat management
  getChats: () => apiCall('/ai/chats'),
  createChat: (title?: string) =>
    apiCall('/ai/chats', {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),
  getChatMessages: (chatId: number) => apiCall(`/ai/chats/${chatId}/messages`),
  sendChatMessage: (chatId: number, content: string, useContext?: boolean) =>
    apiCall(`/ai/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, useContext }),
    }),
  updateChat: (chatId: number, title: string) =>
    apiCall(`/ai/chats/${chatId}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    }),
  deleteChat: (chatId: number) =>
    apiCall(`/ai/chats/${chatId}`, { method: 'DELETE' }),
  clearAllChats: () =>
    apiCall('/ai/chats', { method: 'DELETE' }),
};

// Dashboard endpoints
export const dashboardApi = {
  // Student stats
  getStudentStats: () => apiCall('/dashboard/stats/student'),
  
  // Teacher stats
  getTeacherStats: () => apiCall('/dashboard/stats/teacher'),
  
  // Enrolled courses (for students)
  getEnrolledCourses: () => apiCall('/dashboard/courses/enrolled'),
  
  // Teaching courses (for teachers)
  getTeachingCourses: () => apiCall('/dashboard/courses/teaching'),
  
  // Weekly activity data
  getWeeklyActivity: () => apiCall('/dashboard/activity/weekly'),
  
  // Calendar events
  getCalendarEvents: (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.append('month', String(month));
    if (year) params.append('year', String(year));
    const queryString = params.toString();
    return apiCall(`/dashboard/calendar/events${queryString ? `?${queryString}` : ''}`);
  },
  
  // Create calendar event
  createCalendarEvent: (title: string, event_date: string, description?: string, event_time?: string, type?: string, course_id?: number) =>
    apiCall('/dashboard/calendar/events', {
      method: 'POST',
      body: JSON.stringify({ title, description, event_date, event_time, type, course_id }),
    }),
  
  // User achievements
  getAchievements: () => apiCall('/dashboard/achievements'),
  
  // Log activity
  logActivity: (hours_spent?: number, lessons_completed?: number, assignments_completed?: number, exams_taken?: number) =>
    apiCall('/dashboard/activity/log', {
      method: 'POST',
      body: JSON.stringify({ hours_spent, lessons_completed, assignments_completed, exams_taken }),
    }),
};

// Unified API export
export const api = {
  auth: authApi,
  courses: coursesApi,
  assignments: assignmentsApi,
  exams: examsApi,
  messages: messagesApi,
  ai: {
    help: (params: { question: string; topic?: string; context?: string; useContext?: boolean }) =>
      aiApi.getHelp(params.question, params.topic, params.context, params.useContext),
    analyze: aiApi.analyzeSubmission,
    questions: aiApi.generateQuestions,
    explain: aiApi.explainConcept,
    templates: aiApi.getTemplates,
    debtPlan: aiApi.createDebtPlan,
    recommendations: aiApi.getRecommendations,
    examPrep: aiApi.examPrep,
    summarize: aiApi.summarize,
    context: aiApi.getContext,
    // Chat management
    chats: aiApi.getChats,
    createChat: aiApi.createChat,
    getChatMessages: aiApi.getChatMessages,
    sendChatMessage: aiApi.sendChatMessage,
    updateChat: aiApi.updateChat,
    deleteChat: aiApi.deleteChat,
    clearAllChats: aiApi.clearAllChats,
  },
  dashboard: dashboardApi,
  // Notifications
  notifications: {
    getAll: messagesApi.getNotifications,
    getUnread: messagesApi.getNotificationsUnread,
    markAsRead: messagesApi.markNotificationRead,
    markAllAsRead: messagesApi.markAllNotificationsRead,
    delete: messagesApi.deleteNotification,
  },
  // Course invitations
  invitations: {
    getAll: messagesApi.getInvitations,
    invite: messagesApi.inviteStudent,
    request: messagesApi.requestCourse,
    accept: messagesApi.acceptInvitation,
    decline: messagesApi.declineInvitation,
  },
};
