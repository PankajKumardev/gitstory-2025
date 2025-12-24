'use client'

import React from 'react';
import { SlideLayout } from '../SlideLayout';
import { GitStoryData } from '../../types';
import { TextReveal } from '../TextReveal';
import { motion } from 'framer-motion';
import { Sun, Moon, Sunrise, Sunset, Clock } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const ProductivitySlide: React.FC<{ data: GitStoryData }> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { productivity, archetype } = data;
  
  const getIcon = () => {
    if (productivity.timeOfDay === "Morning") return <Sunrise size={100} className="text-orange-400" />;
    if (productivity.timeOfDay === "Afternoon") return <Sun size={100} className="text-yellow-400" />;
    if (productivity.timeOfDay === "Evening") return <Sunset size={100} className="text-indigo-400" />;
    return <Moon size={100} className="text-blue-200" />;
  };

  const gradientStart = productivity.timeOfDay === "Morning" ? "#fdba74" : 
                        productivity.timeOfDay === "Afternoon" ? "#facc15" : 
                        productivity.timeOfDay === "Evening" ? "#818cf8" : "#1e3a8a";

  const gradientEnd = productivity.timeOfDay === "Morning" ? "#f97316" : 
                      productivity.timeOfDay === "Afternoon" ? "#ea580c" : 
                      productivity.timeOfDay === "Evening" ? "#4f46e5" : "#000000";

  return (
    <SlideLayout gradientStart={gradientStart} gradientEnd={gradientEnd}>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        
        <div className="mb-12">
            <TextReveal 
                text="The Zone." 
                className={`text-xl font-mono mb-8 uppercase tracking-widest justify-center ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`} 
            />
        </div>

        <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1.5 }}
            className="mb-8 relative"
        >
            <div className={`absolute inset-0 blur-3xl rounded-full ${isDark ? 'bg-white/20' : 'bg-black/10'}`}></div>
            {getIcon()}
        </motion.div>

        <TextReveal 
          text={`You were most active in the ${productivity.timeOfDay.toLowerCase()}.`} 
          className={`text-4xl font-serif mb-6 justify-center ${isDark ? 'text-white' : 'text-black'}`} 
          highlight={productivity.timeOfDay.toLowerCase()}
          delay={0.5}
        />

        <div className={`flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
            <Clock size={20} className={isDark ? 'text-white/70' : 'text-black/70'} />
            <span className={`text-xl font-mono ${isDark ? 'text-white' : 'text-black'}`}>Peak: {productivity.peakHour}:00</span>
        </div>
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="mt-12"
        >
            <p className={`text-sm font-sans mb-2 tracking-widest uppercase ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>Your Developer Archetype</p>
            <h2 className={`text-5xl font-bold font-serif italic text-transparent bg-clip-text bg-gradient-to-r ${isDark ? 'from-white to-white/60' : 'from-black to-black/60'}`}>
                {archetype}
            </h2>
        </motion.div>

      </div>
    </SlideLayout>
  );
};