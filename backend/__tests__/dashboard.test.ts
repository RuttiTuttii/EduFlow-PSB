/**
 * Dashboard API Tests
 * Tests for dashboard endpoints: stats, enrolled courses, activity, calendar, achievements
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
const studentUser = generateTestUser('dashstudent');
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
  db.prepare('DELETE FROM user_activity WHERE user_id = ?').run(studentId);
  db.prepare('DELETE FROM calendar_events WHERE user_id = ?').run(studentId);
  if (courseId) {
    db.prepare('DELETE FROM enrollments WHERE course_id = ?').run(courseId);
    db.prepare('DELETE FROM courses WHERE id = ?').run(courseId);
  }
  await cleanupTestData([studentUser.email, teacherUser.email]);
});

describe('Dashboard API - Student Stats', () => {
  test('GET /api/dashboard/stats/student - should return student stats', async () => {
    const response = await request(app)
      .get('/api/dashboard/stats/student')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('coursesCompleted');
    expect(response.body).toHaveProperty('currentCourses');
    expect(response.body).toHaveProperty('totalHours');
    expect(response.body).toHaveProperty('averageProgress');

    expect(typeof response.body.coursesCompleted).toBe('number');
    expect(typeof response.body.currentCourses).toBe('number');
    expect(response.body.currentCourses).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/dashboard/stats/student - should fail without auth', async () => {
    const response = await request(app)
      .get('/api/dashboard/stats/student')
      .expect(401);

    expect(response.body.error).toBe('Missing authorization header');
  });
});

describe('Dashboard API - Teacher Stats', () => {
  test('GET /api/dashboard/stats/teacher - should return teacher stats', async () => {
    const response = await request(app)
      .get('/api/dashboard/stats/teacher')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('totalStudents');
    expect(response.body).toHaveProperty('activeCourses');
    expect(response.body).toHaveProperty('pendingSubmissions');
    expect(response.body).toHaveProperty('gradedSubmissions');

    expect(typeof response.body.totalStudents).toBe('number');
    expect(response.body.activeCourses).toBeGreaterThanOrEqual(1);
  });
});

describe('Dashboard API - Enrolled Courses', () => {
  test('GET /api/dashboard/courses/enrolled - should return enrolled courses', async () => {
    const response = await request(app)
      .get('/api/dashboard/courses/enrolled')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);

    const enrolledCourse = response.body[0];
    expect(enrolledCourse).toHaveProperty('id');
    expect(enrolledCourse).toHaveProperty('title');
    expect(enrolledCourse).toHaveProperty('progress');
    expect(enrolledCourse).toHaveProperty('teacher_name');
  });
});

describe('Dashboard API - Teaching Courses', () => {
  test('GET /api/dashboard/courses/teaching - should return teaching courses', async () => {
    const response = await request(app)
      .get('/api/dashboard/courses/teaching')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);

    const teachingCourse = response.body[0];
    expect(teachingCourse).toHaveProperty('id');
    expect(teachingCourse).toHaveProperty('title');
    expect(teachingCourse).toHaveProperty('students_count');
  });
});

describe('Dashboard API - Weekly Activity', () => {
  test('GET /api/dashboard/activity/weekly - should return weekly activity', async () => {
    const response = await request(app)
      .get('/api/dashboard/activity/weekly')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('weekData');
    expect(response.body).toHaveProperty('totalHours');
    expect(response.body).toHaveProperty('totalLessons');
    expect(response.body).toHaveProperty('totalAssignments');

    expect(Array.isArray(response.body.weekData)).toBe(true);
    expect(response.body.weekData.length).toBe(7);

    const dayData = response.body.weekData[0];
    expect(dayData).toHaveProperty('day');
    expect(dayData).toHaveProperty('date');
    expect(dayData).toHaveProperty('hours');
    expect(dayData).toHaveProperty('completed');
  });
});

describe('Dashboard API - Activity Logging', () => {
  test('POST /api/dashboard/activity/log - should log activity', async () => {
    const response = await request(app)
      .post('/api/dashboard/activity/log')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({
        hours_spent: 1.5,
        lessons_completed: 2,
        assignments_completed: 1,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  test('POST /api/dashboard/activity/log - should accumulate activity', async () => {
    // Log more activity
    await request(app)
      .post('/api/dashboard/activity/log')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({
        hours_spent: 0.5,
        lessons_completed: 1,
      })
      .expect(200);

    // Check updated stats
    const response = await request(app)
      .get('/api/dashboard/activity/weekly')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body.totalHours).toBeGreaterThanOrEqual(2);
    expect(response.body.totalLessons).toBeGreaterThanOrEqual(3);
  });
});

describe('Dashboard API - Calendar Events', () => {
  let eventId: number;

  test('POST /api/dashboard/calendar/events - should create calendar event', async () => {
    const eventData = {
      title: 'Study Session',
      description: 'Review course materials',
      event_date: new Date().toISOString().split('T')[0],
      event_time: '14:00',
      type: 'study',
    };

    const response = await request(app)
      .post('/api/dashboard/calendar/events')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send(eventData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(eventData.title);
    expect(response.body.type).toBe('study');

    eventId = response.body.id;
  });

  test('GET /api/dashboard/calendar/events - should return calendar events', async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const response = await request(app)
      .get(`/api/dashboard/calendar/events?month=${month}&year=${year}`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const event = response.body.find((e: any) => e.id === eventId);
    expect(event).toBeDefined();
  });

  afterAll(async () => {
    if (eventId) {
      const db = getDb();
      db.prepare('DELETE FROM calendar_events WHERE id = ?').run(eventId);
    }
  });
});

describe('Dashboard API - Achievements', () => {
  test('GET /api/dashboard/achievements - should return achievements', async () => {
    const response = await request(app)
      .get('/api/dashboard/achievements')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    
    if (response.body.length > 0) {
      const achievement = response.body[0];
      expect(achievement).toHaveProperty('id');
      expect(achievement).toHaveProperty('type');
      expect(achievement).toHaveProperty('title');
      expect(achievement).toHaveProperty('description');
      expect(achievement).toHaveProperty('progress');
      expect(achievement).toHaveProperty('unlocked');
    }
  });

  test('GET /api/dashboard/achievements - should calculate progress', async () => {
    const response = await request(app)
      .get('/api/dashboard/achievements')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    // After logging some activity, some achievements should have progress
    response.body.forEach((achievement: any) => {
      expect(typeof achievement.progress).toBe('number');
      expect(achievement.progress).toBeGreaterThanOrEqual(0);
      expect(achievement.progress).toBeLessThanOrEqual(100);
    });
  });
});

export { studentAuthToken, teacherAuthToken };
