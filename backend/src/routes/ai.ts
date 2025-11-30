import { Router, Request, Response } from 'express';
import { authMiddleware } from '../auth.js';
import { getDb } from '../db.js';

const router = Router();

// ProxyAPI configuration for hackathon
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'sk-68J3E3GDfyBQotTdg9NEexCqc8OMqUST';
// Use OpenAI-compatible endpoint from ProxyAPI (more reliable)
const PROXY_BASE_URL = 'https://api.proxyapi.ru/openai/v1';

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

// Helper function to call AI via ProxyAPI (OpenAI-compatible)
async function callGemini(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${PROXY_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      }),
    });

    const data = await response.json() as ChatCompletionResponse;
    
    if (!response.ok) {
      console.error('ProxyAPI Error:', JSON.stringify(data));
      throw new Error(data.error?.message || `API error: ${response.status}`);
    }

    return data.choices?.[0]?.message?.content || 'Не удалось получить ответ от AI';
  } catch (error) {
    console.error('callGemini error:', error);
    throw error;
  }
}

// Get user context from DB
function getUserContext(userId: number): any {
  const db = getDb();
  
  // Get enrolled courses with progress
  const courses = db.prepare(`
    SELECT c.id, c.title, c.level, e.progress, e.deadline,
           (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.student_id = ?
  `).all(userId);

  // Get pending assignments
  const pendingAssignments = db.prepare(`
    SELECT a.id, a.title, a.due_date, c.title as course_title
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
    JOIN enrollments e ON e.course_id = c.id AND e.student_id = ?
    WHERE NOT EXISTS (
      SELECT 1 FROM submissions s 
      WHERE s.assignment_id = a.id AND s.student_id = ?
    )
    ORDER BY a.due_date ASC
  `).all(userId, userId);

  // Get upcoming exams
  const upcomingExams = db.prepare(`
    SELECT ex.id, ex.title, ex.duration, c.title as course_title
    FROM exams ex
    JOIN courses c ON ex.course_id = c.id
    JOIN enrollments e ON e.course_id = c.id AND e.student_id = ?
    WHERE NOT EXISTS (
      SELECT 1 FROM exam_attempts ea 
      WHERE ea.exam_id = ex.id AND ea.student_id = ? AND ea.completed_at IS NOT NULL
    )
  `).all(userId, userId);

  // Get debts
  const debts = db.prepare(`
    SELECT * FROM student_debts WHERE student_id = ? AND status = 'pending'
  `).all(userId);

  // Get recent activity
  const activity = db.prepare(`
    SELECT * FROM user_activity WHERE user_id = ? ORDER BY activity_date DESC LIMIT 7
  `).all(userId);

  return { courses, pendingAssignments, upcomingExams, debts, activity };
}

// Get AI assistance with user context
router.post('/help', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { topic, question, context, useContext = true } = req.body;
    const userId = req.user!.id;

    if (!question) {
      return res.status(400).json({ error: 'Вопрос не указан' });
    }

    // Get user context if requested
    let userContextStr = '';
    if (useContext) {
      const userContext = getUserContext(userId);
      userContextStr = `
КОНТЕКСТ СТУДЕНТА:
- Записан на курсы: ${userContext.courses.map((c: any) => `${c.title} (прогресс: ${c.progress}%)`).join(', ') || 'нет курсов'}
- Несданные задания: ${userContext.pendingAssignments.length} шт.
- Предстоящие экзамены: ${userContext.upcomingExams.length} шт.
- Академические долги: ${userContext.debts.length} шт.
`;
    }

    const prompt = `Ты — образовательный помощник EduFlow, который помогает студентам РАЗОБРАТЬСЯ в материале самостоятельно.

ВАЖНЫЕ ПРАВИЛА:
1. НИКОГДА не давай прямых ответов на задания, тесты или экзаменационные вопросы
2. Вместо ответа — задавай наводящие вопросы
3. Объясняй концепции и принципы, но не решай задачи за студента
4. Если студент просит готовый ответ — вежливо откажи и предложи разобраться вместе
5. Поощряй самостоятельное мышление
${userContextStr}
Тема: ${topic || 'Общая'}
Контекст курса: ${context || 'Дополнительный контекст отсутствует'}

Вопрос студента: ${question}

Помоги студенту ПОНЯТЬ материал, но НЕ ДАВАЙ готовый ответ. Задай наводящие вопросы, объясни принципы, направь к правильному ходу мыслей. Отвечай на русском языке.`;

    const text = await callGemini(prompt);

    res.json({
      response: text,
      topic,
      question,
    });
  } catch (error) {
    console.error('AI Help Error:', error);
    res.status(500).json({ error: 'Не удалось получить помощь от AI' });
  }
});

