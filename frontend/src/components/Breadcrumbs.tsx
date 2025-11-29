import { motion } from 'motion/react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GridPattern } from './GridPattern';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  theme: 'day' | 'night';
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ theme, items }: BreadcrumbsProps) {
  const navigate = useNavigate();

  const pageToPath = (page: string): string => {
    const mapping: { [key: string]: string } = {
      'landing': '/',
      'login': '/login',
      'register': '/register',
      'student-dashboard': '/student-dashboard',
      'teacher-dashboard': '/teacher-dashboard',
      'course': '/course',
      'assignment': '/assignment',
      'grading': '/grading',
      'messenger': '/messenger',
      'ai-assistant': '/ai-assistant',
      'create-course': '/create-course',
      'edit-course': '/edit-course',
      'create-exam': '/create-exam',
    };
    return mapping[page] || '/';
  };
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const mutedClass = theme === 'day' ? 'text-indigo-600' : 'text-indigo-300';
  const cardBg = theme === 'day' ? 'bg-white/80' : 'bg-indigo-900/60';
  const hoverBg = theme === 'day' ? 'hover:bg-white' : 'hover:bg-indigo-800/80';

  if (items.length === 0) return null;

  return (
    <nav className={`flex items-center gap-2 mb-6 ${cardBg} backdrop-blur-xl rounded-[20px] px-4 py-2 shadow-lg border ${
      theme === 'day' ? 'border-indigo-200/50' : 'border-indigo-800/50'
    } relative overflow-hidden`}>
      <GridPattern theme={theme} />
      
      <div className="relative z-10 flex items-center gap-2">
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`p-1.5 rounded-[10px] ${hoverBg} transition-all duration-300`}
          title="На главную"
        >
          <Home className={`w-4 h-4 ${mutedClass}`} />
        </motion.button>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div key={`${item.path}-${index}`} className="flex items-center gap-2">
              <ChevronRight className={`w-3.5 h-3.5 ${mutedClass}`} />
              {isLast ? (
                <span className={`px-2 py-1 ${textClass} text-sm`}>
                  {item.label}
                </span>
              ) : (
                <motion.button
                  onClick={() => navigate(pageToPath(item.path))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-2 py-1 rounded-[10px] text-sm ${mutedClass} ${hoverBg} transition-all duration-300`}
                >
                  {item.label}
                </motion.button>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
