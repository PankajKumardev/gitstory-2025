'use client'

import React from 'react';
import { SlideLayout } from '../SlideLayout';
import { GitStoryData } from '../../types';
import { TextReveal } from '../TextReveal';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export const RoutineSlide: React.FC<{ data: GitStoryData }> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const maxVal = Math.max(...data.weekdayStats);
  const maxIndex = data.weekdayStats.indexOf(maxVal);
  const maxHeight = 180; // Max bar height in pixels

  return (
    <SlideLayout gradientStart="#374151" gradientEnd="#111827">
      <div className="flex-1 flex flex-col items-center justify-center">
        
        {/* Heading */}
        <div className="mb-10 text-center">
          <TextReveal 
            text="Your favorite day?" 
            className={`text-xl font-mono mb-4 uppercase tracking-widest ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`} 
          />
          <TextReveal 
            text={`${fullDays[maxIndex]}s.`} 
            className={`text-5xl md:text-6xl font-serif italic ${isDark ? 'text-white' : 'text-neutral-800'}`} 
            delay={0.5}
          />
        </div>

        {/* Bar Chart */}
        <div className="flex items-end justify-center gap-3 md:gap-6 w-full max-w-xl px-4">
          {data.weekdayStats.map((count, index) => {
            const heightPercentage = maxVal > 0 ? count / maxVal : 0;
            const barHeight = Math.max(heightPercentage * maxHeight, 30); // Min 30px
            const isMax = index === maxIndex;

            return (
              <div key={index} className="flex flex-col items-center gap-3 flex-1">
                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: barHeight }}
                  transition={{ 
                    delay: 0.8 + (index * 0.08), 
                    duration: 0.6, 
                    ease: [0.34, 1.56, 0.64, 1]
                  }}
                  className={`w-full max-w-12 md:max-w-16 rounded-xl ${
                    isMax 
                      ? (isDark ? "bg-white" : "bg-neutral-800") 
                      : (isDark ? "bg-neutral-600" : "bg-neutral-400")
                  }`}
                  style={{
                    boxShadow: isMax 
                      ? (isDark ? '0 0 40px rgba(255,255,255,0.5)' : '0 0 30px rgba(0,0,0,0.2)') 
                      : 'none'
                  }}
                />
                {/* Day Label */}
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + (index * 0.08) }}
                  className={`text-base md:text-lg font-medium ${
                    isMax 
                      ? (isDark ? "text-white" : "text-neutral-800") 
                      : (isDark ? "text-neutral-500" : "text-neutral-500")
                  }`}
                >
                  {days[index]}
                </motion.span>
              </div>
            );
          })}
        </div>

        {/* Bottom Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.6 }}
          className={`mt-10 text-lg md:text-xl font-light italic ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}
        >
          You ship most on {fullDays[maxIndex]}s
        </motion.p>

      </div>
    </SlideLayout>
  );
};