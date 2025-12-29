import { GitStoryData, Language, Repository, ContributionBreakdown, CommunityStats } from "../types";
import { MOCK_DATA } from "../constants";
import { 
  calculateLanguageScores, 
  getTopLanguages, 
  calculateRepoScore, 
  calculateArchetype,
  calculateProductivity 
} from "./scoringAlgorithms";

// Use server-side proxy to avoid CORS issues in production
const GITHUB_API_BASE = "/api/github";
// For constructing proxy URLs
const makeGitHubUrl = (endpoint: string) => `${GITHUB_API_BASE}?endpoint=${encodeURIComponent(endpoint)}`;
// Third-party API to get contribution graph
const CONTRIB_API = "https://github-contributions-api.jogruber.de/v4";


// Fetch contributions + stats using GitHub GraphQL API (includes private contributions when authenticated)
// This single call replaces: contributions API + 3 separate search API calls = saves 3 API calls!
const fetchContributionsWithGraphQL = async (username: string, headers: HeadersInit): Promise<{
    contributions: { date: string; count: number }[];
    total: Record<string, number>;
    prCount: number;
    issueCount: number;
    reviewCount: number;
}> => {
    const query = `
        query($username: String!) {
            user(login: $username) {
                contributionsCollection(from: "2025-01-01T00:00:00Z", to: "2025-12-31T23:59:59Z") {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                date
                                contributionCount
                            }
                        }
                    }
                    totalPullRequestContributions
                    totalIssueContributions
                    totalPullRequestReviewContributions
                }
            }
        }
    `;

    try {
        // Use server-side proxy for GraphQL to avoid CORS
        const response = await fetch('/api/github', {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables: { username } })
        });

        if (!response.ok) {
            console.warn('GraphQL request failed, falling back to public API');
            return { contributions: [], total: {}, prCount: -1, issueCount: -1, reviewCount: -1 };
        }

        const data = await response.json();
        
        if (data.errors) {
            console.warn('GraphQL errors:', data.errors);
            return { contributions: [], total: {}, prCount: -1, issueCount: -1, reviewCount: -1 };
        }

        // Transform GraphQL response to match the format expected by the rest of the code
        const collection = data.data?.user?.contributionsCollection;
        const calendar = collection?.contributionCalendar;
        if (!calendar) return { contributions: [], total: {}, prCount: -1, issueCount: -1, reviewCount: -1 };

        const contributions: { date: string; count: number }[] = [];
        calendar.weeks.forEach((week: any) => {
            week.contributionDays.forEach((day: any) => {
                contributions.push({
                    date: day.date,
                    count: day.contributionCount
                });
            });
        });

        return { 
            contributions,
            total: { "2025": calendar.totalContributions },
            prCount: collection.totalPullRequestContributions || 0,
            issueCount: collection.totalIssueContributions || 0,
            reviewCount: collection.totalPullRequestReviewContributions || 0
        };
    } catch (error) {
        console.warn('Failed to fetch contributions via GraphQL:', error);
        return { contributions: [], total: {}, prCount: -1, issueCount: -1, reviewCount: -1 };
    }
};

