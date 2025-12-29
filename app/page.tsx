'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { fetchUserStory } from '@/services/githubService'
import { fetchGitLabUserStory } from '@/services/gitlabService'
import { GitStoryData } from '@/types'
import { StoryContainer } from '@/components/StoryContainer'
import { Github, Play, Loader2, AlertCircle, Key, ChevronDown, ChevronUp, Lock, RefreshCw, CheckCircle2, XCircle, Sun, Moon, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'

// GitLab icon
const GitLabIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fc6d26">
    <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z"/>
  </svg>
)

export default function Home() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [storyData, setStoryData] = useState<GitStoryData | null>(null)
  const [showStory, setShowStory] = useState(false)
  const [error, setError] = useState<{ message: string; type: 'rate_limit' | 'not_found' | 'auth' | 'generic' } | null>(null)
  const [starCount, setStarCount] = useState<number | null>(null)
  
  // Fetch repo stars on mount - use proxy to avoid CORS
  useEffect(() => {
    fetch('/api/github?endpoint=' + encodeURIComponent('/repos/pankajkumardev/gitstory-2025'))
      .then(res => res.json())
      .then(data => setStarCount(data.stargazers_count || 0))
      .catch(() => setStarCount(null))
  }, [])
  
  // Use OAuth token if available, otherwise use manual token
  const effectiveToken = session?.accessToken || token.trim()
  
  // Token validation state
  const [tokenStatus, setTokenStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle')
  const [tokenUser, setTokenUser] = useState<{ login: string; avatar_url: string } | null>(null)

  // Auto-fill username from OAuth session
  useEffect(() => {
    if (session?.username && !username) {
      setUsername(session.username)
    }
  }, [session?.username, username])

  // Validate manual token when it changes
  useEffect(() => {
    if (session?.accessToken || !token || token.length < 10) {
      setTokenStatus('idle')
      setTokenUser(null)
      return
    }

    const validateToken = async () => {
      setTokenStatus('validating')
      try {
        // Use proxy to avoid CORS issues
        const res = await fetch('/api/github?endpoint=' + encodeURIComponent('/user'), {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const user = await res.json()
          setTokenUser({ login: user.login, avatar_url: user.avatar_url })
          setTokenStatus('valid')
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
  }, [token, username, session?.accessToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) return

    setIsLoading(true)
    setError(null)
    try {
      let data: GitStoryData
      
      // Use GitLab service if logged in with GitLab
      if (session?.provider === 'gitlab' && session?.accessToken) {
        data = await fetchGitLabUserStory(username.trim(), session.accessToken)
      } else {
        data = await fetchUserStory(username.trim(), effectiveToken || undefined)
      }
      
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

  const isDark = theme === 'dark'

  return (
    <div className={`min-h-[100dvh] flex flex-col items-center justify-center p-6 overflow-hidden relative transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Top Bar - Theme Toggle & Star Repo */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <a
          href="https://github.com/pankajkumardev/gitstory-2025"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${isDark ? 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800' : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'}`}
        >
          <Github size={14} />
          <span>{starCount !== null ? starCount : '⭐'}</span>
        </a>
        <button
          onClick={toggleTheme}
          className={`p-1.5 rounded-lg transition-all border ${isDark ? 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800' : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'}`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Background Elements */}
      <div className={`absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-hero-blue/20' : 'bg-hero-blue/10'}`} />
      <div className={`absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none ${isDark ? 'bg-hero-purple/20' : 'bg-hero-purple/10'}`} />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-12">
          <Github size={64} className="mx-auto mb-6" />
          <h1 className="text-5xl md:text-7xl font-serif italic mb-2 tracking-tight">GitStory</h1>
          <p className={`font-sans tracking-widest text-sm uppercase ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>Your 2025 Cinematic Wrapped</p>
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
              className={`w-full border rounded-xl px-6 py-4 text-xl font-mono text-center focus:outline-none focus:border-hero-blue focus:ring-1 focus:ring-hero-blue transition-all ${isDark ? 'bg-neutral-900/50 border-neutral-800 placeholder:text-neutral-600' : 'bg-neutral-100 border-neutral-200 placeholder:text-neutral-400'}`}
            />
          </div>

          {/* OAuth Buttons - minimal style */}
          <div className="flex items-center justify-center gap-2">
            {session ? (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border ${isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300' : 'bg-neutral-100 border-neutral-200 text-neutral-700'}`}>
                {session.user?.image && <img src={session.user.image} alt="" className="w-5 h-5 rounded-full" />}
                <span className="font-mono">@{session.username || session.user?.name}</span>
                <button onClick={() => signOut()} className={`ml-1 p-1 rounded transition-colors ${isDark ? 'hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200' : 'hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700'}`}><LogOut size={12} /></button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => signIn('github')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${isDark ? 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-900' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100'}`}
                >
                  <Github size={16} /> GitHub
                </button>
                <button
                  type="button"
                  onClick={() => signIn('gitlab')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${isDark ? 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-900' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100'}`}
                >
                  <GitLabIcon size={16} /> GitLab
                </button>
                <span className={`text-xs ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>for private repos</span>
              </>
            )}
          </div>

          {/* Optional Token Section - only show if not OAuth'd */}
          {!session && (
          <div>
            <button
              type="button"
              onClick={() => setShowTokenInput(!showTokenInput)}
              className={`w-full flex items-center justify-center gap-2 text-xs font-mono py-2 transition-colors ${isDark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
              <Key size={12} />
              {showTokenInput ? 'Hide' : 'Or add token manually'}
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
                        className={`w-full border rounded-lg px-4 py-3 text-sm font-mono text-center focus:outline-none transition-all ${
                          isDark 
                            ? 'bg-neutral-900/30 placeholder:text-neutral-600' 
                            : 'bg-neutral-100 placeholder:text-neutral-400'
                        } ${
                          tokenStatus === 'valid' 
                            ? 'border-green-500/50 focus:border-green-500 focus:ring-1 focus:ring-green-500' 
                            : tokenStatus === 'invalid'
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : isDark 
                              ? 'border-neutral-800 focus:border-hero-purple focus:ring-1 focus:ring-hero-purple'
                              : 'border-neutral-200 focus:border-hero-blue focus:ring-1 focus:ring-hero-blue'
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
          )}

          <button
            type="submit"
            disabled={isLoading || !username}
            className={`w-full rounded-xl px-6 py-4 font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group ${isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}
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
