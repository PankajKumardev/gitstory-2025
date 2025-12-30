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
  const url = searchParams.get('url'); // For proxying full URLs like the contributions API
  
  if (!endpoint && !url) {
    return NextResponse.json({ error: 'Missing endpoint or url parameter' }, { status: 400 });
  }

  const targetUrl = url || `${GITHUB_API_BASE}${endpoint}`;
  const userAuthHeader = request.headers.get('Authorization');
  
  // Cache key includes the URL and the token (or 'public') 
  // This ensures User A doesn't see User B's private data cache
  const cacheKey = `${targetUrl}:${userAuthHeader || 'public'}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, { 
      status: cached.status,
      headers: { 
        'X-Cache': 'HIT', 
        'X-Tokens-Available': String(GITHUB_TOKENS.length) 
      }
    });
  }
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitStory-2025',
  };
  
  // Only apply GitHub tokens if we are calling GitHub
  if (targetUrl.includes('api.github.com')) {
    if (userAuthHeader) {
      headers['Authorization'] = userAuthHeader;
    } else {
      const serverToken = getNextToken();
      if (serverToken) {
        headers['Authorization'] = `Bearer ${serverToken}`;
      }
    }
  }

  try {
    const response = await fetch(targetUrl, { headers });
    const data = await response.json();
    
    // Cache successful responses
    if (response.ok) {
      cache.set(cacheKey, { data, status: response.status, timestamp: Date.now() });
    }
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'X-Cache': 'MISS',
        'X-Tokens-Available': String(GITHUB_TOKENS.length),
      }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
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
