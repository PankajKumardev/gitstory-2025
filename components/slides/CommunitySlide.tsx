import React from 'react';
import { SlideLayout } from '../SlideLayout';
import { GitStoryData } from '../../types';
import { TextReveal } from '../TextReveal';
import { motion } from 'framer-motion';
import { Users, Star, GitFork, Heart } from 'lucide-react';

export const CommunitySlide: React.FC<{ data: GitStoryData }> = ({ data }) => {
  const { community } = data;

  return (
    <SlideLayout gradientStart="#be123c" gradientEnd="#881337">
      <div className="flex-1 flex flex-col items-center justify-center">
        
        <div className="mb-12 text-center">
            <TextReveal 
                text="The Impact." 
                className="text-xl font-mono text-rose-300 mb-4 uppercase tracking-widest justify-center" 
            />
        </div>

        {/* Big Impact Numbers */}
        <div className="grid grid-cols-1 gap-12 w-full max-w-md">
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", delay: 0.5 }}
                className="flex flex-col items-center"
            >
                <div className="flex items-center gap-4 text-white mb-2">
                    <Users size={48} className="text-rose-400" />
                    <span className="text-7xl font-serif italic font-bold">{community.followers.toLocaleString()}</span>
                </div>
                <span className="text-neutral-400 font-mono tracking-widest uppercase text-sm">Followers inspired</span>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", delay: 1.0 }}
                className="flex flex-col items-center"
            >
                <div className="flex items-center gap-4 text-white mb-2">
                    <Star size={48} className="text-yellow-400" />
                    <span className="text-7xl font-serif italic font-bold">{community.totalStars.toLocaleString()}</span>
                </div>
                <span className="text-neutral-400 font-mono tracking-widest uppercase text-sm">Stars Earned</span>
            </motion.div>

        </div>

        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0 }}
            className="mt-16 bg-white/10 backdrop-blur-md rounded-full px-8 py-4 flex items-center gap-4 border border-white/20"
        >
            <div className="flex -space-x-3">
                 {/* Fake avatars for effect */}
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-black" />
                <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-black" />
                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-black" />
            </div>
            <span className="text-sm font-sans text-white">
                You're building more than code.
            </span>
        </motion.div>

      </div>
    </SlideLayout>
  );
};