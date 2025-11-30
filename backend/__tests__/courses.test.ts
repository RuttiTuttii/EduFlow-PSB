/**
 * Courses API Tests
 * Tests for course endpoints: list, get, create, update, delete, enroll
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
const studentUser = generateTestUser('coursestudent');
const teacherUser = generateTestTeacher();
const testCourse = generateTestCourse();

let studentAuthToken: string;
let teacherAuthToken: string;
let studentId: number;
let teacherId: number;
let courseId: number;

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
});

afterAll(async () => {
  const db = getDb();
  // Clean up courses created during tests
  if (courseId) {
    db.prepare('DELETE FROM enrollments WHERE course_id = ?').run(courseId);
    db.prepare('DELETE FROM lessons WHERE course_id = ?').run(courseId);
    db.prepare('DELETE FROM assignments WHERE course_id = ?').run(courseId);
    db.prepare('DELETE FROM courses WHERE id = ?').run(courseId);
  }
  await cleanupTestData([studentUser.email, teacherUser.email]);
});

describe('Courses API - Create Course', () => {
  test('POST /api/courses - teacher should create course', async () => {
    const response = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send(testCourse)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(testCourse.title);
    expect(response.body.description).toBe(testCourse.description);
    expect(response.body.level).toBe(testCourse.level);
    expect(response.body.teacher_id).toBe(teacherId);

    courseId = response.body.id;
  });

  test('POST /api/courses - student should not create course', async () => {
    const response = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send(testCourse)
      .expect(403);

    expect(response.body.error).toBe('Insufficient permissions');
  });

  test('POST /api/courses - should fail without auth', async () => {
    const response = await request(app)
      .post('/api/courses')
      .send(testCourse)
      .expect(401);

    expect(response.body.error).toBe('Missing authorization header');
  });
});

describe('Courses API - Get Courses', () => {
  test('GET /api/courses - should return all courses', async () => {
    const response = await request(app)
      .get('/api/courses')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const createdCourse = response.body.find((c: any) => c.id === courseId);
    expect(createdCourse).toBeDefined();
    expect(createdCourse.teacher_name).toBeDefined();
  });

  test('GET /api/courses/:id - should return course with lessons', async () => {
    const response = await request(app)
      .get(`/api/courses/${courseId}`)
      .expect(200);

    expect(response.body.id).toBe(courseId);
    expect(response.body.title).toBe(testCourse.title);
    expect(response.body).toHaveProperty('lessons');
    expect(response.body).toHaveProperty('assignments');
    expect(Array.isArray(response.body.lessons)).toBe(true);
  });

  test('GET /api/courses/:id - should return 404 for non-existent course', async () => {
    const response = await request(app)
      .get('/api/courses/99999')
      .expect(404);

    expect(response.body.error).toBe('Course not found');
  });
});

describe('Courses API - Update Course', () => {
  test('PUT /api/courses/:id - teacher should update own course', async () => {
    const updatedData = {
      title: 'Updated Course Title',
      description: 'Updated description',
      level: 'intermediate',
    };

    const response = await request(app)
      .put(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.title).toBe(updatedData.title);
    expect(response.body.description).toBe(updatedData.description);
    expect(response.body.level).toBe(updatedData.level);
  });

  test('PUT /api/courses/:id - should fail for non-owner teacher', async () => {
    // Create another teacher
    const anotherTeacher = generateTestTeacher();
    const anotherRes = await request(app)
      .post('/api/auth/register')
      .send(anotherTeacher);
    const anotherToken = anotherRes.body.authToken;

    const response = await request(app)
      .put(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${anotherToken}`)
      .send({ title: 'Hacked' })
      .expect(403);

    expect(response.body.error).toBe('Unauthorized');

    // Cleanup
    await cleanupTestData([anotherTeacher.email]);
  });

  test('PUT /api/courses/:id - student should not update course', async () => {
    const response = await request(app)
      .put(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({ title: 'Hacked' })
      .expect(403);

    expect(response.body.error).toBe('Insufficient permissions');
  });

  test('PUT /api/courses/:id - should return 404 for non-existent course', async () => {
    const response = await request(app)
      .put('/api/courses/99999')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send({ title: 'Test' })
      .expect(404);

    expect(response.body.error).toBe('Course not found');
  });
});

describe('Courses API - Enrollment', () => {
  test('POST /api/courses/:id/enroll - student should enroll in course', async () => {
    const response = await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body.message).toBe('Enrolled successfully');
  });

  test('POST /api/courses/:id/enroll - should fail on duplicate enrollment', async () => {
    const response = await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(409);

    expect(response.body.error).toBe('Already enrolled');
  });

  test('POST /api/courses/:id/enroll - should fail for non-existent course', async () => {
    const response = await request(app)
      .post('/api/courses/99999/enroll')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(404);

    expect(response.body.error).toBe('Course not found');
  });

  test('POST /api/courses/:id/enroll - should fail without auth', async () => {
    const response = await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .expect(401);

    expect(response.body.error).toBe('Missing authorization header');
  });
});

describe('Courses API - Delete Course', () => {
  let courseToDelete: number;

  beforeAll(async () => {
    // Create a course to delete
    const response = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send(generateTestCourse());
    courseToDelete = response.body.id;
  });

  test('DELETE /api/courses/:id - student should not delete course', async () => {
    const response = await request(app)
      .delete(`/api/courses/${courseToDelete}`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(403);

    expect(response.body.error).toBe('Insufficient permissions');
  });

  test('DELETE /api/courses/:id - should return 404 for non-existent course', async () => {
    const response = await request(app)
      .delete('/api/courses/99999')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .expect(404);

    expect(response.body.error).toBe('Course not found');
  });

  test('DELETE /api/courses/:id - teacher should delete own course', async () => {
    const response = await request(app)
      .delete(`/api/courses/${courseToDelete}`)
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .expect(200);

    expect(response.body.message).toBe('Course deleted');
  });
});

export { courseId, teacherAuthToken, studentAuthToken };
