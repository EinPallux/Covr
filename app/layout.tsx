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
    default: 'Covr — Free Minecraft Marketplace Cover Editor',
    template: '%s | Covr',
  },
  description:
    'Create stunning Minecraft Marketplace cover art for free. Browser-based editor — no account, no backend, no cost.',
  keywords: ['minecraft', 'marketplace', 'cover art', 'template editor', 'free', 'builtbybit'],
  openGraph: {
    title: 'Covr — Free Minecraft Marketplace Cover Editor',
    description: 'Create stunning Minecraft Marketplace cover art for free.',
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