// NEW: Create debt recovery plan
router.post('/create-debt-plan', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userContext = getUserContext(userId);
    const db = getDb();

    if (userContext.debts.length === 0 && userContext.pendingAssignments.length === 0) {
      return res.json({
        plan: null,
        message: 'У вас нет академических долгов! 🎉'
      });
    }

    const debtsInfo = userContext.debts.map((d: any) => 
      `- ${d.title} (дедлайн: ${d.new_deadline || d.original_deadline})`
    ).join('\n');

    const assignmentsInfo = userContext.pendingAssignments.map((a: any) => 
      `- ${a.title} по курсу "${a.course_title}" (до ${a.due_date})`
    ).join('\n');

    const prompt = `Создай персонализированный план исправления академических долгов для студента.

НЕСДАННЫЕ ЗАДАНИЯ:
${assignmentsInfo || 'Нет'}

АКАДЕМИЧЕСКИЕ ДОЛГИ:
${debtsInfo || 'Нет'}

КУРСЫ СТУДЕНТА:
${userContext.courses.map((c: any) => `- ${c.title} (прогресс: ${c.progress}%)`).join('\n')}

Создай подробный план в JSON формате:
{
  "title": "название плана",
  "description": "краткое описание",
  "total_days": число_дней,
  "items": [
    {
      "day": 1,
      "title": "что делать",
      "tasks": ["задача 1", "задача 2"],
      "time_estimate": "2 часа",
      "priority": "high/medium/low"
    }
  ],
  "tips": ["совет 1", "совет 2"]
}

Верни ТОЛЬКО JSON без дополнительного текста. План должен быть реалистичным и выполнимым.`;

    const text = await callGemini(prompt);

    // Parse the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let plan = null;
    
    if (jsonMatch) {
      try {
        plan = JSON.parse(jsonMatch[0]);
        
        // Save plan to database
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + (plan.total_days || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        db.prepare(`
          INSERT INTO study_plans (student_id, title, description, plan_type, items, start_date, end_date)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          userId,
          plan.title || 'План исправления долгов',
          plan.description || '',
          'debt_recovery',
          JSON.stringify(plan.items),
          startDate,
          endDate
        );
      } catch (e) {
        console.error('Failed to parse plan JSON:', e);
      }
    }

    res.json({
      plan,
      debts: userContext.debts,
      pendingAssignments: userContext.pendingAssignments
    });
  } catch (error) {
    console.error('AI Debt Plan Error:', error);
    res.status(500).json({ error: 'Не удалось создать план' });
  }
});

// NEW: Get study recommendations
router.post('/recommendations', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userContext = getUserContext(userId);

    const prompt = `На основе данных о студенте дай персонализированные рекомендации.

ДАННЫЕ СТУДЕНТА:
- Курсы: ${userContext.courses.map((c: any) => `${c.title} (${c.progress}%)`).join(', ') || 'нет'}
- Несданных заданий: ${userContext.pendingAssignments.length}
- Предстоящих экзаменов: ${userContext.upcomingExams.length}
- Долгов: ${userContext.debts.length}
- Активность за неделю: ${userContext.activity.reduce((sum: number, a: any) => sum + (a.hours_spent || 0), 0).toFixed(1)} часов

Дай 3-5 конкретных персонализированных рекомендаций в формате JSON:
{
  "recommendations": [
    {
      "icon": "📚/⏰/💪/🎯/📝",
      "title": "короткий заголовок",
      "description": "подробное описание рекомендации",
      "action": "конкретное действие"
    }
  ],
  "motivation": "мотивационное сообщение для студента"
}

Верни ТОЛЬКО JSON. Рекомендации должны быть конкретными и полезными.`;

    const text = await callGemini(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [], motivation: '' };

    res.json(result);
  } catch (error) {
    console.error('AI Recommendations Error:', error);
    res.status(500).json({ error: 'Не удалось получить рекомендации' });
  }
});

// NEW: Get available templates/tools
router.get('/templates', authMiddleware, (req: Request, res: Response) => {
  const templates = [
    {
      id: 'debt_plan',
      icon: '📋',
      title: 'План исправления долгов',
      description: 'Создать персональный план для закрытия академических долгов',
      action: '/api/ai/create-debt-plan'
    },
    {
      id: 'recommendations',
      icon: '💡',
      title: 'Рекомендации по обучению',
      description: 'Получить персональные рекомендации на основе вашего прогресса',
      action: '/api/ai/recommendations'
    },
    {
      id: 'explain_concept',
      icon: '📖',
      title: 'Объяснить тему',
      description: 'Попросить AI объяснить сложную тему простым языком',
      action: '/api/ai/explain'
    },
    {
      id: 'exam_prep',
      icon: '📝',
      title: 'Подготовка к экзамену',
      description: 'Получить план подготовки к конкретному экзамену',
      action: '/api/ai/exam-prep'
    },
    {
      id: 'summarize',
      icon: '📄',
      title: 'Краткое содержание',
      description: 'Сделать краткое содержание темы или урока',
      action: '/api/ai/summarize'
    }
  ];

  res.json({ templates });
});

// NEW: Exam preparation plan
router.post('/exam-prep', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { examId, daysUntilExam = 7 } = req.body;
    const userId = req.user!.id;
    const db = getDb();

    let examInfo = null;
    let courseInfo = null;
    let lessons = [];

    if (examId) {
      examInfo = db.prepare(`
        SELECT ex.*, c.title as course_title
        FROM exams ex
        JOIN courses c ON ex.course_id = c.id
        WHERE ex.id = ?
      `).get(examId);

      if (examInfo) {
        lessons = db.prepare(`
          SELECT title, content FROM lessons WHERE course_id = ? ORDER BY order_num
        `).all(examInfo.course_id);
      }
    }

    const prompt = `Создай план подготовки к экзамену на ${daysUntilExam} дней.

${examInfo ? `ЭКЗАМЕН: ${examInfo.title}
КУРС: ${examInfo.course_title}
ДЛИТЕЛЬНОСТЬ: ${examInfo.duration} минут` : 'Экзамен: общая подготовка'}

${lessons.length > 0 ? `ТЕМЫ КУРСА:\n${lessons.map((l: any) => `- ${l.title}`).join('\n')}` : ''}

Создай план в JSON формате:
{
  "title": "План подготовки к экзамену",
  "exam_name": "название экзамена",
  "total_days": ${daysUntilExam},
  "daily_plan": [
    {
      "day": 1,
      "focus": "на чём сосредоточиться",
      "topics": ["тема 1", "тема 2"],
      "activities": ["активность 1", "активность 2"],
      "time_required": "3 часа"
    }
  ],
  "tips": ["совет 1", "совет 2"],
  "common_mistakes": ["ошибка 1", "ошибка 2"]
}

Верни ТОЛЬКО JSON.`;

    const text = await callGemini(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const plan = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    res.json({ plan, examInfo });
  } catch (error) {
    console.error('AI Exam Prep Error:', error);
    res.status(500).json({ error: 'Не удалось создать план подготовки' });
  }
});

// NEW: Summarize topic
router.post('/summarize', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { topic, lessonId, content } = req.body;
    const db = getDb();

    let lessonContent = content;
    if (lessonId && !content) {
      const lesson = db.prepare('SELECT title, content FROM lessons WHERE id = ?').get(lessonId) as any;
      if (lesson) {
        lessonContent = `${lesson.title}\n\n${lesson.content}`;
      }
    }

    const prompt = `Сделай краткое и понятное резюме${topic ? ` по теме "${topic}"` : ''}.

${lessonContent ? `МАТЕРИАЛ:\n${lessonContent.substring(0, 3000)}` : ''}

Формат ответа в JSON:
{
  "title": "название темы",
  "summary": "краткое резюме (2-3 абзаца)",
  "key_points": ["ключевой момент 1", "ключевой момент 2", "ключевой момент 3"],
  "formulas_or_rules": ["формула/правило 1", "формула/правило 2"],
  "remember": "что важно запомнить (1-2 предложения)"
}

Верни ТОЛЬКО JSON на русском языке.`;

    const text = await callGemini(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const summary = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    res.json({ summary });
  } catch (error) {
    console.error('AI Summarize Error:', error);
    res.status(500).json({ error: 'Не удалось создать резюме' });
  }
});

// Analyze assignment (for teachers only - provides feedback, not answers)
router.post(
  '/analyze-submission',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { submission, rubric, assignmentTitle } = req.body;

      if (!submission) {
        return res.status(400).json({ error: 'Работа не указана' });
      }

      const prompt = `Ты — образовательный эксперт, помогающий преподавателю проверить работу студента.
Задание: ${assignmentTitle || 'Не указано'}
Критерии оценки: ${rubric || 'Общие академические стандарты'}

Работа студента:
${submission}

Дай развёрнутый анализ:
1. ✅ Сильные стороны работы
2. ⚠️ Области для улучшения  
3. 💡 Конкретные рекомендации для студента
4. 📊 Предварительная оценка (по шкале от 1 до 10)

Будь конструктивным и ободряющим. Цель — помочь студенту расти. Отвечай на русском языке.`;

      const text = await callGemini(prompt);

      res.json({
        analysis: text,
      });
    } catch (error) {
      console.error('AI Analysis Error:', error);
      res.status(500).json({ error: 'Не удалось проанализировать работу' });
    }
  }
);

// Generate quiz questions
router.post(
  '/generate-questions',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { topic, count = 5, difficulty = 'medium' } = req.body;

      if (!topic) {
        return res.status(400).json({ error: 'Тема не указана' });
      }

      const difficultyRu = difficulty === 'easy' ? 'лёгкой' : difficulty === 'hard' ? 'сложной' : 'средней';

      const prompt = `Сгенерируй ${count} вопросов с вариантами ответов по теме "${topic}" ${difficultyRu} сложности.

Формат каждого вопроса в JSON:
{
  "question": "текст вопроса на русском",
  "options": ["вариант1", "вариант2", "вариант3", "вариант4"],
  "correctAnswer": 0,
  "explanation": "почему это правильный ответ"
}

Верни только JSON массив. Все тексты должны быть на русском языке.`;

      const text = await callGemini(prompt);

      // Parse the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      res.json({
        questions,
        topic,
        difficulty,
      });
    } catch (error) {
      console.error('AI Questions Error:', error);
      res.status(500).json({ error: 'Не удалось сгенерировать вопросы' });
    }
  }
);

// Explain concept (educational, helps understand but doesn't give test answers)
router.post('/explain', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { concept, level = 'intermediate', courseContext } = req.body;

    if (!concept) {
      return res.status(400).json({ error: 'Концепция не указана' });
    }

    const levelRu = level === 'beginner' ? 'начальном' : level === 'advanced' ? 'продвинутом' : 'среднем';

    const prompt = `Ты — образовательный помощник EduFlow. Объясни концепцию "${concept}" на ${levelRu} уровне.

${courseContext ? `Контекст курса: ${courseContext}` : ''}

ВАЖНО: Ты должен НАУЧИТЬ понимать, а не дать готовый ответ.

Структура объяснения:
1. 📖 Простое определение своими словами
2. 🔑 Ключевые моменты (3-4 пункта)
3. 🌍 Пример из реальной жизни
4. ❓ Вопрос для самопроверки (чтобы студент мог проверить, понял ли он)
5. ⚠️ Частые ошибки и заблуждения

Объяснение должно быть понятным и увлекательным. НЕ давай готовых ответов на экзаменационные вопросы. Отвечай на русском языке.`;

    const text = await callGemini(prompt);

    res.json({
      explanation: text,
      concept,
      level,
    });
  } catch (error) {
    console.error('AI Explain Error:', error);
    res.status(500).json({ error: 'Не удалось объяснить концепцию' });
  }
});

// NEW: Get user's study context
router.get('/context', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const context = getUserContext(userId);
    res.json(context);
  } catch (error) {
    console.error('Get Context Error:', error);
    res.status(500).json({ error: 'Не удалось получить контекст' });
  }
});

// ============ AI CHAT MANAGEMENT ============

// Get all AI chats for user
router.get('/chats', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;

    const chats = db.prepare(`
      SELECT c.*, 
        (SELECT content FROM ai_messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM ai_messages WHERE chat_id = c.id) as message_count
      FROM ai_chats c
      WHERE c.user_id = ?
      ORDER BY c.updated_at DESC
    `).all(userId);

    res.json(chats);
  } catch (error) {
    console.error('Get AI Chats Error:', error);
    res.status(500).json({ error: 'Не удалось получить чаты' });
  }
});

// Create new AI chat
router.post('/chats', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const { title = 'Новый чат' } = req.body;

    const result = db.prepare(`
      INSERT INTO ai_chats (user_id, title) VALUES (?, ?)
    `).run(userId, title);

    const chat = db.prepare('SELECT * FROM ai_chats WHERE id = ?').get(result.lastInsertRowid);

    // Add welcome message
    db.prepare(`
      INSERT INTO ai_messages (chat_id, role, content) VALUES (?, 'assistant', ?)
    `).run(result.lastInsertRowid, 'Привет! 👋 Я AI-помощник EduFlow. Чем могу помочь?');

    res.status(201).json(chat);
  } catch (error) {
    console.error('Create AI Chat Error:', error);
    res.status(500).json({ error: 'Не удалось создать чат' });
  }
});

// Get chat messages
router.get('/chats/:chatId/messages', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const chatId = parseInt(req.params.chatId);

    // Verify chat belongs to user
    const chat = db.prepare('SELECT * FROM ai_chats WHERE id = ? AND user_id = ?').get(chatId, userId);
    if (!chat) {
      return res.status(404).json({ error: 'Чат не найден' });
    }

    const messages = db.prepare(`
      SELECT * FROM ai_messages WHERE chat_id = ? ORDER BY created_at ASC
    `).all(chatId);

    res.json(messages);
  } catch (error) {
    console.error('Get AI Messages Error:', error);
    res.status(500).json({ error: 'Не удалось получить сообщения' });
  }
});

// Send message in chat (with streaming support)
router.post('/chats/:chatId/messages', authMiddleware, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const chatId = parseInt(req.params.chatId);
    const { content, useContext = true } = req.body;

    // Verify chat belongs to user
    const chat = db.prepare('SELECT * FROM ai_chats WHERE id = ? AND user_id = ?').get(chatId, userId);
    if (!chat) {
      return res.status(404).json({ error: 'Чат не найден' });
    }

    // Save user message
    db.prepare(`
      INSERT INTO ai_messages (chat_id, role, content) VALUES (?, 'user', ?)
    `).run(chatId, content);

    // Get chat history for context
    const history = db.prepare(`
      SELECT role, content FROM ai_messages 
      WHERE chat_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all(chatId).reverse();

    // Build context
    let userContextStr = '';
    if (useContext) {
      const userContext = getUserContext(userId);
      userContextStr = `
КОНТЕКСТ СТУДЕНТА:
- Курсы: ${userContext.courses.map((c: any) => `${c.title} (${c.progress}%)`).join(', ') || 'нет'}
- Несданных заданий: ${userContext.pendingAssignments.length}
- Экзаменов: ${userContext.upcomingExams.length}
- Долгов: ${userContext.debts.length}
`;
    }

    const historyStr = history.map((m: any) => `${m.role === 'user' ? 'Студент' : 'AI'}: ${m.content}`).join('\n');

    const prompt = `Ты — образовательный помощник EduFlow.
${userContextStr}

ИСТОРИЯ ЧАТА:
${historyStr}

ВАЖНО: Не давай готовых ответов на задания/тесты. Помогай понять, не решай за студента.
Отвечай на русском языке кратко и по делу.

Последнее сообщение студента: ${content}`;

    const responseText = await callGemini(prompt);

    // Save AI response
    const result = db.prepare(`
      INSERT INTO ai_messages (chat_id, role, content) VALUES (?, 'assistant', ?)
    `).run(chatId, responseText);

    // Update chat title if it's the first real message
    const messageCount = db.prepare('SELECT COUNT(*) as count FROM ai_messages WHERE chat_id = ?').get(chatId) as any;
    if (messageCount.count <= 3) {
      // Generate title from first message
      const shortTitle = content.length > 30 ? content.substring(0, 30) + '...' : content;
      db.prepare('UPDATE ai_chats SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(shortTitle, chatId);
    } else {
      db.prepare('UPDATE ai_chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(chatId);
    }

    const message = db.prepare('SELECT * FROM ai_messages WHERE id = ?').get(result.lastInsertRowid);

    res.json(message);
  } catch (error) {
    console.error('Send AI Message Error:', error);
    res.status(500).json({ error: 'Не удалось отправить сообщение' });
  }
});

// Streaming message endpoint
router.post('/chats/:chatId/messages/stream', authMiddleware, async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const chatId = parseInt(req.params.chatId);
    const { content, useContext = true } = req.body;

    // Verify chat belongs to user
    const chat = db.prepare('SELECT * FROM ai_chats WHERE id = ? AND user_id = ?').get(chatId, userId);
    if (!chat) {
      return res.status(404).json({ error: 'Чат не найден' });
    }

    // Save user message
    db.prepare(`
      INSERT INTO ai_messages (chat_id, role, content) VALUES (?, 'user', ?)
    `).run(chatId, content);

    // Get chat history
    const history = db.prepare(`
      SELECT role, content FROM ai_messages 
      WHERE chat_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all(chatId).reverse();

    // Build context
    let userContextStr = '';
    if (useContext) {
      const userContext = getUserContext(userId);
      userContextStr = `КОНТЕКСТ: Курсы: ${userContext.courses.map((c: any) => c.title).join(', ') || 'нет'}. Задания: ${userContext.pendingAssignments.length}. Экзамены: ${userContext.upcomingExams.length}.`;
    }

    const historyStr = history.slice(-6).map((m: any) => `${m.role === 'user' ? 'Студент' : 'AI'}: ${m.content}`).join('\n');

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const response = await fetch(`${PROXY_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `Ты — образовательный помощник EduFlow. ${userContextStr} Не давай готовых ответов на задания. Помогай понять. Отвечай кратко на русском.`
            },
            ...history.slice(-6).map((m: any) => ({
              role: m.role,
              content: m.content
            })),
            { role: 'user', content }
          ],
          max_tokens: 1500,
          temperature: 0.7,
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Save full response to DB
      const result = db.prepare(`
        INSERT INTO ai_messages (chat_id, role, content) VALUES (?, 'assistant', ?)
      `).run(chatId, fullResponse);

      // Update chat
      const messageCount = db.prepare('SELECT COUNT(*) as count FROM ai_messages WHERE chat_id = ?').get(chatId) as any;
      if (messageCount.count <= 3) {
        const shortTitle = content.length > 30 ? content.substring(0, 30) + '...' : content;
        db.prepare('UPDATE ai_chats SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(shortTitle, chatId);
      } else {
        db.prepare('UPDATE ai_chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(chatId);
      }

      res.write(`data: ${JSON.stringify({ content: '', done: true, messageId: result.lastInsertRowid })}\n\n`);
      res.end();
    } catch (error) {
      console.error('Streaming error:', error);
      // Fallback to non-streaming
      const responseText = await callGemini(`${userContextStr}\n\n${historyStr}\n\nСтудент: ${content}`);
      
      const result = db.prepare(`
        INSERT INTO ai_messages (chat_id, role, content) VALUES (?, 'assistant', ?)
      `).run(chatId, responseText);

      res.write(`data: ${JSON.stringify({ content: responseText, done: true, messageId: result.lastInsertRowid })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Stream AI Message Error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Ошибка', done: true })}\n\n`);
    res.end();
  }
});

// Update chat title
router.put('/chats/:chatId', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const chatId = parseInt(req.params.chatId);
    const { title } = req.body;

    const chat = db.prepare('SELECT * FROM ai_chats WHERE id = ? AND user_id = ?').get(chatId, userId);
    if (!chat) {
      return res.status(404).json({ error: 'Чат не найден' });
    }

    db.prepare('UPDATE ai_chats SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, chatId);

    res.json({ success: true });
  } catch (error) {
    console.error('Update AI Chat Error:', error);
    res.status(500).json({ error: 'Не удалось обновить чат' });
  }
});

// Delete chat
router.delete('/chats/:chatId', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;
    const chatId = parseInt(req.params.chatId);

    const chat = db.prepare('SELECT * FROM ai_chats WHERE id = ? AND user_id = ?').get(chatId, userId);
    if (!chat) {
      return res.status(404).json({ error: 'Чат не найден' });
    }

    // Delete messages first (cascade should handle this but just in case)
    db.prepare('DELETE FROM ai_messages WHERE chat_id = ?').run(chatId);
    db.prepare('DELETE FROM ai_chats WHERE id = ?').run(chatId);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete AI Chat Error:', error);
    res.status(500).json({ error: 'Не удалось удалить чат' });
  }
});

// Clear all chats
router.delete('/chats', authMiddleware, (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = req.user!.id;

    // Get all chat IDs
    const chats = db.prepare('SELECT id FROM ai_chats WHERE user_id = ?').all(userId) as any[];
    
    for (const chat of chats) {
      db.prepare('DELETE FROM ai_messages WHERE chat_id = ?').run(chat.id);
    }
    db.prepare('DELETE FROM ai_chats WHERE user_id = ?').run(userId);

    res.json({ success: true, deleted: chats.length });
  } catch (error) {
    console.error('Clear AI Chats Error:', error);
    res.status(500).json({ error: 'Не удалось очистить чаты' });
  }
});

export default router;
