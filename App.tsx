import React, { useState } from 'react';
import { fetchUserStory } from './services/githubService';
import { GitStoryData } from './types';
import { StoryContainer } from './components/StoryContainer';
import { Github, Play, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const App: React.FC = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [storyData, setStoryData] = useState<GitStoryData | null>(null);
  const [showStory, setShowStory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUserStory(username.trim());
      setStoryData(data);
      setShowStory(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate story. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showStory && storyData) {
    return <StoryContainer data={storyData} onComplete={() => setShowStory(false)} />;
  }

  return (
    <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
       {/* Background Elements */}
       <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-hero-blue/20 rounded-full blur-[120px] pointer-events-none" />
       <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-hero-purple/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-12">
          <Github size={64} className="mx-auto mb-6 text-white" />
          <h1 className="text-5xl md:text-7xl font-serif italic mb-2 tracking-tight">GitStory</h1>
          <p className="text-neutral-400 font-sans tracking-widest text-sm uppercase">Your 2025 Cinematic Wrapped</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if(error) setError(null);
              }}
              placeholder="Enter GitHub Username"
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-6 py-4 text-xl font-mono text-center focus:outline-none focus:border-hero-blue focus:ring-1 focus:ring-hero-blue transition-all placeholder:text-neutral-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !username}
            className="w-full bg-white text-black rounded-xl px-6 py-4 font-bold text-lg hover:bg-neutral-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                Play Story <Play size={20} className="fill-black group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/20 border border-red-800/50 text-red-200 p-4 rounded-xl flex items-center gap-3 text-sm font-mono"
            >
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </motion.div>
          )}
        </form>

        <div className="mt-12 text-center text-xs text-neutral-600 font-mono">
          <p>CINEMATIC EXPERIENCE</p>
          <p className="mt-2 opacity-50">Best on Mobile • Try 'demo'</p>
        </div>
      </motion.div>
    </div>
  );
};

export default App;