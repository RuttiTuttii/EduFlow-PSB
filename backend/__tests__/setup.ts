/**
 * Test Setup - Configures the test environment
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import { initDb, getDb } from '../src/db';
import authRouter from '../src/routes/auth';
import coursesRouter from '../src/routes/courses';
import assignmentsRouter from '../src/routes/assignments';
import examsRouter from '../src/routes/exams';
import messagesRouter from '../src/routes/messages';
import dashboardRouter from '../src/routes/dashboard';
import aiRouter from '../src/routes/ai';

// Create test app
export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  
  // Routes
  app.use('/api/auth', authRouter);
  app.use('/api/courses', coursesRouter);
  app.use('/api/assignments', assignmentsRouter);
  app.use('/api/exams', examsRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/ai', aiRouter);
  
  return app;
}

// Test data generators
export function generateTestUser(prefix: string = 'test') {
  const timestamp = Date.now();
  return {
    email: `${prefix}${timestamp}@example.com`,
    password: 'password123',
    name: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} User ${timestamp}`,
  };
}

export function generateTestTeacher() {
  const timestamp = Date.now();
  return {
    email: `teacher${timestamp}@example.com`,
    password: 'password123',
    name: `Teacher ${timestamp}`,
    role: 'teacher',
  };
}

export function generateTestCourse() {
  const timestamp = Date.now();
  return {
    title: `Test Course ${timestamp}`,
    description: `Description for test course ${timestamp}`,
    level: 'beginner',
  };
}

// Cleanup functions
export async function cleanupTestData(emails: string[]) {
  const db = getDb();
  for (const email of emails) {
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
    if (user) {
      // Delete user's related data
      db.prepare('DELETE FROM enrollments WHERE student_id = ?').run(user.id);
      db.prepare('DELETE FROM submissions WHERE student_id = ?').run(user.id);
      db.prepare('DELETE FROM exam_attempts WHERE student_id = ?').run(user.id);
      db.prepare('DELETE FROM messages WHERE sender_id = ? OR recipient_id = ?').run(user.id, user.id);
      db.prepare('DELETE FROM notifications WHERE user_id = ?').run(user.id);
      db.prepare('DELETE FROM user_activity WHERE user_id = ?').run(user.id);
      db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(user.id);
      db.prepare('DELETE FROM courses WHERE teacher_id = ?').run(user.id);
      db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
    }
  }
}

// Initialize DB for tests
export async function setupTestDb() {
  await initDb();
}

// Export test utilities
export { initDb, getDb };
