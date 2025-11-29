import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { Logo } from './Logo';

interface FooterProps {
  theme: 'day' | 'night';
}

export function Footer({ theme }: FooterProps) {
  const textClass = theme === 'day'
    ? 'text-indigo-900'
    : 'text-white';

  const subTextClass = theme === 'day'
    ? 'text-indigo-700'
    : 'text-indigo-300';

  const linkClass = theme === 'day'
    ? 'text-indigo-600 hover:text-indigo-800'
    : 'text-indigo-400 hover:text-indigo-200';

  const containerClass = theme === 'day'
    ? 'bg-white/40 border-white/60'
    : 'bg-indigo-950/30 border-indigo-800/40';

  return (
    <footer className="relative px-4 py-16 mt-8">
      <div className="max-w-6xl mx-auto">
        <div className={`backdrop-blur-2xl border rounded-[48px] p-12 shadow-2xl ${containerClass}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Logo theme={theme} size="small" />
                <h3 className={`text-3xl ${textClass}`} style={{ fontFamily: 'Comfortaa, cursive' }}>
                  EduFlow
                </h3>
              </div>
              <p className={`${subTextClass} mb-6`}>
                Комфортная образовательная среда для студентов и преподавателей
              </p>
              <div className="flex gap-4">
                <Tooltip content="> заходи на наш GitHub! там много интересного 🚀" theme={theme}>
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center transition-all duration-300 shadow-lg`}
                  >
                    <Github className="w-5 h-5 text-white" />
                  </motion.a>
                </Tooltip>
                <Tooltip content="> читай новости! мы регулярно обновляемся 🐦" theme={theme}>
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center transition-all duration-300 shadow-lg`}
                  >
                    <Twitter className="w-5 h-5 text-white" />
                  </motion.a>
                </Tooltip>
                <Tooltip content="> подключайся в LinkedIn! networking это важно 💼" theme={theme}>
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center transition-all duration-300 shadow-lg`}
                  >
                    <Linkedin className="w-5 h-5 text-white" />
                  </motion.a>
                </Tooltip>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className={`text-xl mb-4 ${textClass}`}>
                Навигация
              </h4>
              <ul className="space-y-3">
                {['О платформе', 'Для студентов', 'Для преподавателей', 'Цены', 'Документация'].map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      className={`${linkClass} transition-colors`}
                      whileHover={{ x: 5 }}
                    >
                      {link}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className={`text-xl mb-4 ${textClass}`}>
                Контакты
              </h4>
              <ul className="space-y-4">
                <Tooltip content="> напиши нам! мы с радостью ответим 📧" theme={theme}>
                  <li className="flex items-center gap-3">
                    <Mail className={`w-5 h-5 ${subTextClass}`} />
                    <a href="mailto:info@eduflow.ru" className={`${linkClass} transition-colors`}>
                      info@eduflow.ru
                    </a>
                  </li>
                </Tooltip>
                <Tooltip content="> звони! мы всегда на связи ☎️" theme={theme}>
                  <li className="flex items-center gap-3">
                    <Phone className={`w-5 h-5 ${subTextClass}`} />
                    <a href="tel:+74951234567" className={`${linkClass} transition-colors`}>
                      +7 (495) 123-45-67
                    </a>
                  </li>
                </Tooltip>
                <Tooltip content="> приходи в гости! всегда рады 🏢" theme={theme}>
                  <li className="flex items-start gap-3">
                    <MapPin className={`w-5 h-5 mt-1 ${subTextClass}`} />
                    <span className={subTextClass}>
                      Москва, ул. Примерная, д. 1
                    </span>
                  </li>
                </Tooltip>
              </ul>
            </div>
          </div>

          <div className={`mt-12 pt-8 border-t ${
            theme === 'day' ? 'border-indigo-300/30' : 'border-indigo-700/30'
          }`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className={subTextClass}>
                © 2024 EduFlow. Все права защищены.
              </p>
              <div className="flex gap-6">
                <motion.a
                  href="#"
                  className={`${linkClass} transition-colors`}
                  whileHover={{ scale: 1.05 }}
                >
                  Политика конфиденциальности
                </motion.a>
                <motion.a
                  href="#"
                  className={`${linkClass} transition-colors`}
                  whileHover={{ scale: 1.05 }}
                >
                  Условия использования
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
