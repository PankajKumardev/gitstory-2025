import { NextRequest, NextResponse } from 'next/server';

// Server-side GitHub API proxy to avoid CORS issues
// This runs on the server, not in the browser

const GITHUB_API_BASE = 'https://api.github.com';

// Multiple tokens for higher rate limits - each token = 5000 req/hr
// Add GITHUB_TOKEN_2, GITHUB_TOKEN_3, etc. in Vercel env vars to scale
const GITHUB_TOKENS = [
  process.env.GITHUB_TOKEN,
  process.env.GITHUB_TOKEN_2,
  process.env.GITHUB_TOKEN_3,
  process.env.GITHUB_TOKEN_4,
].filter(Boolean) as string[];

// Round-robin token rotation
let tokenIndex = 0;
const getNextToken = (): string | undefined => {
  if (GITHUB_TOKENS.length === 0) return undefined;
  const token = GITHUB_TOKENS[tokenIndex];
  tokenIndex = (tokenIndex + 1) % GITHUB_TOKENS.length;
  return token;
};

// Cache configuration - 5 min cache for same endpoints
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; status: number; timestamp: number }>();

// Clean expired cache entries periodically  
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      cache.delete(key);
    }
  }
};

// Run cleanup every 2 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanExpiredCache, 2 * 60 * 1000);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  // User's token takes priority (for private repo access)
  const userAuthHeader = request.headers.get('Authorization');
  
  // Cache key - different for authenticated vs public requests
  const cacheKey = `${endpoint}:${userAuthHeader ? 'auth' : 'public'}`;
  
  // Check cache first (only for public/unauthenticated requests)
  if (!userAuthHeader) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, { 
        status: cached.status,
        headers: { 'X-Cache': 'HIT', 'X-Tokens-Available': String(GITHUB_TOKENS.length) }
      });
    }
  }
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitStory-2025',
  };
  
  // Priority: User token > Rotated server tokens
  if (userAuthHeader) {
    headers['Authorization'] = userAuthHeader;
  } else {
    const serverToken = getNextToken();
    if (serverToken) {
      headers['Authorization'] = `Bearer ${serverToken}`;
    }
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers });
    const data = await response.json();
    
    // Cache successful public responses
    if (response.ok && !userAuthHeader) {
      cache.set(cacheKey, { data, status: response.status, timestamp: Date.now() });
    }
    
    // Forward rate limit headers for debugging
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'X-RateLimit-Remaining': rateLimitRemaining || '',
        'X-RateLimit-Reset': rateLimitReset || '',
        'X-Cache': 'MISS',
        'X-Tokens-Available': String(GITHUB_TOKENS.length),
      }
    });
  } catch (error) {
    console.error('GitHub API proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch from GitHub' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization required for GraphQL' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const response = await fetch(`${GITHUB_API_BASE}/graphql`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'GitStory-2025',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('GitHub GraphQL proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch from GitHub GraphQL' }, { status: 500 });
  }
}
