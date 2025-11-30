import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { GridPattern } from './GridPattern';
import { dashboardApi } from '../api/client';

interface CalendarProps {
  theme: 'day' | 'night';
}

interface CalendarEvent {
  id: number;
  title: string;
  event_date: string;
  event_time?: string;
  type: string;
  course_title?: string;
}

const getEventColor = (type: string) => {
  switch (type) {
    case 'deadline':
      return { color: 'bg-red-500', bgColor: 'bg-red-100' };
    case 'exam':
      return { color: 'bg-orange-500', bgColor: 'bg-orange-100' };
    case 'lesson':
      return { color: 'bg-blue-500', bgColor: 'bg-blue-100' };
    case 'event':
    default:
      return { color: 'bg-purple-500', bgColor: 'bg-purple-100' };
  }
};

export function Calendar({ theme }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const cardBg = theme === 'day' 
    ? 'bg-white/70 border-white/50' 
    : 'bg-indigo-900/70 border-indigo-700/30';
  const textClass = theme === 'day' ? 'text-indigo-900' : 'text-white';
  const dayBg = theme === 'day' ? 'hover:bg-indigo-100/80' : 'hover:bg-indigo-800/60';
  const todayBg = theme === 'day' 
    ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
    : 'bg-gradient-to-br from-indigo-600 to-purple-700';

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const data = await dashboardApi.getCalendarEvents(currentDate.getMonth() + 1, currentDate.getFullYear());
        setEvents(data);
      } catch (error) {
        console.error('Failed to load calendar events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [firstDay, daysInMonth]);

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const eventDate = new Date(e.event_date);
      return eventDate.getDate() === day;
    });
  };

  const isToday = (day: number) => {
    return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };

  const upcomingEvents = events
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 5);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ scale: 1.01 }}
      className={`${cardBg} backdrop-blur-2xl border rounded-[32px] p-6 relative overflow-hidden`}
      style={{ boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)' }}
    >
      <GridPattern theme={theme} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg flex items-center gap-2 font-medium ${textClass}`}>
            <CalendarIcon className="w-5 h-5" />
            {monthName} {year}
          </h3>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={previousMonth}
              className={`p-2 rounded-[12px] ${dayBg} transition-colors`}
            >
              <ChevronLeft className={`w-5 h-5 ${textClass}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextMonth}
              className={`p-2 rounded-[12px] ${dayBg} transition-colors`}
            >
              <ChevronRight className={`w-5 h-5 ${textClass}`} />
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
            <div key={day} className={`text-center text-sm font-semibold ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
              {day}
            </div>
          ))}
        </div>

        <motion.div 
          className="grid grid-cols-7 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          key={`${year}-${currentDate.getMonth()}`}
        >
          {calendarDays.map((day, index) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const isDayToday = day ? isToday(day) : false;

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02, type: 'spring', stiffness: 100 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`aspect-square rounded-[12px] flex flex-col items-center justify-center text-sm transition-all relative ${
                  day === null
                    ? ''
                    : isDayToday
                    ? `${todayBg} text-white shadow-lg font-semibold`
                    : `${dayBg} ${textClass}`
                }`}
              >
                {day && <span className="text-base font-medium">{day}</span>}
                {dayEvents.length > 0 && (
                  <div className="flex gap-1.5 mt-1 flex-wrap justify-center">
                    {dayEvents.slice(0, 2).map((event, i) => {
                      const { color } = getEventColor(event.type);
                      return (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.3 }}
                          className={`w-3 h-3 rounded-full ${color} shadow-md cursor-pointer hover:shadow-lg transition-shadow`}
                          title={event.title}
                        />
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <div className={`w-2 h-2 rounded-full ${theme === 'day' ? 'bg-indigo-400' : 'bg-indigo-300'}`} />
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>

        <div className={`my-4 h-px ${theme === 'day' ? 'bg-indigo-200' : 'bg-indigo-700/50'}`} />
        
        {loading ? (
          <div className={`mt-4 text-center py-4 ${theme === 'day' ? 'text-indigo-400' : 'text-indigo-300'}`}>
            <p className="text-sm">Загрузка событий...</p>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="mt-4 space-y-2">
            <h4 className={`text-sm font-semibold mb-3 ${textClass}`}>Предстоящие события</h4>
            {upcomingEvents.map((event, index) => {
              const { color } = getEventColor(event.type);
              const eventDate = new Date(event.event_date);
              return (
                <motion.div
                  key={event.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-[16px] transition-all hover:shadow-md ${
                    theme === 'day' ? 'bg-indigo-50' : 'bg-indigo-800/50'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className={`w-4 h-4 rounded-full ${color} shadow-md flex-shrink-0`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${textClass}`}>{event.title}</div>
                    <div className={`text-xs ${theme === 'day' ? 'text-indigo-600' : 'text-indigo-300'}`}>
                      {eventDate.getDate()} {monthNames[eventDate.getMonth()]}
                      {event.course_title && ` • ${event.course_title}`}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className={`mt-4 text-center py-4 ${theme === 'day' ? 'text-indigo-400' : 'text-indigo-300'}`}>
            <p className="text-sm">Нет событий в этом месяце</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
