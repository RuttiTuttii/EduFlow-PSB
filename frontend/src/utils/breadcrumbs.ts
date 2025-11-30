interface BreadcrumbItem {
  label: string;
  path: string;
  isDynamic?: boolean; // Flag to indicate dynamic content
}

interface BreadcrumbConfig {
  [key: string]: BreadcrumbItem[];
}

// Base configuration with placeholders for dynamic items
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
  'courses': [
    { label: 'Дашборд', path: 'student-dashboard' },
    { label: 'Курсы', path: 'courses' },
  ],
  'course': [
    { label: 'Дашборд', path: 'student-dashboard' },
    { label: 'Курсы', path: 'courses' },
    { label: '', path: 'course', isDynamic: true },
  ],
  'assignment': [
    { label: 'Дашборд', path: 'student-dashboard' },
    { label: '', path: 'course', isDynamic: true },
    { label: '', path: 'assignment', isDynamic: true },
  ],
  'grading': [
    { label: 'Дашборд', path: 'teacher-dashboard' },
    { label: '', path: 'edit-course', isDynamic: true },
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
    { label: '', path: 'edit-course', isDynamic: true },
  ],
  'create-exam': [
    { label: 'Дашборд', path: 'teacher-dashboard' },
    { label: 'Создание теста', path: 'create-exam' },
  ],
};

interface DynamicLabels {
  courseName?: string;
  assignmentName?: string;
}

export function getBreadcrumbs(
  currentPage: string, 
  userRole?: 'student' | 'teacher' | null,
  dynamicLabels?: DynamicLabels
): BreadcrumbItem[] {
  let breadcrumbs = breadcrumbsConfig[currentPage] || [];
  
  // Apply dynamic labels
  if (dynamicLabels) {
    breadcrumbs = breadcrumbs.map(item => {
      if (item.isDynamic) {
        if ((item.path === 'course' || item.path === 'edit-course') && dynamicLabels.courseName) {
          return { ...item, label: dynamicLabels.courseName };
        }
        if (item.path === 'assignment' && dynamicLabels.assignmentName) {
          return { ...item, label: dynamicLabels.assignmentName };
        }
      }
      return item;
    });
  }
  
  // Adjust dashboard path based on user role
  if (userRole) {
    breadcrumbs = breadcrumbs.map(item => {
      if (item.path === 'student-dashboard' && userRole === 'teacher') {
        return { ...item, path: 'teacher-dashboard', label: item.label === 'Дашборд' ? 'Дашборд' : item.label };
      }
      if (item.path === 'teacher-dashboard' && userRole === 'student') {
        return { ...item, path: 'student-dashboard', label: item.label === 'Дашборд' ? 'Дашборд' : item.label };
      }
      return item;
    });
  }
  
  // Filter out items with empty labels (unfilled dynamic items)
  return breadcrumbs.filter(item => item.label !== '');
}
