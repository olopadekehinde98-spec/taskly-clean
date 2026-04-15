import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function BuyerSavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: saved } = await supabase
    .from('saved_listings')
    .select(`
      id, created_at,
      listings(
        id, title, slug, short_description, cover_image_url, average_rating, total_reviews,
        categories(name, icon),
        profiles!listings_seller_id_fkey(display_name, username),
        listing_packages(tier, price_usd)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const items = (saved ?? []).filter((s: any) => s.listings)

  const startingPrice = (listing: any) => {
    const pkgs: any[] = listing.listing_packages ?? []
    const basic = pkgs.find((p: any) => p.tier === 'basic') ?? pkgs[0]
    return basic?.price_usd ? `$${Number(basic.price_usd).toFixed(2)}` : '—'
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#3ecf68]">Buyer Dashboard</p>
        <h1 className="text-3xl font-bold text-slate-900">Saved Services</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Saved Count</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{items.length}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Most Recent Save</p>
          <h2 className="mt-2 text-lg font-bold text-slate-900 truncate">
            {items[0] ? (items[0] as any).listings.title.substring(0, 30) + '…' : '—'}
          </h2>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Quick Action</p>
          <Link href="/services" className="mt-2 inline-block rounded-xl bg-[#3ecf68] px-4 py-2 text-sm font-medium text-white">
            Browse More →
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">
          <div className="mb-4 text-5xl">❤️</div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">No saved services yet</h2>
          <p className="mb-6 text-slate-600">Browse services and click the Save button to add them here.</p>
          <Link href="/services" className="rounded-2xl bg-[#3ecf68] px-5 py-3 font-medium text-white">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((save: any) => {
            const listing = save.listings
            return (
              <div key={save.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-block rounded-full bg-[#edfbf2] px-3 py-1 text-xs font-medium text-[#28a84e]">
                    {listing.categories?.icon} {listing.categories?.name ?? '—'}
                  </span>
                  <form action={`/api/listings/unsave`} method="POST">
                    <input type="hidden" name="listing_id" value={listing.id} />
                    <button type="submit" className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100">
                      Remove
                    </button>
                  </form>
                </div>
                <h2 className="mb-2 text-base font-semibold text-slate-900 line-clamp-2">{listing.title}</h2>
                <p className="mb-3 text-sm text-slate-500">by {listing.profiles?.display_name ?? '—'}</p>
                {listing.average_rating > 0 && (
                  <p className="mb-3 text-xs text-amber-500">★ {Number(listing.average_rating).toFixed(1)} ({listing.total_reviews})</p>
                )}
                <p className="mb-4 text-sm font-semibold text-slate-900">Starting at {startingPrice(listing)}</p>
                <Link href={`/services/${listing.slug}`} className="font-medium text-[#3ecf68] text-sm hover:underline">
                  View Service →
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
