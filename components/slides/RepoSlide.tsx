'use client'

import React from 'react';
import { SlideLayout } from '../SlideLayout';
import { GitStoryData } from '../../types';
import { TextReveal } from '../TextReveal';
import { motion } from 'framer-motion';
import { Star, GitCommit } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const RepoSlide: React.FC<{ data: GitStoryData }> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <SlideLayout gradientStart="#1e293b" gradientEnd="#0f172a">
      <div className="flex-1 flex flex-col items-center justify-center perspective-1000">
        
        <div className="mb-10 text-center">
          <TextReveal 
            text="But one project defined your year." 
            className={`text-3xl font-serif ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`} 
          />
        </div>

        <motion.div
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 10, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.5 }}
          className={`w-72 aspect-[3/4] border rounded-xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'}`}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className={`absolute inset-0 bg-gradient-to-tr to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${isDark ? 'from-white/10' : 'from-black/5'}`} />
          
          <div>
            <div className="text-xs font-mono text-hero-blue mb-2">TOP REPOSITORY</div>
            <h2 className={`text-3xl font-bold leading-none break-words mb-4 line-clamp-3 ${isDark ? 'text-white' : 'text-black'}`}>{data.topRepo.name}</h2>
            <p className={`text-sm leading-relaxed font-sans line-clamp-4 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>{data.topRepo.description}</p>
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-2 text-code-yellow">
                <Star size={18} fill="currentColor" />
                <span className="font-mono text-lg">{data.topRepo.stars.toLocaleString()} Stars</span>
             </div>
             <div className={`flex items-center gap-2 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                <GitCommit size={18} />
                <span className="font-mono text-sm">{data.topRepo.language}</span>
             </div>
          </div>
        </motion.div>
      </div>
    </SlideLayout>
  );
};
