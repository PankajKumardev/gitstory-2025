import { GitStoryData } from "./types";

export const SLIDE_DURATION_MS = 6000; // 6 seconds per slide

const generateYearlyData = () => {
  const data = [];
  const startDate = new Date('2025-01-01');
  
  for (let i = 0; i < 365; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    let commitCount = 0;
    
    // Simulate realistic commit patterns
    if (isWeekend) {
       // Lower chance of commits on weekends
       commitCount = Math.random() > 0.8 ? Math.floor(Math.random() * 8) + 1 : 0;
    } else {
       // Regular weekday activity
       if (Math.random() > 0.15) {
         commitCount = Math.floor(Math.random() * 15) + 3; 
       }
       // Occasional "crunch time" spikes
       if (Math.random() > 0.96) {
         commitCount += Math.floor(Math.random() * 40) + 15;
       }
    }

    data.push({
      date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      commits: commitCount,
    });
  }
  return data;
};

const velocityData = generateYearlyData();
const totalCommits = velocityData.reduce((acc, curr) => acc + curr.commits, 0);

// Calculate realistic streak and weekday stats
let currentStreak = 0;
let maxStreak = 0;
const weekdayStats = [0, 0, 0, 0, 0, 0, 0];

velocityData.forEach((day, index) => {
    // Reconstruct date roughly for mock
    const date = new Date('2025-01-01');
    date.setDate(date.getDate() + index);
    
    if (day.commits > 0) {
        weekdayStats[date.getDay()] += day.commits;
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
        currentStreak = 0;
    }
});

export const MOCK_DATA: GitStoryData = {
  username: "creative-dev",
  avatarUrl: "https://picsum.photos/200/200",
  year: 2025,
  totalCommits: totalCommits,
  longestStreak: maxStreak || 12,
  busiestDay: "Thursdays",
  topLanguages: [
    { name: "Python", color: "#3572A5", percentage: 55, count: 55 },
    { name: "Jupyter Notebook", color: "#DA5B0B", percentage: 25, count: 25 },
    { name: "Rust", color: "#DEA584", percentage: 20, count: 20 },
  ],
  topRepo: {
    name: "neuro-net-v2",
    description: "Distributed inference engine for LLMs on consumer hardware.",
    stars: 3420,
    language: "Python",
    topics: ["ai", "machine-learning", "inference"],
    url: "https://github.com/creative-dev/neuro-net-v2",
  },
  velocityData: velocityData,
  weekdayStats: weekdayStats,
  productivity: {
    timeOfDay: "Late Night",
    peakHour: 23,
  },
  archetype: "The Grid Painter",
  contributionBreakdown: {
    commits: totalCommits,
    prs: 45,
    issues: 12,
    reviews: 8
  },
  community: {
    followers: 1204,
    following: 85,
    totalStars: 4500,
    publicRepos: 42
  }
};