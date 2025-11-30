/**
 * AI API Tests
 * Tests for AI endpoints: help, debt plan, recommendations, templates, exam prep, explain, summarize, chats
 */
import request from 'supertest';
import { 
  createTestApp, 
  generateTestUser, 
  generateTestTeacher,
  generateTestCourse,
  cleanupTestData, 
  setupTestDb,
  getDb
} from './setup';

const app = createTestApp();

// Test data
const studentUser = generateTestUser('aistudent');
const teacherUser = generateTestTeacher();
const testCourse = generateTestCourse();

let studentAuthToken: string;
let teacherAuthToken: string;
let studentId: number;
let teacherId: number;
let courseId: number;
let chatId: number;

beforeAll(async () => {
  await setupTestDb();
  
  // Register student
  const studentRes = await request(app)
    .post('/api/auth/register')
    .send(studentUser);
  studentAuthToken = studentRes.body.authToken;
  studentId = studentRes.body.user.id;
  
  // Register teacher
  const teacherRes = await request(app)
    .post('/api/auth/register')
    .send(teacherUser);
  teacherAuthToken = teacherRes.body.authToken;
  teacherId = teacherRes.body.user.id;

  // Create course
  const courseRes = await request(app)
    .post('/api/courses')
    .set('Authorization', `Bearer ${teacherAuthToken}`)
    .send(testCourse);
  courseId = courseRes.body.id;

  // Enroll student
  await request(app)
    .post(`/api/courses/${courseId}/enroll`)
    .set('Authorization', `Bearer ${studentAuthToken}`);
});

afterAll(async () => {
  const db = getDb();
  // Clean up
  db.prepare('DELETE FROM study_plans WHERE student_id = ?').run(studentId);
  db.prepare('DELETE FROM ai_messages WHERE chat_id IN (SELECT id FROM ai_chats WHERE user_id = ?)').run(studentId);
  db.prepare('DELETE FROM ai_chats WHERE user_id = ?').run(studentId);
  if (courseId) {
    db.prepare('DELETE FROM enrollments WHERE course_id = ?').run(courseId);
    db.prepare('DELETE FROM courses WHERE id = ?').run(courseId);
  }
  await cleanupTestData([studentUser.email, teacherUser.email]);
});

describe('AI API - Get Help', () => {
  test('POST /api/ai/help - should get AI help with context', async () => {
    const response = await request(app)
      .post('/api/ai/help')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({
        question: 'Как решить квадратное уравнение?',
        topic: 'Математика',
        useContext: true,
      })
      .expect(200);

    expect(response.body).toHaveProperty('response');
    expect(response.body).toHaveProperty('topic');
    expect(response.body).toHaveProperty('question');
    expect(typeof response.body.response).toBe('string');
  }, 30000); // Extended timeout for AI call

  test('POST /api/ai/help - should get AI help without context', async () => {
    const response = await request(app)
      .post('/api/ai/help')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({
        question: 'Что такое интеграл?',
        useContext: false,
      })
      .expect(200);

    expect(response.body).toHaveProperty('response');
  }, 30000);

  test('POST /api/ai/help - should fail without question', async () => {
    const response = await request(app)
      .post('/api/ai/help')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({ topic: 'Math' })
      .expect(400);

    expect(response.body.error).toBe('Вопрос не указан');
  });

  test('POST /api/ai/help - should fail without auth', async () => {
    const response = await request(app)
      .post('/api/ai/help')
      .send({ question: 'Test?' })
      .expect(401);

    expect(response.body.error).toBe('Missing authorization header');
  });
});

describe('AI API - Templates', () => {
  test('GET /api/ai/templates - should return available templates', async () => {
    const response = await request(app)
      .get('/api/ai/templates')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('templates');
    expect(Array.isArray(response.body.templates)).toBe(true);
    expect(response.body.templates.length).toBeGreaterThan(0);

    const template = response.body.templates[0];
    expect(template).toHaveProperty('id');
    expect(template).toHaveProperty('icon');
    expect(template).toHaveProperty('title');
    expect(template).toHaveProperty('description');
    expect(template).toHaveProperty('action');
  });

  test('GET /api/ai/templates - should fail without auth', async () => {
    const response = await request(app)
      .get('/api/ai/templates')
      .expect(401);

    expect(response.body.error).toBe('Missing authorization header');
  });
});

describe('AI API - Debt Recovery Plan', () => {
  test('POST /api/ai/create-debt-plan - should create debt plan', async () => {
    const response = await request(app)
      .post('/api/ai/create-debt-plan')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    // If no debts, should return message
    if (!response.body.plan) {
      expect(response.body.message).toBe('У вас нет академических долгов! 🎉');
    } else {
      expect(response.body).toHaveProperty('plan');
      expect(response.body).toHaveProperty('debts');
      expect(response.body).toHaveProperty('pendingAssignments');
    }
  }, 30000);

  test('POST /api/ai/create-debt-plan - should fail without auth', async () => {
    const response = await request(app)
      .post('/api/ai/create-debt-plan')
      .expect(401);

    expect(response.body.error).toBe('Missing authorization header');
  });
});

describe('AI API - Recommendations', () => {
  test('POST /api/ai/recommendations - should return recommendations', async () => {
    const response = await request(app)
      .post('/api/ai/recommendations')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('recommendations');
    expect(Array.isArray(response.body.recommendations)).toBe(true);

    if (response.body.recommendations.length > 0) {
      const rec = response.body.recommendations[0];
      expect(rec).toHaveProperty('icon');
      expect(rec).toHaveProperty('title');
      expect(rec).toHaveProperty('description');
    }
  }, 30000);
});

