<div align="center">

# 🎬 GitStory 2025

### *Your Year in Code — Cinematic Wrapped*

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.x-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Framer_Motion-12.x-FF0055?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/NextAuth.js-4.x-000000?style=for-the-badge&logo=auth0&logoColor=white" alt="NextAuth" />
</p>

<p align="center">
  <strong>Transform your GitHub & GitLab contributions into a stunning, Instagram Stories-style cinematic experience.</strong>
</p>

<p align="center">
  <a href="https://gitstory.pankajk.tech/">🌐 Live Demo</a> •
  <a href="#-features">✨ Features</a> •
  <a href="#-quick-start">⚡ Quick Start</a> •
  <a href="#-tech-stack">🛠️ Tech Stack</a>
</p>

---

</div>

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎥 **Cinematic Experience** | 11 beautifully animated slides with Instagram Stories-like navigation |
| 📊 **Live GitHub & GitLab Data** | Real-time stats fetched from GitHub/GitLab API — commits, PRs, issues, reviews |
| 🔐 **OAuth Authentication** | One-click login with GitHub or GitLab |
| 🌓 **Dark/Light Theme** | Toggle between themes on main page and slides |
| 🧬 **Smart Archetypes** | AI-determined coding personas: *Night Owl*, *Weekend Warrior*, *Grid Painter*, and more |
| 📈 **Velocity Charts** | Animated contribution charts powered by Recharts |
| 🗓️ **Contribution Grid** | Visual heatmap of your 2025 coding activity |
| 🏆 **Top 5 Repositories** | Showcase your best projects with smart ranking |
| 🎨 **Language Breakdown** | Beautiful visualization of your tech stack (55+ languages!) |
| 📱 **Mobile-First** | Touch gestures: tap left/right to navigate, hold to pause |
| 🖼️ **Poster Export** | Download a shareable movie-poster style summary |
| 🔗 **Social Sharing** | Share to Twitter, LinkedIn, Reddit, WhatsApp with one click |
| 🎊 **Confetti Celebration** | End your story with style |
| 🔍 **SEO Optimized** | Built with Next.js for better search engine visibility |

---

## 🆕 What's New (v4.0)

### 🔐 OAuth Authentication
- **GitHub OAuth** — One-click login, no token copying needed
- **GitLab OAuth** — Full GitLab support with OAuth authentication
- Private repos & org repos automatically included when authenticated

### 🌓 Theme Toggle
- **Dark/Light Mode** — Toggle on main page and within slide presentation
- **Play/Pause Controls** — On-screen buttons during story playback
- **Theme-aware slides** — All 11 slides adapt to your preferred theme

### 🔗 Social Sharing
- **Share Button** — On the final poster slide
- **Multiple platforms** — Twitter, LinkedIn, Reddit, WhatsApp
- **Copy Link** — With toast notification
- **Pre-written share text** — Automatically includes your stats

### 🦊 GitLab Support
- **Full GitLab API integration** — Same cinematic experience for GitLab users
- **OAuth authentication** — Login with GitLab account
- **Project stats** — Commits, merge requests, issues from GitLab

---

## 🚀 Previous Updates

### Next.js Migration (v3.0)
- **Migrated from Vite to Next.js 16** for better SEO and performance
- **Server-side metadata** for improved social sharing (Twitter, Facebook, LinkedIn)
- **Optimized fonts** with `next/font/google` for better performance
- **Dynamic sitemap** generation for search engines

### Optimized API (v2.0)
- **With Token:** Only **4 API calls** (GraphQL bundles contributions + PR/Issue/Review counts!)
- **Without Token:** 7 API calls (REST fallback)
- **43% fewer API calls** when authenticated!

### Smart Repository Scoring
Projects are now ranked using **12 factors** instead of just stars:
- ⭐ Stars & Forks (logarithmic scale)
- 📅 Recent activity in 2025 (time-decay bonus)
- ✨ Original work (not forks)
- 📝 Description & Topics
- 💻 Primary language
- 📦 Repository size
- 🐛 Open issues (activity indicator)
- 🆕 Created in 2025 bonus
- 👀 Watchers
- 📦 Archived penalty

---

## 🎬 Slides

Experience your year through **11 cinematic slides**:

| # | Slide | What It Shows |
|---|-------|---------------|
| 1 | **Title** | Your username & avatar with dramatic reveal |
| 2 | **Velocity** | Animated area chart of daily commits |
| 3 | **Grid** | Full-year contribution heatmap |
| 4 | **Composition** | Breakdown: Commits vs PRs vs Issues vs Reviews |
| 5 | **Routine** | Your busiest day of the week |
| 6 | **Productivity** | Peak coding hours & time-of-day persona |
| 7 | **Community** | Followers, stars, and repo count |
| 8 | **Languages** | Top 3 programming languages |
| 9 | **Top 5 Repos** | Your best repositories ranked by score |
| 10 | **Top Repo** | Spotlight on your #1 repository |
| 11 | **Poster** | 🎬 Downloadable movie poster + Share buttons |

---

## 🧬 Archetypes

Based on your **behavior patterns**, you'll be assigned one of these personas:

| Archetype | Criteria |
|-----------|----------|
| 🔀 **The Pull Request Pro** | Opens many PRs (>20% of activity) |
| 👀 **The Reviewer** | Frequent code reviewer (>10% of activity) |
| 🌙 **The Night Owl** | Peak activity after 10 PM |
| 🌅 **The Early Bird** | Peak activity before noon |
| 🗓️ **The Weekend Warrior** | >35% commits on weekends |
| 🎨 **The Grid Painter** | 1200+ commits (green squares everywhere!) |
| ⚡ **The Consistent** | 400+ commits, steady contributor |
| 📋 **The Planner** | High issue-to-commit ratio |
| ⭐ **The Community Star** | 500+ followers or 1000+ total stars |
| 🔧 **The Tinkerer** | Default — you're exploring! |

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/PankajKumardev/gitstory-2025.git
cd gitstory-2025

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your OAuth credentials

