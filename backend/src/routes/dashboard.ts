import { Router, Request, Response } from 'express';
import { getDb } from '../db.js';
import { authMiddleware } from '../auth.js';

const router = Router();

// Get student stats
router.get('/stats/student', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;

    // Courses completed (100% progress)
    const coursesCompleted = db.prepare(`
      SELECT COUNT(*) as count FROM enrollments 
      WHERE student_id = ? AND progress = 100
    `).get(userId)?.count || 0;

    // Current courses (enrolled but not completed)
    const currentCourses = db.prepare(`
      SELECT COUNT(*) as count FROM enrollments 
      WHERE student_id = ? AND progress < 100
    `).get(userId)?.count || 0;

    // Total hours (from user_activity)
    const totalHours = db.prepare(`
      SELECT COALESCE(SUM(hours_spent), 0) as total FROM user_activity 
      WHERE user_id = ?
    `).get(userId)?.total || 0;

    // Average progress across all enrolled courses
    const avgProgress = db.prepare(`
      SELECT COALESCE(AVG(progress), 0) as avg FROM enrollments 
      WHERE student_id = ?
    `).get(userId)?.avg || 0;

    res.json({
      coursesCompleted,
      currentCourses,
      totalHours: Math.round(totalHours * 10) / 10,
      averageProgress: Math.round(avgProgress),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch student stats' });
  }
});

// Get teacher stats
router.get('/stats/teacher', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;

    // Total students enrolled in teacher's courses
    const totalStudents = db.prepare(`
      SELECT COUNT(DISTINCT e.student_id) as count 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.teacher_id = ?
    `).get(userId)?.count || 0;

    // Active courses count
    const activeCourses = db.prepare(`
      SELECT COUNT(*) as count FROM courses WHERE teacher_id = ?
    `).get(userId)?.count || 0;

    // Pending submissions (not graded)
    const pendingSubmissions = db.prepare(`
      SELECT COUNT(*) as count 
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE c.teacher_id = ? AND s.status = 'submitted' AND s.grade IS NULL
    `).get(userId)?.count || 0;

    // Graded submissions
    const gradedSubmissions = db.prepare(`
      SELECT COUNT(*) as count 
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE c.teacher_id = ? AND s.grade IS NOT NULL
    `).get(userId)?.count || 0;

    res.json({
      totalStudents,
      activeCourses,
      pendingSubmissions,
      gradedSubmissions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch teacher stats' });
  }
});

// Get user's enrolled courses with progress
router.get('/courses/enrolled', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;

    const courses = db.prepare(`
      SELECT 
        c.id, c.title, c.description, c.thumbnail, c.level,
        e.progress, e.enrolled_at,
        u.name as teacher_name,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons,
        ROUND(e.progress * (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) / 100) as completed_lessons
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.teacher_id = u.id
      WHERE e.student_id = ?
      ORDER BY e.enrolled_at DESC
    `).all(userId);

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch enrolled courses' });
  }
});

// Get teacher's courses with student counts
router.get('/courses/teaching', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;

    const courses = db.prepare(`
      SELECT 
        c.id, c.title, c.description, c.thumbnail, c.level, c.created_at,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as students_count,
        (SELECT COUNT(*) FROM submissions s 
         JOIN assignments a ON s.assignment_id = a.id 
         WHERE a.course_id = c.id AND s.status = 'submitted' AND s.grade IS NULL) as pending_count
      FROM courses c
      WHERE c.teacher_id = ?
      ORDER BY c.created_at DESC
    `).all(userId);

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch teaching courses' });
  }
});

