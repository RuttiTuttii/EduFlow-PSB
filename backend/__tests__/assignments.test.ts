/**
 * Assignments API Tests
 * Tests for assignment endpoints: list, create, submit, grade
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
const studentUser = generateTestUser('assignstudent');
const teacherUser = generateTestTeacher();
const testCourse = generateTestCourse();

let studentAuthToken: string;
let teacherAuthToken: string;
let studentId: number;
let teacherId: number;
let courseId: number;
let assignmentId: number;
let submissionId: number;

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
  if (submissionId) {
    db.prepare('DELETE FROM submissions WHERE id = ?').run(submissionId);
  }
  if (assignmentId) {
    db.prepare('DELETE FROM assignments WHERE id = ?').run(assignmentId);
  }
  if (courseId) {
    db.prepare('DELETE FROM enrollments WHERE course_id = ?').run(courseId);
    db.prepare('DELETE FROM courses WHERE id = ?').run(courseId);
  }
  await cleanupTestData([studentUser.email, teacherUser.email]);
});

describe('Assignments API - Create Assignment', () => {
  test('POST /api/assignments - teacher should create assignment', async () => {
    const assignmentData = {
      course_id: courseId,
      title: `Test Assignment ${Date.now()}`,
      description: 'Test assignment description',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const response = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send(assignmentData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(assignmentData.title);
    expect(response.body.course_id).toBe(courseId);

    assignmentId = response.body.id;
  });

  test('POST /api/assignments - student should not create assignment', async () => {
    const response = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({
        course_id: courseId,
        title: 'Hacked Assignment',
        description: 'Test',
      })
      .expect(403);

    expect(response.body.error).toBe('Insufficient permissions');
  });

  test('POST /api/assignments - should fail for course not owned by teacher', async () => {
    // Create another teacher
    const anotherTeacher = generateTestTeacher();
    const anotherRes = await request(app)
      .post('/api/auth/register')
      .send(anotherTeacher);
    const anotherToken = anotherRes.body.authToken;

    const response = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${anotherToken}`)
      .send({
        course_id: courseId,
        title: 'Unauthorized Assignment',
        description: 'Test',
      })
      .expect(403);

    expect(response.body.error).toBe('Unauthorized');

    await cleanupTestData([anotherTeacher.email]);
  });
});

describe('Assignments API - Get Assignments', () => {
  test('GET /api/assignments/course/:courseId - should return assignments', async () => {
    const response = await request(app)
      .get(`/api/assignments/course/${courseId}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const assignment = response.body.find((a: any) => a.id === assignmentId);
    expect(assignment).toBeDefined();
  });

  test('GET /api/assignments/course/:courseId - should return empty for non-existent course', async () => {
    const response = await request(app)
      .get('/api/assignments/course/99999')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});

describe('Assignments API - Submit Assignment', () => {
  test('POST /api/assignments/:id/submit - student should submit assignment', async () => {
    const response = await request(app)
      .post(`/api/assignments/${assignmentId}/submit`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({
        content: 'This is my submission content',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.assignment_id).toBe(assignmentId);
    expect(response.body.student_id).toBe(studentId);
    expect(response.body.status).toBe('submitted');

    submissionId = response.body.id;
  });

  test('POST /api/assignments/:id/submit - should fail without auth', async () => {
    const response = await request(app)
      .post(`/api/assignments/${assignmentId}/submit`)
      .send({ content: 'Test' })
      .expect(401);

    expect(response.body.error).toBe('Missing authorization header');
  });
});

describe('Assignments API - Grade Assignment', () => {
  test('POST /api/assignments/:id/grade - teacher should grade submission', async () => {
    const response = await request(app)
      .post(`/api/assignments/${submissionId}/grade`)
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send({
        grade: 95,
        feedback: 'Great work!',
      })
      .expect(200);

    expect(response.body.grade).toBe(95);
    expect(response.body.feedback).toBe('Great work!');
    expect(response.body.status).toBe('graded');
  });

  test('POST /api/assignments/:id/grade - student should not grade', async () => {
    const response = await request(app)
      .post(`/api/assignments/${submissionId}/grade`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({
        grade: 100,
        feedback: 'I deserve an A!',
      })
      .expect(403);

    expect(response.body.error).toBe('Insufficient permissions');
  });
});

export { assignmentId, courseId };
