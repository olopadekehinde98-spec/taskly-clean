import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Props = { params: Promise<{ slug: string }> }

export default async function ServiceDetailsPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch listing by slug or id
  const { data: listing } = await supabase
    .from('listings')
    .select(`
      id, title, slug, description, short_description, cover_image_url,
      average_rating, total_reviews, total_orders, delivery_days,
      listing_status, created_at,
      categories(name, slug, icon),
      profiles!listings_seller_id_fkey(
        id, display_name, username, avatar_url, bio,
        trust_tier, response_time, member_since, response_rate
      ),
      listing_packages(id, tier, title, price_usd, delivery_days, description, revisions)
    `)
    .eq('slug', slug)
    .eq('listing_status', 'live')
    .single()

  if (!listing) notFound()

  const seller = (listing as any).profiles
  const packages: any[] = (listing as any).listing_packages ?? []
  const basicPkg = packages.find(p => p.tier === 'basic') ?? packages[0]
  const sellerName = seller?.display_name || 'Seller'
  const sellerUsername = seller?.username || ''
  const categoryName = (listing as any).categories?.name || 'Service'
  const categorySlug = (listing as any).categories?.slug || ''
  const rating = Number((listing as any).average_rating ?? 0)
  const reviews = Number((listing as any).total_reviews ?? 0)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px]">

        {/* Left column */}
        <div className="space-y-6">
          {/* Cover image */}
          <div className="h-64 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-200 sm:h-80">
            {(listing as any).cover_image_url ? (
              <img src={(listing as any).cover_image_url} alt={(listing as any).title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl">
                {(listing as any).categories?.icon ?? '💼'}
              </div>
            )}
          </div>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            {/* Category + breadcrumb */}
            <div className="mb-4 flex items-center gap-2 text-sm">
              <Link href="/services" className="text-slate-500 hover:text-blue-600">Services</Link>
              <span className="text-slate-300">/</span>
              <Link href={`/services?category=${categorySlug}`} className="text-slate-500 hover:text-blue-600">{categoryName}</Link>
            </div>

            <h1 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">{(listing as any).title}</h1>

            {/* Seller info */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white overflow-hidden">
                {seller?.avatar_url ? (
                  <img src={seller.avatar_url} alt={sellerName} className="h-full w-full object-cover" />
                ) : (
                  sellerName[0]?.toUpperCase()
                )}
              </div>
              <div>
                <Link href={sellerUsername ? `/seller/${sellerUsername}` : '#'} className="font-semibold text-slate-900 hover:text-blue-600">
                  {sellerName}
                </Link>
                {seller?.trust_tier === 'top' && (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Top Seller</span>
                )}
              </div>
            </div>

            {/* Rating */}
            {reviews > 0 && (
              <div className="mb-5 flex items-center gap-2 text-sm">
                <span className="text-amber-400">★</span>
                <span className="font-semibold">{rating.toFixed(1)}</span>
                <span className="text-slate-400">({reviews} reviews)</span>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">About this service</h2>
              <p className="leading-7 text-slate-700 whitespace-pre-line">
                {(listing as any).description || (listing as any).short_description || 'No description provided.'}
              </p>
            </div>

            {/* Packages */}
            {packages.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Packages</h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {packages.map((pkg: any) => (
                    <div key={pkg.id} className="rounded-2xl border bg-slate-50 p-5">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600">{pkg.tier}</p>
                      <h3 className="mb-2 font-semibold text-slate-900">{pkg.title || pkg.tier}</h3>
                      <p className="mb-3 text-2xl font-bold text-slate-900">${Number(pkg.price_usd).toFixed(2)}</p>
                      <p className="mb-2 text-xs text-slate-500">{pkg.delivery_days} day delivery</p>
                      {pkg.revisions != null && <p className="text-xs text-slate-500">{pkg.revisions === -1 ? 'Unlimited' : pkg.revisions} revision{pkg.revisions !== 1 ? 's' : ''}</p>}
                      {pkg.description && <p className="mt-2 text-sm leading-5 text-slate-600">{pkg.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seller bio */}
            {seller?.bio && (
              <div className="rounded-2xl bg-slate-50 p-6">
                <h2 className="mb-3 font-semibold text-slate-900">About the seller</h2>
                <p className="text-sm leading-7 text-slate-700">{seller.bio}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                  {seller.response_time && <span>⚡ Response: {seller.response_time}</span>}
                  {seller.member_since && <span>📅 Member since: {seller.member_since}</span>}
                  {seller.response_rate != null && <span>💬 Response rate: {seller.response_rate}%</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right sticky sidebar */}
        <aside className="h-fit rounded-3xl border bg-white p-6 shadow-sm lg:sticky lg:top-24">
          {basicPkg ? (
            <>
              <p className="mb-1 text-sm text-slate-500">Starting at</p>
              <p className="mb-1 text-3xl font-bold text-blue-600">${Number(basicPkg.price_usd).toFixed(2)}</p>
              <p className="mb-5 text-sm text-slate-400">{basicPkg.delivery_days}-day delivery</p>
              <Link
                href={`/order/${(listing as any).slug ?? (listing as any).id}`}
                className="mb-3 block w-full rounded-2xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Order Now
              </Link>
            </>
          ) : (
            <p className="mb-5 text-sm text-slate-500">Contact seller for pricing</p>
          )}

          <Link
            href={sellerUsername ? `/seller/${sellerUsername}` : '#'}
            className="block w-full rounded-2xl border px-5 py-3 text-center font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            View Seller Profile
          </Link>

          <div className="mt-6 space-y-3 border-t pt-5 text-sm text-slate-600">
            {(listing as any).total_orders > 0 && (
              <div className="flex justify-between">
                <span>Orders completed</span>
                <span className="font-medium text-slate-900">{(listing as any).total_orders}</span>
              </div>
            )}
            {reviews > 0 && (
              <div className="flex justify-between">
                <span>Rating</span>
                <span className="font-medium text-slate-900">⭐ {rating.toFixed(1)} ({reviews})</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  )
}
