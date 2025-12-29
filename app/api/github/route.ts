import { NextRequest, NextResponse } from 'next/server';

// Server-side GitHub API proxy to avoid CORS issues
// This runs on the server, not in the browser

const GITHUB_API_BASE = 'https://api.github.com';

// Server-side token for higher rate limits (5000/hr instead of 60/hr)
// Users can still provide their own token for private repo access
const SERVER_GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  // User's token takes priority (for private repo access)
  // Falls back to server token for rate limit boost
  const userAuthHeader = request.headers.get('Authorization');
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitStory-2025',
  };
  
  // Priority: User token > Server token
  if (userAuthHeader) {
    headers['Authorization'] = userAuthHeader;
  } else if (SERVER_GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${SERVER_GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers });
    const data = await response.json();
    
    // Forward rate limit headers for debugging
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'X-RateLimit-Remaining': rateLimitRemaining || '',
        'X-RateLimit-Reset': rateLimitReset || '',
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
