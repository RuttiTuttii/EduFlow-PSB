import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../auth.js';

const router = Router();

// Get conversations (distinct users)
router.get('/conversations', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    
    const conversations = db
      .prepare(
        `SELECT DISTINCT 
          CASE 
            WHEN sender_id = ? THEN recipient_id 
            ELSE sender_id 
          END as user_id,
          u.name, u.email, u.avatar
        FROM messages m
        JOIN users u ON (
          CASE 
            WHEN m.sender_id = ? THEN u.id = m.recipient_id
            ELSE u.id = m.sender_id
          END
        )
        WHERE m.sender_id = ? OR m.recipient_id = ?`
      )
      .all(req.user!.id, req.user!.id, req.user!.id, req.user!.id);

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages with a specific user
router.get('/user/:userId', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    
    const messages = db
      .prepare(
        `SELECT * FROM messages 
         WHERE (sender_id = ? AND recipient_id = ?) 
            OR (sender_id = ? AND recipient_id = ?)
         ORDER BY created_at`
      )
      .all(
        req.user!.id,
        req.params.userId,
        req.params.userId,
        req.user!.id
      );

    // Mark as read
    db.prepare(
      'UPDATE messages SET read = 1 WHERE recipient_id = ? AND sender_id = ?'
    ).run(req.user!.id, req.params.userId);

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/send', authMiddleware, (req: Request, res: Response) => {
  try {
    const { recipient_id, content } = req.body;
    const db = getDb();

    if (!recipient_id || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stmt = db.prepare(
      'INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)'
    );
    const info = stmt.run(req.user!.id, recipient_id, content);

    const message = db
      .prepare('SELECT * FROM messages WHERE id = ?')
      .get(info.lastInsertRowid);

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get unread count
router.get('/unread', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    
    const result = db
      .prepare('SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND read = 0')
      .get(req.user!.id);

    res.json({ unreadCount: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

export default router;