export const fetchUserStory = async (username: string, token?: string): Promise<GitStoryData> => {
  if (username.toLowerCase() === 'demo') {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_DATA), 1500));
  }

  // Create headers with optional auth token
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // 1. Fetch Basic User Info first (needed for error handling)
    const userRes = await fetch(makeGitHubUrl(`/users/${username}`), { headers });
    
    if (userRes.status === 404) {
        throw new Error(`User "${username}" not found. Check the spelling and try again.`);
    }
    if (userRes.status === 401) {
        throw new Error("Invalid GitHub token. Please check your token and try again.");
    }
    if (userRes.status === 403) {
        const rateLimitReset = userRes.headers.get('X-RateLimit-Reset');
        const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString() : 'soon';
        throw new Error(`API Rate Limit Exceeded. Resets at ${resetTime}. Add a GitHub token for 5000 requests/hour.`);
    }
    if (!userRes.ok) {
        throw new Error(`Failed to fetch user data. (Status: ${userRes.status})`);
    }
    
    const user = await userRes.json();

    // 2. Fire all remaining API calls in PARALLEL for speed ⚡
    // Define contribution data type for proper typing
    type ContribData = {
        contributions: { date: string; count: number }[];
        total: Record<string, number>;
        prCount?: number;
        issueCount?: number;
        reviewCount?: number;
    };
    
    // Use GraphQL for contributions when token is provided (includes private contributions)
    const contributionsPromise: Promise<ContribData> = token 
        ? fetchContributionsWithGraphQL(username, headers)
        : fetch(`${CONTRIB_API}/${username}?y=2025`).then(res => res.ok ? res.json() : { contributions: [], total: {} });

    // Use authenticated endpoint for full repo access (includes org repos) when token is provided
    const reposEndpoint = token
        ? makeGitHubUrl(`/user/repos?per_page=100&sort=pushed&affiliation=owner,collaborator,organization_member&visibility=all`)
        : makeGitHubUrl(`/users/${username}/repos?per_page=100&sort=pushed&type=all`);

    const [
        reposRes,
        contribData,
        eventsRes,
        prSearchRes,
        issueSearchRes,
        reviewSearchRes
    ] = await Promise.all([
        // Repositories (authenticated endpoint includes org repos)
        fetch(reposEndpoint, { headers }),
        // Contributions (GraphQL with token for private, or 3rd party for public)
        contributionsPromise,
        // Recent events for time-of-day
        fetch(makeGitHubUrl(`/users/${username}/events?per_page=100`), { headers }),
        // PRs authored in 2025
        fetch(makeGitHubUrl(`/search/issues?q=author:${username}+type:pr+created:2025-01-01..2025-12-31&per_page=1`), { headers }),
        // Issues authored in 2025
        fetch(makeGitHubUrl(`/search/issues?q=author:${username}+type:issue+created:2025-01-01..2025-12-31&per_page=1`), { headers }),
        // PR reviews in 2025
        fetch(makeGitHubUrl(`/search/issues?q=reviewed-by:${username}+-author:${username}+type:pr+created:2025-01-01..2025-12-31&per_page=1`), { headers })
    ]);

    // Process responses
    let repos: any[] = [];
    if (reposRes.ok) {
        repos = await reposRes.json();
    } else {
        console.warn(`Failed to fetch repos: ${reposRes.status}`);
    }

    // contribData is already resolved from Promise.all (either GraphQL or 3rd party)

    const events = eventsRes.ok ? await eventsRes.json() : [];

    let prCount = 0;
    if (prSearchRes.ok) {
        const prData = await prSearchRes.json();
        prCount = prData.total_count || 0;
    }

    let issueCount = 0;
    if (issueSearchRes.ok) {
        const issueData = await issueSearchRes.json();
        issueCount = issueData.total_count || 0;
    }

    let reviewCount = 0;
    if (reviewSearchRes.ok) {
        const reviewData = await reviewSearchRes.json();
        reviewCount = reviewData.total_count || 0;
    }

    // --- Process Data ---

    // A. Velocity & Commits
    const velocityData: { date: string; commits: number }[] = [];
    let totalCommits = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    const weekdayStats = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    
    const yearData = contribData.contributions || [];
    yearData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const day of yearData) {
        const count = day.count || 0;
        totalCommits += count;
        
        const dateObj = new Date(day.date);
        velocityData.push({
            date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            commits: count
        });

        if (count > 0) weekdayStats[dateObj.getDay()] += count;

        if (count > 0) {
            currentStreak++;
            if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else {
            currentStreak = 0;
        }
    }

    const days = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
    const maxDayIndex = weekdayStats.indexOf(Math.max(...weekdayStats));
    const busiestDay = days[maxDayIndex];

    // B. Analyze Events for Time-of-day analysis only
    const hourCounts: Record<number, number> = {};

    if (Array.isArray(events)) {
        events.forEach((e: any) => {
            const date = new Date(e.created_at);
            const h = date.getHours();
            hourCounts[h] = (hourCounts[h] || 0) + 1;
        });
    }

    // Use accurate counts from Search API
    const contributionBreakdown: ContributionBreakdown = {
        commits: totalCommits,
        prs: prCount,
        issues: issueCount,
        reviews: reviewCount,
    };

    // C. Top Languages & Community Stars
    const langMap: Record<string, number> = {};
    // Extended language color palette (50+ languages with official GitHub colors)
    const langColors: Record<string, string> = {
      // Web & Frontend
      "TypeScript": "#3178C6", "JavaScript": "#F7DF1E", "HTML": "#e34c26", 
      "CSS": "#563d7c", "Vue": "#41b883", "Svelte": "#ff3e00", "SCSS": "#c6538c",
      "Less": "#1d365d", "Astro": "#ff5a03", "MDX": "#1b1f24",
      
      // Systems & Low-level
      "Rust": "#dea584", "C": "#555555", "C++": "#f34b7d", "C#": "#178600",
      "Go": "#00ADD8", "Zig": "#f7a41d", "Assembly": "#6E4C13", "Objective-C": "#438eff",
      
      // JVM & Enterprise
      "Java": "#b07219", "Kotlin": "#A97BFF", "Scala": "#c22d40", "Groovy": "#4298b8",
      "Clojure": "#db5855",
      
      // Scripting & Dynamic
      "Python": "#3572A5", "Ruby": "#701516", "PHP": "#4F5D95", "Perl": "#0298c3",
      "Lua": "#000080", "R": "#198CE7", "Julia": "#a270ba", "Elixir": "#6e4a7e",
      "Erlang": "#B83998", "Haskell": "#5e5086", "OCaml": "#3be133",
      
      // Mobile
      "Swift": "#F05138", "Dart": "#00B4AB", "Objective-C++": "#6866fb",
      
      // Data & ML
      "Jupyter Notebook": "#DA5B0B", "MATLAB": "#e16737", "SAS": "#B34936",
      
      // Shell & Config
      "Shell": "#89e051", "PowerShell": "#012456", "Dockerfile": "#384d54",
      "Makefile": "#427819", "Nix": "#7e7eff", "HCL": "#844fba",
      
      // Query & Data
      "SQL": "#e38c00", "PLpgSQL": "#336790", "TSQL": "#e38c00", "GraphQL": "#e10098",
      
      // Markup & Docs
      "Markdown": "#083fa1", "TeX": "#3D6117", "Org": "#77aa99",
      
      // Other Popular
      "F#": "#b845fc", "Crystal": "#000100", "Nim": "#ffc200", "V": "#4f87c4",
      "Solidity": "#AA6746", "Move": "#4a137a", "Cairo": "#ff4c00",
      "WASM": "#654ff0", "WebAssembly": "#654ff0", "CoffeeScript": "#244776",
      "Elm": "#60B5CC", "PureScript": "#1D222D", "ReasonML": "#ff5847",
      "Raku": "#0000fb", "Fortran": "#4d41b1", "COBOL": "#005ca5", "Ada": "#02f88c",
      "D": "#ba595e", "Vala": "#a56de2", "Hack": "#878787", "ActionScript": "#882B0F"
    };

    let bestRepo: any = null;
    let totalStars = 0;

    // Score all repos and collect stats
    const repoScores: { repo: any; score: number }[] = [];
    
    if (Array.isArray(repos)) {
        repos.forEach((repo: any) => {
          totalStars += repo.stargazers_count;
          // Calculate score using modular function
          const repoScore = calculateRepoScore(repo);
          repoScores.push({ repo, score: repoScore });
        });
    }

    // Sort by score and get top 5
    repoScores.sort((a, b) => b.score - a.score);
    const topCandidates = repoScores.slice(0, 5);
    
    // Best repo is the highest scoring
    bestRepo = topCandidates[0]?.repo || null;

    // Calculate language scores using modular function
    const langScoreMap = calculateLanguageScores(repos);
    const topLangScores = getTopLanguages(langScoreMap, 3);
    
    // Calculate the weight of just the top languages (for normalization to 100%)
    // We normalize among displayed languages so they sum to 100%
    const topLangWeight = topLangScores.reduce((sum, l) => sum + l.weight, 0);

    // Map top languages with percentages that sum to 100%
    // We normalize among the displayed languages so the chart makes visual sense
    const topLanguages: Language[] = topLangScores.map(lang => {
        // Normalize so top 3 sum to 100% (better visual representation)
        // This shows relative dominance among your main languages
        const normalizedPercentage = topLangWeight > 0 ? (lang.weight / topLangWeight) * 100 : 0;
        
        return {
            name: lang.name,
            count: lang.repoCount,
            // Use normalized percentage so displayed languages add to 100%
            percentage: Math.round(normalizedPercentage),
            color: langColors[lang.name] || "#A3A3A3"
        };
    });
    
    // Fix rounding errors: ensure percentages sum to exactly 100%
    if (topLanguages.length > 0) {
        const sum = topLanguages.reduce((s, l) => s + l.percentage, 0);
        if (sum !== 100 && sum > 0) {
            // Add the difference to the largest language
            topLanguages[0].percentage += (100 - sum);
        }
    }

    if (topLanguages.length === 0) {
        topLanguages.push({ name: "Polyglot", count: 1, percentage: 100, color: "#FFFFFF" });
    }

    const topRepo: Repository = bestRepo ? {
      name: bestRepo.name,
      description: bestRepo.description || "No description provided.",
      stars: bestRepo.stargazers_count,
      language: bestRepo.language || "Unknown",
      topics: bestRepo.topics || [],
      url: bestRepo.html_url
    } : {
      name: "No Public Repos",
      description: "Start coding to write history.",
      stars: 0,
      language: "N/A",
      topics: [],
      url: ""
    };

    // Build top 5 repos array
    const topRepos: Repository[] = topCandidates.slice(0, 5).map(c => ({
      name: c.repo.name,
      description: c.repo.description || "No description provided.",
      stars: c.repo.stargazers_count,
      language: c.repo.language || "Unknown",
      topics: c.repo.topics || [],
      url: c.repo.html_url
    }));

    // D. Productivity
    const productivity = calculateProductivity(hourCounts);

    // E. Community Stats
    const communityStats: CommunityStats = {
        followers: user.followers,
        following: user.following,
        publicRepos: user.public_repos,
        totalStars: totalStars
    };

    // F. Final Archetype
    const archetype = calculateArchetype(contributionBreakdown, communityStats, totalCommits, productivity, weekdayStats);

    return {
      username: user.login,
      avatarUrl: user.avatar_url,
      year: 2025,
      totalCommits,
      longestStreak: maxStreak,
      busiestDay,
      topLanguages,
      topRepo,
      topRepos,
      velocityData,
      weekdayStats,
      productivity,
      archetype,
      contributionBreakdown,
      community: communityStats
    };

  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
};