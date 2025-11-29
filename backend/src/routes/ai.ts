import { Router, Request, Response } from 'express';
import { authMiddleware } from '../auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const model = client.getGenerativeModel({
  model: 'gemini-2.0-flash',
});

// Get AI assistance
router.post('/help', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { topic, question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Missing question' });
    }

    const prompt = `You are an educational assistant helping a student.
Topic: ${topic || 'General'}
Context: ${context || 'No additional context'}

Student question: ${question}

Please provide a clear, educational response that helps the student understand the concept. Keep it concise and helpful.`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    res.json({
      response: text,
      topic,
      question,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get AI assistance' });
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
        return res.status(400).json({ error: 'Missing submission' });
      }

      const prompt = `You are an educational evaluator analyzing a student submission.
Rubric: ${rubric || 'General academic standards'}

Submission to analyze:
${submission}

Please provide:
1. Strengths of the submission
2. Areas for improvement
3. Specific suggestions for enhancement
4. Overall assessment

Be constructive and encouraging.`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();

      res.json({
        analysis: text,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to analyze submission' });
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
        return res.status(400).json({ error: 'Missing topic' });
      }

      const prompt = `Generate ${count} multiple choice questions about "${topic}" at ${difficulty} difficulty level.

Format each question as JSON:
{
  "question": "question text",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": 0,
  "explanation": "why this is correct"
}

Return only a JSON array.`;

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
      console.error(error);
      res.status(500).json({ error: 'Failed to generate questions' });
    }
  }
);

// Explain concept
router.post('/explain', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { concept, level = 'intermediate' } = req.body;

    if (!concept) {
      return res.status(400).json({ error: 'Missing concept' });
    }

    const prompt = `Explain the concept of "${concept}" at a ${level} level.

Include:
1. Simple definition
2. Key points
3. Real-world example
4. Common misconceptions to avoid

Keep the explanation clear and engaging.`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    res.json({
      explanation: text,
      concept,
      level,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to explain concept' });
  }
});

export default router;
