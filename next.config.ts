import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack(config) {
    // Konva's Node adapter imports 'canvas' for server-side rendering.
    // We only use Konva client-side (via dynamic import with ssr:false),
    // so replace the missing 'canvas' module with an empty stub.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    }
    return config
  },
}

export default nextConfig