describe('AI API - Exam Preparation', () => {
  test('POST /api/ai/exam-prep - should create exam prep plan', async () => {
    const response = await request(app)
      .post('/api/ai/exam-prep')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({ daysUntilExam: 5 })
      .expect(200);

    expect(response.body).toHaveProperty('plan');
    if (response.body.plan) {
      expect(response.body.plan).toHaveProperty('daily_plan');
      expect(Array.isArray(response.body.plan.daily_plan)).toBe(true);
    }
  }, 30000);

  test('POST /api/ai/exam-prep - should fail without auth', async () => {
    const response = await request(app)
      .post('/api/ai/exam-prep')
      .send({ daysUntilExam: 5 })
      .expect(401);

    expect(response.body.error).toBe('Missing authorization header');
  });
});

describe('AI API - Explain Concept', () => {
  test('POST /api/ai/explain - should explain concept', async () => {
    const response = await request(app)
      .post('/api/ai/explain')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({
        concept: 'Производная функции',
        level: 'beginner',
      })
      .expect(200);

    expect(response.body).toHaveProperty('explanation');
    expect(typeof response.body.explanation).toBe('string');
  }, 30000);

  test('POST /api/ai/explain - should fail without concept', async () => {
    const response = await request(app)
      .post('/api/ai/explain')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({})
      .expect(400);

    expect(response.body.error).toBe('Концепция не указана');
  });
});

describe('AI API - Summarize', () => {
  test('POST /api/ai/summarize - should summarize topic', async () => {
    const response = await request(app)
      .post('/api/ai/summarize')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({
        topic: 'Основы программирования',
      })
      .expect(200);

    expect(response.body).toHaveProperty('summary');
  }, 30000);
});

describe('AI API - Analyze Submission (Teacher)', () => {
  test('POST /api/ai/analyze-submission - teacher should analyze submission', async () => {
    const response = await request(app)
      .post('/api/ai/analyze-submission')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send({
        submission: 'Это текст работы студента для проверки.',
        assignmentTitle: 'Эссе по программированию',
      })
      .expect(200);

    expect(response.body).toHaveProperty('analysis');
    expect(typeof response.body.analysis).toBe('string');
  }, 30000);

  test('POST /api/ai/analyze-submission - should fail without submission', async () => {
    const response = await request(app)
      .post('/api/ai/analyze-submission')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send({})
      .expect(400);

    expect(response.body.error).toBe('Работа не указана');
  });
});

describe('AI API - Generate Questions', () => {
  test('POST /api/ai/generate-questions - should generate quiz questions', async () => {
    const response = await request(app)
      .post('/api/ai/generate-questions')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send({
        topic: 'JavaScript основы',
        count: 3,
        difficulty: 'easy',
      })
      .expect(200);

    expect(response.body).toHaveProperty('questions');
    expect(Array.isArray(response.body.questions)).toBe(true);
    expect(response.body.topic).toBe('JavaScript основы');
  }, 30000);

  test('POST /api/ai/generate-questions - should fail without topic', async () => {
    const response = await request(app)
      .post('/api/ai/generate-questions')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send({ count: 5 })
      .expect(400);

    expect(response.body.error).toBe('Тема не указана');
  });
});

describe('AI API - User Context', () => {
  test('GET /api/ai/context - should return user study context', async () => {
    const response = await request(app)
      .get('/api/ai/context')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('courses');
    expect(response.body).toHaveProperty('pendingAssignments');
    expect(response.body).toHaveProperty('upcomingExams');
    expect(response.body).toHaveProperty('debts');
    expect(response.body).toHaveProperty('activity');
    expect(Array.isArray(response.body.courses)).toBe(true);
  });
});

describe('AI API - Chat Management', () => {
  test('POST /api/ai/chats - should create new chat', async () => {
    const response = await request(app)
      .post('/api/ai/chats')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({ title: 'Тестовый чат' })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Тестовый чат');
    expect(response.body.user_id).toBe(studentId);

    chatId = response.body.id;
  });

  test('GET /api/ai/chats - should return all chats', async () => {
    const response = await request(app)
      .get('/api/ai/chats')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const chat = response.body.find((c: any) => c.id === chatId);
    expect(chat).toBeDefined();
  });

  test('GET /api/ai/chats/:chatId/messages - should return chat messages', async () => {
    const response = await request(app)
      .get(`/api/ai/chats/${chatId}/messages`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    // Should have welcome message
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  test('POST /api/ai/chats/:chatId/messages - should send message in chat', async () => {
    const response = await request(app)
      .post(`/api/ai/chats/${chatId}/messages`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({ content: 'Привет!' })
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.role).toBe('assistant');
    expect(response.body.content).toBeDefined();
  }, 30000);

  test('PUT /api/ai/chats/:chatId - should update chat title', async () => {
    const response = await request(app)
      .put(`/api/ai/chats/${chatId}`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({ title: 'Обновленный заголовок' })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  test('GET /api/ai/chats/:chatId/messages - should fail for non-existent chat', async () => {
    const response = await request(app)
      .get('/api/ai/chats/99999/messages')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(404);

    expect(response.body.error).toBe('Чат не найден');
  });

  test('DELETE /api/ai/chats/:chatId - should delete chat', async () => {
    // Create a chat to delete
    const createRes = await request(app)
      .post('/api/ai/chats')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({ title: 'Чат для удаления' });
    
    const deleteId = createRes.body.id;

    const response = await request(app)
      .delete(`/api/ai/chats/${deleteId}`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  test('DELETE /api/ai/chats - should clear all chats', async () => {
    const response = await request(app)
      .delete('/api/ai/chats')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('deleted');
  });
});

export { studentAuthToken };
