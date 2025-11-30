import { Router, Request, Response } from 'express';
import { authMiddleware } from '../auth.js';

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
        max_tokens: 1000,
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

// Get AI assistance
router.post('/help', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { topic, question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Вопрос не указан' });
    }

    const prompt = `Ты — образовательный помощник EduFlow, который помогает студентам РАЗОБРАТЬСЯ в материале самостоятельно.

ВАЖНЫЕ ПРАВИЛА:
1. НИКОГДА не давай прямых ответов на задания, тесты или экзаменационные вопросы
2. Вместо ответа — задавай наводящие вопросы
3. Объясняй концепции и принципы, но не решай задачи за студента
4. Если студент просит готовый ответ — вежливо откажи и предложи разобраться вместе
5. Поощряй самостоятельное мышление

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

export default router;
