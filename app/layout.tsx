import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Covr — Social Graphics Editor',
    template: '%s | Covr',
  },
  description:
    'Create social media graphics in a fast, local-first browser editor. Free, open source, and no account required.',
  keywords: ['social media graphics', 'design editor', 'local-first', 'open source', 'free'],
  openGraph: {
    title: 'Covr — Social Graphics Editor',
    description: 'Create social media graphics locally in your browser.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  )
}
