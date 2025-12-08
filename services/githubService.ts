import { GitStoryData, Language, Repository, ContributionBreakdown, CommunityStats, ProductivityData } from "../types";
import { MOCK_DATA } from "../constants";

const GITHUB_API_BASE = "https://api.github.com";
// Third-party API to get contribution graph
const CONTRIB_API = "https://github-contributions-api.jogruber.de/v4";

// Helper to determine time of day persona
const getProductivityTime = (hour: number) => {
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 22) return "Evening";
  return "Late Night";
};

// --- SOPHISTICATED ARCHETYPE LOGIC ---
// Now focused on BEHAVIOR, not Languages.
const calculateArchetype = (
    stats: ContributionBreakdown,
    community: CommunityStats,
    totalCommits: number,
    productivity: ProductivityData,
    weekdayStats: number[]
): string => {
    const totalActivity = stats.commits + stats.prs + stats.issues + stats.reviews;
    const prRatio = totalActivity > 0 ? stats.prs / totalActivity : 0;
    const reviewRatio = totalActivity > 0 ? stats.reviews / totalActivity : 0;
    const issueRatio = totalActivity > 0 ? stats.issues / totalActivity : 0;

    // Calc Weekend Ratio
    const weekendCommits = weekdayStats[0] + weekdayStats[6]; // Sun + Sat
    const weekendRatio = totalCommits > 0 ? weekendCommits / totalCommits : 0;

    // 1. "The Pull Request Pro" - Opens a lot of PRs
    if (prRatio > 0.20 && stats.prs > 20) {
        return "The Pull Request Pro";
    }

    // 2. "The Reviewer" - Does a lot of Code Reviews
    if (reviewRatio > 0.10 && stats.reviews > 10) {
        return "The Reviewer";
    }

    // 3. "The Weekend Warrior" - Codes mostly on weekends
    if (weekendRatio > 0.35 && totalCommits > 50) {
        return "The Weekend Warrior";
    }

    // 4. "The Night Owl" - Late night activity
    if (productivity.timeOfDay === "Late Night" && totalCommits > 50) {
        return "The Night Owl";
    }

    // 5. "The Early Bird" - Morning activity
    if (productivity.timeOfDay === "Morning" && totalCommits > 50) {
        return "The Early Bird";
    }

    // 6. "The Grid Painter" - Massive volume
    if (totalCommits > 1200) {
        return "The Grid Painter";
    }

    // 7. "The Consistent" - Consistent, decent volume (inspired by 'consistenter')
    if (totalCommits > 400) {
        return "The Consistent";
    }

    // 8. "The Planner" - High issues relative to commits
    if (issueRatio > 0.15) {
        return "The Planner";
    }

    // 9. "The Community Star" - Famous
    if (community.followers > 500 || community.totalStars > 1000) {
        return "The Community Star";
    }

    // Default
    return "The Tinkerer";
};

