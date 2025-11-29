import { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { Problems } from '../components/Problems';
import { Solution } from '../components/Solution';
import { ForStudents } from '../components/ForStudents';
import { ForTeachers } from '../components/ForTeachers';
import { Features } from '../components/Features';
import { CTA } from '../components/CTA';
import { Footer } from '../components/Footer';
import { ThemeToggle } from '../components/ThemeToggle';
import { CloudBackground } from '../components/CloudBackground';
import { BurgerMenu } from '../components/BurgerMenu';

interface LandingPageProps {
  theme: 'day' | 'night';
  onNavigate: (page: string) => void;
  onToggleTheme: () => void;
}

export function LandingPage({ theme, onNavigate, onToggleTheme }: LandingPageProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [menuOpen]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <CloudBackground theme={theme} />
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      <BurgerMenu 
        theme={theme} 
        isOpen={menuOpen} 
        onToggle={setMenuOpen}
        onNavigate={onNavigate}
      />
      
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-all duration-300"
          onClick={() => setMenuOpen(false)}
        />
      )}
      
      <main className="relative z-10">
        <Hero theme={theme} onNavigate={onNavigate} />
        <div className="px-4 space-y-8 pb-20">
          <Problems theme={theme} />
          <Solution theme={theme} />
          <ForStudents theme={theme} />
          <ForTeachers theme={theme} />
          <Features theme={theme} />
          <CTA theme={theme} onNavigate={onNavigate} />
        </div>
        <Footer theme={theme} />
      </main>
    </div>
  );
}
