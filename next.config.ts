import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SSR stays on Vercel. The Capacitor mobile app loads the live Vercel URL
  // via server.url in capacitor.config.ts — no static export needed.
}

export default nextConfig;
