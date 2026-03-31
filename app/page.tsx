import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface SearchParams { search?: string; category?: string }

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { search, category } = await searchParams
  const supabase = await createClient()

  // Fetch real categories from DB
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .eq('is_active', true)
    .order('sort_order')

  // Build real listings query
  let query = supabase
    .from('listings')
    .select(`
      id, title, slug, short_description, cover_image_url,
      average_rating, total_reviews, total_orders,
      listing_packages ( price_usd, tier ),
      profiles ( display_name, username, avatar_url, trust_tier ),
      categories ( name, slug )
    `)
    .eq('listing_status', 'live')
    .order('total_orders', { ascending: false })

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  if (category) {
    const cat = categories?.find(c => c.slug === category)
    if (cat) query = query.eq('category_id', cat.id)
  }

  const { data: listings, error } = await query.limit(48)

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {search ? `Results for "${search}"` : category ? `${categories?.find(c => c.slug === category)?.name ?? 'Services'}` : 'All Services'}
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            {listings?.length ?? 0} services available
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="rounded-2xl bg-white border p-4">
              <h3 className="mb-3 font-semibold text-slate-900 text-sm">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/services"
                    className={`block rounded-xl px-3 py-2 text-sm transition-colors ${!category ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    All Categories
                  </Link>
                </li>
                {categories?.map(cat => (
                  <li key={cat.id}>
                    <Link
                      href={`/services?category=${cat.slug}${search ? `&search=${search}` : ''}`}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${category === cat.slug ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Listings grid */}
          <div className="flex-1">
            {!listings || listings.length === 0 ? (
              <div className="rounded-2xl bg-white border p-16 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-slate-900">No services found</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {search ? `No results for "${search}". Try a different search.` : 'No services available in this category yet.'}
                </p>
                <Link href="/services" className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 transition-colors">
                  Browse all services
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing: any) => {
                  const basicPackage = listing.listing_packages?.find((p: any) => p.tier === 'basic')
                    ?? listing.listing_packages?.[0]
                  const price = basicPackage?.price_usd ?? 0
                  const seller = listing.profiles
                  const rating = listing.average_rating ?? 0
                  const reviews = listing.total_reviews ?? 0

                  return (
                    <Link
                      key={listing.id}
                      href={`/services/${listing.slug ?? listing.id}`}
                      className="group rounded-2xl bg-white border overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Cover image */}
                      <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                        {listing.cover_image_url ? (
                          <img
                            src={listing.cover_image_url}
                            alt={listing.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-4xl">
                            {listing.categories?.icon ?? '💼'}
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        {/* Seller info */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                            {seller?.avatar_url ? (
                              <img src={seller.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              (seller?.display_name ?? 'S')[0].toUpperCase()
                            )}
                          </div>
                          <span className="text-xs text-slate-500">{seller?.display_name ?? 'Seller'}</span>
                          {seller?.trust_tier === 'top' && (
                            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Top Seller</span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug mb-2">
                          {listing.title}
                        </h3>

                        {/* Rating */}
                        {reviews > 0 && (
                          <div className="flex items-center gap-1 mb-3">
                            <span className="text-amber-400 text-xs">★</span>
                            <span className="text-xs font-semibold text-slate-900">{Number(rating).toFixed(1)}</span>
                            <span className="text-xs text-slate-400">({reviews})</span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between border-t pt-3 mt-3">
                          <span className="text-xs text-slate-400">Starting at</span>
                          <span className="text-sm font-bold text-slate-900">${Number(price).toFixed(2)}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}