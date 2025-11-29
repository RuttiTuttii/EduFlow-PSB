import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/client';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const { authToken } = authApi.getTokens();
    if (authToken) {
      // In a real app, verify the token with the backend
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    }
    setIsLoading(false);
  }, []);

  const register = async (email: string, password: string, name: string, role = 'student') => {
    const data = await authApi.register(email, password, name, role);
    authApi.setTokens(data.authToken, data.refreshToken);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    authApi.setTokens(data.authToken, data.refreshToken);
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
