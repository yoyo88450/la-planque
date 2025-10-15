'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ScrollArrowProps {
  sections: string[];
  className?: string;
}

export default function ScrollArrow({ sections, className = '' }: ScrollArrowProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (currentSectionIndex >= sections.length) {
        setIsVisible(false);
        return;
      }

      const targetElement = document.getElementById(sections[currentSectionIndex]);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setIsVisible(rect.top > window.innerHeight * 0.8);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentSectionIndex, sections]);

  const scrollToNext = () => {
    if (currentSectionIndex >= sections.length) return;

    const targetElement = document.getElementById(sections[currentSectionIndex]);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  if (!isVisible || currentSectionIndex >= sections.length) return null;

  return (
    <motion.div
      className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 cursor-pointer ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      onClick={scrollToNext}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-3 shadow-lg hover:bg-white/20 transition-all duration-300">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </motion.div>
  );
}
