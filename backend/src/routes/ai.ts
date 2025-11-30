import { Router, Request, Response } from 'express';
import { authMiddleware } from '../auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// ProxyAPI configuration for hackathon
// Using custom baseUrl for ProxyAPI.ru
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'sk-68J3E3GDfyBQotTdg9NEexCqc8OMqUST';
const PROXY_BASE_URL = 'https://api.proxyapi.ru/google';

const client = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use gemini-1.5-flash for lower cost, with ProxyAPI baseUrl
const model = client.getGenerativeModel(
  { model: 'gemini-1.5-flash' },
  { baseUrl: PROXY_BASE_URL }
);

// Get AI assistance
router.post('/help', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { topic, question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Вопрос не указан' });
    }

    const prompt = `Ты — образовательный помощник, который помогает студентам.
Тема: ${topic || 'Общая'}
Контекст: ${context || 'Дополнительный контекст отсутствует'}

Вопрос студента: ${question}

Пожалуйста, дай понятный, образовательный ответ, который поможет студенту понять концепцию. Отвечай кратко и по делу. Отвечай на русском языке.`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();

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

// Analyze assignment
router.post(
  '/analyze-submission',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { submission, rubric } = req.body;

      if (!submission) {
        return res.status(400).json({ error: 'Работа не указана' });
      }

      const prompt = `Ты — образовательный эксперт, анализирующий работу студента.
Критерии оценки: ${rubric || 'Общие академические стандарты'}

Работа для анализа:
${submission}

Пожалуйста, укажи:
1. Сильные стороны работы
2. Области для улучшения
3. Конкретные предложения по доработке
4. Общая оценка

Будь конструктивным и ободряющим. Отвечай на русском языке.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();

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

      const response = await model.generateContent(prompt);
      const text = response.response.text();

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

// Explain concept
router.post('/explain', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { concept, level = 'intermediate' } = req.body;

    if (!concept) {
      return res.status(400).json({ error: 'Концепция не указана' });
    }

    const levelRu = level === 'beginner' ? 'начальном' : level === 'advanced' ? 'продвинутом' : 'среднем';

    const prompt = `Объясни концепцию "${concept}" на ${levelRu} уровне.

Включи:
1. Простое определение
2. Ключевые моменты
3. Пример из реальной жизни
4. Распространённые заблуждения, которых стоит избегать

Объяснение должно быть понятным и увлекательным. Отвечай на русском языке.`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();

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

export default router;
