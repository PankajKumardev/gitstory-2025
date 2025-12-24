'use client'

import React from 'react';
import { SlideLayout } from '../SlideLayout';
import { GitStoryData } from '../../types';
import { TextReveal } from '../TextReveal';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export const LanguagesSlide: React.FC<{ data: GitStoryData }> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const topLang = data.topLanguages[0];

  return (
    <SlideLayout gradientStart={topLang.color} gradientEnd="#000000">
      <div className="flex-1 flex flex-col justify-center relative">
        
        <div className="absolute inset-0 z-0 pointer-events-none">
          {data.topLanguages.map((lang, i) => (
            <motion.div
              key={lang.name}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{ 
                scale: [1, 1.2, 1],
                x: [0, Math.random() * 50 - 25, 0],
                y: [0, Math.random() * 50 - 25, 0],
              }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
              className="absolute rounded-full blur-[60px] opacity-40 mix-blend-screen"
              style={{
                backgroundColor: lang.color,
                width: `${lang.percentage * 5}px`,
                height: `${lang.percentage * 5}px`,
                top: `${30 + i * 20}%`,
                left: `${20 + i * 30}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          <TextReveal 
            text="The Palette." 
            className={`text-xl font-mono mb-8 uppercase tracking-widest ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`} 
          />

          <TextReveal 
            text={`You spoke ${topLang.name} fluently.`} 
            className={`text-6xl font-serif leading-tight mb-12 ${isDark ? 'text-white' : 'text-black'}`} 
            highlight={topLang.name}
            delay={0.5}
          />

          <div className="flex flex-col gap-4 items-center">
            {data.topLanguages.map((lang, i) => (
              <motion.div 
                key={lang.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + (i * 0.2) }}
                className="flex items-center gap-4 w-full max-w-xs"
              >
                <div 
                  className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" 
                  style={{ backgroundColor: lang.color, color: lang.color }}
                />
                <span className={`text-xl font-sans ${isDark ? 'text-white' : 'text-black'}`}>{lang.name}</span>
                <div className={`flex-1 h-px mx-2 ${isDark ? 'bg-neutral-800' : 'bg-neutral-300'}`} />
                <span className={`font-mono ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>{lang.percentage}%</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SlideLayout>
  );
};
