/**
 * Exams API Tests
 * Tests for exam endpoints: list, get, create, add questions, start, submit
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
const studentUser = generateTestUser('examstudent');
const teacherUser = generateTestTeacher();
const testCourse = generateTestCourse();

let studentAuthToken: string;
let teacherAuthToken: string;
let studentId: number;
let teacherId: number;
let courseId: number;
let examId: number;
let questionId: number;
let attemptId: number;

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
  if (attemptId) {
    db.prepare('DELETE FROM exam_answers WHERE attempt_id = ?').run(attemptId);
    db.prepare('DELETE FROM exam_attempts WHERE id = ?').run(attemptId);
  }
  if (questionId) {
    db.prepare('DELETE FROM exam_questions WHERE id = ?').run(questionId);
  }
  if (examId) {
    db.prepare('DELETE FROM exams WHERE id = ?').run(examId);
  }
  if (courseId) {
    db.prepare('DELETE FROM enrollments WHERE course_id = ?').run(courseId);
    db.prepare('DELETE FROM courses WHERE id = ?').run(courseId);
  }
  await cleanupTestData([studentUser.email, teacherUser.email]);
});

describe('Exams API - Create Exam', () => {
  test('POST /api/exams - teacher should create exam', async () => {
    const examData = {
      course_id: courseId,
      title: `Test Exam ${Date.now()}`,
      description: 'Test exam description',
      duration: 60,
      total_points: 100,
    };

    const response = await request(app)
      .post('/api/exams')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send(examData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(examData.title);
    expect(response.body.course_id).toBe(courseId);
    expect(response.body.duration).toBe(60);

    examId = response.body.id;
  });

  test('POST /api/exams - student should not create exam', async () => {
    const response = await request(app)
      .post('/api/exams')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({
        course_id: courseId,
        title: 'Hacked Exam',
        duration: 30,
      })
      .expect(403);

    expect(response.body.error).toBe('Insufficient permissions');
  });

  test('POST /api/exams - should fail for course not owned by teacher', async () => {
    // Create another teacher
    const anotherTeacher = generateTestTeacher();
    const anotherRes = await request(app)
      .post('/api/auth/register')
      .send(anotherTeacher);
    const anotherToken = anotherRes.body.authToken;

    const response = await request(app)
      .post('/api/exams')
      .set('Authorization', `Bearer ${anotherToken}`)
      .send({
        course_id: courseId,
        title: 'Unauthorized Exam',
        duration: 30,
      })
      .expect(403);

    expect(response.body.error).toBe('Unauthorized');

    await cleanupTestData([anotherTeacher.email]);
  });
});

describe('Exams API - Add Questions', () => {
  test('POST /api/exams/:examId/questions - teacher should add question', async () => {
    const questionData = {
      question: 'What is 2 + 2?',
      type: 'multiple_choice',
      options: ['1', '2', '3', '4'],
      correct_answer: '4',
      points: 10,
    };

    const response = await request(app)
      .post(`/api/exams/${examId}/questions`)
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send(questionData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.question).toBe(questionData.question);
    expect(response.body.exam_id).toBe(examId);

    questionId = response.body.id;
  });

  test('POST /api/exams/:examId/questions - student should not add question', async () => {
    const response = await request(app)
      .post(`/api/exams/${examId}/questions`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({
        question: 'Hacked question',
        type: 'text',
        correct_answer: 'hack',
        points: 100,
      })
      .expect(403);

    expect(response.body.error).toBe('Insufficient permissions');
  });

  test('POST /api/exams/:examId/questions - should fail for non-existent exam', async () => {
    const response = await request(app)
      .post('/api/exams/99999/questions')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send({
        question: 'Test',
        type: 'text',
        correct_answer: 'answer',
        points: 10,
      })
      .expect(404);

    expect(response.body.error).toBe('Exam not found');
  });
});

describe('Exams API - Get Exams', () => {
  test('GET /api/exams/course/:courseId - should return exams', async () => {
    const response = await request(app)
      .get(`/api/exams/course/${courseId}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const exam = response.body.find((e: any) => e.id === examId);
    expect(exam).toBeDefined();
  });

  test('GET /api/exams/:id - should return exam with questions', async () => {
    const response = await request(app)
      .get(`/api/exams/${examId}`)
      .expect(200);

    expect(response.body.id).toBe(examId);
    expect(response.body).toHaveProperty('questions');
    expect(Array.isArray(response.body.questions)).toBe(true);
  });

  test('GET /api/exams/:id - should return 404 for non-existent exam', async () => {
    const response = await request(app)
      .get('/api/exams/99999')
      .expect(404);

    expect(response.body.error).toBe('Exam not found');
  });
});

describe('Exams API - Start Exam', () => {
  test('POST /api/exams/:id/start - student should start exam', async () => {
    const response = await request(app)
      .post(`/api/exams/${examId}/start`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.exam_id).toBe(examId);
    expect(response.body.student_id).toBe(studentId);

    attemptId = response.body.id;
  });

  test('POST /api/exams/:id/start - should fail without auth', async () => {
    const response = await request(app)
      .post(`/api/exams/${examId}/start`)
      .expect(401);

    expect(response.body.error).toBe('Missing authorization header');
  });
});

describe('Exams API - Submit Exam', () => {
  test('POST /api/exams/:attemptId/submit - should submit exam answers', async () => {
    const answers = {
      [questionId]: '4', // Correct answer
    };

    const response = await request(app)
      .post(`/api/exams/${attemptId}/submit`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({ answers })
      .expect(200);

    expect(response.body).toHaveProperty('score');
    expect(response.body).toHaveProperty('total_points');
    expect(response.body.score).toBe(10); // 10 points for correct answer
  });

  test('POST /api/exams/:attemptId/submit - should fail without auth', async () => {
    const response = await request(app)
      .post(`/api/exams/${attemptId}/submit`)
      .send({ answers: {} })
      .expect(401);

    expect(response.body.error).toBe('Missing authorization header');
  });
});

export { examId, courseId };
