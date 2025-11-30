/**
 * Messages API Tests
 * Tests for messaging endpoints: conversations, messages, notifications, invitations
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
const studentUser = generateTestUser('msgstudent');
const teacherUser = generateTestTeacher();
const testCourse = generateTestCourse();

let studentAuthToken: string;
let teacherAuthToken: string;
let studentId: number;
let teacherId: number;
let courseId: number;
let conversationId: number;
let messageId: number;
let notificationId: number;
let invitationId: number;

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
  if (messageId) {
    db.prepare('DELETE FROM messages WHERE id = ?').run(messageId);
  }
  if (conversationId) {
    db.prepare('DELETE FROM conversations WHERE id = ?').run(conversationId);
  }
  if (notificationId) {
    db.prepare('DELETE FROM notifications WHERE id = ?').run(notificationId);
  }
  if (invitationId) {
    db.prepare('DELETE FROM course_invitations WHERE id = ?').run(invitationId);
  }
  if (courseId) {
    db.prepare('DELETE FROM enrollments WHERE course_id = ?').run(courseId);
    db.prepare('DELETE FROM courses WHERE id = ?').run(courseId);
  }
  await cleanupTestData([studentUser.email, teacherUser.email]);
});

describe('Messages API - Conversations', () => {
  test('POST /api/messages/conversations - should create conversation', async () => {
    const response = await request(app)
      .post('/api/messages/conversations')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({ user_id: teacherId })
      .expect(201);

    expect(response.body).toHaveProperty('conversation_id');
    expect(response.body.created).toBe(true);

    conversationId = response.body.conversation_id;
  });

  test('POST /api/messages/conversations - should return existing conversation', async () => {
    const response = await request(app)
      .post('/api/messages/conversations')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({ user_id: teacherId })
      .expect(200);

    expect(response.body.conversation_id).toBe(conversationId);
    expect(response.body.created).toBe(false);
  });

  test('POST /api/messages/conversations - should fail with self conversation', async () => {
    const response = await request(app)
      .post('/api/messages/conversations')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({ user_id: studentId })
      .expect(400);

    expect(response.body.error).toBe('Invalid user_id');
  });

  test('GET /api/messages/conversations - should return conversations', async () => {
    const response = await request(app)
      .get('/api/messages/conversations')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/messages/available-users - should return available users', async () => {
    const response = await request(app)
      .get('/api/messages/available-users')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('Messages API - Send/Receive Messages', () => {
  test('POST /api/messages/send - should send message', async () => {
    const response = await request(app)
      .post('/api/messages/send')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({
        recipient_id: teacherId,
        content: 'Hello teacher!',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.sender_id).toBe(studentId);
    expect(response.body.recipient_id).toBe(teacherId);
    expect(response.body.content).toBe('Hello teacher!');

    messageId = response.body.id;
  });

  test('POST /api/messages/send - should fail with missing fields', async () => {
    const response = await request(app)
      .post('/api/messages/send')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({ content: 'Test' })
      .expect(400);

    expect(response.body.error).toBe('Missing required fields');
  });

  test('GET /api/messages/user/:userId - should return messages', async () => {
    const response = await request(app)
      .get(`/api/messages/user/${teacherId}`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const message = response.body.find((m: any) => m.id === messageId);
    expect(message).toBeDefined();
    expect(message.content).toBe('Hello teacher!');
  });

  test('GET /api/messages/unread - should return unread count', async () => {
    const response = await request(app)
      .get('/api/messages/unread')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('unreadCount');
    expect(typeof response.body.unreadCount).toBe('number');
  });

  test('DELETE /api/messages/:id - should soft delete message', async () => {
    const response = await request(app)
      .delete(`/api/messages/${messageId}`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  test('DELETE /api/messages/:id - should fail for non-existent message', async () => {
    const response = await request(app)
      .delete('/api/messages/99999')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(404);

    expect(response.body.error).toBe('Message not found');
  });
});

describe('Messages API - Notifications', () => {
  beforeAll(async () => {
    // Create a notification directly in DB for testing
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (?, 'test', 'Test Notification', 'Test message')
    `).run(studentId);
    notificationId = Number(result.lastInsertRowid);
  });

  test('GET /api/messages/notifications - should return notifications', async () => {
    const response = await request(app)
      .get('/api/messages/notifications')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const notification = response.body.find((n: any) => n.id === notificationId);
    expect(notification).toBeDefined();
  });

  test('GET /api/messages/notifications/unread - should return unread count', async () => {
    const response = await request(app)
      .get('/api/messages/notifications/unread')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('unreadCount');
    expect(response.body.unreadCount).toBeGreaterThanOrEqual(1);
  });

  test('PUT /api/messages/notifications/:id/read - should mark notification as read', async () => {
    const response = await request(app)
      .put(`/api/messages/notifications/${notificationId}/read`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  test('PUT /api/messages/notifications/read-all - should mark all as read', async () => {
    const response = await request(app)
      .put('/api/messages/notifications/read-all')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  test('DELETE /api/messages/notifications/:id - should delete notification', async () => {
    const response = await request(app)
      .delete(`/api/messages/notifications/${notificationId}`)
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});

describe('Messages API - Course Invitations', () => {
  let newStudent: any;
  let newStudentToken: string;

  beforeAll(async () => {
    // Create another course for invitation tests
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send(generateTestCourse());
    
    // Create new student for invitation
    newStudent = generateTestUser('invitestudent');
    const studentRes = await request(app)
      .post('/api/auth/register')
      .send(newStudent);
    newStudentToken = studentRes.body.authToken;
  });

  afterAll(async () => {
    await cleanupTestData([newStudent.email]);
  });

  test('POST /api/messages/invitations/invite - teacher should invite student', async () => {
    const response = await request(app)
      .post('/api/messages/invitations/invite')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send({
        course_id: courseId,
        student_email: newStudent.email,
        message: 'Join my course!',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    invitationId = response.body.id;
  });

  test('POST /api/messages/invitations/invite - should fail for already enrolled student', async () => {
    const response = await request(app)
      .post('/api/messages/invitations/invite')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send({
        course_id: courseId,
        student_email: studentUser.email,
      })
      .expect(400);

    expect(response.body.error).toBe('Student is already enrolled in this course');
  });

  test('POST /api/messages/invitations/invite - student should not invite', async () => {
    const response = await request(app)
      .post('/api/messages/invitations/invite')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({
        course_id: courseId,
        student_email: 'test@test.com',
      })
      .expect(403);

    expect(response.body.error).toBe('Only teachers can invite students');
  });

  test('POST /api/messages/invitations/request - student should request to join', async () => {
    // Create a new course that student is not enrolled in
    const newCourse = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherAuthToken}`)
      .send(generateTestCourse());

    const response = await request(app)
      .post('/api/messages/invitations/request')
      .set('Authorization', `Bearer ${newStudentToken}`)
      .send({
        course_id: newCourse.body.id,
        message: 'Please let me join!',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.message).toBe('Request sent');

    // Cleanup
    const db = getDb();
    db.prepare('DELETE FROM course_invitations WHERE id = ?').run(response.body.id);
    db.prepare('DELETE FROM courses WHERE id = ?').run(newCourse.body.id);
  });

  test('POST /api/messages/invitations/request - should fail for already enrolled', async () => {
    const response = await request(app)
      .post('/api/messages/invitations/request')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .send({ course_id: courseId })
      .expect(400);

    expect(response.body.error).toBe('You are already enrolled in this course');
  });
});

export { conversationId, messageId };
