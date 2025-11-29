/// <reference types="vite/client" />

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  getMessages: (userId: number) =>
    apiCall(`/messages/user/${userId}`),
  send: (recipient_id: number, content: string) =>
    apiCall('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ recipient_id, content }),
    }),
  getUnreadCount: () =>
    apiCall('/messages/unread'),
};

// AI endpoints
export const aiApi = {
  getHelp: (question: string, topic?: string, context?: string) =>
    apiCall('/ai/help', {
      method: 'POST',
      body: JSON.stringify({ question, topic, context }),
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
};
