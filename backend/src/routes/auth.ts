import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db.js';
import { generateTokens, verifyRefreshToken } from '../auth.js';
import crypto from 'crypto';

const router = Router();

// Cookie options for refresh token
const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
};

// Save refresh token to DB
function saveRefreshToken(userId: number, token: string) {
  const db = getDb();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  // Delete old tokens for this user
  db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?').run(userId);
  
  // Save new token
  db.prepare(`
    INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)
  `).run(userId, token, expiresAt);
}

// Verify refresh token from DB
function verifyDbRefreshToken(token: string): any {
  const db = getDb();
  const record = db.prepare(`
    SELECT rt.*, u.email, u.role 
    FROM refresh_tokens rt
    JOIN users u ON u.id = rt.user_id
    WHERE rt.token = ? AND rt.expires_at > datetime('now')
  `).get(token) as any;
  
  if (!record) return null;
  
  return { id: record.user_id, email: record.email, role: record.role };
}

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
      
      console.log(`✅ User created with ID: ${userId}`);

      const user = db.prepare(
        'SELECT id, email, name, role FROM users WHERE id = ?'
      ).get(userId);

      if (!user) {
        console.error('❌ User not found after insert, userId:', userId);
        return res.status(500).json({ error: 'Failed to create user' });
      }
      
      console.log('✅ User fetched:', user);

      const tokens = generateTokens({
        id: (user as any).id,
        email: (user as any).email,
        role: (user as any).role,
      });

      // Save refresh token to DB and set cookie
      saveRefreshToken(Number(userId), tokens.refreshToken);
      res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      // Check for pending invitations for this email
      const invitations = db.prepare(`
        SELECT id FROM course_invitations 
        WHERE student_email = ? AND student_id IS NULL AND status = 'pending'
      `).all(email) as any[];
      
      if (invitations.length > 0) {
        db.prepare(`
          UPDATE course_invitations SET student_id = ? WHERE student_email = ? AND student_id IS NULL
        `).run(userId, email);
      }

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

    // Save refresh token to DB and set cookie
    saveRefreshToken((user as any).id, tokens.refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

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
    // Try to get refresh token from cookie first, then from body
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Missing refresh token' });
    }

    // Verify from DB first
    let payload = verifyDbRefreshToken(refreshToken);
    
    // Fallback to JWT verification
    if (!payload) {
      payload = verifyRefreshToken(refreshToken);
    }
    
    if (!payload) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokens = generateTokens(payload);
    
    // Save new refresh token
    saveRefreshToken(payload.id, tokens.refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.json(tokens);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Logout - clear refresh token
router.post('/logout', (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
    if (refreshToken) {
      const db = getDb();
      db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
    }
    
    res.clearCookie('refreshToken');
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user from token
router.get('/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    const { verifyAccessToken } = require('../auth.js');
    const payload = verifyAccessToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const db = getDb();
    const user = db.prepare('SELECT id, email, name, role, avatar FROM users WHERE id = ?').get(payload.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
