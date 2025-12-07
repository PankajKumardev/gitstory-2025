import React from 'react';
import { SlideLayout } from '../SlideLayout';
import { GitStoryData } from '../../types';
import { TextReveal } from '../TextReveal';
import { motion } from 'framer-motion';
import { Sun, Moon, Sunrise, Sunset, Clock } from 'lucide-react';

export const ProductivitySlide: React.FC<{ data: GitStoryData }> = ({ data }) => {
  const { productivity, archetype } = data;
  
  // Icon based on time
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
                className="text-xl font-mono text-neutral-400 mb-8 uppercase tracking-widest justify-center" 
            />
        </div>

        <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1.5 }}
            className="mb-8 relative"
        >
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full"></div>
            {getIcon()}
        </motion.div>

        <TextReveal 
          text={`You were most active in the ${productivity.timeOfDay.toLowerCase()}.`} 
          className="text-4xl font-serif text-white mb-6 justify-center" 
          highlight={productivity.timeOfDay.toLowerCase()}
          delay={0.5}
        />

        <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full backdrop-blur-md">
            <Clock size={20} className="text-white/70" />
            <span className="text-xl font-mono text-white">Peak: {productivity.peakHour}:00</span>
        </div>
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className="mt-12"
        >
            <p className="text-neutral-400 text-sm font-sans mb-2 tracking-widest uppercase">Your Developer Archetype</p>
            <h2 className="text-5xl font-bold font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                {archetype}
            </h2>
        </motion.div>

      </div>
    </SlideLayout>
  );
};