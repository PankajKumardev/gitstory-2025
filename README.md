<div align="center">

# 🎬 GitStory 2025

### *Your Year in Code — Cinematic Wrapped*

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Framer_Motion-12.x-FF0055?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
</p>

<p align="center">
  <strong>Transform your GitHub contributions into a stunning, Instagram Stories-style cinematic experience.</strong>
</p>

<br />

[**🚀 Live Demo**](#) • [**📸 Screenshots**](#-slides) • [**⚡ Quick Start**](#-quick-start)

<br />

---

</div>

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎥 **Cinematic Experience** | 10 beautifully animated slides with Instagram Stories-like navigation |
| 📊 **Live GitHub Data** | Real-time stats fetched from GitHub API — commits, PRs, issues, reviews |
| 🧬 **Smart Archetypes** | AI-determined coding personas: *Night Owl*, *Weekend Warrior*, *Grid Painter*, and more |
| 📈 **Velocity Charts** | Animated contribution charts powered by Recharts |
| 🗓️ **Contribution Grid** | Visual heatmap of your 2025 coding activity |
| 🏆 **Top Repository** | Showcase your most-starred project |
| 🎨 **Language Breakdown** | Beautiful visualization of your tech stack |
| 📱 **Mobile-First** | Touch gestures: tap left/right to navigate, hold to pause |
| 🖼️ **Poster Export** | Download a shareable movie-poster style summary |
| 🎊 **Confetti Celebration** | End your story with style |

---

## 🎬 Slides

Experience your year through **10 cinematic slides**:

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
| 9 | **Top Repo** | Your most-starred repository spotlight |
| 10 | **Poster** | 🎬 Downloadable movie poster with confetti! |

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
git clone https://github.com/yourusername/gitstory-2025.git
cd gitstory-2025

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:3000** and enter any GitHub username!

> 💡 **Tip:** Type `demo` to see a full experience with mock data.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Components with latest features |
| **TypeScript** | Type-safe development |
| **Vite 6** | Lightning-fast build tool |
| **Tailwind CSS 4** | Utility-first styling with `@theme` config |
| **Framer Motion** | Buttery-smooth animations |
| **Recharts** | Beautiful, responsive charts |
| **Lucide React** | Consistent icon system |
| **html-to-image** | Poster PNG export |
| **canvas-confetti** | Celebration effects 🎊 |

---

## 📡 API Usage

GitStory uses **unauthenticated** GitHub API calls:

| Endpoint | Purpose |
|----------|---------|
| `/users/{username}` | Basic profile info |
| `/users/{username}/repos` | Repository list & languages |
| `/users/{username}/events` | Recent activity breakdown |
| `github-contributions-api.jogruber.de` | Contribution heatmap data |

### Rate Limits

- **60 requests/hour per IP** (unauthenticated)
- Each user's limit is independent — your app won't get globally rate-limited
- Graceful error handling with fallback to demo mode

---

## 📱 Gestures

| Action | Effect |
|--------|--------|
| **Tap right 2/3** | Next slide |
| **Tap left 1/3** | Previous slide |
| **Hold anywhere** | Pause timer |
| **Release** | Resume timer |

---

## 🏗️ Project Structure

```
gitstory-2025/
├── index.html          # Entry point
├── index.css           # Tailwind + custom styles
├── index.tsx           # React root
├── App.tsx             # Main app with landing page
├── types.ts            # TypeScript interfaces
├── constants.ts        # Mock data & configuration
├── vite.config.ts      # Vite configuration
├── services/
│   └── githubService.ts    # GitHub API integration
└── components/
    ├── StoryContainer.tsx  # Slide navigation & gestures
    ├── SlideLayout.tsx     # Reusable slide wrapper
    ├── TextReveal.tsx      # Animated text component
    └── slides/
        ├── TitleSlide.tsx
        ├── VelocitySlide.tsx
        ├── GridSlide.tsx
        ├── CompositionSlide.tsx
        ├── RoutineSlide.tsx
        ├── ProductivitySlide.tsx
        ├── CommunitySlide.tsx
        ├── LanguagesSlide.tsx
        ├── RepoSlide.tsx
        └── PosterSlide.tsx
```

---

## 🚀 Build & Deploy

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

Deploy the `dist/` folder to any static host:
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **Cloudflare Pages**

---

## 📄 License

MIT © 2025

---

<div align="center">

**Made with 💜 for developers who ship**

*Star ⭐ this repo if you found it useful!*

</div>
