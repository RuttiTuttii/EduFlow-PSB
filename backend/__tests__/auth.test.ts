/**
 * Auth API Tests
 * Tests for authentication endpoints: register, login, refresh, logout, me
 */
import request from 'supertest';
import { 
  createTestApp, 
  generateTestUser, 
  generateTestTeacher,
  cleanupTestData, 
  setupTestDb 
} from './setup';

const app = createTestApp();

// Test data
const studentUser = generateTestUser('student');
const teacherUser = generateTestTeacher();
let studentAuthToken: string;
let studentRefreshToken: string;
let teacherAuthToken: string;
let teacherRefreshToken: string;

beforeAll(async () => {
  await setupTestDb();
});

afterAll(async () => {
  await cleanupTestData([studentUser.email, teacherUser.email]);
});

describe('Auth API - Registration', () => {
  test('POST /api/auth/register - should register a new student', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(studentUser)
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('authToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user.email).toBe(studentUser.email);
    expect(response.body.user.name).toBe(studentUser.name);
    expect(response.body.user.role).toBe('student');
    expect(response.body.user).not.toHaveProperty('password');

    studentAuthToken = response.body.authToken;
    studentRefreshToken = response.body.refreshToken;
  });

  test('POST /api/auth/register - should register a new teacher', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(teacherUser)
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(teacherUser.email);
    expect(response.body.user.role).toBe('teacher');

    teacherAuthToken = response.body.authToken;
    teacherRefreshToken = response.body.refreshToken;
  });

  test('POST /api/auth/register - should fail with duplicate email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(studentUser)
      .expect(409);

    expect(response.body.error).toBe('Email already exists');
  });

  test('POST /api/auth/register - should fail with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' })
      .expect(400);

    expect(response.body.error).toBe('Missing required fields');
  });

  test('POST /api/auth/register - should fail with missing email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ password: 'test123', name: 'Test' })
      .expect(400);

    expect(response.body.error).toBe('Missing required fields');
  });
});

describe('Auth API - Login', () => {
  test('POST /api/auth/login - should login existing student', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: studentUser.email,
        password: studentUser.password,
      })
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('authToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user.email).toBe(studentUser.email);

    studentAuthToken = response.body.authToken;
    studentRefreshToken = response.body.refreshToken;
  });

  test('POST /api/auth/login - should login existing teacher', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: teacherUser.email,
        password: teacherUser.password,
      })
      .expect(200);

    expect(response.body.user.role).toBe('teacher');

    teacherAuthToken = response.body.authToken;
    teacherRefreshToken = response.body.refreshToken;
  });

  test('POST /api/auth/login - should fail with wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: studentUser.email,
        password: 'wrongpassword',
      })
      .expect(401);

    expect(response.body.error).toBe('Invalid credentials');
  });

  test('POST /api/auth/login - should fail with non-existent email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      })
      .expect(401);

    expect(response.body.error).toBe('Invalid credentials');
  });

  test('POST /api/auth/login - should fail with missing credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400);

    expect(response.body.error).toBe('Missing credentials');
  });
});

describe('Auth API - Token Refresh', () => {
  test('POST /api/auth/refresh - should refresh tokens via body', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: studentRefreshToken })
      .expect(200);

    expect(response.body).toHaveProperty('authToken');
    expect(response.body).toHaveProperty('refreshToken');
    
    studentRefreshToken = response.body.refreshToken;
  });

  test('POST /api/auth/refresh - should refresh tokens via cookie', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refreshToken=${studentRefreshToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('authToken');
    expect(response.body).toHaveProperty('refreshToken');

    studentAuthToken = response.body.authToken;
    studentRefreshToken = response.body.refreshToken;
  });

  test('POST /api/auth/refresh - should fail with invalid refresh token', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token' })
      .expect(401);

    expect(response.body.error).toBe('Invalid refresh token');
  });

  test('POST /api/auth/refresh - should fail with missing refresh token', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .send({})
      .expect(400);

    expect(response.body.error).toBe('Missing refresh token');
  });
});

describe('Auth API - Get Current User', () => {
  test('GET /api/auth/me - should return current user', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentAuthToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(studentUser.email);
    expect(response.body.user).not.toHaveProperty('password');
  });

  test('GET /api/auth/me - should fail without auth header', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .expect(401);

    expect(response.body.error).toBe('Not authenticated');
  });

  test('GET /api/auth/me - should fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.error).toBe('Invalid token');
  });

  test('GET /api/auth/me - should fail with malformed header', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', studentAuthToken)
      .expect(401);

    expect(response.body.error).toBe('Not authenticated');
  });
});

describe('Auth API - Logout', () => {
  test('POST /api/auth/logout - should logout successfully', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', `refreshToken=${studentRefreshToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  test('POST /api/auth/logout - should succeed even without token', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});

// Export tokens for use in other test files
export { studentAuthToken, teacherAuthToken, studentUser, teacherUser };