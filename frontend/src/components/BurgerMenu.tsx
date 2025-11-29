import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

interface BurgerMenuProps {
  theme: "day" | "night";
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

const menuSections = [
  {
    title: "Навигация",
    items: [
      {
        title: "Главная",
        href: "#hero",
        tooltip: "начни отсюда! здесь всё самое важное",
        emoji: "🏠",
      },
      {
        title: "Проблемы",
        href: "#problems",
        tooltip: "узнай какие проблемы мы решаем",
        emoji: "💡",
      },
      {
        title: "Решение",
        href: "#solution",
        tooltip: "вот как мы это делаем! магия внутри",
        emoji: "✨",
      },
      {
        title: "Для студентов",
        href: "#students",
        tooltip: "учись легко и с удовольствием",
        emoji: "📚",
      },
      {
        title: "Для преподавателей",
        href: "#teachers",
        tooltip: "преподавай эффективно! мы поможем",
        emoji: "🎓",
      },
    ],
  },
  {
    title: "Возможности",
    items: [
      {
        title: "Функции",
        href: "#features",
        tooltip: "всё что нужно для обучения! смотри сам",
        emoji: "🚀",
      },
      {
        title: "Начать",
        href: "#cta",
        tooltip: "присоединяйся! это бесплатно",
        emoji: "🎉",
      },
    ],
  },
];

export function BurgerMenu({
  theme,
  isOpen,
  onToggle,
}: BurgerMenuProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(
    null,
  );
  const [activeSection, setActiveSection] = useState(0);

  const handleLinkClick = () => {
    onToggle(false);
  };

  const bgGradient =
    theme === "day"
      ? "bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500"
      : "bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950";

  const cardBg =
    theme === "day" ? "bg-white/95" : "bg-indigo-900/95";

  const textClass =
    theme === "day" ? "text-indigo-900" : "text-white";

  const tooltipBg =
    theme === "day" ? "bg-indigo-600" : "bg-indigo-700";

  const itemBg =
    theme === "day"
      ? "bg-indigo-50 hover:bg-indigo-100"
      : "bg-indigo-800/50 hover:bg-indigo-700/70";

  const currentSection = menuSections[activeSection];
  const hoveredItemData = currentSection.items.find(
    (item) => item.href === hoveredItem,
  );

  return (
    <>
      {/* Burger Button */}
      <motion.button
        onClick={() => onToggle(!isOpen)}
        className={`fixed top-8 left-8 z-50 flex flex-col gap-1.5 p-4 rounded-[24px] ${
          theme === "day"
            ? "bg-white/95 border-2 border-indigo-300 shadow-lg"
            : "bg-indigo-900/95 border-2 border-indigo-700 shadow-2xl"
        } transition-all duration-300`}
        whileHover={{ scale: 1.05, rotate: isOpen ? 0 : 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className={`w-6 h-0.5 rounded-full ${
            theme === "day" ? "bg-indigo-900" : "bg-white"
          }`}
          animate={
            isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }
          }
          transition={{ duration: 0.3 }}
        />
        <motion.span
          className={`w-6 h-0.5 rounded-full ${
            theme === "day" ? "bg-indigo-900" : "bg-white"
          }`}
          animate={
            isOpen
              ? { opacity: 0, x: -10 }
              : { opacity: 1, x: 0 }
          }
          transition={{ duration: 0.3 }}
        />
        <motion.span
          className={`w-6 h-0.5 rounded-full ${
            theme === "day" ? "bg-indigo-900" : "bg-white"
          }`}
          animate={
            isOpen
              ? { rotate: -45, y: -8 }
              : { rotate: 0, y: 0 }
          }
          transition={{ duration: 0.3 }}
        />
      </motion.button>

      {/* Full Screen Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 z-40 ${bgGradient}`}
          >
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-2 h-2 rounded-full ${
                    theme === "day"
                      ? "bg-white/30"
                      : "bg-indigo-400/30"
                  }`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, Math.random() * 20 - 10, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <div className="relative h-full flex items-center justify-center p-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{
                  duration: 0.4,
                  type: "spring",
                  damping: 25,
                }}
                className="w-full max-w-7xl"
              >
                {/* Close Button */}

                {/* Section Tabs */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex gap-4 mb-8"
                >
                  {menuSections.map((section, index) => (
                    <motion.button
                      key={section.title}
                      onClick={() => setActiveSection(index)}
                      className={`px-8 py-4 rounded-[28px] text-xl transition-all duration-300 ${
                        activeSection === index
                          ? theme === "day"
                            ? "bg-white text-indigo-900 shadow-xl"
                            : "bg-indigo-900 text-white shadow-xl"
                          : theme === "day"
                            ? "bg-white/40 text-white"
                            : "bg-indigo-900/40 text-white/70"
                      }`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {section.title}
                    </motion.button>
                  ))}
                </motion.div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Menu Items - Takes 2 columns */}
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                    className="lg:col-span-2"
                  >
                    <div
                      className={`${cardBg} rounded-[48px] p-8 shadow-2xl`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentSection.items.map(
                          (item, index) => (
                            <motion.a
                              key={item.href}
                              href={item.href}
                              onClick={handleLinkClick}
                              onMouseEnter={() =>
                                setHoveredItem(item.href)
                              }
                              onMouseLeave={() =>
                                setHoveredItem(null)
                              }
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: index * 0.08,
                              }}
                              className={`relative group p-6 rounded-[32px] ${itemBg} transition-all duration-500 overflow-hidden`}
                              whileHover={{
                                scale: 1.03,
                                y: -5,
                              }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {/* Animated gradient on hover */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                animate={
                                  hoveredItem === item.href
                                    ? {
                                        backgroundPosition: [
                                          "0% 50%",
                                          "100% 50%",
                                          "0% 50%",
                                        ],
                                      }
                                    : {}
                                }
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                }}
                              />

                              <div className="relative z-10 flex items-center gap-4">
                                {/* Emoji with animation */}
                                <motion.div
                                  className="text-4xl"
                                  animate={
                                    hoveredItem === item.href
                                      ? {
                                          rotate: [
                                            0, -10, 10, -10, 0,
                                          ],
                                          scale: [1, 1.2, 1],
                                        }
                                      : {}
                                  }
                                  transition={{ duration: 0.6 }}
                                >
                                  {item.emoji}
                                </motion.div>

                                <div className="flex-1">
                                  <motion.h3
                                    className={`text-xl ${textClass} flex items-center gap-2`}
                                    animate={{
                                      x:
                                        hoveredItem ===
                                        item.href
                                          ? 10
                                          : 0,
                                    }}
                                    transition={{
                                      duration: 0.5,
                                      ease: "easeOut",
                                    }}
                                  >
                                    {item.title}
                                    <motion.div
                                      animate={{
                                        opacity:
                                          hoveredItem ===
                                          item.href
                                            ? 1
                                            : 0,
                                        x:
                                          hoveredItem ===
                                          item.href
                                            ? 0
                                            : -10,
                                      }}
                                      transition={{
                                        duration: 0.3,
                                      }}
                                    >
                                      <ArrowRight className="w-5 h-5" />
                                    </motion.div>
                                  </motion.h3>
                                </div>
                              </div>

                              {/* Sparkle effect on hover */}
                              <AnimatePresence>
                                {hoveredItem === item.href && (
                                  <>
                                    {[...Array(5)].map(
                                      (_, i) => (
                                        <motion.div
                                          key={i}
                                          initial={{
                                            opacity: 0,
                                            scale: 0,
                                          }}
                                          animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0, 1, 0],
                                            x:
                                              Math.random() *
                                                100 -
                                              50,
                                            y:
                                              Math.random() *
                                                100 -
                                              50,
                                          }}
                                          exit={{ opacity: 0 }}
                                          transition={{
                                            duration: 1,
                                            delay: i * 0.1,
                                            repeat: Infinity,
                                            repeatDelay: 0.5,
                                          }}
                                          className="absolute"
                                          style={{
                                            left: "50%",
                                            top: "50%",
                                          }}
                                        >
                                          <Sparkles
                                            className={`w-4 h-4 ${
                                              theme === "day"
                                                ? "text-indigo-500"
                                                : "text-indigo-300"
                                            }`}
                                          />
                                        </motion.div>
                                      ),
                                    )}
                                  </>
                                )}
                              </AnimatePresence>
                            </motion.a>
                          ),
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Tooltip Area - Takes 1 column */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-1"
                  >
                    <div
                      className={`${tooltipBg} rounded-[48px] p-8 shadow-2xl h-full flex flex-col items-center justify-center min-h-[400px]`}
                    >
                      <AnimatePresence mode="wait">
                        {hoveredItemData ? (
                          <motion.div
                            key={hoveredItemData.href}
                            initial={{
                              opacity: 0,
                              scale: 0.8,
                              y: 20,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.8,
                              y: -20,
                            }}
                            transition={{
                              duration: 0.4,
                              type: "spring",
                            }}
                            className="text-center space-y-6"
                          >
                            <motion.div
                              animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.2, 1.2, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                              }}
                              className="text-7xl"
                            >
                              {hoveredItemData.emoji}
                            </motion.div>

                            <motion.p
                              className="text-2xl text-white leading-relaxed px-4"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              {hoveredItemData.tooltip}
                            </motion.p>

                            {/* Decorative elements */}
                            <div className="flex justify-center gap-2">
                              {[...Array(3)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="w-2 h-2 rounded-full bg-white/50"
                                  animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                  }}
                                />
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center space-y-4"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="text-6xl"
                            >
                              ✨
                            </motion.div>
                            <p className="text-white/60 text-lg">
                              Наведите на пункт меню
                              <br />
                              чтобы узнать больше
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>

                {/* Bottom hint */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`mt-8 text-center ${
                    theme === "day"
                      ? "text-white"
                      : "text-indigo-200"
                  } text-lg`}
                >
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    💫 Выберите раздел и начните путешествие по
                    EduFlow
                  </motion.span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}