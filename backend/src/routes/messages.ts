import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../auth.js';

const router = Router();

// ============ CONVERSATIONS ============

// Get all conversations with last message
router.get('/conversations', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    
    const conversations = db.prepare(`
      SELECT 
        c.id as conversation_id,
        CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END as user_id,
        u.name, u.email, u.avatar, u.role,
        m.content as last_message,
        m.created_at as last_message_time,
        m.sender_id as last_message_sender_id,
        (SELECT COUNT(*) FROM messages 
         WHERE recipient_id = ? AND sender_id = u.id AND read = 0 
         AND deleted_by_recipient = 0) as unread_count
      FROM conversations c
      JOIN users u ON (CASE WHEN c.user1_id = ? THEN u.id = c.user2_id ELSE u.id = c.user1_id END)
      LEFT JOIN messages m ON m.id = c.last_message_id
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY c.updated_at DESC
    `).all(userId, userId, userId, userId, userId);

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get total unread count
router.get('/unread/count', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    
    const result = db.prepare(`
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE recipient_id = ? AND read = 0 AND deleted_by_recipient = 0
    `).get(userId) as { count: number };

    res.json({ count: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Get or create conversation with a user
router.post('/conversations', authMiddleware, (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    const db = getDb();
    const currentUserId = req.user!.id;

    if (!user_id || user_id === currentUserId) {
      return res.status(400).json({ error: 'Invalid user_id' });
    }

    // Check if conversation exists
    const existing = db.prepare(`
      SELECT id FROM conversations 
      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
    `).get(currentUserId, user_id, user_id, currentUserId);

    if (existing) {
      return res.json({ conversation_id: (existing as any).id, created: false });
    }

    // Create new conversation
    const user1 = Math.min(currentUserId, user_id);
    const user2 = Math.max(currentUserId, user_id);
    
    const result = db.prepare(
      'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)'
    ).run(user1, user2);

    res.status(201).json({ conversation_id: result.lastInsertRowid, created: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get available users to start a conversation with
router.get('/available-users', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let users;
    if (userRole === 'teacher') {
      // Teachers can message their enrolled students
      users = db.prepare(`
        SELECT DISTINCT u.id, u.name, u.email, u.avatar, u.role
        FROM users u
        JOIN enrollments e ON e.student_id = u.id
        JOIN courses c ON c.id = e.course_id
        WHERE c.teacher_id = ? AND u.id != ?
        ORDER BY u.name
      `).all(userId, userId);
    } else {
      // Students can message teachers of their enrolled courses
      users = db.prepare(`
        SELECT DISTINCT u.id, u.name, u.email, u.avatar, u.role
        FROM users u
        JOIN courses c ON c.teacher_id = u.id
        JOIN enrollments e ON e.course_id = c.id
        WHERE e.student_id = ? AND u.id != ?
        ORDER BY u.name
      `).all(userId, userId);
    }

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch available users' });
  }
});

// ============ MESSAGES ============

// Get messages with a specific user
router.get('/user/:userId', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const currentUserId = req.user!.id;
    const otherUserId = parseInt(req.params.userId);
    
    const messages = db.prepare(`
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE ((m.sender_id = ? AND m.recipient_id = ? AND m.deleted_by_sender = 0)
          OR (m.sender_id = ? AND m.recipient_id = ? AND m.deleted_by_recipient = 0))
      ORDER BY m.created_at ASC
    `).all(currentUserId, otherUserId, otherUserId, currentUserId);

    // Mark messages as read
    db.prepare(`
      UPDATE messages SET read = 1 
      WHERE recipient_id = ? AND sender_id = ? AND read = 0
    `).run(currentUserId, otherUserId);

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
    const senderId = req.user!.id;

    if (!recipient_id || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert message
    const result = db.prepare(
      'INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)'
    ).run(senderId, recipient_id, content);

    const messageId = result.lastInsertRowid;

    // Update or create conversation
    const user1 = Math.min(senderId, recipient_id);
    const user2 = Math.max(senderId, recipient_id);
    
    db.prepare(`
      INSERT INTO conversations (user1_id, user2_id, last_message_id, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user1_id, user2_id) DO UPDATE SET
        last_message_id = excluded.last_message_id,
        updated_at = CURRENT_TIMESTAMP
    `).run(user1, user2, messageId);

    // Create notification for recipient
    const sender = db.prepare('SELECT name FROM users WHERE id = ?').get(senderId) as any;
    db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (?, 'new_message', 'Новое сообщение', ?, ?)
    `).run(recipient_id, `${sender.name}: ${content.substring(0, 50)}...`, JSON.stringify({ sender_id: senderId }));

    const message = db.prepare(`
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.id = ?
    `).get(messageId);

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Delete message
router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const messageId = parseInt(req.params.id);
    const userId = req.user!.id;

    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId) as any;
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Soft delete - mark as deleted for the user
    if (message.sender_id === userId) {
      db.prepare('UPDATE messages SET deleted_by_sender = 1 WHERE id = ?').run(messageId);
    } else if (message.recipient_id === userId) {
      db.prepare('UPDATE messages SET deleted_by_recipient = 1 WHERE id = ?').run(messageId);
    } else {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Get unread count
router.get('/unread', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    
    const result = db.prepare(`
      SELECT COUNT(*) as count FROM messages 
      WHERE recipient_id = ? AND read = 0 AND deleted_by_recipient = 0
    `).get(req.user!.id) as any;

    res.json({ unreadCount: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// ============ NOTIFICATIONS ============

// Get all notifications
router.get('/notifications', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    
    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all(req.user!.id);

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notifications count
router.get('/notifications/unread', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    
    const result = db.prepare(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ? AND read = 0
    `).get(req.user!.id) as any;

    res.json({ unreadCount: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    
    db.prepare(`
      UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.user!.id);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    
    db.prepare(`
      UPDATE notifications SET read = 1 WHERE user_id = ?
    `).run(req.user!.id);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Delete notification
router.delete('/notifications/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    
    db.prepare(`
      DELETE FROM notifications WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.user!.id);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// ============ COURSE INVITATIONS ============

// Invite student to course (by teacher)
router.post('/invitations/invite', authMiddleware, (req: Request, res: Response) => {
  try {
    const { course_id, student_email, message } = req.body;
    const db = getDb();
    const teacherId = req.user!.id;

    if (req.user!.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can invite students' });
    }

    // Check if course belongs to teacher
    const course = db.prepare('SELECT * FROM courses WHERE id = ? AND teacher_id = ?').get(course_id, teacherId) as any;
    if (!course) {
      return res.status(404).json({ error: 'Course not found or not yours' });
    }

    // Find student by email
    const student = db.prepare('SELECT id, name FROM users WHERE email = ? AND role = ?').get(student_email, 'student') as any;
    
    // Check if already enrolled
    if (student) {
      const enrolled = db.prepare('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?').get(student.id, course_id);
      if (enrolled) {
        return res.status(400).json({ error: 'Student is already enrolled in this course' });
      }
    }

    // Check for existing pending invitation
    const existing = db.prepare(`
      SELECT id FROM course_invitations 
      WHERE course_id = ? AND student_email = ? AND status = 'pending' AND type = 'invite'
    `).get(course_id, student_email);
    
    if (existing) {
      return res.status(400).json({ error: 'Invitation already sent to this student' });
    }

    // Create invitation
    const result = db.prepare(`
      INSERT INTO course_invitations (course_id, teacher_id, student_email, student_id, type, message)
      VALUES (?, ?, ?, ?, 'invite', ?)
    `).run(course_id, teacherId, student_email, student?.id || null, message || null);

    // If student exists, create notification
    if (student) {
      const teacher = db.prepare('SELECT name FROM users WHERE id = ?').get(teacherId) as any;
      db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (?, 'course_invite', 'Приглашение на курс', ?, ?)
      `).run(
        student.id, 
        `${teacher.name} приглашает вас на курс "${course.title}"`,
        JSON.stringify({ invitation_id: result.lastInsertRowid, course_id, teacher_id: teacherId })
      );
    }

    res.status(201).json({ 
      id: result.lastInsertRowid, 
      message: student ? 'Invitation sent' : 'Invitation created, student will see it when they register' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Request to join course (by student)
router.post('/invitations/request', authMiddleware, (req: Request, res: Response) => {
  try {
    const { course_id, message } = req.body;
    const db = getDb();
    const studentId = req.user!.id;

    if (req.user!.role !== 'student') {
      return res.status(403).json({ error: 'Only students can request to join courses' });
    }

    // Get course and teacher
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(course_id) as any;
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if already enrolled
    const enrolled = db.prepare('SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?').get(studentId, course_id);
    if (enrolled) {
      return res.status(400).json({ error: 'You are already enrolled in this course' });
    }

    // Check for existing pending request
    const existing = db.prepare(`
      SELECT id FROM course_invitations 
      WHERE course_id = ? AND student_id = ? AND status = 'pending' AND type = 'request'
    `).get(course_id, studentId);
    
    if (existing) {
      return res.status(400).json({ error: 'Request already pending' });
    }

    // Create request
    const student = db.prepare('SELECT email, name FROM users WHERE id = ?').get(studentId) as any;
    const result = db.prepare(`
      INSERT INTO course_invitations (course_id, teacher_id, student_email, student_id, type, message)
      VALUES (?, ?, ?, ?, 'request', ?)
    `).run(course_id, course.teacher_id, student.email, studentId, message || null);

    // Notify teacher
    db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES (?, 'course_request', 'Заявка на курс', ?, ?)
    `).run(
      course.teacher_id,
      `${student.name} хочет записаться на курс "${course.title}"`,
      JSON.stringify({ invitation_id: result.lastInsertRowid, course_id, student_id: studentId })
    );

    res.status(201).json({ id: result.lastInsertRowid, message: 'Request sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send request' });
  }
});

// Get pending invitations/requests for current user
router.get('/invitations', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let invitations;
    if (userRole === 'teacher') {
      // Teachers see student requests
      invitations = db.prepare(`
        SELECT ci.*, c.title as course_title, u.name as student_name, u.email as student_email_display, u.avatar as student_avatar
        FROM course_invitations ci
        JOIN courses c ON c.id = ci.course_id
        LEFT JOIN users u ON u.id = ci.student_id
        WHERE ci.teacher_id = ? AND ci.status = 'pending'
        ORDER BY ci.created_at DESC
      `).all(userId);
    } else {
      // Students see teacher invitations
      const student = db.prepare('SELECT email FROM users WHERE id = ?').get(userId) as any;
      invitations = db.prepare(`
        SELECT ci.*, c.title as course_title, t.name as teacher_name, t.avatar as teacher_avatar
        FROM course_invitations ci
        JOIN courses c ON c.id = ci.course_id
        JOIN users t ON t.id = ci.teacher_id
        WHERE (ci.student_id = ? OR ci.student_email = ?) AND ci.status = 'pending' AND ci.type = 'invite'
        ORDER BY ci.created_at DESC
      `).all(userId, student.email);
    }

    res.json(invitations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Accept invitation/request
router.post('/invitations/:id/accept', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const invitationId = parseInt(req.params.id);
    const userId = req.user!.id;

    const invitation = db.prepare('SELECT * FROM course_invitations WHERE id = ?').get(invitationId) as any;
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation already processed' });
    }

    // Verify authorization
    if (invitation.type === 'invite' && invitation.student_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (invitation.type === 'request' && invitation.teacher_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get student_id for enrollment
    const studentId = invitation.type === 'invite' ? userId : invitation.student_id;

    // Create enrollment
    db.prepare(`
      INSERT OR IGNORE INTO enrollments (student_id, course_id) VALUES (?, ?)
    `).run(studentId, invitation.course_id);

    // Update invitation status
    db.prepare(`
      UPDATE course_invitations SET status = 'accepted', responded_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(invitationId);

    // Notify the other party
    const course = db.prepare('SELECT title FROM courses WHERE id = ?').get(invitation.course_id) as any;
    if (invitation.type === 'invite') {
      // Notify teacher that student accepted
      const student = db.prepare('SELECT name FROM users WHERE id = ?').get(studentId) as any;
      db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (?, 'invite_accepted', 'Приглашение принято', ?, ?)
      `).run(
        invitation.teacher_id,
        `${student.name} принял(а) приглашение на курс "${course.title}"`,
        JSON.stringify({ course_id: invitation.course_id, student_id: studentId })
      );
    } else {
      // Notify student that request was accepted
      const teacher = db.prepare('SELECT name FROM users WHERE id = ?').get(invitation.teacher_id) as any;
      db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (?, 'request_accepted', 'Заявка одобрена', ?, ?)
      `).run(
        studentId,
        `${teacher.name} одобрил(а) вашу заявку на курс "${course.title}"`,
        JSON.stringify({ course_id: invitation.course_id })
      );
    }

    res.json({ success: true, message: 'Invitation accepted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Decline invitation/request
router.post('/invitations/:id/decline', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const invitationId = parseInt(req.params.id);
    const userId = req.user!.id;

    const invitation = db.prepare('SELECT * FROM course_invitations WHERE id = ?').get(invitationId) as any;
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation already processed' });
    }

    // Verify authorization
    if (invitation.type === 'invite' && invitation.student_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (invitation.type === 'request' && invitation.teacher_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update invitation status
    db.prepare(`
      UPDATE course_invitations SET status = 'declined', responded_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(invitationId);

    // Notify the other party
    const course = db.prepare('SELECT title FROM courses WHERE id = ?').get(invitation.course_id) as any;
    if (invitation.type === 'invite') {
      const student = db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as any;
      db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (?, 'invite_declined', 'Приглашение отклонено', ?, ?)
      `).run(
        invitation.teacher_id,
        `${student.name} отклонил(а) приглашение на курс "${course.title}"`,
        JSON.stringify({ course_id: invitation.course_id })
      );
    } else {
      const teacher = db.prepare('SELECT name FROM users WHERE id = ?').get(invitation.teacher_id) as any;
      db.prepare(`
        INSERT INTO notifications (user_id, type, title, message, data)
        VALUES (?, 'request_declined', 'Заявка отклонена', ?, ?)
      `).run(
        invitation.student_id,
        `${teacher.name} отклонил(а) вашу заявку на курс "${course.title}"`,
        JSON.stringify({ course_id: invitation.course_id })
      );
    }

    res.json({ success: true, message: 'Invitation declined' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to decline invitation' });
  }
});

export default router;