export const fetchUserStory = async (username: string): Promise<GitStoryData> => {
  if (username.toLowerCase() === 'demo') {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_DATA), 1500));
  }

  try {
    // 1. Fetch Basic User Info
    const userRes = await fetch(`${GITHUB_API_BASE}/users/${username}`);
    
    if (userRes.status === 404) {
        throw new Error(`User "${username}" not found.`);
    }
    if (userRes.status === 403) {
        throw new Error("API Rate Limit Exceeded. Try searching 'demo' to see the experience.");
    }
    if (!userRes.ok) {
        throw new Error("Failed to fetch user data.");
    }
    
    const user = await userRes.json();

    // 2. Fetch Repositories (Public, up to 100, sorted by updated)
    const reposRes = await fetch(`${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=pushed&type=all`);
    let repos: any[] = [];
    if (reposRes.ok) {
        repos = await reposRes.json();
    } else {
        console.warn(`Failed to fetch repos: ${reposRes.status}`);
        // Continue with empty repos to prevent crash
    }

    // 3. Fetch Contributions for 2025 (Heatmap)
    const contribRes = await fetch(`${CONTRIB_API}/${username}?y=2025`);
    let contribData: any = {};
    if (contribRes.ok) {
        contribData = await contribRes.json();
    }

    // 4. Fetch Recent Events (for time-of-day analysis)
    const eventsRes = await fetch(`${GITHUB_API_BASE}/users/${username}/events?per_page=100`);
    const events = eventsRes.ok ? await eventsRes.json() : [];

    // 5. Fetch actual PR and Issue counts using Search API
    // Search for PRs authored by user in 2025
    const prSearchRes = await fetch(`${GITHUB_API_BASE}/search/issues?q=author:${username}+type:pr+created:2025-01-01..2025-12-31&per_page=1`);
    let prCount = 0;
    if (prSearchRes.ok) {
        const prData = await prSearchRes.json();
        prCount = prData.total_count || 0;
    }

    // Search for Issues authored by user in 2025
    const issueSearchRes = await fetch(`${GITHUB_API_BASE}/search/issues?q=author:${username}+type:issue+created:2025-01-01..2025-12-31&per_page=1`);
    let issueCount = 0;
    if (issueSearchRes.ok) {
        const issueData = await issueSearchRes.json();
        issueCount = issueData.total_count || 0;
    }

    // Search for PR reviews by user in 2025 (reviews on PRs where user is not author)
    const reviewSearchRes = await fetch(`${GITHUB_API_BASE}/search/issues?q=reviewed-by:${username}+-author:${username}+type:pr+created:2025-01-01..2025-12-31&per_page=1`);
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
    const langColors: Record<string, string> = {
      "TypeScript": "#3178C6", "JavaScript": "#F7DF1E", "Python": "#3572A5", 
      "Java": "#b07219", "Go": "#00ADD8", "Rust": "#dea584", "HTML": "#e34c26", 
      "CSS": "#563d7c", "C++": "#f34b7d", "C#": "#178600", "Vue": "#41b883", "React": "#61dafb",
      "Swift": "#F05138", "Kotlin": "#A97BFF", "Jupyter Notebook": "#DA5B0B"
    };

    let bestRepo: any = null;
    let bestScore = -1;
    let totalStars = 0;

    // Scoring function to determine the "best" project
    const calculateRepoScore = (repo: any): number => {
        let score = 0;
        const now = new Date();
        const year2025Start = new Date('2025-01-01');
        
        // 1. Stars contribution (logarithmic scale to prevent huge repos from dominating)
        // Max ~30 points for stars
        score += Math.min(Math.log10(repo.stargazers_count + 1) * 10, 30);
        
        // 2. Forks contribution (shows community adoption)
        // Max ~15 points for forks
        score += Math.min(Math.log10(repo.forks_count + 1) * 5, 15);
        
        // 3. Recency bonus - repos pushed in 2025 get priority
        const pushedAt = new Date(repo.pushed_at);
        if (pushedAt >= year2025Start) {
            // More recent = higher score (max 25 points)
            const daysSincePush = Math.max(0, (now.getTime() - pushedAt.getTime()) / (1000 * 60 * 60 * 24));
            score += Math.max(0, 25 - (daysSincePush / 15)); // Decay over ~1 year
        }
        
        // 4. Original work bonus (not a fork) - 15 points
        if (!repo.fork) {
            score += 15;
        }
        
        // 5. Has description bonus - 5 points
        if (repo.description && repo.description.trim().length > 10) {
            score += 5;
        }
        
        // 6. Has topics/tags bonus - 5 points
        if (repo.topics && repo.topics.length > 0) {
            score += 5;
        }
        
        // 7. Has a primary language - 3 points
        if (repo.language) {
            score += 3;
        }
        
        // 8. Watchers bonus (engagement indicator)
        score += Math.min(repo.watchers_count * 0.5, 5);
        
        // 9. Penalty for archived repos
        if (repo.archived) {
            score -= 20;
        }
        
        return score;
    };

    if (Array.isArray(repos)) {
        repos.forEach((repo: any) => {
          totalStars += repo.stargazers_count;

          if (repo.language) {
            langMap[repo.language] = (langMap[repo.language] || 0) + 1;
          }

          // Calculate score and track best repo
          const repoScore = calculateRepoScore(repo);
          if (repoScore > bestScore) {
            bestScore = repoScore;
            bestRepo = repo;
          }
        });
    }

    const topLanguages: Language[] = Object.entries(langMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({
        name,
        count,
        percentage: repos.length > 0 ? Math.round((count / repos.length) * 100) : 0,
        color: langColors[name] || "#A3A3A3"
      }));

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

    // D. Productivity
    const sortedHours = Object.entries(hourCounts).sort(([,a], [,b]) => b - a);
    let peakHour = 14; 
    if (sortedHours.length > 0) peakHour = parseInt(sortedHours[0][0]);
    const timeOfDay = getProductivityTime(peakHour);
    const productivity: ProductivityData = { timeOfDay, peakHour };

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