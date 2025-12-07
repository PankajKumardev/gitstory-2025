import React from 'react';
import { SlideLayout } from '../SlideLayout';
import { GitStoryData } from '../../types';
import { TextReveal } from '../TextReveal';
import { motion } from 'framer-motion';

export const GridSlide: React.FC<{ data: GitStoryData }> = ({ data }) => {
  // Normalize data for visualization
  // Create a 7x20 grid (showing ~5 months) for aesthetic purposes on mobile
  // or use the whole year scaling down. 
  // Let's use the last 150 days to keep the "cubes" visible size.
  
  const displayData = data.velocityData.slice(-140); // Last ~20 weeks
  
  return (
    <SlideLayout gradientStart="#10b981" gradientEnd="#064e3b">
      <div className="flex-1 flex flex-col items-center justify-center">
        
        <div className="mb-8 text-center">
            <TextReveal 
                text="Every commit counts." 
                className="text-4xl font-serif text-white mb-2" 
            />
             <TextReveal 
                text={`${data.totalCommits} contributions made.`} 
                className="text-xl font-mono text-emerald-400" 
                highlight={`${data.totalCommits}`}
                delay={0.5}
            />
        </div>

        {/* The Grid Visual */}
        <div className="relative p-4 bg-neutral-900/50 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm overflow-hidden">
            {/* Grid Container */}
            <div className="flex gap-1">
                {Array.from({ length: 20 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                            const dataIndex = weekIndex * 7 + dayIndex;
                            const commitCount = displayData[dataIndex]?.commits || 0;
                            
                            // Color logic
                            let bgClass = "bg-neutral-800";
                            let opacity = 0.3;
                            
                            if (commitCount > 0) {
                                bgClass = "bg-emerald-500";
                                opacity = Math.min(0.4 + (commitCount / 10), 1);
                            }

                            return (
                                <motion.div
                                    key={dayIndex}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ 
                                        delay: 0.5 + (weekIndex * 0.05) + (dayIndex * 0.01),
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20
                                    }}
                                    className={`w-3 h-3 md:w-4 md:h-4 rounded-sm ${bgClass}`}
                                    style={{ opacity: commitCount > 0 ? opacity : 0.2, boxShadow: commitCount > 5 ? '0 0 8px #10b981' : 'none' }}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
             <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-60 pointer-events-none"></div>
        </div>

        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="mt-8 text-xs font-mono text-neutral-500 uppercase tracking-widest"
        >
            Visualizing recent activity
        </motion.p>

      </div>
    </SlideLayout>
  );
};