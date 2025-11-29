# EduFlow Frontend Integration

## Setup

1. Make sure the backend is running on `http://localhost:5000`

2. Install frontend dependencies:
```bash
cd Eduflow
npm install
```

3. Create `.env.local`:
```
VITE_API_URL=http://localhost:5000/api
```

## Running

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Authentication Flow

### Register
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { register } = useAuth();

await register('user@example.com', 'password123', 'John Doe', 'student');
```

### Login
```typescript
const { login } = useAuth();

await login('user@example.com', 'password123');
```

### Access User Data
```typescript
const { user, isAuthenticated } = useAuth();

if (isAuthenticated) {
  console.log(user.name, user.role);
}
```

### Logout
```typescript
const { logout } = useAuth();

logout();
```

## API Usage

### Courses
```typescript
import { coursesApi } from '@/api/client';

// Get all courses
const courses = await coursesApi.getAll();

// Get specific course
const course = await coursesApi.getById(1);

// Create course (teacher only)
const newCourse = await coursesApi.create('Math 101', 'Advanced calculus', 'advanced');

// Enroll in course (student)
await coursesApi.enroll(1);
```

### Assignments
```typescript
import { assignmentsApi } from '@/api/client';

// Get assignments for course
const assignments = await assignmentsApi.getByCourse(1);

// Create assignment (teacher)
await assignmentsApi.create(1, 1, 'Assignment 1', 'Description', '2025-12-31');

// Submit assignment (student)
await assignmentsApi.submit(1, 'My solution here');

// Grade assignment (teacher)
await assignmentsApi.grade(1, 95, 'Great work!');
```

### Exams
```typescript
import { examsApi } from '@/api/client';

// Get exams for course
const exams = await examsApi.getByCourse(1);

// Get exam with questions
const exam = await examsApi.getById(1);

// Create exam (teacher)
await examsApi.create(1, 'Midterm', 'Description', 60, 100);

// Add question (teacher)
await examsApi.addQuestion(
  1,
  'What is 2+2?',
  'multiple-choice',
  ['3', '4', '5'],
  '1',
  1
);

// Start exam (student)
const attempt = await examsApi.start(1);

// Submit exam (student)
await examsApi.submit(attempt.id, {
  '1': '4',
  '2': 'answer',
  // ...
});
```

### Messages
```typescript
import { messagesApi } from '@/api/client';

// Get conversations
const conversations = await messagesApi.getConversations();

// Get messages with user
const messages = await messagesApi.getMessages(2);

// Send message
await messagesApi.send(2, 'Hello!');

// Get unread count
const { unreadCount } = await messagesApi.getUnreadCount();
```

### AI Assistance
```typescript
import { aiApi } from '@/api/client';

// Get help with a question
const help = await aiApi.getHelp(
  'How do I solve this equation?',
  'Math',
  'Linear equations'
);

// Analyze submission
const analysis = await aiApi.analyzeSubmission(
  'My answer text',
  'Rubric: clarity, correctness'
);

// Generate quiz questions
const questions = await aiApi.generateQuestions('Biology', 5, 'intermediate');

// Explain concept
const explanation = await aiApi.explainConcept('Photosynthesis', 'beginner');
```

## Token Refresh

The token refresh happens automatically. When the auth token expires (10 minutes), the client automatically uses the refresh token to get a new one.

If both tokens expire or the refresh fails, the user is logged out automatically.

## Component Structure

### With AuthProvider
Wrap your app with `AuthProvider`:

```tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Your routes */}
      </Routes>
    </AuthProvider>
  );
}
```

### Protected Routes
Create a protected route component:

```tsx
import { useAuth } from '@/contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
}
```

## Error Handling

All API calls throw errors with meaningful messages:

```typescript
try {
  await coursesApi.create('Math', 'Description', 'advanced');
} catch (error) {
  console.error(error.message); // e.g., "Email already exists"
}
```

## Notes

- All timestamps are in UTC
- Role-based access control is enforced on the backend
- Course modifications can only be done by the course teacher
- Student and teacher roles are determined at registration
