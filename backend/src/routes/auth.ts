import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';
import { generateTokens, verifyRefreshToken } from '../auth.js';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role = 'student' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDb();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const stmt = db.prepare(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)'
      );
      const info = stmt.run(email, hashedPassword, name, role);
      const userId = info.lastInsertRowid;

      const user = db.prepare(
        'SELECT id, email, name, role FROM users WHERE id = ?'
      ).get(userId);

      const tokens = generateTokens({
        id: (user as any).id,
        email: (user as any).email,
        role: (user as any).role,
      });

      res.json({
        user,
        ...tokens,
      });
    } catch (err: any) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const db = getDb();
    const user = db.prepare(
      'SELECT id, email, password, name, role FROM users WHERE email = ?'
    ).get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, (user as any).password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = generateTokens({
      id: (user as any).id,
      email: (user as any).email,
      role: (user as any).role,
    });

    res.json({
      user: {
        id: (user as any).id,
        email: (user as any).email,
        name: (user as any).name,
        role: (user as any).role,
      },
      ...tokens,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/refresh', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Missing refresh token' });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokens = generateTokens(payload);
    res.json(tokens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

export default router;
