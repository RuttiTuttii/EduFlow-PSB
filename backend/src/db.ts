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
  
  // Seed demo data for hackathon
  await seedDemoData();
  
  console.log('Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

// Seed demo users, course, lessons, tests, and exam
async function seedDemoData() {
  const bcrypt = await import('bcryptjs');
  
  // Check if demo data already exists
  const existingTeacher = dbWrapper!.prepare('SELECT id FROM users WHERE email = ?').get('admin@teacher');
  if (existingTeacher) {
    console.log('📦 Demo data already exists, skipping seed...');
    return;
  }
  
  console.log('📦 Seeding demo data...');
  
  // Create demo teacher
  const teacherPassword = await bcrypt.hash('admin@teacher', 10);
  const teacherResult = dbWrapper!.prepare(
    'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)'
  ).run('admin@teacher', teacherPassword, 'Иван Преподавателев', 'teacher');
  const teacherId = teacherResult.lastInsertRowid;
  
  // Create demo student
  const studentPassword = await bcrypt.hash('admin@student', 10);
  const studentResult = dbWrapper!.prepare(
    'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)'
  ).run('admin@student', studentPassword, 'Алексей Студентов', 'student');
  const studentId = studentResult.lastInsertRowid;
  
  // Create demo course: "Основы программирования на Python"
  const courseResult = dbWrapper!.prepare(
    'INSERT INTO courses (teacher_id, title, description, thumbnail, level) VALUES (?, ?, ?, ?, ?)'
  ).run(
    teacherId,
    'Основы программирования на Python',
    'Полный курс по основам Python для начинающих. Вы изучите переменные, типы данных, условия, циклы, функции и многое другое. Курс включает практические задания и итоговый экзамен.',
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
    'beginner'
  );
  const courseId = courseResult.lastInsertRowid;
  
  // Enroll student in the course
  dbWrapper!.prepare(
    'INSERT INTO enrollments (student_id, course_id, progress) VALUES (?, ?, ?)'
  ).run(studentId, courseId, 25);
  
  // Create lessons
  const lessons = [
    {
      title: 'Введение в Python',
      content: `# Введение в Python

## Что такое Python?

Python — это высокоуровневый язык программирования с динамической типизацией и автоматическим управлением памятью.

### Преимущества Python:
- **Простой синтаксис** — код легко читать и писать
- **Большое сообщество** — много библиотек и документации
- **Универсальность** — веб, ML, автоматизация, анализ данных

### Первая программа

\`\`\`python
print("Привет, мир!")
\`\`\`

### Установка Python
1. Скачайте Python с python.org
2. Установите, отметив "Add to PATH"
3. Проверьте: \`python --version\`

## Задание для самопроверки
Попробуйте запустить свою первую программу и вывести своё имя!`,
      order_num: 1
    },
    {
      title: 'Переменные и типы данных',
      content: `# Переменные и типы данных

## Что такое переменная?

Переменная — это именованная область памяти для хранения данных.

### Создание переменных

\`\`\`python
name = "Алексей"      # строка (str)
age = 20              # целое число (int)
height = 1.75         # дробное число (float)
is_student = True     # логический тип (bool)
\`\`\`

### Основные типы данных

| Тип | Описание | Пример |
|-----|----------|--------|
| str | Строка | "Привет" |
| int | Целое число | 42 |
| float | Дробное число | 3.14 |
| bool | True/False | True |
| list | Список | [1, 2, 3] |
| dict | Словарь | {"name": "Alex"} |

### Проверка типа

\`\`\`python
x = 10
print(type(x))  # <class 'int'>
\`\`\`

## Подумайте сами
Какой тип данных подойдёт для хранения среднего балла студента?`,
      order_num: 2
    },
    {
      title: 'Условные операторы',
      content: `# Условные операторы

## Конструкция if-elif-else

Позволяет выполнять код в зависимости от условия.

### Синтаксис

\`\`\`python
age = 18

if age < 18:
    print("Несовершеннолетний")
elif age == 18:
    print("Только исполнилось 18!")
else:
    print("Совершеннолетний")
\`\`\`

### Операторы сравнения

- \`==\` — равно
- \`!=\` — не равно
- \`<\`, \`>\` — меньше, больше
- \`<=\`, \`>=\` — меньше/больше или равно

### Логические операторы

\`\`\`python
x = 10
if x > 5 and x < 15:
    print("x между 5 и 15")

if x < 5 or x > 15:
    print("x вне диапазона")
\`\`\`

## Практическое задание
Напишите программу, которая по возрасту определяет категорию: ребёнок (до 12), подросток (12-17), взрослый (18+).`,
      order_num: 3
    },
    {
      title: 'Циклы',
      content: `# Циклы в Python

## Цикл for

Используется для перебора элементов последовательности.

\`\`\`python
# Перебор списка
fruits = ["яблоко", "банан", "апельсин"]
for fruit in fruits:
    print(fruit)

# Перебор чисел
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4
\`\`\`

## Цикл while

Выполняется пока условие истинно.

\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1
\`\`\`

### break и continue

\`\`\`python
for i in range(10):
    if i == 3:
        continue  # пропустить 3
    if i == 7:
        break     # остановиться на 7
    print(i)
\`\`\`

## Задание
Напишите программу, которая выводит таблицу умножения на 7.`,
      order_num: 4
    },
    {
      title: 'Функции',
      content: `# Функции в Python

## Что такое функция?

Функция — это именованный блок кода, который можно вызывать многократно.

### Создание функции

\`\`\`python
def greet(name):
    """Функция приветствия"""
    return f"Привет, {name}!"

# Вызов функции
message = greet("Алексей")
print(message)  # Привет, Алексей!
\`\`\`

### Параметры по умолчанию

\`\`\`python
def power(base, exponent=2):
    return base ** exponent

print(power(3))     # 9 (3^2)
print(power(3, 3))  # 27 (3^3)
\`\`\`

### Возврат нескольких значений

\`\`\`python
def min_max(numbers):
    return min(numbers), max(numbers)

minimum, maximum = min_max([1, 5, 3, 9, 2])
\`\`\`

## Практика
Создайте функцию, которая принимает список чисел и возвращает их сумму и среднее значение.`,
      order_num: 5
    }
  ];
  
  for (const lesson of lessons) {
    dbWrapper!.prepare(
      'INSERT INTO lessons (course_id, title, content, order_num) VALUES (?, ?, ?, ?)'
    ).run(courseId, lesson.title, lesson.content, lesson.order_num);
  }
  
  // Create assignments (tests)
  const assignments = [
    {
      title: 'Тест: Переменные и типы данных',
      description: 'Проверьте свои знания о переменных и типах данных в Python. Тест включает 5 вопросов.',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      max_score: 100
    },
    {
      title: 'Практика: Условные операторы',
      description: 'Напишите программу для определения високосного года. Год високосный, если делится на 4, но не на 100, или делится на 400.',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      max_score: 100
    }
  ];
  
  for (const assignment of assignments) {
    dbWrapper!.prepare(
      'INSERT INTO assignments (course_id, title, description, due_date, max_score) VALUES (?, ?, ?, ?, ?)'
    ).run(courseId, assignment.title, assignment.description, assignment.due_date, assignment.max_score);
  }
  
  // Create exam
  dbWrapper!.prepare(
    'INSERT INTO exams (course_id, title, description, duration_minutes, passing_score, questions) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    courseId,
    'Итоговый экзамен: Основы Python',
    'Итоговый экзамен по курсу. Включает вопросы по всем темам: переменные, типы данных, условия, циклы и функции.',
    45,
    70,
    JSON.stringify([
      {
        question: 'Какой тип данных используется для хранения текста в Python?',
        options: ['int', 'str', 'bool', 'float'],
        correctAnswer: 1,
        explanation: 'str (string) — это тип данных для хранения текстовых строк в Python.'
      },
      {
        question: 'Что выведет код: print(type(3.14))?',
        options: ["<class 'int'>", "<class 'str'>", "<class 'float'>", "<class 'double'>"],
        correctAnswer: 2,
        explanation: '3.14 — это число с плавающей точкой, поэтому его тип float.'
      },
      {
        question: 'Какой оператор используется для проверки равенства в Python?',
        options: ['=', '==', '===', ':='],
        correctAnswer: 1,
        explanation: '== используется для сравнения значений. = используется для присваивания.'
      },
      {
        question: 'Что делает функция range(5)?',
        options: [
          'Создаёт список [1, 2, 3, 4, 5]',
          'Создаёт последовательность 0, 1, 2, 3, 4',
          'Создаёт число 5',
          'Вызывает ошибку'
        ],
        correctAnswer: 1,
        explanation: 'range(5) создаёт последовательность чисел от 0 до 4 (5 не включается).'
      },
      {
        question: 'Как правильно определить функцию в Python?',
        options: [
          'function greet():',
          'def greet():',
          'func greet():',
          'define greet():'
        ],
        correctAnswer: 1,
        explanation: 'В Python функции определяются с помощью ключевого слова def.'
      },
      {
        question: 'Какой цикл гарантированно выполнится хотя бы один раз?',
        options: ['for', 'while', 'do-while', 'В Python нет такого цикла'],
        correctAnswer: 3,
        explanation: 'В Python нет цикла do-while. Циклы for и while могут не выполниться ни разу, если условие ложно.'
      },
      {
        question: 'Что делает оператор break в цикле?',
        options: [
          'Пропускает текущую итерацию',
          'Полностью прекращает цикл',
          'Перезапускает цикл',
          'Вызывает ошибку'
        ],
        correctAnswer: 1,
        explanation: 'break немедленно прекращает выполнение цикла и выходит из него.'
      },
      {
        question: 'Какое значение вернёт выражение: 10 // 3?',
        options: ['3.33', '3', '4', '1'],
        correctAnswer: 1,
        explanation: '// — это целочисленное деление. 10 // 3 = 3 (без остатка).'
      },
      {
        question: 'Как получить длину списка в Python?',
        options: ['list.length()', 'len(list)', 'list.size()', 'count(list)'],
        correctAnswer: 1,
        explanation: 'Функция len() возвращает количество элементов в списке.'
      },
      {
        question: 'Что такое None в Python?',
        options: [
          'Число ноль',
          'Пустая строка',
          'Специальное значение "ничего"',
          'Ошибка'
        ],
        correctAnswer: 2,
        explanation: 'None — это специальный объект, обозначающий отсутствие значения.'
      }
    ])
  );
  
  // Add some user activity for the student
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  dbWrapper!.prepare(
    'INSERT OR REPLACE INTO user_activity (user_id, activity_date, hours_spent, lessons_completed) VALUES (?, ?, ?, ?)'
  ).run(studentId, today, 1.5, 2);
  
  dbWrapper!.prepare(
    'INSERT OR REPLACE INTO user_activity (user_id, activity_date, hours_spent, lessons_completed) VALUES (?, ?, ?, ?)'
  ).run(studentId, yesterday, 2.0, 3);
  
  console.log('✅ Demo data seeded successfully!');
  console.log('   📧 Teacher: admin@teacher / admin@teacher');
  console.log('   📧 Student: admin@student / admin@student');
}

export function getDb(): any {
  return dbWrapper;
}
