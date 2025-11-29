import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { authMiddleware, roleMiddleware } from '../auth.js';

const router = Router();

// Get assignments for a course
router.get('/course/:courseId', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const assignments = db
      .prepare('SELECT * FROM assignments WHERE course_id = ? ORDER BY due_date')
      .all(req.params.courseId);

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Create assignment
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['teacher']),
  (req: Request, res: Response) => {
    try {
      const { course_id, lesson_id, title, description, due_date } = req.body;
      const db = getDb();

      // Verify teacher owns the course
      const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(course_id);
      if (!course || course.teacher_id !== req.user!.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const stmt = db.prepare(
        'INSERT INTO assignments (course_id, lesson_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)'
      );
      const info = stmt.run(course_id, lesson_id, title, description, due_date);

      const assignment = db
        .prepare('SELECT * FROM assignments WHERE id = ?')
        .get(info.lastInsertRowid);

      res.status(201).json(assignment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create assignment' });
    }
  }
);

// Submit assignment
router.post(
  '/:id/submit',
  authMiddleware,
  (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      const db = getDb();

      const stmt = db.prepare(
        'INSERT INTO submissions (assignment_id, student_id, content, status) VALUES (?, ?, ?, ?)'
      );
      const info = stmt.run(req.params.id, req.user!.id, content, 'submitted');

      const submission = db
        .prepare('SELECT * FROM submissions WHERE id = ?')
        .get(info.lastInsertRowid);

      res.status(201).json(submission);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to submit assignment' });
    }
  }
);

// Grade assignment
router.post(
  '/:id/grade',
  authMiddleware,
  roleMiddleware(['teacher']),
  (req: Request, res: Response) => {
    try {
      const { grade, feedback } = req.body;
      const db = getDb();

      db.prepare(
        'UPDATE submissions SET grade = ?, feedback = ?, status = ?, graded_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(grade, feedback, 'graded', req.params.id);

      const submission = db
        .prepare('SELECT * FROM submissions WHERE id = ?')
        .get(req.params.id);

      res.json(submission);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to grade assignment' });
    }
  }
);

export default router;
