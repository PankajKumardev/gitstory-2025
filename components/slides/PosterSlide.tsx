'use client'

import React, { useEffect, useState, useRef } from 'react';
import { SlideLayout } from '../SlideLayout';
import { GitStoryData } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Download, Check, Loader2, AlertTriangle, Share2, X } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useTheme } from '@/context/ThemeContext';

// Social share icons
const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const RedditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

export const PosterSlide: React.FC<{ data: GitStoryData }> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  
  const shareText = `My GitHub Wrapped 2025:\n\n${data.totalCommits} commits\n${data.topLanguages[0]?.name || 'Code'} mastery\n${data.community.totalStars} stars earned\n\nCheck out your GitStory too!`;
  const shareUrl = 'https://gitstory.pankajk.tech/';

  const shareLinks = [
    {
      name: 'X / Twitter',
      icon: <TwitterIcon />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: <LinkedInIcon />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Reddit',
      icon: <RedditIcon />,
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`
    },
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    },
  ];
  
  useEffect(() => {
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

  const generateImage = async (skipFonts = false): Promise<void> => {
    if (!posterRef.current) return;

    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        quality: 0.95,
        skipFonts: skipFonts,
        filter: (node) => {
          const tagName = (node as HTMLElement).tagName;
          return tagName !== 'LINK' && tagName !== 'SCRIPT';
        }
      });

      const link = document.createElement('a');
      link.download = `gitstory-${data.username}-${data.year}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      if (!skipFonts) {
        throw err;
      }
      throw new Error('Image generation failed');
    }
  };

  const handleDownload = async (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    
    if (hasDownloaded || isDownloading) return;

    setIsDownloading(true);
    setError(null);
    
    try {
      await generateImage(false);
      setHasDownloaded(true);
      setTimeout(() => setHasDownloaded(false), 3000);
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
        
        <motion.div 
          ref={posterRef}
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className={`border-4 p-6 w-full max-w-sm aspect-[4/5] relative flex flex-col justify-between ${isDark ? 'bg-neutral-900 border-white shadow-[0_0_50px_rgba(255,255,255,0.1)]' : 'bg-neutral-100 border-black shadow-[0_0_50px_rgba(0,0,0,0.1)]'}`}
        >
          <div className={`flex justify-between items-start border-b pb-4 ${isDark ? 'border-neutral-700' : 'border-neutral-300'}`}>
            <img 
                src={data.avatarUrl} 
                alt="Avatar" 
                crossOrigin="anonymous"
                className={`w-16 h-16 rounded-full border grayscale ${isDark ? 'border-neutral-500' : 'border-neutral-400'}`} 
            />
            <div className="text-right">
               <h1 className={`text-3xl font-serif italic ${isDark ? 'text-white' : 'text-black'}`}>GitStory</h1>
               <div className={`text-xl font-mono tracking-tighter ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>2025</div>
            </div>
          </div>

          <div className="space-y-6 py-4">
             <div>
               <div className={`text-xs uppercase font-mono tracking-widest mb-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Starring</div>
               <div className={`text-2xl font-sans font-bold ${isDark ? 'text-white' : 'text-black'}`}>@{data.username}</div>
               <div className="text-lg text-hero-blue font-serif italic">{data.archetype}</div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <div className={`text-xs uppercase font-mono tracking-widest mb-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Commits</div>
                  <div className={`text-xl font-serif italic ${isDark ? 'text-white' : 'text-black'}`}>{data.totalCommits}</div>
               </div>
               <div>
                  <div className={`text-xs uppercase font-mono tracking-widest mb-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Top Lang</div>
                  <div className={`text-xl font-serif italic ${isDark ? 'text-white' : 'text-black'}`}>{data.topLanguages[0]?.name || "N/A"}</div>
               </div>
             </div>

             <div>
                <div className={`text-xs uppercase font-mono tracking-widest mb-1 ${isDark ? 'text-neutral-500' : 'text-neutral-600'}`}>Magnum Opus</div>
                <div className={`text-lg font-bold truncate ${isDark ? 'text-neutral-200' : 'text-neutral-800'}`}>{data.topRepo.name}</div>
             </div>
          </div>

          <div className={`border-t pt-4 flex justify-between items-end ${isDark ? 'border-neutral-700' : 'border-neutral-300'}`}>
             <div className={`barcode h-8 w-24 opacity-80 ${isDark ? 'bg-white' : 'bg-black'}`} style={{ backgroundImage: isDark ? 'repeating-linear-gradient(90deg, black 0, black 2px, transparent 2px, transparent 4px)' : 'repeating-linear-gradient(90deg, white 0, white 2px, transparent 2px, transparent 4px)'}}></div>
             <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-neutral-600' : 'text-neutral-500'}`}>Directed by You</div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-8 flex items-center gap-3"
        >
          {/* Save Button */}
          <button
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all active:scale-95 ${
              hasDownloaded 
                ? "bg-green-500 text-white" 
                : error 
                  ? "bg-red-500 text-white"
                  : isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
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
                Save
              </>
            )}
          </button>

          {/* Share Button with Dropdown */}
          <div className="relative">
            <button
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all active:scale-95 ${isDark ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-black/10 text-black border border-black/20 hover:bg-black/20'}`}
              onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Share2 size={18} />
              Share
            </button>

            {/* Share Dropdown Menu */}
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute bottom-full mb-2 right-0 min-w-[180px] py-2 rounded-xl shadow-xl border ${isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200'}`}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {shareLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowShareMenu(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${isDark ? 'text-neutral-300 hover:bg-white/10' : 'text-neutral-700 hover:bg-black/5'}`}
                    >
                      <span className={isDark ? 'text-neutral-400' : 'text-neutral-500'}>{link.icon}</span>
                      <span className="text-sm font-medium">{link.name}</span>
                    </a>
                  ))}
                  <div className={`my-1 border-t ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`} />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      setCopied(true);
                      setShowShareMenu(false);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 w-full transition-colors ${isDark ? 'text-neutral-300 hover:bg-white/10' : 'text-neutral-700 hover:bg-black/5'}`}
                  >
                    <span className={isDark ? 'text-neutral-400' : 'text-neutral-500'}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </span>
                    <span className="text-sm font-medium">Copy Link</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Copied Toast */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium shadow-lg ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
            >
              Link copied!
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </SlideLayout>
  );
};