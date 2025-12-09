/**
 * Scoring and calculation algorithms for GitStory
 * All scoring logic is centralized here for easy modification
 */

// ============================================
// CONFIGURATION - Easy to tune
// ============================================
export const SCORING_CONFIG = {
  // Language scoring weights
  language: {
    baseWeight: 1,           // Each repo counts as 1
    recentActivityBonus: 1,  // Extra point for 2025 activity
    diversityThreshold: 3,   // Minimum repos to get diversity bonus
    diversityBonus: 0.5,     // Bonus per repo above threshold
  },
  
  // Repository scoring weights
  repo: {
    stars: {
      maxPoints: 30,
      logMultiplier: 10,
    },
    forks: {
      maxPoints: 15,
      logMultiplier: 5,
    },
    recency: {
      maxPoints: 25,
      decayDays: 15,  // Points decay over this many days
    },
    originalWork: 15,     // Bonus for non-fork
    hasDescription: 5,    // Bonus for having description
    hasTopics: 5,         // Bonus for having topics
    hasLanguage: 3,       // Bonus for having a language
    watchersMultiplier: 0.5,
    watchersMax: 5,
    archivedPenalty: -20,
    sizeLogMultiplier: 3,
    sizeMaxPoints: 15,
    openIssuesLogMultiplier: 4,
    openIssuesMaxPoints: 8,
    createdIn2025Bonus: 10,
  }
};

// ============================================
// LANGUAGE SCORING
// ============================================

interface LanguageScore {
  name: string;
  weight: number;
  repoCount: number;
  recentCount: number;
}

/**
 * Calculate language weights from repositories
 * - Excludes forks (they don't represent user's own code)
 * - Weights recent activity higher (2025 repos count more)
 * - Diversity bonus: languages with 3+ repos get extra weight
 */
export function calculateLanguageScores(repos: any[]): Map<string, LanguageScore> {
  const langMap = new Map<string, LanguageScore>();
  const year2025 = new Date('2025-01-01');
  const { baseWeight, recentActivityBonus, diversityThreshold, diversityBonus } = SCORING_CONFIG.language;
  
  // First pass: count repos per language
  repos.forEach((repo) => {
    // Skip forks - they don't represent user's own work
    if (repo.fork) return;
    
    // Skip repos without a language
    if (!repo.language) return;
    
    const lang = repo.language;
    const pushedAt = new Date(repo.pushed_at);
    const isActiveIn2025 = pushedAt >= year2025;
    
    // Initialize if not exists
    if (!langMap.has(lang)) {
      langMap.set(lang, {
        name: lang,
        weight: 0,
        repoCount: 0,
        recentCount: 0,
      });
    }
    
    const score = langMap.get(lang)!;
    score.repoCount++;
    
    if (isActiveIn2025) {
      score.recentCount++;
    }
    
    // Base weight + recent activity bonus
    score.weight += baseWeight + (isActiveIn2025 ? recentActivityBonus : 0);
  });
  
  // Second pass: apply diversity bonus for languages with many repos
  // This rewards consistent use of a language across multiple projects
  langMap.forEach((score) => {
    if (score.repoCount >= diversityThreshold) {
      const extraRepos = score.repoCount - diversityThreshold;
      score.weight += extraRepos * diversityBonus;
    }
  });
  
  return langMap;
}

/**
 * Get top N languages sorted by weight
 */
export function getTopLanguages(langMap: Map<string, LanguageScore>, topN: number = 3): LanguageScore[] {
  return Array.from(langMap.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, topN);
}

// ============================================
// REPOSITORY SCORING
// ============================================

/**
 * Calculate a comprehensive score for a repository
 * Higher score = more interesting/important project
 */
