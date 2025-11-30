import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { NewLandingPage } from './pages/NewLandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { CoursePage } from './pages/CoursePage';
import { CoursesPage } from './pages/CoursesPage';
import { AssignmentPage } from './pages/AssignmentPage';
import { GradingPage } from './pages/GradingPage';
import { MessengerPage } from './pages/MessengerPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { LoadingPage } from './pages/LoadingPage';
import { ErrorPage } from './pages/ErrorPage';
import { CreateCoursePage } from './pages/CreateCoursePage';
import { CreateExamPage } from './pages/CreateExamPage';
import { EditCoursePage } from './pages/EditCoursePage';
import { useDynamicFavicon } from './utils/useDynamicFavicon';

export type UserRole = 'student' | 'teacher' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: User | null;
  requiredRole?: UserRole;
}

function ProtectedRoute({ children, user, requiredRole }: ProtectedRouteProps) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'day' | 'night'>('night');
  const [loading, setLoading] = useState(true);

  // Динамический favicon в зависимости от темы
  useDynamicFavicon(theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    if (userData.role === 'student') {
      navigate('/student-dashboard');
    } else if (userData.role === 'teacher') {
      navigate('/teacher-dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(theme === 'day' ? 'night' : 'day');
  };

  if (loading) {
    return <LoadingPage theme={theme} />;
  }

  return (
    <Routes>
      <Route path="/" element={
        <NewLandingPage 
          theme={theme} 
          onNavigate={navigate} 
          onToggleTheme={toggleTheme}
          isAuthenticated={!!user}
          user={user ? { name: user.name, role: user.role || 'student' } : null}
          onLogout={handleLogout}
        />
      } />
      <Route path="/old-landing" element={<LandingPage theme={theme} onNavigate={navigate} onToggleTheme={toggleTheme} />} />
      <Route path="/login" element={<LoginPage theme={theme} onLogin={handleLogin} onNavigate={navigate} />} />
      <Route path="/register" element={<RegisterPage theme={theme} onRegister={handleLogin} onNavigate={navigate} />} />

      <Route path="/student-dashboard" element={
        <ProtectedRoute user={user} requiredRole="student">
          <StudentDashboard theme={theme} user={user} onLogout={handleLogout} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />

      <Route path="/teacher-dashboard" element={
        <ProtectedRoute user={user} requiredRole="teacher">
          <TeacherDashboard theme={theme} user={user} onLogout={handleLogout} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />

      <Route path="/courses" element={
        <ProtectedRoute user={user}>
          <CoursesPage theme={theme} user={user} onLogout={handleLogout} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />

      <Route path="/course" element={
        <ProtectedRoute user={user}>
          <CoursePage theme={theme} user={user} onNavigate={navigate} onLogout={handleLogout} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />

      <Route path="/assignment" element={
        <ProtectedRoute user={user}>
          <AssignmentPage theme={theme} user={user} onNavigate={navigate} onLogout={handleLogout} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />

      <Route path="/grading" element={
        <ProtectedRoute user={user} requiredRole="teacher">
          <GradingPage theme={theme} user={user} onNavigate={navigate} onLogout={handleLogout} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />

      <Route path="/messenger" element={
        <ProtectedRoute user={user}>
          <MessengerPage theme={theme} user={user} onNavigate={navigate} onLogout={handleLogout} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />

      <Route path="/ai-assistant" element={
        <ProtectedRoute user={user}>
          <AIAssistantPage theme={theme} user={user} onNavigate={navigate} onLogout={handleLogout} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />

      <Route path="/create-course" element={
        <ProtectedRoute user={user} requiredRole="teacher">
          <CreateCoursePage theme={theme} user={user} onNavigate={navigate} onLogout={handleLogout} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />

      <Route path="/create-exam" element={
        <ProtectedRoute user={user} requiredRole="teacher">
          <CreateExamPage theme={theme} user={user} onNavigate={navigate} onLogout={handleLogout} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />

      <Route path="/edit-course" element={
        <ProtectedRoute user={user} requiredRole="teacher">
          <EditCoursePage theme={theme} user={user} onNavigate={navigate} onLogout={handleLogout} onToggleTheme={toggleTheme} />
        </ProtectedRoute>
      } />

      <Route path="/unauthorized" element={<ErrorPage theme={theme} errorCode="403" onNavigate={navigate} />} />
      <Route path="*" element={<ErrorPage theme={theme} errorCode="404" onNavigate={navigate} />} />
    </Routes>
  );
}

export default function App() {
  return <div className="min-h-screen"><AppContent /></div>;
}