# Start development server
npm run dev
```

Open **http://localhost:3000** and enter any GitHub username!

> 💡 **Tip:** Type `demo` to see a full experience with mock data.

---

## 🔐 Authentication

### OAuth Login (Recommended)
Click **GitHub** or **GitLab** button on the home page for one-click authentication.

### Environment Variables
```env
# NextAuth Configuration
NEXTAUTH_URL=https://gitstory.pankajk.tech
NEXTAUTH_SECRET=your-secret-key

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# GitLab OAuth (https://gitlab.com/-/user_settings/applications)
GITLAB_CLIENT_ID=your-gitlab-client-id
GITLAB_CLIENT_SECRET=your-gitlab-client-secret
```

### OAuth Callback URLs
| Provider | Callback URL |
|----------|-------------|
| GitHub | `https://yourdomain.com/api/auth/callback/github` |
| GitLab | `https://yourdomain.com/api/auth/callback/gitlab` |

### GitLab Scopes Required
- `read_user` — Profile info
- `read_api` — API access
- `read_repository` — Repository access

### Benefits with OAuth
| Feature | Without OAuth | With OAuth |
|---------|---------------|------------|
| Rate Limit | 60/hour | **5000/hour** |
| Private Repos | ❌ | ✅ |
| Org Repos | ❌ | ✅ |
| Private Contributions | ❌ | ✅ |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router for SEO & performance |
| **React 19** | UI Components with latest features |
| **NextAuth.js** | OAuth authentication for GitHub & GitLab |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling with `@theme` config |
| **Framer Motion** | Buttery-smooth animations |
| **Recharts** | Beautiful, responsive charts |
| **Lucide React** | Consistent icon system |
| **html-to-image** | Poster PNG export |
| **canvas-confetti** | Celebration effects 🎊 |
| **Vercel Analytics** | Privacy-friendly analytics |

---

## 📱 Controls

### On-Screen Controls
| Button | Effect |
|--------|--------|
| **⏸️ Pause** | Pause slide timer |
| **☀️/🌙 Theme** | Toggle dark/light mode |
| **✕ Close** | Exit story |
| **📤 Share** | Share to social (poster slide) |

### Touch Gestures (Mobile)
| Action | Effect |
|--------|--------|
| **Tap right 2/3** | Next slide |
| **Tap left 1/3** | Previous slide |
| **Hold anywhere** | Pause timer |
| **Release** | Resume timer |

### Keyboard Controls (Desktop)
| Key | Effect |
|-----|--------|
| **→** or **D** | Next slide |
| **←** or **A** | Previous slide |
| **Space** | Pause/Resume |
| **Escape** | Exit story |

---

## 🏗️ Project Structure

```
gitstory-2025/
├── app/
│   ├── api/auth/[...nextauth]/  # NextAuth API route
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Main page with OAuth
│   ├── globals.css              # Tailwind + custom styles
│   └── sitemap.ts               # Dynamic sitemap
├── components/
│   ├── providers/
│   │   └── SessionProvider.tsx  # NextAuth session wrapper
│   ├── StoryContainer.tsx       # Slide navigation & controls
│   ├── SlideLayout.tsx          # Theme-aware slide wrapper
│   └── slides/                  # 11 slide components
├── context/
│   └── ThemeContext.tsx         # Dark/light theme context
├── lib/
│   └── auth.ts                  # NextAuth configuration
├── services/
│   ├── githubService.ts         # GitHub API integration
│   ├── gitlabService.ts         # GitLab API integration
│   └── scoringAlgorithms.ts     # Scoring logic
├── types.ts                     # TypeScript interfaces
└── constants.ts                 # Mock data & configuration
```

---

## 🚀 Build & Deploy

```bash
# Production build
npm run build

# Start production server
npm start
```

Deploy to any platform that supports Next.js:
- **Vercel** (recommended - zero config)
- **Netlify**
- **Railway**
- **Cloudflare Pages**

### Vercel Environment Variables
Add these in your Vercel project settings:
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITLAB_CLIENT_ID`
- `GITLAB_CLIENT_SECRET`

---

## 📄 License

**MIT License with Attribution** — see [LICENSE](LICENSE) for full text.

### ⚠️ Attribution Required

If you use, modify, or build upon this project, you **MUST**:

1. ✅ **Credit the original author** — Include "Based on [GitStory](https://github.com/PankajKumardev/gitstory-2025) by [Pankaj Kumar](https://github.com/PankajKumardev)" in your README
2. ✅ **Link to the original repo** — https://github.com/PankajKumardev/gitstory-2025
3. ❌ **Do NOT claim original authorship** — This includes Product Hunt, social media, or any other platform
4. ❌ **Do NOT remove copyright notices** — Keep the license file and copyright comments

### Why This Matters

This project took significant effort to create. If you found it useful, please:
- ⭐ **Star this repo**
- 🔗 **Credit the original** when sharing
- 🐦 **Tag @pankajkumar_dev** when posting about it

Copyright © 2024-2025 [Pankaj Kumar](https://github.com/PankajKumardev)

---

<div align="center">

**Made with 💜 for developers who ship**

*Star ⭐ this repo if you found it useful!*

[🌐 Try GitStory 2025](https://gitstory.pankajk.tech/) | [🐦 Twitter](https://twitter.com/pankajkumar_dev)

</div>
