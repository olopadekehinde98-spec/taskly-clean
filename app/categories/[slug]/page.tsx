import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Props = { params: Promise<{ slug: string }> }

export default async function CategoryDetailsPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('id, name, slug, icon, description')
    .eq('slug', slug)
    .single()

  if (!category) notFound()

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id, title, slug, short_description, cover_image_url,
      average_rating, total_reviews,
      listing_packages(tier, price_usd),
      profiles!listings_seller_id_fkey(display_name, avatar_url, trust_tier)
    `)
    .eq('category_id', category.id)
    .eq('listing_status', 'live')
    .order('total_orders', { ascending: false })
    .limit(24)

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <Link href="/categories" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[#3ecf68] hover:underline">
            ← All Categories
          </Link>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edfbf2] text-2xl">
              {(category as any).icon ?? '💼'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{(category as any).name}</h1>
              {(category as any).description && (
                <p className="mt-1 text-slate-500 text-sm max-w-xl">{(category as any).description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">{listings?.length ?? 0} services in {(category as any).name}</p>
          <Link href={`/services?category=${slug}`} className="text-sm font-medium text-[#3ecf68] hover:underline">
            View with filters →
          </Link>
        </div>

        {!listings || listings.length === 0 ? (
          <div className="rounded-3xl border bg-white p-16 text-center shadow-sm">
            <p className="text-4xl mb-4">🔍</p>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No services yet in this category</h2>
            <p className="text-slate-500 text-sm mb-6">Be the first to offer a service here.</p>
            <Link href="/start-selling" className="rounded-2xl bg-[#3ecf68] px-6 py-3 text-sm font-semibold text-white hover:bg-[#28a84e]">
              Start Selling
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing: any) => {
              const pkg = listing.listing_packages?.find((p: any) => p.tier === 'basic') ?? listing.listing_packages?.[0]
              const sellerName = listing.profiles?.display_name || 'Seller'
              const rating = Number(listing.average_rating ?? 0)
              const reviews = Number(listing.total_reviews ?? 0)
              return (
                <Link
                  key={listing.id}
                  href={`/services/${listing.slug ?? listing.id}`}
                  className="group rounded-2xl bg-white border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gradient-to-br from-[#3ecf68] to-[#163522] overflow-hidden">
                    {listing.cover_image_url ? (
                      <img src={listing.cover_image_url} alt={listing.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-4xl">{(category as any).icon ?? '💼'}</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#3ecf68] to-[#163522] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        {listing.profiles?.avatar_url ? (
                          <img src={listing.profiles.avatar_url} alt={sellerName} className="h-full w-full object-cover" />
                        ) : sellerName[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-slate-500">{sellerName}</span>
                      {listing.profiles?.trust_tier === 'top' && (
                        <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Top Seller</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2">{listing.title}</h3>
                    {reviews > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
                        <span className="text-xs text-slate-400">({reviews})</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t pt-3 mt-3">
                      <span className="text-xs text-slate-400">Starting at</span>
                      <span className="text-sm font-bold text-slate-900">
                        {pkg ? `$${Number(pkg.price_usd).toFixed(2)}` : 'Contact seller'}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