// Get weekly activity (for progress chart)
router.get('/activity/weekly', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;

    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayIndex = date.getDay();
      const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1]; // Convert Sunday=0 to index 6

      const activity = db.prepare(`
        SELECT hours_spent, lessons_completed, assignments_completed
        FROM user_activity
        WHERE user_id = ? AND activity_date = ?
      `).get(userId, dateStr);

      weekData.push({
        day: dayName,
        date: dateStr,
        hours: activity?.hours_spent || 0,
        completed: (activity?.lessons_completed || 0) + (activity?.assignments_completed || 0),
      });
    }

    // Total stats for the week
    const weekStats = db.prepare(`
      SELECT 
        COALESCE(SUM(hours_spent), 0) as total_hours,
        COALESCE(SUM(lessons_completed), 0) as total_lessons,
        COALESCE(SUM(assignments_completed), 0) as total_assignments
      FROM user_activity
      WHERE user_id = ? AND activity_date >= date('now', '-7 days')
    `).get(userId);

    res.json({
      weekData,
      totalHours: Math.round((weekStats?.total_hours || 0) * 10) / 10,
      totalLessons: weekStats?.total_lessons || 0,
      totalAssignments: weekStats?.total_assignments || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch weekly activity' });
  }
});

// Get calendar events
router.get('/calendar/events', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const { month, year } = req.query;

    let query = `
      SELECT 
        ce.id, ce.title, ce.description, ce.event_date, ce.event_time, ce.type,
        c.title as course_title
      FROM calendar_events ce
      LEFT JOIN courses c ON ce.course_id = c.id
      WHERE ce.user_id = ?
    `;

    const params: any[] = [userId];

    if (month && year) {
      query += ` AND strftime('%m', ce.event_date) = ? AND strftime('%Y', ce.event_date) = ?`;
      params.push(String(month).padStart(2, '0'), String(year));
    }

    query += ` ORDER BY ce.event_date, ce.event_time`;

    const events = db.prepare(query).all(...params);

    // Also get deadlines from assignments
    let assignmentQuery = `
      SELECT 
        a.id, a.title, a.due_date as event_date, 'deadline' as type,
        c.title as course_title
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN enrollments e ON e.course_id = c.id
      WHERE e.student_id = ? AND a.due_date IS NOT NULL
    `;

    const assignmentParams: any[] = [userId];

    if (month && year) {
      assignmentQuery += ` AND strftime('%m', a.due_date) = ? AND strftime('%Y', a.due_date) = ?`;
      assignmentParams.push(String(month).padStart(2, '0'), String(year));
    }

    const deadlines = db.prepare(assignmentQuery).all(...assignmentParams);

    res.json([...events, ...deadlines.map((d: any) => ({
      ...d,
      title: `Дедлайн: ${d.title}`,
    }))]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Create calendar event
router.post('/calendar/events', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const { title, description, event_date, event_time, type, course_id } = req.body;

    const stmt = db.prepare(`
      INSERT INTO calendar_events (user_id, title, description, event_date, event_time, type, course_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(userId, title, description ?? null, event_date, event_time ?? null, type || 'event', course_id ?? null);

    const event = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

// Get user achievements
router.get('/achievements', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;

    // Get all achievement definitions with user's unlock status
    const achievements = db.prepare(`
      SELECT 
        ad.id, ad.type, ad.title, ad.description, ad.icon, ad.color, 
        ad.requirement_type, ad.requirement_value,
        CASE WHEN a.unlocked = 1 THEN 1 ELSE 0 END as unlocked,
        a.unlocked_at
      FROM achievement_definitions ad
      LEFT JOIN achievements a ON ad.type = a.achievement_type AND a.user_id = ?
      ORDER BY ad.id
    `).all(userId);

    // Calculate progress for each achievement
    const lessonsCompleted = db.prepare(`
      SELECT COALESCE(SUM(lessons_completed), 0) as count FROM user_activity WHERE user_id = ?
    `).get(userId)?.count || 0;

    const coursesCompleted = db.prepare(`
      SELECT COUNT(*) as count FROM enrollments WHERE student_id = ? AND progress = 100
    `).get(userId)?.count || 0;

    const totalHours = db.prepare(`
      SELECT COALESCE(SUM(hours_spent), 0) as total FROM user_activity WHERE user_id = ?
    `).get(userId)?.total || 0;

    const assignmentsCompleted = db.prepare(`
      SELECT COUNT(*) as count FROM submissions WHERE student_id = ? AND status = 'graded'
    `).get(userId)?.count || 0;

    // Calculate streak (consecutive days)
    const activityDays = db.prepare(`
      SELECT activity_date FROM user_activity 
      WHERE user_id = ? AND (hours_spent > 0 OR lessons_completed > 0)
      ORDER BY activity_date DESC
    `).all(userId);

    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);
    
    for (const day of activityDays) {
      const activityDate = new Date(day.activity_date);
      const diff = Math.floor((checkDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 1) {
        streak++;
        checkDate = activityDate;
      } else {
        break;
      }
    }

    // Perfect exam check
    const perfectExam = db.prepare(`
      SELECT COUNT(*) as count FROM exam_attempts 
      WHERE student_id = ? AND score = total_points AND total_points > 0
    `).get(userId)?.count || 0;

    // Add progress to each achievement
    const achievementsWithProgress = achievements.map((ach: any) => {
      let progress = 0;
      switch (ach.requirement_type) {
        case 'lessons':
          progress = Math.min(100, (lessonsCompleted / ach.requirement_value) * 100);
          break;
        case 'courses':
          progress = Math.min(100, (coursesCompleted / ach.requirement_value) * 100);
          break;
        case 'hours':
          progress = Math.min(100, (totalHours / ach.requirement_value) * 100);
          break;
        case 'streak':
          progress = Math.min(100, (streak / ach.requirement_value) * 100);
          break;
        case 'assignments':
          progress = Math.min(100, (assignmentsCompleted / ach.requirement_value) * 100);
          break;
        case 'perfect_exam':
          progress = perfectExam > 0 ? 100 : 0;
          break;
      }
      return { ...ach, progress: Math.round(progress) };
    });

    res.json(achievementsWithProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Log activity (called when user completes lessons, etc.)
router.post('/activity/log', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const { hours_spent = 0, lessons_completed = 0, assignments_completed = 0, exams_taken = 0 } = req.body;
    
    const today = new Date().toISOString().split('T')[0];

    // Upsert activity
    db.prepare(`
      INSERT INTO user_activity (user_id, activity_date, hours_spent, lessons_completed, assignments_completed, exams_taken)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, activity_date) DO UPDATE SET
        hours_spent = hours_spent + excluded.hours_spent,
        lessons_completed = lessons_completed + excluded.lessons_completed,
        assignments_completed = assignments_completed + excluded.assignments_completed,
        exams_taken = exams_taken + excluded.exams_taken
    `).run(userId, today, hours_spent, lessons_completed, assignments_completed, exams_taken);

    // Check and unlock achievements
    checkAndUnlockAchievements(db, userId);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

function checkAndUnlockAchievements(db: any, userId: number) {
  // Get current stats
  const lessonsCompleted = db.prepare(`
    SELECT COALESCE(SUM(lessons_completed), 0) as count FROM user_activity WHERE user_id = ?
  `).get(userId)?.count || 0;

  const coursesCompleted = db.prepare(`
    SELECT COUNT(*) as count FROM enrollments WHERE student_id = ? AND progress = 100
  `).get(userId)?.count || 0;

  const totalHours = db.prepare(`
    SELECT COALESCE(SUM(hours_spent), 0) as total FROM user_activity WHERE user_id = ?
  `).get(userId)?.total || 0;

  const assignmentsCompleted = db.prepare(`
    SELECT COUNT(*) as count FROM submissions WHERE student_id = ? AND status = 'graded'
  `).get(userId)?.count || 0;

  // Get all achievement definitions
  const definitions = db.prepare('SELECT * FROM achievement_definitions').all();

  for (const def of definitions) {
    let shouldUnlock = false;

    switch (def.requirement_type) {
      case 'lessons':
        shouldUnlock = lessonsCompleted >= def.requirement_value;
        break;
      case 'courses':
        shouldUnlock = coursesCompleted >= def.requirement_value;
        break;
      case 'hours':
        shouldUnlock = totalHours >= def.requirement_value;
        break;
      case 'assignments':
        shouldUnlock = assignmentsCompleted >= def.requirement_value;
        break;
    }

    if (shouldUnlock) {
      db.prepare(`
        INSERT OR IGNORE INTO achievements (user_id, achievement_type, unlocked, unlocked_at)
        VALUES (?, ?, 1, CURRENT_TIMESTAMP)
      `).run(userId, def.type);
    }
  }
}

export default router;
