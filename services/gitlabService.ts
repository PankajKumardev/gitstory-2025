import { GitStoryData, Language, Repository, ContributionBreakdown, CommunityStats } from "../types";
import { 
  calculateLanguageScores, 
  getTopLanguages, 
  calculateRepoScore, 
  calculateArchetype,
  calculateProductivity 
} from "./scoringAlgorithms";

const GITLAB_API_BASE = "https://gitlab.com/api/v4";

export const fetchGitLabUserStory = async (username: string, token: string): Promise<GitStoryData> => {
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    // 1. Fetch User Info
    const userRes = await fetch(`${GITLAB_API_BASE}/user`, { headers });
    
    if (userRes.status === 401) {
      throw new Error("Invalid GitLab token. Please check your token and try again.");
    }
    if (!userRes.ok) {
      throw new Error(`Failed to fetch user data. (Status: ${userRes.status})`);
    }
    
    const user = await userRes.json();

    // 2. Fetch all data in parallel
    // Fetch 3 pages of events (300 total) to cover more history/private contribs
    const [projectsRes, eventsRes1, eventsRes2, eventsRes3] = await Promise.all([
      // User's projects (repositories)
      fetch(`${GITLAB_API_BASE}/users/${user.id}/projects?per_page=100&order_by=last_activity_at`, { headers }),
      // User's events - Pages 1-3
      fetch(`${GITLAB_API_BASE}/users/${user.id}/events?per_page=100&after=2025-01-01&page=1`, { headers }),
      fetch(`${GITLAB_API_BASE}/users/${user.id}/events?per_page=100&after=2025-01-01&page=2`, { headers }),
      fetch(`${GITLAB_API_BASE}/users/${user.id}/events?per_page=100&after=2025-01-01&page=3`, { headers }),
    ]);

    const projects = projectsRes.ok ? await projectsRes.json() : [];
    
    // Combine events
    const e1 = eventsRes1.ok ? await eventsRes1.json() : [];
    const e2 = eventsRes2.ok ? await eventsRes2.json() : [];
    const e3 = eventsRes3.ok ? await eventsRes3.json() : [];
    const events = [...(Array.isArray(e1) ? e1 : []), ...(Array.isArray(e2) ? e2 : []), ...(Array.isArray(e3) ? e3 : [])];

    // --- Process Data ---

    // A. Process events for contributions
    const velocityData: { date: string; commits: number }[] = [];
    let totalCommits = 0;
    const weekdayStats = [0, 0, 0, 0, 0, 0, 0];
    const hourCounts: Record<number, number> = {};
    const dateCommits: Record<string, number> = {};

    // Count contributions from events
    let prCount = 0;
    let issueCount = 0;
    let reviewCount = 0;

    if (Array.isArray(events)) {
      events.forEach((e: any) => {
        const date = new Date(e.created_at);
        const dateStr = date.toISOString().split('T')[0];
        const h = date.getHours();
        
        hourCounts[h] = (hourCounts[h] || 0) + 1;
        
        if (e.action_name === 'pushed to' || e.action_name === 'pushed new') {
          const pushCount = e.push_data?.commit_count || 1;
          dateCommits[dateStr] = (dateCommits[dateStr] || 0) + pushCount;
          totalCommits += pushCount;
          weekdayStats[date.getDay()] += pushCount;
        } else if (e.action_name === 'opened' && e.target_type === 'MergeRequest') {
          prCount++;
        } else if (e.action_name === 'opened' && e.target_type === 'Issue') {
          issueCount++;
        } else if (e.action_name === 'commented on' && e.target_type === 'MergeRequest') {
          reviewCount++;
        }
      });
    }

    // Convert to velocity data
    Object.keys(dateCommits).sort().forEach(date => {
      const dateObj = new Date(date);
      velocityData.push({
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        commits: dateCommits[date]
      });
    });

    // Calculate streak
    let currentStreak = 0;
    let maxStreak = 0;
    Object.keys(dateCommits).sort().forEach(date => {
      if (dateCommits[date] > 0) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });

    const days = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];
    const maxDayIndex = weekdayStats.indexOf(Math.max(...weekdayStats));
    const busiestDay = days[maxDayIndex];

    const contributionBreakdown: ContributionBreakdown = {
      commits: totalCommits,
      prs: prCount,
      issues: issueCount,
      reviews: reviewCount,
    };

    // B. Process projects for languages and repos
    const langColors: Record<string, string> = {
      "TypeScript": "#3178C6", "JavaScript": "#F7DF1E", "HTML": "#e34c26", 
      "CSS": "#563d7c", "Vue": "#41b883", "Python": "#3572A5", "Ruby": "#701516", 
      "PHP": "#4F5D95", "Java": "#b07219", "Kotlin": "#A97BFF", "Go": "#00ADD8",
      "Rust": "#dea584", "C": "#555555", "C++": "#f34b7d", "C#": "#178600",
      "Swift": "#F05138", "Dart": "#00B4AB", "Shell": "#89e051",
    };

    let bestProject: any = null;
    let totalStars = 0;
    const projectScores: { project: any; score: number }[] = [];

    // Convert GitLab projects to repo-like format for scoring
    const repoLikeProjects = projects.map((p: any) => ({
      ...p,
      stargazers_count: p.star_count || 0,
      forks_count: p.forks_count || 0,
      pushed_at: p.last_activity_at,
      html_url: p.web_url,
      topics: p.topics || p.tag_list || [],
    }));

    if (Array.isArray(repoLikeProjects)) {
      repoLikeProjects.forEach((project: any) => {
        totalStars += project.stargazers_count;
        const projectScore = calculateRepoScore(project);
        projectScores.push({ project, score: projectScore });
      });
    }

    projectScores.sort((a, b) => b.score - a.score);
    bestProject = projectScores[0]?.project || null;

    // Calculate language scores
    const langScoreMap = calculateLanguageScores(repoLikeProjects);
    const topLangScores = getTopLanguages(langScoreMap, 3);
    
    const topLangWeight = topLangScores.reduce((sum, l) => sum + l.weight, 0);

    const topLanguages: Language[] = topLangScores.map(lang => {
      const normalizedPercentage = topLangWeight > 0 ? (lang.weight / topLangWeight) * 100 : 0;
      return {
        name: lang.name,
        count: lang.repoCount,
        percentage: Math.round(normalizedPercentage),
        color: langColors[lang.name] || "#A3A3A3"
      };
    });
    
    if (topLanguages.length > 0) {
      const sum = topLanguages.reduce((s, l) => s + l.percentage, 0);
      if (sum !== 100 && sum > 0) {
        topLanguages[0].percentage += (100 - sum);
      }
    }

    if (topLanguages.length === 0) {
      topLanguages.push({ name: "Polyglot", count: 1, percentage: 100, color: "#FFFFFF" });
    }

    const topRepo: Repository = bestProject ? {
      name: bestProject.name,
      description: bestProject.description || "No description provided.",
      stars: bestProject.stargazers_count,
      language: bestProject.language || "Unknown",
      topics: bestProject.topics || [],
      url: bestProject.web_url
    } : {
      name: "No Public Repos",
      description: "Start coding to write history.",
      stars: 0,
      language: "N/A",
      topics: [],
      url: ""
    };

    const topRepos: Repository[] = projectScores.slice(0, 5).map(c => ({
      name: c.project.name,
      description: c.project.description || "No description provided.",
      stars: c.project.stargazers_count,
      language: c.project.language || "Unknown",
      topics: c.project.topics || [],
      url: c.project.web_url
    }));

    // C. Productivity
    const productivity = calculateProductivity(hourCounts);

    // D. Community Stats
    const communityStats: CommunityStats = {
      followers: user.followers || 0,
      following: user.following || 0,
      publicRepos: projects.length,
      totalStars: totalStars
    };

    // E. Archetype
    const archetype = calculateArchetype(contributionBreakdown, communityStats, totalCommits, productivity, weekdayStats);

    return {
      username: user.username,
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
    console.error("Error generating GitLab story:", error);
    throw error;
  }
};
