import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SSR stays on Vercel. The Capacitor mobile app loads the live Vercel URL
  // via server.url in capacitor.config.ts — no static export needed.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig;
