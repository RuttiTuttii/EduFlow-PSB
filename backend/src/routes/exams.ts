import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { authMiddleware, roleMiddleware } from '../auth.js';

const router = Router();

// Get exams for a course
router.get('/course/:courseId', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const exams = db
      .prepare('SELECT * FROM exams WHERE course_id = ?')
      .all(req.params.courseId);

    res.json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Get exam with questions
router.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const exam = db
      .prepare('SELECT * FROM exams WHERE id = ?')
      .get(req.params.id);

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const questions = db
      .prepare('SELECT id, question, type, options, points FROM exam_questions WHERE exam_id = ?')
      .all(req.params.id);

    res.json({ ...exam, questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
});

// Create exam
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['teacher']),
  (req: Request, res: Response) => {
    try {
      const { course_id, title, description, duration, total_points } = req.body;
      const db = getDb();

      const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(course_id);
      if (!course || course.teacher_id !== req.user!.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const stmt = db.prepare(
        'INSERT INTO exams (course_id, title, description, duration, total_points) VALUES (?, ?, ?, ?, ?)'
      );
      const info = stmt.run(course_id, title, description, duration, total_points);

      const exam = db
        .prepare('SELECT * FROM exams WHERE id = ?')
        .get(info.lastInsertRowid);

      res.status(201).json(exam);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create exam' });
    }
  }
);

// Add question to exam
router.post(
  '/:examId/questions',
  authMiddleware,
  roleMiddleware(['teacher']),
  (req: Request, res: Response) => {
    try {
      const { question, type, options, correct_answer, points } = req.body;
      const db = getDb();

      const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(req.params.examId);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      const stmt = db.prepare(
        'INSERT INTO exam_questions (exam_id, question, type, options, correct_answer, points) VALUES (?, ?, ?, ?, ?, ?)'
      );
      const info = stmt.run(
        req.params.examId,
        question,
        type,
        JSON.stringify(options),
        correct_answer,
        points
      );

      const result = db
        .prepare('SELECT * FROM exam_questions WHERE id = ?')
        .get(info.lastInsertRowid);

      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to add question' });
    }
  }
);

// Start exam attempt
router.post(
  '/:id/start',
  authMiddleware,
  (req: Request, res: Response) => {
    try {
      const db = getDb();

      const stmt = db.prepare(
        'INSERT INTO exam_attempts (exam_id, student_id) VALUES (?, ?)'
      );
      const info = stmt.run(req.params.id, req.user!.id);

      const attempt = db
        .prepare('SELECT * FROM exam_attempts WHERE id = ?')
        .get(info.lastInsertRowid);

      res.status(201).json(attempt);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to start exam' });
    }
  }
);

// Submit exam answers
router.post(
  '/:attemptId/submit',
  authMiddleware,
  (req: Request, res: Response) => {
    try {
      const { answers } = req.body;
      const db = getDb();

      let totalScore = 0;
      let maxPoints = 0;

      for (const [questionId, answer] of Object.entries(answers)) {
        const question = db
          .prepare('SELECT correct_answer, points FROM exam_questions WHERE id = ?')
          .get(questionId);

        const isCorrect = question.correct_answer === answer;
        maxPoints += question.points;
        if (isCorrect) totalScore += question.points;

        db.prepare(
          'INSERT INTO exam_answers (attempt_id, question_id, answer, is_correct) VALUES (?, ?, ?, ?)'
        ).run(req.params.attemptId, questionId, answer, isCorrect ? 1 : 0);
      }

      db.prepare(
        'UPDATE exam_attempts SET score = ?, total_points = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(totalScore, maxPoints, req.params.attemptId);

      const attempt = db
        .prepare('SELECT * FROM exam_attempts WHERE id = ?')
        .get(req.params.attemptId);

      res.json(attempt);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to submit exam' });
    }
  }
);

export default router;
