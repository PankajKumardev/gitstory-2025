'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GitStoryData, SlideType } from '../types';
import { SLIDE_DURATION_MS } from '../constants';
import { TitleSlide } from './slides/TitleSlide';
import { VelocitySlide } from './slides/VelocitySlide';
import { GridSlide } from './slides/GridSlide';
import { CompositionSlide } from './slides/CompositionSlide';
import { RoutineSlide } from './slides/RoutineSlide';
import { ProductivitySlide } from './slides/ProductivitySlide';
import { CommunitySlide } from './slides/CommunitySlide';
import { LanguagesSlide } from './slides/LanguagesSlide';
import { TopReposSlide } from './slides/TopReposSlide';
import { RepoSlide } from './slides/RepoSlide';
import { PosterSlide } from './slides/PosterSlide';
import { X, Sun, Moon, Play, Pause, Share2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface StoryContainerProps {
  data: GitStoryData;
  onComplete: () => void;
}

export const StoryContainer: React.FC<StoryContainerProps> = ({ data, onComplete }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = 11;
  const progressIntervalRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Check if we're on the last slide (PosterSlide)
  const isLastSlide = currentSlide === SlideType.POSTER;

  const handleNext = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
      setProgress(0);
    } else {
      onComplete();
    }
  }, [currentSlide, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      setProgress(0);
    }
  }, [currentSlide]);

  // Timer Logic - PAUSED on last slide
  useEffect(() => {
    // Don't auto-progress on the last slide (PosterSlide)
    if (isPaused || isLastSlide) return;

    const startTime = Date.now();
    const startProgress = progress;

    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, startProgress + (elapsed / SLIDE_DURATION_MS) * 100);
      
      setProgress(newProgress);

      if (newProgress < 100) {
        progressIntervalRef.current = requestAnimationFrame(animateProgress);
      } else {
        handleNext();
      }
    };

    progressIntervalRef.current = requestAnimationFrame(animateProgress);

    return () => {
      if (progressIntervalRef.current) cancelAnimationFrame(progressIntervalRef.current);
    };
  }, [currentSlide, isPaused, handleNext, isLastSlide]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'd':
        case 'Enter': // Added Enter key for last slide
          handleNext();
          break;
        case 'ArrowLeft':
        case 'a':
          handlePrev();
          break;
        case ' ': // Space to pause/resume (or exit on last slide)
          e.preventDefault();
          if (isLastSlide) {
            onComplete();
          } else {
            setIsPaused(prev => !prev);
          }
          break;
        case 'Escape':
          onComplete();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onComplete, isLastSlide]);

  // Gestures
  const touchStartX = useRef(0);
  const longPressTimer = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Ignore interaction if clicking a button/interactive element
    if ((e.target as HTMLElement).closest('button, a, input')) return;

    touchStartX.current = e.clientX;
    
    // Don't pause on last slide since it's already stopped
    if (!isLastSlide) {
      setIsPaused(true);
    }
    
    longPressTimer.current = window.setTimeout(() => {
      // Long press logic handled by setting paused to true immediately
    }, 200);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    
    if (!isLastSlide) {
      setIsPaused(false);
    }

    // Ignore interaction if clicking a button/interactive element
    if ((e.target as HTMLElement).closest('button, a, input')) return;

    const diff = e.clientX - touchStartX.current;
    
    if (Math.abs(diff) < 10) {
      // It's a tap
      const screenWidth = window.innerWidth;
      if (e.clientX < screenWidth / 3) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  const renderSlide = () => {
    switch (currentSlide) {
      case SlideType.TITLE: return <TitleSlide data={data} />;
      case SlideType.VELOCITY: return <VelocitySlide data={data} />;
      case SlideType.GRID: return <GridSlide data={data} />;
      case SlideType.COMPOSITION: return <CompositionSlide data={data} />;
      case SlideType.ROUTINE: return <RoutineSlide data={data} />;
      case SlideType.PRODUCTIVITY: return <ProductivitySlide data={data} />;
      case SlideType.COMMUNITY: return <CommunitySlide data={data} />;
      case SlideType.LANGUAGES: return <LanguagesSlide data={data} />;
      case SlideType.TOP_REPOS: return <TopReposSlide data={data} />;
      case SlideType.REPO: return <RepoSlide data={data} />;
      case SlideType.POSTER: return <PosterSlide data={data} />;
      default: return null;
    }
  };

  return (
    <div 
      className={`fixed inset-0 w-full h-[100dvh] select-none cursor-pointer transition-colors ${isDark ? 'bg-black' : 'bg-white'}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => !isLastSlide && setIsPaused(false)}
    >
      {/* Progress Bar */}
      <div className="absolute top-4 left-2 right-2 flex gap-1 z-50">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <div key={idx} className={`h-1 flex-1 rounded-full overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-neutral-300'}`}>
            <div 
              className={`h-full transition-all duration-100 ease-linear ${isDark ? 'bg-white' : 'bg-neutral-800'}`}
              style={{ 
                width: idx < currentSlide ? '100%' : idx === currentSlide ? (isLastSlide ? '100%' : `${progress}%`) : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Control Buttons - Right Side */}
      <div className="absolute top-8 right-4 z-50 flex items-center gap-1">
        {!isLastSlide && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsPaused(prev => !prev); }}
            className={`p-2 rounded-lg transition-all active:scale-90 ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-black/70 hover:text-black hover:bg-black/10'}`}
            aria-label={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
          className={`p-2 rounded-lg transition-all active:scale-90 ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-black/70 hover:text-black hover:bg-black/10'}`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          className={`p-2 rounded-lg transition-all active:scale-90 ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-black/70 hover:text-black hover:bg-black/10'}`}
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Slide Content */}
      <AnimatePresence mode="popLayout" initial={false}>
        <div key={currentSlide} className="w-full h-full">
          {renderSlide()}
        </div>
      </AnimatePresence>
    </div>
  );
};