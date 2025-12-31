export const SCORING_CONFIG = {
  language: {
    baseWeight: 1,           
    recentActivityBonus: 1,  
    diversityThreshold: 3,   
    diversityBonus: 0.5,     
  },
  
  repo: {
    stars: {
      maxPoints: 35,      
      logMultiplier: 12,
    },
    forks: {
      maxPoints: 20,      
      logMultiplier: 6,
    },
    recency: {
      maxPoints: 0,      
    },
    originalWork: 20,    
    hasDescription: 2,   
    hasTopics: 2,       
    hasLanguage: 3,
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

interface LanguageScore {
  name: string;
  weight: number;
  repoCount: number;
  recentCount: number;
}

export function calculateLanguageScores(repos: any[]): Map<string, LanguageScore> {
  const langMap = new Map<string, LanguageScore>();
  const year2025 = new Date('2025-01-01');
  const { baseWeight, recentActivityBonus, diversityThreshold, diversityBonus } = SCORING_CONFIG.language;
  
  repos.forEach((repo) => {
    if (repo.fork) return;
    
    if (!repo.language) return;
    
    const lang = repo.language;
    const pushedAt = new Date(repo.pushed_at);
    const isActiveIn2025 = pushedAt >= year2025;
    
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
    
    score.weight += baseWeight + (isActiveIn2025 ? recentActivityBonus : 0);
  });
  
  langMap.forEach((score) => {
    if (score.repoCount >= diversityThreshold) {
      const extraRepos = score.repoCount - diversityThreshold;
      score.weight += extraRepos * diversityBonus;
    }
  });
  
  return langMap;
}

export function getTopLanguages(langMap: Map<string, LanguageScore>, topN: number = 3): LanguageScore[] {
  return Array.from(langMap.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, topN);
}

export function calculateRepoScore(repo: any): number {
  let score = 0;
  const config = SCORING_CONFIG.repo;
  const now = new Date();
  const year2025Start = new Date('2025-01-01');

  score += Math.min(
    Math.log10(repo.stargazers_count + 1) * config.stars.logMultiplier,
    config.stars.maxPoints
  );
  
  score += Math.min(
    Math.log10(repo.forks_count + 1) * config.forks.logMultiplier,
    config.forks.maxPoints
  );
  
  const pushedAt = new Date(repo.pushed_at);
  if (pushedAt >= year2025Start && config.recency.maxPoints > 0) {
    score += config.recency.maxPoints;
  }
  
  if (!repo.fork) {
    score += config.originalWork;
  }
  
  if (repo.description && repo.description.trim().length > 10) {
    score += config.hasDescription;
  }
  
  if (repo.topics && repo.topics.length > 0) {
    score += config.hasTopics;
  }
  
  if (repo.language) {
    score += config.hasLanguage;
  }
  
  score += Math.min(repo.watchers_count * config.watchersMultiplier, config.watchersMax);
  
  if (repo.archived) {
    score += config.archivedPenalty;
  }
  
  if (repo.size > 0) {
    score += Math.min(
      Math.log10(repo.size) * config.sizeLogMultiplier,
      config.sizeMaxPoints
    );
  }
  
  if (repo.open_issues_count > 0) {
    score += Math.min(
      Math.log10(repo.open_issues_count + 1) * config.openIssuesLogMultiplier,
      config.openIssuesMaxPoints
    );
  }
  
  const createdAt = new Date(repo.created_at);
  if (createdAt >= year2025Start) {
    score += config.createdIn2025Bonus;
  }
  
  return score;
}

import { ContributionBreakdown, CommunityStats } from '../types';

export function calculateArchetype(
  breakdown: ContributionBreakdown,
  community: CommunityStats,
  totalCommits: number,
  productivity: { peakHour: number },
  weekdayStats: number[]
): string {
  const totalActivity = breakdown.commits + breakdown.prs + breakdown.issues + breakdown.reviews;
  
  const prPercentage = totalActivity > 0 ? (breakdown.prs / totalActivity) * 100 : 0;
  const reviewPercentage = totalActivity > 0 ? (breakdown.reviews / totalActivity) * 100 : 0;
  const issuePercentage = totalActivity > 0 ? (breakdown.issues / totalActivity) * 100 : 0;
  
  const weekendCommits = weekdayStats[0] + weekdayStats[6];
  const totalWeekCommits = weekdayStats.reduce((a, b) => a + b, 0);
  const weekendPercentage = totalWeekCommits > 0 ? (weekendCommits / totalWeekCommits) * 100 : 0;
  
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

export function calculateProductivity(hourCounts: Record<number, number>): {
  timeOfDay: string;
  peakHour: number;
} {
  let peakHour = 14; 
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
