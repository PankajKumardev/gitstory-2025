'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface SlideLayoutProps {
  children: React.ReactNode;
  gradientStart?: string;
  gradientEnd?: string;
}

export const SlideLayout: React.FC<SlideLayoutProps> = ({ children, gradientStart = "#3B82F6", gradientEnd = "#8B5CF6" }) => {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden bg-black"
      initial={{ x: "100%" }}
      animate={{ x: "0%", scale: 1, filter: "brightness(1)" }}
      exit={{ scale: 0.9, opacity: 0, filter: "brightness(0.5)", transition: { duration: 0.6 } }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
           className="w-[200%] h-[200%] -top-[50%] -left-[50%] absolute"
           style={{
             background: `radial-gradient(circle at 50% 50%, ${gradientStart}20 0%, transparent 60%), radial-gradient(circle at 80% 80%, ${gradientEnd}20 0%, transparent 60%)`
           }}
         />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col px-6 py-12">
        {children}
      </div>
    </motion.div>
  );
};
