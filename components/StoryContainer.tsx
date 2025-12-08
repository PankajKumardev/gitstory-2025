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
import { X } from 'lucide-react';

interface StoryContainerProps {
  data: GitStoryData;
  onComplete: () => void;
}

export const StoryContainer: React.FC<StoryContainerProps> = ({ data, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = 11;
  const progressIntervalRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

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

  // Timer Logic
  useEffect(() => {
    if (isPaused) return;

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
  }, [currentSlide, isPaused, handleNext]);

  // Gestures
  const touchStartX = useRef(0);
  const longPressTimer = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Ignore interaction if clicking a button/interactive element
    if ((e.target as HTMLElement).closest('button, a, input')) return;

    touchStartX.current = e.clientX;
    setIsPaused(true);
    
    longPressTimer.current = window.setTimeout(() => {
      // Long press logic handled by setting paused to true immediately
    }, 200);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    setIsPaused(false);

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
      className="fixed inset-0 w-full h-[100dvh] bg-black select-none cursor-pointer"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => setIsPaused(false)}
    >
      {/* Progress Bar */}
      <div className="absolute top-4 left-2 right-2 flex gap-1 z-50">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <div key={idx} className="h-1 flex-1 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ 
                width: idx < currentSlide ? '100%' : idx === currentSlide ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Close Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onComplete(); }}
        className="absolute top-8 right-4 z-50 text-white/50 hover:text-white p-2"
      >
        <X size={24} />
      </button>

      {/* Slide Content */}
      <AnimatePresence mode="popLayout" initial={false}>
        <div key={currentSlide} className="w-full h-full">
          {renderSlide()}
        </div>
      </AnimatePresence>
    </div>
  );
};