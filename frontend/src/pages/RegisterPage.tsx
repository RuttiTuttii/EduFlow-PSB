import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User as UserIcon, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getBreadcrumbs } from '../utils/breadcrumbs';
import { authApi } from '../api/client';
import type { User } from '../App';

interface RegisterPageProps {
  theme: 'day' | 'night';
  onRegister: (user: User) => void;
  onNavigate: (page: string) => void;
}

export function RegisterPage({ theme, onRegister, onNavigate }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const bgGradient = theme === 'day'
    ? 'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500'
    : 'bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950';

  const cardBg = theme === 'day'
    ? 'bg-white/95'
    : 'bg-indigo-900/95';

  const textClass = theme === 'day'
    ? 'text-indigo-900'
    : 'text-white';

  const inputBg = theme === 'day'
    ? 'bg-indigo-50 border-indigo-200 focus:border-indigo-500'
    : 'bg-indigo-800/50 border-indigo-700 focus:border-indigo-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают!');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.register(email, password, name, role);
      authApi.setTokens(data.authToken, data.refreshToken);
      const mockUser: User = {
        id: String(data.user.id),
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      };
      onRegister(mockUser);
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${bgGradient} flex items-center justify-center p-4 relative`}>
      {/* Breadcrumbs */}
      <div className="absolute top-8 left-8 z-20">
        <Breadcrumbs 
          theme={theme}
          items={getBreadcrumbs('register')}
          onNavigate={onNavigate}
        />
      </div>
      
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              theme === 'day' ? 'bg-white/30' : 'bg-indigo-400/30'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <motion.button
          onClick={() => onNavigate('landing')}
          className={`absolute -top-16 left-0 flex items-center gap-2 px-4 py-2 rounded-[20px] ${
            theme === 'day' ? 'bg-white text-indigo-900' : 'bg-indigo-900 text-white'
          } shadow-xl`}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Назад</span>
        </motion.button>

        <div className={`${cardBg} rounded-[48px] p-10 shadow-2xl`}>
          <div className="flex flex-col items-center mb-8">
            <Logo theme={theme} size="small" />
            <h1 className={`text-3xl mt-4 mb-2 ${textClass}`}>
              Регистрация
            </h1>
            <p className={`${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
              Начните обучение прямо сейчас
            </p>
          </div>

          <div className="flex gap-3 mb-6">
            <motion.button
              onClick={() => setRole('student')}
              className={`flex-1 py-3 rounded-[24px] transition-all duration-300 ${
                role === 'student'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : theme === 'day'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-indigo-800/50 text-indigo-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Студент
            </motion.button>
            <motion.button
              onClick={() => setRole('teacher')}
              className={`flex-1 py-3 rounded-[24px] transition-all duration-300 ${
                role === 'teacher'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                  : theme === 'day'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-indigo-800/50 text-indigo-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Преподаватель
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-[16px] border-2 flex items-start gap-3 ${
                  theme === 'day'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-red-900/30 border-red-700/50'
                }`}
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className={`text-sm ${theme === 'day' ? 'text-red-700' : 'text-red-300'}`}>
                  {error}
                </p>
              </motion.div>
            )}

            <div>
              <label className={`block mb-2 ${textClass}`}>Имя</label>
              <div className="relative">
                <UserIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'
                }`} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  className={`w-full pl-12 pr-4 py-3 rounded-[20px] border-2 ${inputBg} ${textClass} transition-all duration-300 focus:outline-none`}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className={`block mb-2 ${textClass}`}>Email</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'
                }`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={`w-full pl-12 pr-4 py-3 rounded-[20px] border-2 ${inputBg} ${textClass} transition-all duration-300 focus:outline-none`}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className={`block mb-2 ${textClass}`}>Пароль</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3 rounded-[20px] border-2 ${inputBg} ${textClass} transition-all duration-300 focus:outline-none`}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className={`w-5 h-5 ${theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'}`} />
                  ) : (
                    <Eye className={`w-5 h-5 ${theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'}`} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className={`block mb-2 ${textClass}`}>Подтвердите пароль</label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'
                }`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3 rounded-[20px] border-2 ${inputBg} ${textClass} transition-all duration-300 focus:outline-none`}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className={`w-5 h-5 ${theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'}`} />
                  ) : (
                    <Eye className={`w-5 h-5 ${theme === 'day' ? 'text-indigo-500' : 'text-indigo-400'}`} />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-[24px] text-white text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                loading
                  ? theme === 'day'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 cursor-not-allowed'
                  : role === 'student'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/50'
                  : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:shadow-lg hover:shadow-pink-500/50'
              } shadow-xl mt-6`}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>
                </motion.div>
              )}
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </motion.button>
          </form>

          <div className={`text-center mt-6 ${theme === 'day' ? 'text-indigo-700' : 'text-indigo-300'}`}>
            Уже есть аккаунт?{' '}
            <button
              onClick={() => onNavigate('login')}
              className={`${theme === 'day' ? 'text-indigo-600 hover:text-indigo-800' : 'text-indigo-400 hover:text-indigo-200'} transition-colors underline`}
            >
              Войти
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
