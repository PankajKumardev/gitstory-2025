import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Instrument_Serif, Inter_Tight, Space_Mono } from 'next/font/google'
import './globals.css'

// Configure fonts using Next.js font optimization
const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-serif',
})

const interTight = Inter_Tight({
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-tight',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://gitstory-2025.vercel.app'),
  title: 'GitStory 2025 - Your Year in Code | GitHub Wrapped',
  description: 'Relive your coding journey with GitStory 2025. Transform your GitHub contributions into a stunning cinematic experience with beautiful animations and personalized insights. Your GitHub Wrapped for 2025!',
  keywords: [
    // Primary keywords
    'GitStory',
    'Git Story',
    'GitHub Wrapped',
    'GitHub Wrapped 2025',
    'Git Wrapped',
    'Git Wrapped 2025',
    // Feature keywords
    'GitHub Year in Review',
    'GitHub Stats',
    'GitHub Statistics',
    'GitHub Contributions',
    'GitHub Analytics',
    'GitHub Profile Stats',
    'GitHub Activity',
    'GitHub Summary',
    // Comparison/alternative keywords
    'Spotify Wrapped for GitHub',
    'GitHub Recap',
    'GitHub Rewind',
    'Developer Wrapped',
    'Coder Wrapped',
    'Code Wrapped',
    'Coding Year Review',
    // Action keywords
    'GitHub Visualization',
    'Code Visualization',
    'Contribution Graph',
    'Commit History',
    'Programming Stats',
    // Long-tail keywords
    'Year in Code 2025',
    'Developer Year Review',
    'GitHub Profile Wrapped',
    'GitHub Contribution Summary',
    'Open Source Stats',
    'Developer Statistics 2025',
    'Coding Journey 2025',
    'GitHub Cinematic Experience',
  ],
  authors: [{ name: 'GitStory' }],
  creator: 'GitStory',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    url: 'https://gitstory-2025.vercel.app/',
    title: 'GitStory 2025 - Your Year in Code | GitHub Wrapped',
    description: 'Relive your coding journey with GitStory 2025. Transform your GitHub contributions into a stunning cinematic experience. Your GitHub Wrapped for 2025!',
    siteName: 'GitStory',
    locale: 'en_US',
    images: [
      {
        url: '/card.png',
        width: 1200,
        height: 630,
        alt: 'GitStory 2025 - GitHub Wrapped Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitStory 2025 - Your Year in Code | GitHub Wrapped',
    description: 'Relive your coding journey with GitStory 2025. Transform your GitHub contributions into a stunning cinematic experience. Your GitHub Wrapped for 2025!',
    images: ['/card.png'],
    creator: '@pankajkumar_dev',
    site: '@pankajkumar_dev',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GitStory',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/card.png',
  },
  other: {
    'og:image:secure_url': 'https://gitstory-2025.vercel.app/card.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
}

// JSON-LD structured data for rich snippets
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'GitStory 2025',
  description: 'Transform your GitHub contributions into a stunning cinematic experience. Your GitHub Wrapped for 2025!',
  url: 'https://gitstory-2025.vercel.app',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Person',
    name: 'Pankaj Kumar',
    url: 'https://twitter.com/pankajkumar_dev',
  },
  screenshot: 'https://gitstory-2025.vercel.app/card.png',
  featureList: [
    'GitHub Year in Review',
    'Contribution Statistics',
    'Language Analytics',
    'Repository Insights',
    'Cinematic Animations',
    'Downloadable Poster',
  ],
  keywords: 'GitStory, GitHub Wrapped, GitHub Wrapped 2025, Git Wrapped, Developer Stats, Code Visualization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${interTight.variable} ${spaceMono.variable}`}>
      <head>
        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Analytics />
        {children}
      </body>
    </html>
  )
}
