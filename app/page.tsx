import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch featured listings
  const { data: featured } = await supabase
    .from('listings')
    .select(`
      id, title, slug, cover_image_url, average_rating, total_reviews,
      listing_packages ( price_usd, tier ),
      profiles ( display_name, username, avatar_url, trust_tier ),
      categories ( name, icon )
    `)
    .eq('listing_status', 'live')
    .order('total_orders', { ascending: false })
    .limit(8)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .eq('is_active', true)
    .order('sort_order')
    .limit(8)

  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
              ✨ Trusted by thousands of businesses
            </p>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Find the perfect<br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                freelance service
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              Connect with top-rated freelancers for writing, publishing, design, Amazon support, and more. Quality work, delivered fast.
            </p>

            {/* Search bar */}
            <form action="/services" method="GET" className="mt-8 flex gap-0 rounded-2xl overflow-hidden shadow-2xl max-w-xl">
              <input
                name="search"
                type="text"
                placeholder='Try "ebook formatting" or "Amazon appeal"'
                className="flex-1 px-5 py-4 text-slate-900 outline-none text-sm placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="bg-blue-600 px-7 py-4 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shrink-0"
              >
                Search
              </button>
            </form>

            {/* Popular tags */}
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="text-xs text-slate-400">Popular:</span>
              {['Ebook Formatting', 'Amazon FBA', 'Ghost Writing', 'Kindle Publishing', 'Logo Design'].map(tag => (
                <Link
                  key={tag}
                  href={`/services?search=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-300 hover:border-blue-400 hover:text-blue-300 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <div className="flex flex-wrap gap-8 text-sm text-slate-400">
              {[
                { label: 'Active Sellers', value: '500+' },
                { label: 'Services Offered', value: '1,200+' },
                { label: 'Happy Buyers', value: '3,000+' },
                { label: 'Avg. Rating', value: '4.9 ★' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="font-bold text-white">{s.value}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      {categories && categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Browse by Category</h2>
            <Link href="/categories" className="text-sm font-medium text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/services?category=${cat.slug}`}
                className="group flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FEATURED SERVICES ── */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Featured Services</h2>
            <Link href="/services" className="text-sm font-medium text-blue-600 hover:underline">Browse all →</Link>
          </div>

          {!featured || featured.length === 0 ? (
            <div className="rounded-3xl border bg-white p-16 text-center">
              <p className="text-slate-400">No services yet. <Link href="/start-selling" className="text-blue-600 hover:underline">Be the first to sell!</Link></p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((listing: any) => {
                const basicPkg = listing.listing_packages?.find((p: any) => p.tier === 'basic') ?? listing.listing_packages?.[0]
                const price = basicPkg?.price_usd ?? 0
                const seller = listing.profiles
                const rating = listing.average_rating ?? 0
                const reviews = listing.total_reviews ?? 0

                return (
                  <Link
                    key={listing.id}
                    href={`/services/${listing.slug ?? listing.id}`}
                    className="group rounded-2xl bg-white border overflow-hidden hover:shadow-lg transition-all duration-200"
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden relative">
                      {listing.cover_image_url ? (
                        <img src={listing.cover_image_url} alt={listing.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-5xl">
                          {listing.categories?.icon ?? '💼'}
                        </div>
                      )}
                      {seller?.trust_tier === 'top' && (
                        <span className="absolute top-2 left-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-white">TOP</span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                          {seller?.avatar_url ? (
                            <img src={seller.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            (seller?.display_name ?? 'S')[0].toUpperCase()
                          )}
                        </div>
                        <span className="text-xs text-slate-500 truncate">{seller?.display_name ?? 'Seller'}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug mb-2">{listing.title}</h3>
                      {reviews > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-amber-400 text-xs">★</span>
                          <span className="text-xs font-bold text-slate-900">{Number(rating).toFixed(1)}</span>
                          <span className="text-xs text-slate-400">({reviews})</span>
                        </div>
                      )}
                      <div className="border-t pt-3 mt-auto">
                        <span className="text-xs text-slate-400">From </span>
                        <span className="text-sm font-bold text-slate-900">${Number(price).toFixed(2)}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-12 text-center text-2xl font-bold text-slate-900">How TasklyClean Works</h2>
        <div className="grid gap-8 md:grid-cols-3 text-center">
          {[
            { step: '1', icon: '🔍', title: 'Find a Service', desc: 'Browse hundreds of services across writing, publishing, design, and business support.' },
            { step: '2', icon: '🛒', title: 'Place Your Order', desc: 'Choose a package, fill in your requirements, and pay securely. Funds are held in escrow.' },
            { step: '3', icon: '✅', title: 'Get it Done', desc: 'Receive your delivery, request revisions if needed, and release payment when satisfied.' },
          ].map(s => (
            <div key={s.step} className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">{s.icon}</div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">Step {s.step}</p>
              <h3 className="mb-2 text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-3xl font-extrabold mb-3">Ready to get started?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join thousands of businesses and freelancers on TasklyClean.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {!user ? (
              <>
                <Link href="/signup" className="rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-lg">
                  Get Started Free
                </Link>
                <Link href="/services" className="rounded-2xl border-2 border-white/40 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                  Browse Services
                </Link>
              </>
            ) : (
              <>
                <Link href="/services" className="rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-lg">
                  Browse Services
                </Link>
                <Link href="/start-selling" className="rounded-2xl border-2 border-white/40 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                  Start Selling
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

    </main>
  )
}
