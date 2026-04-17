import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://taskly-clean.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/seller`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/help`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]

  const [{ data: listings }, { data: sellers }, { data: categories }] = await Promise.all([
    supabase.from('listings').select('slug, created_at').eq('listing_status', 'live'),
    supabase.from('profiles').select('username, created_at').eq('is_seller', true),
    supabase.from('categories').select('slug'),
  ])

  const listingRoutes: MetadataRoute.Sitemap = (listings ?? []).map((l) => ({
    url: `${BASE_URL}/services/${l.slug}`,
    lastModified: new Date(l.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const sellerRoutes: MetadataRoute.Sitemap = (sellers ?? []).map((s) => ({
    url: `${BASE_URL}/seller/${s.username}`,
    lastModified: new Date(s.created_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${BASE_URL}/categories/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...listingRoutes, ...sellerRoutes, ...categoryRoutes]
}
