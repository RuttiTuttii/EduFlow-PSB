# EduFlow Backend Tests

## Обзор тестового покрытия

### Тестовые файлы

| Файл | Описание | Количество тестов |
|------|----------|-------------------|
| `auth.test.ts` | Аутентификация | 15 тестов |
| `courses.test.ts` | Курсы | 14 тестов |
| `assignments.test.ts` | Задания | 10 тестов |
| `exams.test.ts` | Экзамены | 13 тестов |
| `messages.test.ts` | Сообщения и уведомления | 22 теста |
| `dashboard.test.ts` | Дашборд и статистика | 15 тестов |
| `ai.test.ts` | AI-ассистент | 20 тестов |
| `integration.test.ts` | Интеграционные тесты | 15 тестов |

**Всего: ~124 теста**

## Покрытие по роутам

### `/api/auth` - Аутентификация ✅
- [x] POST `/register` - Регистрация пользователя
- [x] POST `/login` - Вход в систему
- [x] POST `/refresh` - Обновление токенов
- [x] POST `/logout` - Выход из системы
- [x] GET `/me` - Получение текущего пользователя

### `/api/courses` - Курсы ✅
- [x] GET `/` - Список всех курсов
- [x] GET `/:id` - Получение курса по ID
- [x] POST `/` - Создание курса (teacher only)
- [x] PUT `/:id` - Обновление курса (teacher only)
- [x] DELETE `/:id` - Удаление курса (teacher only)
- [x] POST `/:id/enroll` - Запись на курс

### `/api/assignments` - Задания ✅
- [x] GET `/course/:courseId` - Задания курса
- [x] POST `/` - Создание задания (teacher only)
- [x] POST `/:id/submit` - Сдача задания
- [x] POST `/:id/grade` - Оценка задания (teacher only)

### `/api/exams` - Экзамены ✅
- [x] GET `/course/:courseId` - Экзамены курса
- [x] GET `/:id` - Получение экзамена с вопросами
- [x] POST `/` - Создание экзамена (teacher only)
- [x] POST `/:examId/questions` - Добавление вопросов (teacher only)
- [x] POST `/:id/start` - Начало экзамена
- [x] POST `/:attemptId/submit` - Сдача экзамена

### `/api/messages` - Сообщения и уведомления ✅
- [x] GET `/conversations` - Список диалогов
- [x] POST `/conversations` - Создание диалога
- [x] GET `/available-users` - Доступные пользователи
- [x] GET `/user/:userId` - Сообщения с пользователем
- [x] POST `/send` - Отправка сообщения
- [x] DELETE `/:id` - Удаление сообщения
- [x] GET `/unread` - Счетчик непрочитанных
- [x] GET `/notifications` - Уведомления
- [x] GET `/notifications/unread` - Непрочитанные уведомления
- [x] PUT `/notifications/:id/read` - Прочитать уведомление
- [x] PUT `/notifications/read-all` - Прочитать все
- [x] DELETE `/notifications/:id` - Удалить уведомление
- [x] POST `/invitations/invite` - Пригласить студента
- [x] POST `/invitations/request` - Запрос на вступление

### `/api/dashboard` - Дашборд ✅
- [x] GET `/stats/student` - Статистика студента
- [x] GET `/stats/teacher` - Статистика преподавателя
- [x] GET `/courses/enrolled` - Записанные курсы
- [x] GET `/courses/teaching` - Преподаваемые курсы
- [x] GET `/activity/weekly` - Недельная активность
- [x] POST `/activity/log` - Логирование активности
- [x] GET `/calendar/events` - События календаря
- [x] POST `/calendar/events` - Создание события
- [x] GET `/achievements` - Достижения

### `/api/ai` - AI-ассистент ✅
- [x] POST `/help` - Помощь от AI
- [x] GET `/templates` - Шаблоны AI
- [x] GET `/context` - Контекст пользователя
- [x] POST `/create-debt-plan` - План закрытия долгов
- [x] POST `/recommendations` - Рекомендации
- [x] POST `/exam-prep` - Подготовка к экзамену
- [x] POST `/explain` - Объяснение концепции
- [x] POST `/summarize` - Резюме темы
- [x] POST `/analyze-submission` - Анализ работы (teacher)
- [x] POST `/generate-questions` - Генерация вопросов
- [x] GET `/chats` - Список чатов
- [x] POST `/chats` - Создание чата
- [x] GET `/chats/:chatId/messages` - Сообщения чата
- [x] POST `/chats/:chatId/messages` - Отправка в чат
- [x] PUT `/chats/:chatId` - Обновление чата
- [x] DELETE `/chats/:chatId` - Удаление чата
- [x] DELETE `/chats` - Очистка всех чатов

## Запуск тестов

```bash
# Все тесты
npm run test:jest

# С покрытием кода
npm run test:coverage

# Один файл
npx jest __tests__/auth.test.ts --runInBand
```

## Структура тестов

```
backend/
├── __tests__/
│   ├── setup.ts           # Общий setup и утилиты
│   ├── auth.test.ts       # Тесты аутентификации
│   ├── courses.test.ts    # Тесты курсов
│   ├── assignments.test.ts # Тесты заданий
│   ├── exams.test.ts      # Тесты экзаменов
│   ├── messages.test.ts   # Тесты сообщений
│   ├── dashboard.test.ts  # Тесты дашборда
│   ├── ai.test.ts         # Тесты AI
│   └── integration.test.ts # Интеграционные тесты
└── jest.config.js         # Конфигурация Jest
```

## Типы тестов

1. **Unit тесты** - Тестирование отдельных эндпоинтов
2. **Интеграционные тесты** - Тестирование полного workflow
3. **E2E сценарии** - Симуляция реального использования

## Особенности

- Каждый тест-файл независим и очищает за собой данные
- Используется in-memory SQLite для изоляции
- AI-тесты имеют увеличенный timeout (30 секунд)
- Role-based access control полностью протестирован
