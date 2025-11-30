import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import authRouter from './routes/auth.js';
import coursesRouter from './routes/courses.js';
import assignmentsRouter from './routes/assignments.js';
import examsRouter from './routes/exams.js';
import messagesRouter from './routes/messages.js';
import aiRouter from './routes/ai.js';
import dashboardRouter from './routes/dashboard.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
  origin: process.env.CORS_ORIGIN === '*' 
    ? '*' 
    : (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Initialize database
await initDb();

// Routes
app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/exams', examsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  // Try multiple possible paths for frontend build
  const possiblePaths = [
    path.join(process.cwd(), 'frontend/build'),        // From project root (Railway)
    path.join(__dirname, '../../frontend/build'),      // Local Docker
    path.join(__dirname, '../../../frontend/build'),   // Alternative
    '/app/frontend/build',                              // Absolute path
  ];
  
  let frontendPath = '';
  const fs = await import('fs');
  
  for (const p of possiblePaths) {
    const indexPath = path.join(p, 'index.html');
    console.log(`🔍 Checking path: ${indexPath}`);
    if (fs.existsSync(indexPath)) {
      frontendPath = p;
      console.log(`✅ Found frontend at: ${frontendPath}`);
      break;
    }
  }
  
  if (frontendPath) {
    console.log(`📁 Serving frontend from: ${frontendPath}`);
    app.use(express.static(frontendPath));
    
    // Handle SPA routing - serve index.html for all non-API routes
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return next();
      }
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  } else {
    console.error('❌ Frontend build not found! Checked paths:', possiblePaths);
    // Fallback - show error page
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return next();
      }
      res.status(503).send(`
        <!DOCTYPE html>
        <html>
          <head><title>EduFlow - Starting</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>🚀 EduFlow</h1>
            <p>Backend is running, but frontend build was not found.</p>
            <p>API is available at <a href="/health">/health</a></p>
          </body>
        </html>
      `);
    });
  }
}

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Listen on 0.0.0.0 to accept connections from outside the container
const HOST = process.env.HOST || '0.0.0.0';
app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
});
