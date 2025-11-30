import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use different paths for development and production
const dataDir = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'backend/data')
  : path.join(__dirname, '../data');

console.log(`📂 Database directory: ${dataDir}`);

// Ensure data directory exists
try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`✅ Created data directory: ${dataDir}`);
  }
} catch (err) {
  console.error(`❌ Failed to create data directory: ${err}`);
}

const dbPath = path.join(dataDir, 'eduflow.db');
console.log(`📂 Database path: ${dbPath}`);
let db: SqlJsDatabase | null = null;

// Helper to save database to file
function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Wrapper to make sql.js API compatible with better-sqlite3 style
class DbWrapper {
  private sqlDb: SqlJsDatabase;

  constructor(sqlDb: SqlJsDatabase) {
    this.sqlDb = sqlDb;
  }

  prepare(sql: string) {
    const self = this;
    return {
      run(...params: any[]) {
        // Flatten params if first arg is an array (handles both styles)
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        self.sqlDb.run(sql, flatParams);
        saveDb();
        return { changes: self.sqlDb.getRowsModified(), lastInsertRowid: self.getLastInsertRowId() };
      },
      get(...params: any[]) {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const stmt = self.sqlDb.prepare(sql);
        if (flatParams.length > 0) {
          stmt.bind(flatParams);
        }
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },
      all(...params: any[]) {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const results: any[] = [];
        const stmt = self.sqlDb.prepare(sql);
        if (flatParams.length > 0) {
          stmt.bind(flatParams);
        }
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    };
  }

  private getLastInsertRowId(): number {
    const result = this.sqlDb.exec("SELECT last_insert_rowid() as id");
    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0] as number;
    }
    return 0;
  }

  pragma(pragma: string) {
    this.sqlDb.run(`PRAGMA ${pragma}`);
  }

  exec(sql: string) {
    this.sqlDb.exec(sql);
    saveDb();
  }
}

let dbWrapper: DbWrapper | null = null;

