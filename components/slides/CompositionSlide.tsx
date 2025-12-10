'use client'

import React from 'react';
import { SlideLayout } from '../SlideLayout';
import { GitStoryData } from '../../types';
import { TextReveal } from '../TextReveal';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const CompositionSlide: React.FC<{ data: GitStoryData }> = ({ data }) => {
  const { contributionBreakdown } = data;
  
  const chartData = [
    { name: 'Commits', value: contributionBreakdown.commits, color: '#3B82F6' },
    { name: 'PRs', value: contributionBreakdown.prs, color: '#8B5CF6' },
    { name: 'Issues', value: contributionBreakdown.issues, color: '#EAB308' },
    { name: 'Reviews', value: contributionBreakdown.reviews, color: '#EC4899' },
  ].filter(d => d.value > 0);

  return (
    <SlideLayout gradientStart="#1e1b4b" gradientEnd="#312e81">
      <div className="flex-1 flex flex-col items-center justify-center">
        
        <div className="mb-8 text-center">
            <TextReveal 
                text="The DNA." 
                className="text-xl font-mono text-neutral-400 mb-2 uppercase tracking-widest justify-center" 
            />
            <TextReveal 
                text="How you built it." 
                className="text-4xl font-serif text-white justify-center" 
            />
        </div>

        <div className="w-full max-w-sm h-64 relative mb-8">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={false} // Fix for chart visibility issues in some contexts
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             
             {/* Center Label */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white font-mono">100%</span>
             </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            {chartData.map((item, index) => (
                <motion.div 
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + (index * 0.2) }}
                    className="flex items-center gap-3 bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/10"
                >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="flex flex-col">
                        <span className="text-sm text-neutral-400 font-mono uppercase">{item.name}</span>
                        <span className="text-lg text-white font-bold">{item.value.toLocaleString()}</span>
                    </div>
                </motion.div>
            ))}
        </div>

      </div>
    </SlideLayout>
  );
};