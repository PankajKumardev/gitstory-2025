import React, { useEffect, useState, useRef } from 'react';
import { SlideLayout } from '../SlideLayout';
import { GitStoryData } from '../../types';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Download, Check, Loader2, AlertTriangle } from 'lucide-react';
import { toPng } from 'html-to-image';

export const PosterSlide: React.FC<{ data: GitStoryData }> = ({ data }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Fire confetti on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3B82F6', '#8B5CF6', '#EAB308']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3B82F6', '#8B5CF6', '#EAB308']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const generateImage = async (skipFonts = false) => {
    if (!posterRef.current) return;

    const dataUrl = await toPng(posterRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      quality: 0.95,
      skipFonts: skipFonts,
      filter: (node) => {
        // Filter out elements that might cause issues
        const tagName = (node as HTMLElement).tagName;
        return tagName !== 'LINK' && tagName !== 'SCRIPT';
      }
    });

    const link = document.createElement('a');
    link.download = `gitstory-${data.username}-${data.year}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDownload = async (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    
    if (hasDownloaded || isDownloading) return;

    setIsDownloading(true);
    setError(null);
    
    try {
      // First attempt: Try normally (with fonts)
      try {
        await generateImage(false);
        setHasDownloaded(true);
        setTimeout(() => setHasDownloaded(false), 3000);
      } catch (err) {
        console.warn("Standard download failed, retrying without fonts embedding...", err);
        // Second attempt: Skip fonts if CORS/CSS access fails
        await generateImage(true);
        setHasDownloaded(true);
        setTimeout(() => setHasDownloaded(false), 3000);
      }
    } catch (err) {
      console.error("Failed to generate poster image:", err);
      setError("Failed to save. Try screenshotting!");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <SlideLayout gradientStart="#000000" gradientEnd="#171717">
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        
        {/* The Poster */}
        <motion.div 
          ref={posterRef}
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="bg-neutral-900 border-4 border-white p-6 w-full max-w-sm aspect-[4/5] relative flex flex-col justify-between shadow-[0_0_50px_rgba(255,255,255,0.1)]"
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b border-neutral-700 pb-4">
            <img 
                src={data.avatarUrl} 
                alt="Avatar" 
                crossOrigin="anonymous"
                className="w-16 h-16 rounded-full border border-neutral-500 grayscale" 
            />
            <div className="text-right">
               <h1 className="text-3xl font-serif text-white italic">GitStory</h1>
               <div className="text-xl font-mono text-neutral-500 tracking-tighter">2025</div>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-6 py-4">
             <div>
               <div className="text-xs text-neutral-500 uppercase font-mono tracking-widest mb-1">Starring</div>
               <div className="text-2xl text-white font-sans font-bold">@{data.username}</div>
               <div className="text-lg text-hero-blue font-serif italic">{data.archetype}</div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <div className="text-xs text-neutral-500 uppercase font-mono tracking-widest mb-1">Commits</div>
                  <div className="text-xl text-white font-serif italic">{data.totalCommits}</div>
               </div>
               <div>
                  <div className="text-xs text-neutral-500 uppercase font-mono tracking-widest mb-1">Top Lang</div>
                  <div className="text-xl text-white font-serif italic">{data.topLanguages[0]?.name || "N/A"}</div>
               </div>
             </div>

             <div>
                <div className="text-xs text-neutral-500 uppercase font-mono tracking-widest mb-1">Magnum Opus</div>
                <div className="text-lg text-neutral-200 font-bold truncate">{data.topRepo.name}</div>
             </div>
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-700 pt-4 flex justify-between items-end">
             <div className="barcode h-8 w-24 bg-white opacity-80" style={{ backgroundImage: 'repeating-linear-gradient(90deg, black 0, black 2px, transparent 2px, transparent 4px)'}}></div>
             <div className="text-[10px] text-neutral-600 font-mono uppercase">Directed by You</div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className={`mt-8 flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
            hasDownloaded 
              ? "bg-green-500 text-white" 
              : error 
                ? "bg-red-500 text-white"
                : "bg-white text-black hover:bg-neutral-200"
          }`}
          onClick={handleDownload}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : hasDownloaded ? (
            <>
              <Check size={18} />
              Saved!
            </>
          ) : error ? (
            <>
              <AlertTriangle size={18} />
              {error}
            </>
          ) : (
            <>
              <Download size={18} />
              Save Poster
            </>
          )}
        </motion.button>

      </div>
    </SlideLayout>
  );
};