export async function initDb() {
  try {
    const SQL = await initSqlJs();
    
    // Load existing database or create new one
    let sqlDb: SqlJsDatabase;
    if (fs.existsSync(dbPath)) {
      console.log(`📂 Loading existing database from: ${dbPath}`);
      const fileBuffer = fs.readFileSync(dbPath);
      sqlDb = new SQL.Database(fileBuffer);
    } else {
      console.log(`📂 Creating new database at: ${dbPath}`);
      sqlDb = new SQL.Database();
    }
  
    db = sqlDb;
    dbWrapper = new DbWrapper(sqlDb);
  
  // Enable foreign keys
  dbWrapper.pragma('foreign_keys = ON');

  // Create all tables
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      thumbnail TEXT,
      level TEXT DEFAULT 'beginner',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(teacher_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      progress INTEGER DEFAULT 0,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES users(id),
      FOREIGN KEY(course_id) REFERENCES courses(id),
      UNIQUE(student_id, course_id)
    )`,
    `CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      order_num INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(course_id) REFERENCES courses(id)
    )`,
    `CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      lesson_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      due_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(course_id) REFERENCES courses(id),
      FOREIGN KEY(lesson_id) REFERENCES lessons(id)
    )`,
    `CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignment_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      content TEXT,
      file_url TEXT,
      status TEXT DEFAULT 'submitted',
      grade REAL,
      feedback TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      graded_at DATETIME,
      FOREIGN KEY(assignment_id) REFERENCES assignments(id),
      FOREIGN KEY(student_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      duration INTEGER,
      total_points INTEGER DEFAULT 100,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(course_id) REFERENCES courses(id)
    )`,
    `CREATE TABLE IF NOT EXISTS exam_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      type TEXT NOT NULL,
      options TEXT,
      correct_answer TEXT,
      points INTEGER DEFAULT 1,
      FOREIGN KEY(exam_id) REFERENCES exams(id)
    )`,
    `CREATE TABLE IF NOT EXISTS exam_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      score REAL,
      total_points INTEGER,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY(exam_id) REFERENCES exams(id),
      FOREIGN KEY(student_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS exam_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      answer TEXT,
      is_correct BOOLEAN,
      FOREIGN KEY(attempt_id) REFERENCES exam_attempts(id),
      FOREIGN KEY(question_id) REFERENCES exam_questions(id)
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      recipient_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(sender_id) REFERENCES users(id),
      FOREIGN KEY(recipient_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_type TEXT NOT NULL,
      unlocked BOOLEAN DEFAULT 0,
      unlocked_at DATETIME,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      event_date DATE NOT NULL,
      event_time TIME,
      type TEXT DEFAULT 'event',
      course_id INTEGER,
      assignment_id INTEGER,
      exam_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(course_id) REFERENCES courses(id),
      FOREIGN KEY(assignment_id) REFERENCES assignments(id),
      FOREIGN KEY(exam_id) REFERENCES exams(id)
    )`,
    `CREATE TABLE IF NOT EXISTS user_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      activity_date DATE NOT NULL,
      hours_spent REAL DEFAULT 0,
      lessons_completed INTEGER DEFAULT 0,
      assignments_completed INTEGER DEFAULT 0,
      exams_taken INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id),
      UNIQUE(user_id, activity_date)
    )`,
    `CREATE TABLE IF NOT EXISTS achievement_definitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      requirement_type TEXT NOT NULL,
      requirement_value INTEGER NOT NULL
    )`
  ];

  // Insert default achievement definitions if not exist
  const defaultAchievements = [
    { type: 'first_lesson', title: 'Первый шаг', description: 'Завершите первый урок', icon: 'Rocket', color: 'blue', requirement_type: 'lessons', requirement_value: 1 },
    { type: 'lessons_5', title: 'Ученик', description: 'Завершите 5 уроков', icon: 'BookOpen', color: 'green', requirement_type: 'lessons', requirement_value: 5 },
    { type: 'lessons_10', title: 'Знаток', description: 'Завершите 10 уроков', icon: 'GraduationCap', color: 'purple', requirement_type: 'lessons', requirement_value: 10 },
    { type: 'lessons_25', title: 'Эксперт', description: 'Завершите 25 уроков', icon: 'Star', color: 'yellow', requirement_type: 'lessons', requirement_value: 25 },
    { type: 'lessons_50', title: 'Мастер', description: 'Завершите 50 уроков', icon: 'Crown', color: 'orange', requirement_type: 'lessons', requirement_value: 50 },
    { type: 'first_course', title: 'Курс пройден', description: 'Завершите первый курс', icon: 'Award', color: 'cyan', requirement_type: 'courses', requirement_value: 1 },
    { type: 'courses_3', title: 'Коллекционер', description: 'Завершите 3 курса', icon: 'Trophy', color: 'pink', requirement_type: 'courses', requirement_value: 3 },
    { type: 'courses_5', title: 'Энциклопедист', description: 'Завершите 5 курсов', icon: 'Library', color: 'indigo', requirement_type: 'courses', requirement_value: 5 },
    { type: 'hours_10', title: 'Усердный', description: 'Проведите 10 часов за обучением', icon: 'Clock', color: 'teal', requirement_type: 'hours', requirement_value: 10 },
    { type: 'hours_50', title: 'Марафонец', description: 'Проведите 50 часов за обучением', icon: 'Timer', color: 'red', requirement_type: 'hours', requirement_value: 50 },
    { type: 'streak_3', title: 'На волне', description: '3 дня подряд обучения', icon: 'Flame', color: 'orange', requirement_type: 'streak', requirement_value: 3 },
    { type: 'streak_7', title: 'Неделя силы', description: '7 дней подряд обучения', icon: 'Zap', color: 'yellow', requirement_type: 'streak', requirement_value: 7 },
    { type: 'perfect_exam', title: 'Перфекционист', description: 'Сдайте экзамен на 100%', icon: 'CheckCircle', color: 'green', requirement_type: 'perfect_exam', requirement_value: 1 },
    { type: 'first_assignment', title: 'Активист', description: 'Сдайте первое задание', icon: 'FileCheck', color: 'blue', requirement_type: 'assignments', requirement_value: 1 },
    { type: 'assignments_10', title: 'Трудяга', description: 'Сдайте 10 заданий', icon: 'Files', color: 'purple', requirement_type: 'assignments', requirement_value: 10 },
  ];

  for (const sql of tables) {
    dbWrapper!.prepare(sql).run();
  }

  // Insert default achievement definitions if they don't exist
  const insertAchievement = dbWrapper!.prepare(`
    INSERT OR IGNORE INTO achievement_definitions (type, title, description, icon, color, requirement_type, requirement_value)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ach of defaultAchievements) {
    insertAchievement.run(ach.type, ach.title, ach.description, ach.icon, ach.color, ach.requirement_type, ach.requirement_value);
  }
  
  console.log('Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

export function getDb(): any {
  return dbWrapper;
}
