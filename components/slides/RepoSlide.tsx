'use client'

import React from 'react';
import { SlideLayout } from '../SlideLayout';
import { GitStoryData } from '../../types';
import { TextReveal } from '../TextReveal';
import { motion } from 'framer-motion';
import { Star, GitCommit } from 'lucide-react';

export const RepoSlide: React.FC<{ data: GitStoryData }> = ({ data }) => {
  return (
    <SlideLayout gradientStart="#1e293b" gradientEnd="#0f172a">
      <div className="flex-1 flex flex-col items-center justify-center perspective-1000">
        
        <div className="mb-10 text-center">
          <TextReveal 
            text="But one project defined your year." 
            className="text-3xl font-serif text-neutral-200" 
          />
        </div>

        {/* 3D Card */}
        <motion.div
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 10, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.5 }}
          className="w-72 aspect-[3/4] bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div>
            <div className="text-xs font-mono text-hero-blue mb-2">TOP REPOSITORY</div>
            <h2 className="text-3xl font-bold text-white leading-none break-words mb-4 line-clamp-3">{data.topRepo.name}</h2>
            <p className="text-sm text-neutral-400 leading-relaxed font-sans line-clamp-4">{data.topRepo.description}</p>
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-2 text-code-yellow">
                <Star size={18} fill="currentColor" />
                <span className="font-mono text-lg">{data.topRepo.stars.toLocaleString()} Stars</span>
             </div>
             <div className="flex items-center gap-2 text-neutral-400">
                <GitCommit size={18} />
                <span className="font-mono text-sm">{data.topRepo.language}</span>
             </div>
          </div>
        </motion.div>
      </div>
    </SlideLayout>
  );
};
