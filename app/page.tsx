'use client'

import { useState, useEffect } from 'react'
import { fetchUserStory } from '@/services/githubService'
import { GitStoryData } from '@/types'
import { StoryContainer } from '@/components/StoryContainer'
import { Github, Play, Loader2, AlertCircle, Key, ChevronDown, ChevronUp, Lock, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [storyData, setStoryData] = useState<GitStoryData | null>(null)
  const [showStory, setShowStory] = useState(false)
  const [error, setError] = useState<{ message: string; type: 'rate_limit' | 'not_found' | 'auth' | 'generic' } | null>(null)
  
  // Token validation state
  const [tokenStatus, setTokenStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle')
  const [tokenUser, setTokenUser] = useState<{ login: string; avatar_url: string } | null>(null)

  // Validate token when it changes
  useEffect(() => {
    if (!token || token.length < 10) {
      setTokenStatus('idle')
      setTokenUser(null)
      return
    }

    const validateToken = async () => {
      setTokenStatus('validating')
      try {
        const res = await fetch('https://api.github.com/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const user = await res.json()
          setTokenUser({ login: user.login, avatar_url: user.avatar_url })
          setTokenStatus('valid')
          // Auto-fill username if empty
          if (!username) setUsername(user.login)
        } else {
          setTokenStatus('invalid')
          setTokenUser(null)
        }
      } catch {
        setTokenStatus('invalid')
        setTokenUser(null)
      }
    }

    const debounce = setTimeout(validateToken, 500)
    return () => clearTimeout(debounce)
  }, [token, username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) return

    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchUserStory(username.trim(), token.trim() || undefined)
      setStoryData(data)
      setShowStory(true)
    } catch (err: any) {
      console.error(err)
      
      // Parse error type for better UX
      const errorMessage = err.message || "Failed to generate story."
      let errorType: 'rate_limit' | 'not_found' | 'auth' | 'generic' = 'generic'
      
      if (errorMessage.toLowerCase().includes('rate limit')) {
        errorType = 'rate_limit'
      } else if (errorMessage.toLowerCase().includes('not found')) {
        errorType = 'not_found'
      } else if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('401')) {
        errorType = 'auth'
      }
      
      setError({ message: errorMessage, type: errorType })
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorDetails = () => {
    if (!error) return null
    
    switch (error.type) {
      case 'rate_limit':
        return {
          title: 'Rate Limit Exceeded',
          message: error.message,
          suggestion: token 
            ? 'Try again in a few minutes, or check your token permissions.'
            : 'Add a GitHub token below for 5000 requests/hour instead of 60.',
          showTokenHint: !token
        }
      case 'not_found':
        return {
          title: 'User Not Found',
          message: error.message,
          suggestion: 'Check the username spelling. Try "demo" to see the experience.',
          showTokenHint: false
        }
      case 'auth':
        return {
          title: 'Authentication Error',
          message: error.message,
          suggestion: 'Your token may be invalid or expired. Please check it.',
          showTokenHint: true
        }
      default:
        return {
          title: 'Something Went Wrong',
          message: error.message,
          suggestion: 'Please try again. If the problem persists, try "demo".',
          showTokenHint: false
        }
    }
  }

  if (showStory && storyData) {
    return <StoryContainer data={storyData} onComplete={() => setShowStory(false)} />
  }

  const errorDetails = getErrorDetails()

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
                setUsername(e.target.value)
                if(error) setError(null)
              }}
              placeholder="Enter GitHub Username"
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-6 py-4 text-xl font-mono text-center focus:outline-none focus:border-hero-blue focus:ring-1 focus:ring-hero-blue transition-all placeholder:text-neutral-600"
            />
          </div>

          {/* Optional Token Section */}
          <div>
            <button
              type="button"
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="w-full flex items-center justify-center gap-2 text-neutral-500 hover:text-neutral-300 text-xs font-mono py-2 transition-colors"
            >
              <Key size={12} />
              {showTokenInput ? 'Hide' : 'Add GitHub Token'} (Optional)
              {showTokenInput ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            
            <AnimatePresence>
              {showTokenInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 space-y-2">
                    <div className="relative">
                      <input
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxx"
                        className={`w-full bg-neutral-900/30 border rounded-lg px-4 py-3 text-sm font-mono text-center focus:outline-none transition-all placeholder:text-neutral-700 ${
                          tokenStatus === 'valid' 
                            ? 'border-green-500/50 focus:border-green-500 focus:ring-1 focus:ring-green-500' 
                            : tokenStatus === 'invalid'
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-neutral-800 focus:border-hero-purple focus:ring-1 focus:ring-hero-purple'
                        }`}
                      />
                      {/* Token status indicator */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {tokenStatus === 'validating' && (
                          <Loader2 size={16} className="animate-spin text-neutral-400" />
                        )}
                        {tokenStatus === 'valid' && (
                          <CheckCircle2 size={16} className="text-green-500" />
                        )}
                        {tokenStatus === 'invalid' && (
                          <XCircle size={16} className="text-red-500" />
                        )}
                      </div>
                    </div>
                    
                    {/* Auth status badge */}
                    <AnimatePresence>
                      {tokenStatus === 'valid' && tokenUser && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2"
                        >
                          <img 
                            src={tokenUser.avatar_url} 
                            alt={tokenUser.login}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-xs text-green-400 font-mono">
                            Connected as <strong>@{tokenUser.login}</strong>
                          </span>
                          <CheckCircle2 size={12} className="text-green-500 ml-auto" />
                        </motion.div>
                      )}
                      {tokenStatus === 'invalid' && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2"
                        >
                          <XCircle size={14} className="text-red-400" />
                          <span className="text-xs text-red-400 font-mono">
                            Invalid token - check and try again
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-start gap-2 text-neutral-600 text-xs p-2">
                      <Lock size={12} className="shrink-0 mt-0.5" />
                      <p>
                        Token stays in your browser. Enables: private repos, org repos, 5000 API calls/hr.{' '}
                        <a 
                          href="https://github.com/settings/tokens/new?scopes=repo,read:org,read:user&description=GitStory%202025" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-hero-blue hover:underline"
                        >
                          Create token →
                        </a>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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

          {/* Enhanced Error Display */}
          <AnimatePresence>
            {errorDetails && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl border ${
                  error?.type === 'rate_limit' 
                    ? 'bg-orange-900/20 border-orange-800/50' 
                    : error?.type === 'not_found'
                    ? 'bg-yellow-900/20 border-yellow-800/50'
                    : 'bg-red-900/20 border-red-800/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className={`shrink-0 mt-0.5 ${
                    error?.type === 'rate_limit' ? 'text-orange-400' : 
                    error?.type === 'not_found' ? 'text-yellow-400' : 'text-red-400'
                  }`} />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white mb-1">{errorDetails.title}</p>
                    <p className="text-xs text-neutral-400 mb-2">{errorDetails.message}</p>
                    <p className="text-xs text-neutral-500">{errorDetails.suggestion}</p>
                    
                    {errorDetails.showTokenHint && !showTokenInput && (
                      <button
                        type="button"
                        onClick={() => setShowTokenInput(true)}
                        className="mt-2 text-xs text-hero-blue hover:underline flex items-center gap-1"
                      >
                        <Key size={10} /> Add Token for Higher Limits
                      </button>
                    )}
                    
                    {error?.type === 'rate_limit' && (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="mt-2 text-xs text-hero-purple hover:underline flex items-center gap-1"
                      >
                        <RefreshCw size={10} /> Try Again
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <div className="mt-12 text-center text-xs text-neutral-600 font-mono">
          <p>CINEMATIC EXPERIENCE</p>
          <p className="mt-2 opacity-50">Best on Mobile • Try 'demo'</p>
        </div>
      </motion.div>
    </div>
  )
}
