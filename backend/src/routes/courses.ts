import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { authMiddleware, roleMiddleware } from '../auth.js';

const router = Router();

// Get all courses
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const courses = db
      .prepare(
        `SELECT c.*, u.name as teacher_name 
         FROM courses c 
         JOIN users u ON c.teacher_id = u.id`
      )
      .all();

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get course by ID with lessons
router.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const course = db
      .prepare(
        `SELECT c.*, u.name as teacher_name 
         FROM courses c 
         JOIN users u ON c.teacher_id = u.id 
         WHERE c.id = ?`
      )
      .get(req.params.id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lessons = db
      .prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_num')
      .all(req.params.id);

    const assignments = db
      .prepare('SELECT * FROM assignments WHERE course_id = ?')
      .all(req.params.id);

    res.json({ ...course, lessons, assignments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Create course (teacher only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['teacher']),
  (req: Request, res: Response) => {
    try {
      const { title, description, level } = req.body;
      const db = getDb();

      const stmt = db.prepare(
        'INSERT INTO courses (teacher_id, title, description, level) VALUES (?, ?, ?, ?)'
      );
      const info = stmt.run(req.user!.id, title, description, level);

      const course = db
        .prepare('SELECT * FROM courses WHERE id = ?')
        .get(info.lastInsertRowid);

      res.status(201).json(course);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create course' });
    }
  }
);

// Update course
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['teacher']),
  (req: Request, res: Response) => {
    try {
      const db = getDb();
      const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.teacher_id !== req.user!.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { title, description, level } = req.body;
      db.prepare(
        'UPDATE courses SET title = ?, description = ?, level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(title, description, level, req.params.id);

      const updated = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update course' });
    }
  }
);

// Delete course
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['teacher']),
  (req: Request, res: Response) => {
    try {
      const db = getDb();
      const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.teacher_id !== req.user!.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
      res.json({ message: 'Course deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete course' });
    }
  }
);

// Enroll in course
router.post(
  '/:id/enroll',
  authMiddleware,
  (req: Request, res: Response) => {
    try {
      const db = getDb();
      const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      try {
        db.prepare(
          'INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)'
        ).run(req.user!.id, req.params.id);

        res.json({ message: 'Enrolled successfully' });
      } catch (err: any) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Already enrolled' });
        }
        throw err;
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to enroll' });
    }
  }
);

export default router;