export function calculateRepoScore(repo: any): number {
  let score = 0;
  const config = SCORING_CONFIG.repo;
  const now = new Date();
  const year2025Start = new Date('2025-01-01');
  
  // 1. Stars (logarithmic scale)
  score += Math.min(
    Math.log10(repo.stargazers_count + 1) * config.stars.logMultiplier,
    config.stars.maxPoints
  );
  
  // 2. Forks (logarithmic scale)
  score += Math.min(
    Math.log10(repo.forks_count + 1) * config.forks.logMultiplier,
    config.forks.maxPoints
  );
  
  // 3. Recency - repos pushed in 2025 get priority
  const pushedAt = new Date(repo.pushed_at);
  if (pushedAt >= year2025Start) {
    const daysSincePush = Math.max(0, (now.getTime() - pushedAt.getTime()) / (1000 * 60 * 60 * 24));
    score += Math.max(0, config.recency.maxPoints - (daysSincePush / config.recency.decayDays));
  }
  
  // 4. Original work bonus (not a fork)
  if (!repo.fork) {
    score += config.originalWork;
  }
  
  // 5. Has description
  if (repo.description && repo.description.trim().length > 10) {
    score += config.hasDescription;
  }
  
  // 6. Has topics/tags
  if (repo.topics && repo.topics.length > 0) {
    score += config.hasTopics;
  }
  
  // 7. Has a primary language
  if (repo.language) {
    score += config.hasLanguage;
  }
  
  // 8. Watchers
  score += Math.min(repo.watchers_count * config.watchersMultiplier, config.watchersMax);
  
  // 9. Archived penalty
  if (repo.archived) {
    score += config.archivedPenalty;
  }
  
  // 10. Repo size (proxy for code volume)
  if (repo.size > 0) {
    score += Math.min(
      Math.log10(repo.size) * config.sizeLogMultiplier,
      config.sizeMaxPoints
    );
  }
  
  // 11. Open issues (activity indicator)
  if (repo.open_issues_count > 0) {
    score += Math.min(
      Math.log10(repo.open_issues_count + 1) * config.openIssuesLogMultiplier,
      config.openIssuesMaxPoints
    );
  }
  
  // 12. Created in 2025
  const createdAt = new Date(repo.created_at);
  if (createdAt >= year2025Start) {
    score += config.createdIn2025Bonus;
  }
  
  return score;
}

// ============================================
// ARCHETYPE CALCULATION
// ============================================

import { ContributionBreakdown, CommunityStats } from '../types';

/**
 * Determine user's coding archetype based on behavior patterns
 */
export function calculateArchetype(
  breakdown: ContributionBreakdown,
  community: CommunityStats,
  totalCommits: number,
  productivity: { peakHour: number },
  weekdayStats: number[]
): string {
  const totalActivity = breakdown.commits + breakdown.prs + breakdown.issues + breakdown.reviews;
  
  // Calculate percentages
  const prPercentage = totalActivity > 0 ? (breakdown.prs / totalActivity) * 100 : 0;
  const reviewPercentage = totalActivity > 0 ? (breakdown.reviews / totalActivity) * 100 : 0;
  const issuePercentage = totalActivity > 0 ? (breakdown.issues / totalActivity) * 100 : 0;
  
  // Weekend activity
  const weekendCommits = weekdayStats[0] + weekdayStats[6]; // Sunday + Saturday
  const totalWeekCommits = weekdayStats.reduce((a, b) => a + b, 0);
  const weekendPercentage = totalWeekCommits > 0 ? (weekendCommits / totalWeekCommits) * 100 : 0;
  
  // Determine archetype based on patterns
  if (prPercentage > 20) return "The Pull Request Pro";
  if (reviewPercentage > 10) return "The Reviewer";
  if (productivity.peakHour >= 22 || productivity.peakHour <= 4) return "The Night Owl";
  if (productivity.peakHour >= 5 && productivity.peakHour <= 11) return "The Early Bird";
  if (weekendPercentage > 35) return "The Weekend Warrior";
  if (totalCommits >= 1200) return "The Grid Painter";
  if (totalCommits >= 400) return "The Consistent";
  if (issuePercentage > 15) return "The Planner";
  if (community.followers >= 500 || community.totalStars >= 1000) return "The Community Star";
  
  return "The Tinkerer";
}

// ============================================
// PRODUCTIVITY CALCULATION
// ============================================

/**
 * Determine peak coding hours and time-of-day persona
 */
export function calculateProductivity(hourCounts: Record<number, number>): {
  timeOfDay: string;
  peakHour: number;
} {
  let peakHour = 14; // Default to afternoon
  let maxCount = 0;
  
  for (const [hour, count] of Object.entries(hourCounts)) {
    if (count > maxCount) {
      maxCount = count;
      peakHour = parseInt(hour);
    }
  }
  
  let timeOfDay: string;
  if (peakHour >= 5 && peakHour < 12) {
    timeOfDay = "Morning";
  } else if (peakHour >= 12 && peakHour < 17) {
    timeOfDay = "Afternoon";
  } else if (peakHour >= 17 && peakHour < 21) {
    timeOfDay = "Evening";
  } else {
    timeOfDay = "Late Night";
  }
  
  return { timeOfDay, peakHour };
}
