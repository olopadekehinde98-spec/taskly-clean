import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

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
    <main className="min-h-screen bg-[#fdfaf4]">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#0d2818] text-white">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(62,207,104,0.07) 0%, transparent 65%)' }} />

        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32 relative z-10">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <p className="mb-4 inline-flex items-center gap-2 text-[#3ecf68] text-xs font-bold uppercase tracking-widest">
              <span className="block w-5 h-0.5 bg-[#3ecf68]" />
              Freelance Marketplace
            </p>

            <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl" style={{ fontFamily: 'Fraunces, serif' }}>
              Quality work,<br />
              <em className="not-italic text-[#3ecf68]">guaranteed</em><br />
              delivery.
            </h1>

            <p className="mt-6 text-lg text-white/55 leading-relaxed max-w-lg">
              Find expert freelancers for any project. Secure escrow payments, verified reviews, and AI-powered matching — all in one place.
            </p>

            {/* Search bar */}
            <form action="/services" method="GET" className="mt-8 flex gap-0 rounded-2xl overflow-hidden shadow-2xl max-w-xl border border-white/10">
              <input
                name="search"
                type="text"
                placeholder='Try "logo design" or "SEO blog post"'
                className="flex-1 px-5 py-4 bg-white/8 text-white placeholder:text-white/30 outline-none text-sm backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
              <button
                type="submit"
                className="bg-[#3ecf68] px-7 py-4 text-sm font-bold text-[#0d2818] hover:bg-[#52e07a] transition-colors shrink-0"
              >
                Search
              </button>
            </form>

            {/* Popular tags */}
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="text-xs text-white/35">Popular:</span>
              {['Logo Design', 'Web Development', 'SEO Writing', 'Mobile App', 'Brand Identity'].map(tag => (
                <Link
                  key={tag}
                  href={`/services?search=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/55 hover:border-[#3ecf68]/60 hover:text-[#3ecf68] transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10 bg-[#163522]">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <div className="flex flex-wrap gap-8 text-sm text-white/45">
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
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#3ecf68] mb-1 flex items-center gap-2">
                <span className="block w-4 h-0.5 bg-[#3ecf68]" />Services
              </p>
              <h2 className="text-2xl font-bold text-[#0d2818]" style={{ fontFamily: 'Fraunces, serif' }}>Browse by Category</h2>
            </div>
            <Link href="/categories" className="text-sm font-semibold text-[#3ecf68] hover:text-[#28a84e] transition-colors">View all →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/services?category=${cat.slug}`}
                className="group flex items-center gap-3 rounded-2xl border border-[#dae8df] bg-white p-4 shadow-sm hover:border-[#3ecf68] hover:shadow-md hover:bg-[#edfbf2] transition-all"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-sm font-semibold text-[#0d2818] group-hover:text-[#28a84e] transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FEATURED SERVICES ── */}
      <section className="bg-white border-t border-b border-[#dae8df] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#3ecf68] mb-1 flex items-center gap-2">
                <span className="block w-4 h-0.5 bg-[#3ecf68]" />Trending
              </p>
              <h2 className="text-2xl font-bold text-[#0d2818]" style={{ fontFamily: 'Fraunces, serif' }}>Featured Services</h2>
            </div>
            <Link href="/services" className="text-sm font-semibold text-[#3ecf68] hover:text-[#28a84e] transition-colors">Browse all →</Link>
          </div>

          {!featured || featured.length === 0 ? (
            <div className="rounded-3xl border border-[#dae8df] bg-[#fdfaf4] p-16 text-center">
              <p className="text-[#7a9a86]">No services yet. <Link href="/start-selling" className="text-[#3ecf68] hover:underline">Be the first to sell!</Link></p>
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
                    className="group rounded-2xl bg-[#fdfaf4] border border-[#dae8df] overflow-hidden hover:border-[#3ecf68] hover:shadow-lg transition-all duration-200"
                  >
                    <div className="aspect-video bg-[#edfbf2] overflow-hidden relative">
                      {listing.cover_image_url ? (
                        <Image src={listing.cover_image_url} alt={listing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-5xl">
                          {listing.categories?.icon ?? '💼'}
                        </div>
                      )}
                      {seller?.trust_tier === 'top' && (
                        <span className="absolute top-2 left-2 rounded-full bg-[#d4a853] px-2 py-0.5 text-xs font-bold text-white">TOP</span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-[#3ecf68] flex items-center justify-center text-xs font-bold text-[#0d2818] overflow-hidden shrink-0 relative">
                          {seller?.avatar_url ? (
                            <Image src={seller.avatar_url} alt={seller?.display_name ?? 'Seller'} fill className="object-cover" />
                          ) : (
                            (seller?.display_name ?? 'S')[0].toUpperCase()
                          )}
                        </div>
                        <span className="text-xs text-[#7a9a86] truncate">{seller?.display_name ?? 'Seller'}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#0d2818] line-clamp-2 leading-snug mb-2">{listing.title}</h3>
                      {reviews > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-amber-500 text-xs">★</span>
                          <span className="text-xs font-bold text-[#0d2818]">{Number(rating).toFixed(1)}</span>
                          <span className="text-xs text-[#7a9a86]">({reviews})</span>
                        </div>
                      )}
                      <div className="border-t border-[#dae8df] pt-3 mt-auto">
                        <span className="text-xs text-[#7a9a86]">From </span>
                        <span className="text-sm font-bold text-[#0d2818]">${Number(price).toFixed(2)}</span>
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
      <section className="bg-[#f5f0e4] border-b border-[#dae8df] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#3ecf68] mb-2 flex items-center justify-center gap-2">
              <span className="block w-4 h-0.5 bg-[#3ecf68]" />Process<span className="block w-4 h-0.5 bg-[#3ecf68]" />
            </p>
            <h2 className="text-2xl font-bold text-[#0d2818]" style={{ fontFamily: 'Fraunces, serif' }}>How Taskly Works</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3 text-center">
            {[
              { step: '01', icon: '🔍', title: 'Find a Service', desc: 'Browse verified freelancers by skill, rating, and price — or use AI matching to find your perfect fit.' },
              { step: '02', icon: '🔒', title: 'Pay with Escrow', desc: 'Choose a package and pay securely. Funds are held safely until you approve the final delivery.' },
              { step: '03', icon: '✅', title: 'Get it Done', desc: 'Receive your delivery, request revisions if needed, and release payment when satisfied.' },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center bg-white rounded-2xl border border-[#dae8df] p-8 hover:border-[#3ecf68] transition-all">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#3ecf68] mb-3">Step {s.step}</p>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edfbf2] text-3xl">{s.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-[#0d2818]" style={{ fontFamily: 'Fraunces, serif' }}>{s.title}</h3>
                <p className="text-sm text-[#4a6958] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0d2818] text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-3xl font-black mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
            Start your next project <em className="not-italic text-[#3ecf68]">today.</em>
          </h2>
          <p className="text-white/50 mb-8 text-lg">Free to join. No subscriptions. Pay only for work you love.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {!user ? (
              <>
                <Link href="/signup" className="rounded-2xl bg-[#3ecf68] px-8 py-3.5 text-sm font-bold text-[#0d2818] hover:bg-[#52e07a] transition-colors shadow-lg shadow-[#3ecf68]/20">
                  Create Free Account →
                </Link>
                <Link href="/services" className="rounded-2xl border border-white/20 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors">
                  Browse Services
                </Link>
              </>
            ) : (
              <>
                <Link href="/services" className="rounded-2xl bg-[#3ecf68] px-8 py-3.5 text-sm font-bold text-[#0d2818] hover:bg-[#52e07a] transition-colors shadow-lg shadow-[#3ecf68]/20">
                  Browse Services
                </Link>
                <Link href="/start-selling" className="rounded-2xl border border-white/20 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition-colors">
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
