# EduFlow Backend Setup

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Create `.env` file with:
```
PORT=5000
JWT_SECRET=b77565dc063a8ebe845faf09ff95eb3fba3b53d0558c2d17fdef84eee75ce82c
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
NODE_ENV=development
GEMINI_API_KEY=your-gemini-api-key-here
```

2. Get Gemini API Key:
   - Visit https://makersuite.google.com/app/apikeys
   - Create a new API key
   - Add it to `.env`

## Running the Backend

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (teacher)
- `PUT /api/courses/:id` - Update course (teacher)
- `DELETE /api/courses/:id` - Delete course (teacher)
- `POST /api/courses/:id/enroll` - Enroll in course (student)

### Assignments
- `GET /api/assignments/course/:courseId` - Get assignments
- `POST /api/assignments` - Create assignment (teacher)
- `POST /api/assignments/:id/submit` - Submit assignment (student)
- `POST /api/assignments/:id/grade` - Grade assignment (teacher)

### Exams
- `GET /api/exams/course/:courseId` - Get exams
- `GET /api/exams/:id` - Get exam with questions
- `POST /api/exams` - Create exam (teacher)
- `POST /api/exams/:examId/questions` - Add question (teacher)
- `POST /api/exams/:id/start` - Start exam attempt (student)
- `POST /api/exams/:attemptId/submit` - Submit exam (student)

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/user/:userId` - Get messages with user
- `POST /api/messages/send` - Send message
- `GET /api/messages/unread` - Get unread count

### AI Assistance
- `POST /api/ai/help` - Get AI help with question
- `POST /api/ai/analyze-submission` - AI analyze assignment
- `POST /api/ai/generate-questions` - Generate quiz questions
- `POST /api/ai/explain` - Explain concept

## Database

SQLite database is automatically initialized at `./data/eduflow.db`

Tables:
- users
- courses
- enrollments
- lessons
- assignments
- submissions
- exams
- exam_questions
- exam_attempts
- exam_answers
- messages
- achievements

## Token System

- **Auth Token**: 10 minutes expiration
- **Refresh Token**: 2 weeks expiration

When auth token expires, use refresh token to get new auth token automatically.

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Role-based access control (student, teacher)
- Course ownership verification
- SQL injection prevention
