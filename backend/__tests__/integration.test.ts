/**
 * Integration Tests
 * End-to-end tests for complete user workflows
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
const student = generateTestUser('integration_student');
const teacher = generateTestTeacher();

let studentToken: string;
let teacherToken: string;
let studentId: number;
let teacherId: number;
let courseId: number;
let assignmentId: number;
let examId: number;
let questionId: number;

beforeAll(async () => {
  await setupTestDb();
});

afterAll(async () => {
  const db = getDb();
  // Full cleanup
  if (questionId) {
    db.prepare('DELETE FROM exam_questions WHERE id = ?').run(questionId);
  }
  if (examId) {
    db.prepare('DELETE FROM exam_attempts WHERE exam_id = ?').run(examId);
    db.prepare('DELETE FROM exams WHERE id = ?').run(examId);
  }
  if (assignmentId) {
    db.prepare('DELETE FROM submissions WHERE assignment_id = ?').run(assignmentId);
    db.prepare('DELETE FROM assignments WHERE id = ?').run(assignmentId);
  }
  if (courseId) {
    db.prepare('DELETE FROM enrollments WHERE course_id = ?').run(courseId);
    db.prepare('DELETE FROM lessons WHERE course_id = ?').run(courseId);
    db.prepare('DELETE FROM courses WHERE id = ?').run(courseId);
  }
  await cleanupTestData([student.email, teacher.email]);
});

describe('Integration: Complete Course Workflow', () => {
  
  // Step 1: User Registration
  describe('Step 1: User Registration', () => {
    test('Teacher can register', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(teacher)
        .expect(200);

      expect(res.body.user.role).toBe('teacher');
      teacherToken = res.body.authToken;
      teacherId = res.body.user.id;
    });

    test('Student can register', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(student)
        .expect(200);

      expect(res.body.user.role).toBe('student');
      studentToken = res.body.authToken;
      studentId = res.body.user.id;
    });
  });

  // Step 2: Course Creation
  describe('Step 2: Course Creation', () => {
    test('Teacher creates a course', async () => {
      const courseData = generateTestCourse();
      
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(courseData)
        .expect(201);

      expect(res.body.teacher_id).toBe(teacherId);
      courseId = res.body.id;
    });

    test('Course appears in listing', async () => {
      const res = await request(app)
        .get('/api/courses')
        .expect(200);

      const course = res.body.find((c: any) => c.id === courseId);
      expect(course).toBeDefined();
    });
  });

  // Step 3: Student Enrollment
  describe('Step 3: Student Enrollment', () => {
    test('Student enrolls in course', async () => {
      const res = await request(app)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.message).toBe('Enrolled successfully');
    });

    test('Student sees course in enrolled courses', async () => {
      const res = await request(app)
        .get('/api/dashboard/courses/enrolled')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      const enrolled = res.body.find((c: any) => c.id === courseId);
      expect(enrolled).toBeDefined();
      expect(enrolled.progress).toBe(0);
    });

    test('Teacher sees student in stats', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats/teacher')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body.totalStudents).toBeGreaterThanOrEqual(1);
    });
  });

  // Step 4: Assignment Creation and Submission
  describe('Step 4: Assignments', () => {
    test('Teacher creates assignment', async () => {
      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          course_id: courseId,
          title: 'Integration Test Assignment',
          description: 'Complete this assignment',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .expect(201);

      assignmentId = res.body.id;
    });

    test('Student sees assignment in course', async () => {
      const res = await request(app)
        .get(`/api/assignments/course/${courseId}`)
        .expect(200);

      const assignment = res.body.find((a: any) => a.id === assignmentId);
      expect(assignment).toBeDefined();
    });

    test('Student submits assignment', async () => {
      const res = await request(app)
        .post(`/api/assignments/${assignmentId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ content: 'My submission content' })
        .expect(201);

      expect(res.body.status).toBe('submitted');
    });

    test('Teacher grades submission', async () => {
      // Get submission ID
      const db = getDb();
      const submission = db.prepare(
        'SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?'
      ).get(assignmentId, studentId) as any;

      const res = await request(app)
        .post(`/api/assignments/${submission.id}/grade`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ grade: 90, feedback: 'Good work!' })
        .expect(200);

      expect(res.body.grade).toBe(90);
      expect(res.body.status).toBe('graded');
    });
  });

  // Step 5: Exam Creation and Taking
  describe('Step 5: Exams', () => {
    test('Teacher creates exam', async () => {
      const res = await request(app)
        .post('/api/exams')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          course_id: courseId,
          title: 'Integration Test Exam',
          description: 'Final exam',
          duration: 60,
          total_points: 100,
        })
        .expect(201);

      examId = res.body.id;
    });

    test('Teacher adds question to exam', async () => {
      const res = await request(app)
        .post(`/api/exams/${examId}/questions`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          question: 'What is 2+2?',
          type: 'multiple_choice',
          options: ['1', '2', '3', '4'],
          correct_answer: '4',
          points: 10,
        })
        .expect(201);

      questionId = res.body.id;
    });

    test('Student starts exam', async () => {
      const res = await request(app)
        .post(`/api/exams/${examId}/start`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      expect(res.body.exam_id).toBe(examId);
    });

    test('Student submits exam', async () => {
      // Get attempt ID
      const db = getDb();
      const attempt = db.prepare(
        'SELECT id FROM exam_attempts WHERE exam_id = ? AND student_id = ?'
      ).get(examId, studentId) as any;

      const res = await request(app)
        .post(`/api/exams/${attempt.id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers: { [questionId]: '4' } })
        .expect(200);

      expect(res.body.score).toBe(10); // Correct answer
    });
  });

  // Step 6: Messaging
  describe('Step 6: Messaging', () => {
    test('Student creates conversation with teacher', async () => {
      const res = await request(app)
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ user_id: teacherId })
        .expect(201);

      expect(res.body.created).toBe(true);
    });

    test('Student sends message to teacher', async () => {
      const res = await request(app)
        .post('/api/messages/send')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          recipient_id: teacherId,
          content: 'Hello teacher, I have a question!',
        })
        .expect(201);

      expect(res.body.sender_id).toBe(studentId);
      expect(res.body.recipient_id).toBe(teacherId);
    });

    test('Teacher receives notification', async () => {
      const res = await request(app)
        .get('/api/messages/notifications/unread')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body.unreadCount).toBeGreaterThanOrEqual(1);
    });
  });

  // Step 7: Dashboard Stats
  describe('Step 7: Dashboard Verification', () => {
    test('Student stats reflect activity', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats/student')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.currentCourses).toBeGreaterThanOrEqual(1);
    });

    test('Teacher stats reflect activity', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats/teacher')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(res.body.activeCourses).toBeGreaterThanOrEqual(1);
      expect(res.body.gradedSubmissions).toBeGreaterThanOrEqual(1);
    });
  });

  // Step 8: Cleanup and Logout
  describe('Step 8: Session Management', () => {
    test('Student can logout', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', `refreshToken=dummy`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    test('Teacher can logout', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});

describe('Integration: Error Handling', () => {
  test('Invalid endpoints return 404', async () => {
    await request(app)
      .get('/api/invalid-endpoint')
      .expect(404);
  });

  test('Unauthorized access returns 401', async () => {
    await request(app)
      .get('/api/dashboard/stats/student')
      .expect(401);
  });

  test('Invalid token returns 401', async () => {
    await request(app)
      .get('/api/dashboard/stats/student')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});

describe('Integration: Role-Based Access Control', () => {
  test('Student cannot create courses', async () => {
    // Re-login student
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: student.email, password: student.password })
      .expect(200);

    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${loginRes.body.authToken}`)
      .send(generateTestCourse())
      .expect(403);

    expect(res.body.error).toBe('Insufficient permissions');
  });

  test('Student cannot grade submissions', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: student.email, password: student.password })
      .expect(200);

    const res = await request(app)
      .post('/api/assignments/1/grade')
      .set('Authorization', `Bearer ${loginRes.body.authToken}`)
      .send({ grade: 100 })
      .expect(403);

    expect(res.body.error).toBe('Insufficient permissions');
  });
});
