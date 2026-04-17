import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://taskly-clean.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/services', '/services/', '/categories', '/categories/', '/seller', '/seller/'],
        disallow: ['/admin', '/buyer', '/dashboard', '/api/', '/schedule', '/messages'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
