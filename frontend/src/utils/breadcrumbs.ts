interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbConfig {
  [key: string]: BreadcrumbItem[];
}

export const breadcrumbsConfig: BreadcrumbConfig = {
  'landing': [],
  'login': [
    { label: 'Главная', path: 'landing' },
    { label: 'Вход', path: 'login' },
  ],
  'register': [
    { label: 'Главная', path: 'landing' },
    { label: 'Регистрация', path: 'register' },
  ],
  'student-dashboard': [
    { label: 'Дашборд', path: 'student-dashboard' },
  ],
  'teacher-dashboard': [
    { label: 'Дашборд', path: 'teacher-dashboard' },
  ],
  'course': [
    { label: 'Дашборд', path: 'student-dashboard' },
    { label: 'Курсы', path: 'student-dashboard' },
    { label: 'Основы маркетинга', path: 'course' },
  ],
  'assignment': [
    { label: 'Дашборд', path: 'student-dashboard' },
    { label: 'Основы маркетинга', path: 'course' },
    { label: 'Анализ аудитории', path: 'assignment' },
  ],
  'grading': [
    { label: 'Дашборд', path: 'teacher-dashboard' },
    { label: 'Основы маркетинга', path: 'edit-course' },
    { label: 'Проверка работ', path: 'grading' },
  ],
  'messenger': [
    { label: 'Дашборд', path: 'student-dashboard' },
    { label: 'Сообщения', path: 'messenger' },
  ],
  'ai-assistant': [
    { label: 'Дашборд', path: 'student-dashboard' },
    { label: 'AI Помощник', path: 'ai-assistant' },
  ],
  'create-course': [
    { label: 'Дашборд', path: 'teacher-dashboard' },
    { label: 'Создание курса', path: 'create-course' },
  ],
  'edit-course': [
    { label: 'Дашборд', path: 'teacher-dashboard' },
    { label: 'Мои курсы', path: 'teacher-dashboard' },
    { label: 'Основы маркетинга', path: 'edit-course' },
  ],
  'create-exam': [
    { label: 'Дашборд', path: 'teacher-dashboard' },
    { label: 'Создание теста', path: 'create-exam' },
  ],
};

export function getBreadcrumbs(currentPage: string, userRole?: 'student' | 'teacher' | null): BreadcrumbItem[] {
  let breadcrumbs = breadcrumbsConfig[currentPage] || [];
  
  // Adjust dashboard path based on user role
  if (userRole) {
    breadcrumbs = breadcrumbs.map(item => {
      if (item.path === 'student-dashboard' && userRole === 'teacher') {
        return { ...item, path: 'teacher-dashboard', label: 'Дашборд преподавателя' };
      }
      if (item.path === 'teacher-dashboard' && userRole === 'student') {
        return { ...item, path: 'student-dashboard', label: 'Дашборд' };
      }
      return item;
    });
  }
  
  return breadcrumbs;
}
