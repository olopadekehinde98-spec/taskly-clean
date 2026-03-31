import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function statusBadge(status: string) {
  if (status === 'live') return 'bg-emerald-50 text-emerald-700'
  if (status === 'in_review') return 'bg-amber-50 text-amber-700'
  if (status === 'draft') return 'bg-slate-100 text-slate-600'
  if (status === 'paused') return 'bg-orange-50 text-orange-700'
  return 'bg-red-50 text-red-700'
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id, title, slug, listing_status, total_orders, average_rating, total_reviews, created_at,
      listing_packages ( price_usd, tier ),
      categories ( name, icon )
    `)
    .eq('seller_id', user!.id)
    .order('created_at', { ascending: false })

  const live = listings?.filter(l => l.listing_status === 'live').length ?? 0
  const drafts = listings?.filter(l => l.listing_status === 'draft').length ?? 0
  const inReview = listings?.filter(l => l.listing_status === 'in_review').length ?? 0
  const totalOrders = listings?.reduce((sum, l) => sum + (l.total_orders ?? 0), 0) ?? 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Listing Studio</p>
          <h1 className="text-3xl font-bold text-slate-900">My Listings</h1>
        </div>
        <Link href="/schedule/new" className="rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 transition-colors text-center">
          + Create New Listing
        </Link>
      </div>

      {params.success && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          {params.success}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Live', value: live, color: 'text-emerald-600' },
          { label: 'In Review', value: inReview, color: 'text-amber-600' },
          { label: 'Drafts', value: drafts, color: 'text-slate-600' },
          { label: 'Total Orders', value: totalOrders, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {!listings || listings.length === 0 ? (
        <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No listings yet</h2>
          <p className="text-slate-500 mb-6">Create your first listing and use the AI quality checker to make it stand out.</p>
          <Link href="/schedule/new" className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors">
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing: any) => {
            const basicPkg = listing.listing_packages?.find((p: any) => p.tier === 'basic') ?? listing.listing_packages?.[0]
            return (
              <div key={listing.id} className="rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    <span>{listing.categories?.icon ?? '💼'}</span>
                    <span>{listing.categories?.name ?? 'Uncategorized'}</span>
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusBadge(listing.listing_status)}`}>
                    {listing.listing_status?.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 line-clamp-2 mb-3">{listing.title}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span>📦 {listing.total_orders ?? 0} orders</span>
                  {listing.total_reviews > 0 && <span>★ {Number(listing.average_rating).toFixed(1)}</span>}
                  {basicPkg && <span className="font-semibold text-slate-900">${Number(basicPkg.price_usd).toFixed(0)}</span>}
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <Link href={`/dashboard/services/${listing.slug}`} className="text-sm font-medium text-blue-600 hover:underline">
                    Edit
                  </Link>
                  <Link href={`/schedule/quality-check?id=${listing.id}`} className="text-sm font-medium text-purple-600 hover:underline">
                    AI Check
                  </Link>
                  <Link href={`/services/${listing.slug}`} className="text-sm text-slate-500 hover:underline">
                    View Public
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
