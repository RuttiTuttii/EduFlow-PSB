import request from 'supertest';
import express from 'express';
import authRouter from '../src/routes/auth';
import { initDb, getDb } from '../src/db';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

// Test data
const testUser = {
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  name: 'Test User'
};

let authToken: string;
let refreshToken: string;

beforeAll(async () => {
  // Initialize database
  await initDb();
});

afterAll(async () => {
  // Clean up test data
  const db = getDb();
  await new Promise((resolve) => {
    db.run('DELETE FROM users WHERE email = ?', [testUser.email], () => {
      db.close();
      resolve(null);
    });
  });
});

describe('Auth API', () => {
  test('POST /api/auth/register - should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('authToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user.email).toBe(testUser.email);
    expect(response.body.user.name).toBe(testUser.name);
    expect(response.body.user.role).toBe('student');

    authToken = response.body.authToken;
    refreshToken = response.body.refreshToken;
  });

  test('POST /api/auth/register - should fail with duplicate email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(409);

    expect(response.body.error).toBe('Email already exists');
  });

  test('POST /api/auth/login - should login existing user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('authToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user.email).toBe(testUser.email);
  });

  test('POST /api/auth/login - should fail with wrong password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      })
      .expect(401);

    expect(response.body.error).toBe('Invalid credentials');
  });

  test('POST /api/auth/login - should fail with non-existent email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      })
      .expect(401);

    expect(response.body.error).toBe('Invalid credentials');
  });

  test('POST /api/auth/refresh - should refresh tokens', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(response.body).toHaveProperty('authToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  test('POST /api/auth/refresh - should fail with invalid refresh token', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token' })
      .expect(401);

    expect(response.body.error).toBe('Invalid refresh token');
  });
});