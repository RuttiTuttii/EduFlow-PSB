import { describe, test, expect, vi, beforeEach } from 'vitest';
import { authApi, coursesApi, assignmentsApi, examsApi, messagesApi, dashboardApi, aiApi } from '../api/client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create mock response
const mockResponse = (data: any, ok = true, status = 200) => {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
    statusText: ok ? 'OK' : 'Error',
  });
};

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Auth API', () => {
    test('login should call API with correct parameters', async () => {
      const mockData = {
        user: { id: 1, email: 'test@test.com', name: 'Test', role: 'student' },
        authToken: 'test-token',
        refreshToken: 'test-refresh',
      };
      mockFetch.mockResolvedValueOnce(mockResponse(mockData));

      const result = await authApi.login('test@test.com', 'password');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@test.com', password: 'password' }),
        })
      );
      expect(result).toEqual(mockData);
    });

    test('register should call API with correct parameters', async () => {
      const mockData = {
        user: { id: 1, email: 'new@test.com', name: 'New User', role: 'student' },
        authToken: 'new-token',
        refreshToken: 'new-refresh',
      };
      mockFetch.mockResolvedValueOnce(mockResponse(mockData));

      const result = await authApi.register('new@test.com', 'password123', 'New User', 'student');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'new@test.com', password: 'password123', name: 'New User', role: 'student' }),
        })
      );
      expect(result).toEqual(mockData);
    });

    test('setTokens should save tokens to localStorage', () => {
      authApi.setTokens('token123', 'refresh123');
      
      // Verify setItem was called with correct values
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'token123');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh123');
    });

    test('logout should clear tokens from localStorage', () => {
      authApi.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('Courses API', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'test-token');
    });

    test('getAll should fetch all courses', async () => {
      const mockCourses = [
        { id: 1, title: 'Course 1', description: 'Desc 1' },
        { id: 2, title: 'Course 2', description: 'Desc 2' },
      ];
      mockFetch.mockResolvedValueOnce(mockResponse(mockCourses));

      const result = await coursesApi.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/courses'),
        expect.any(Object)
      );
      expect(result).toEqual(mockCourses);
    });

    test('getById should fetch specific course', async () => {
      const mockCourse = { id: 1, title: 'Course 1', lessons: [] };
      mockFetch.mockResolvedValueOnce(mockResponse(mockCourse));

      const result = await coursesApi.getById(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/courses/1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockCourse);
    });

    test('create should send POST request with course data', async () => {
      const mockCourse = { id: 1, title: 'New Course', description: 'Desc', level: 'beginner' };
      mockFetch.mockResolvedValueOnce(mockResponse(mockCourse));

      const result = await coursesApi.create('New Course', 'Desc', 'beginner');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/courses'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'New Course', description: 'Desc', level: 'beginner' }),
        })
      );
      expect(result).toEqual(mockCourse);
    });

    test('enroll should send POST to enroll endpoint', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ message: 'Enrolled' }));

      await coursesApi.enroll(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/courses/1/enroll'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    test('delete should send DELETE request', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ message: 'Deleted' }));

      await coursesApi.delete(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/courses/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Assignments API', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'test-token');
    });

    test('getByCourse should fetch assignments for course', async () => {
      const mockAssignments = [{ id: 1, title: 'Assignment 1' }];
      mockFetch.mockResolvedValueOnce(mockResponse(mockAssignments));

      const result = await assignmentsApi.getByCourse(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/assignments/course/1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockAssignments);
    });

    test('submit should send submission content', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, status: 'submitted' }));

      await assignmentsApi.submit(1, 'My submission content');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/assignments/1/submit'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ content: 'My submission content' }),
        })
      );
    });

    test('grade should send grade and feedback', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ grade: 95, feedback: 'Great!' }));

      await assignmentsApi.grade(1, 95, 'Great!');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/assignments/1/grade'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ grade: 95, feedback: 'Great!' }),
        })
      );
    });
  });

  describe('Exams API', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'test-token');
    });

    test('getByCourse should fetch exams', async () => {
      const mockExams = [{ id: 1, title: 'Exam 1' }];
      mockFetch.mockResolvedValueOnce(mockResponse(mockExams));

      const result = await examsApi.getByCourse(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/exams/course/1'),
        expect.any(Object)
      );
      expect(result).toEqual(mockExams);
    });

    test('start should initiate exam attempt', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ attemptId: 1, started_at: '2024-01-01' }));

      const result = await examsApi.start(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/exams/1/start'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result).toHaveProperty('attemptId');
    });

    test('submit should send exam answers', async () => {
      const answers = { '1': 'A', '2': 'B', '3': 'C' };
      mockFetch.mockResolvedValueOnce(mockResponse({ score: 80, total: 100 }));

      await examsApi.submit(1, answers);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/exams/1/submit'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ answers }),
        })
      );
    });
  });

  describe('Messages API', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'test-token');
    });

    test('getConversations should fetch user conversations', async () => {
      const mockConversations = [{ id: 1, user: { name: 'User 1' } }];
      mockFetch.mockResolvedValueOnce(mockResponse(mockConversations));

      const result = await messagesApi.getConversations();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/messages/conversations'),
        expect.any(Object)
      );
      expect(result).toEqual(mockConversations);
    });

    test('send should post new message', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, content: 'Hello' }));

      await messagesApi.send(2, 'Hello');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/messages/send'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ recipient_id: 2, content: 'Hello' }),
        })
      );
    });

    test('getUnreadCount should return unread count', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ count: 5 }));

      const result = await messagesApi.getUnreadCount();

      expect(result).toEqual({ count: 5 });
    });
  });

  describe('Dashboard API', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'test-token');
    });

    test('getStudentStats should fetch student statistics', async () => {
      const mockStats = {
        enrolledCourses: 3,
        completedAssignments: 10,
        averageGrade: 85,
      };
      mockFetch.mockResolvedValueOnce(mockResponse(mockStats));

      const result = await dashboardApi.getStudentStats();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard/stats/student'),
        expect.any(Object)
      );
      expect(result).toEqual(mockStats);
    });

    test('getTeacherStats should fetch teacher statistics', async () => {
      const mockStats = {
        totalCourses: 5,
        totalStudents: 100,
        pendingSubmissions: 15,
      };
      mockFetch.mockResolvedValueOnce(mockResponse(mockStats));

      const result = await dashboardApi.getTeacherStats();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard/stats/teacher'),
        expect.any(Object)
      );
      expect(result).toEqual(mockStats);
    });

    test('logActivity should send activity data', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));

      await dashboardApi.logActivity(2, 5, 3, 1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/dashboard/activity/log'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ hours_spent: 2, lessons_completed: 5, assignments_completed: 3, exams_taken: 1 }),
        })
      );
    });
  });

  describe('AI API', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'test-token');
    });

    test('getHelp should send question to AI', async () => {
      const mockResponse_data = { response: 'AI answer', topic: 'Math' };
      mockFetch.mockResolvedValueOnce(mockResponse(mockResponse_data));

      const result = await aiApi.getHelp('What is 2+2?', 'math', undefined, true);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai/help'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(mockResponse_data);
    });

    test('getTemplates should fetch AI templates', async () => {
      const mockTemplates = [{ id: 1, title: 'Template 1' }];
      mockFetch.mockResolvedValueOnce(mockResponse(mockTemplates));

      const result = await aiApi.getTemplates();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai/templates'),
        expect.any(Object)
      );
      expect(result).toEqual(mockTemplates);
    });

    test('getRecommendations should fetch AI recommendations', async () => {
      const mockRecs = { recommendations: [{ course: 'Math', reason: 'Good for you' }] };
      mockFetch.mockResolvedValueOnce(mockResponse(mockRecs));

      const result = await aiApi.getRecommendations();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai/recommendations'),
        expect.objectContaining({ method: 'POST' })
      );
      expect(result).toEqual(mockRecs);
    });

    test('createChat should create new AI chat', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ id: 1, title: 'New Chat' }));

      const result = await aiApi.createChat('New Chat');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai/chats'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'New Chat' }),
        })
      );
      expect(result).toHaveProperty('id');
    });
  });

  describe('Error Handling', () => {
    test('should throw error on failed request', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Not found' }, false, 404));

      await expect(coursesApi.getById(999)).rejects.toThrow('Not found');
    });

    test('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(authApi.login('test@test.com', 'pass')).rejects.toThrow('Network error');
    });
  });
});
