import { createClient } from '@/lib/supabase/server'
import { updateListingStatus } from '../actions'

const STATUS_STYLES: Record<string, string> = {
  live: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-slate-100 text-slate-600',
  denied: 'bg-red-100 text-red-700',
  removed: 'bg-red-100 text-red-700',
  paused: 'bg-amber-100 text-amber-700',
  in_review: 'bg-blue-100 text-blue-700',
}

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('listings')
    .select(`
      id, title, slug, listing_status, moderation_status,
      total_orders, average_rating, created_at,
      profiles ( display_name, email ),
      listing_packages ( price_usd, tier ),
      categories ( name )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (status) query = query.eq('listing_status', status)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: listings } = await query

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-red-600">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">All Services</h1>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by title..."
          className="rounded-xl border px-4 py-2 text-sm outline-none focus:border-blue-500 w-64"
        />
        <select name="status" defaultValue={status ?? ''} className="rounded-xl border px-4 py-2 text-sm outline-none">
          <option value="">All statuses</option>
          <option value="live">Live</option>
          <option value="draft">Draft</option>
          <option value="in_review">In Review</option>
          <option value="paused">Paused</option>
          <option value="denied">Denied</option>
          <option value="removed">Removed</option>
        </select>
        <button type="submit" className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700">Filter</button>
        {(status || q) && (
          <a href="/admin/services" className="rounded-xl border px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Clear</a>
        )}
      </form>

      <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <p className="text-sm text-slate-500">{listings?.length ?? 0} listings found</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3">Listing</th>
                <th className="px-5 py-3">Seller</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!listings || listings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">No listings found</td>
                </tr>
              ) : listings.map((l: any) => {
                const seller = l.profiles
                const basicPkg = l.listing_packages?.find((p: any) => p.tier === 'basic') ?? l.listing_packages?.[0]
                return (
                  <tr key={l.id} className="border-t hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-medium text-slate-900 truncate">{l.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(l.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700">{seller?.display_name ?? 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{seller?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{(l.categories as any)?.name ?? '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {basicPkg ? `$${Number(basicPkg.price_usd).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[l.listing_status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {l.listing_status}
                      </span>
                      {l.moderation_status === 'pending' && (
                        <span className="ml-1 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-medium">pending review</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {l.listing_status !== 'live' && l.listing_status !== 'denied' && (
                          <form action={updateListingStatus}>
                            <input type="hidden" name="listing_id" value={l.id} />
                            <input type="hidden" name="action" value="approve" />
                            <input type="hidden" name="reason" value="Admin approved" />
                            <button className="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700">Approve</button>
                          </form>
                        )}
                        {l.listing_status === 'live' && (
                          <form action={updateListingStatus}>
                            <input type="hidden" name="listing_id" value={l.id} />
                            <input type="hidden" name="action" value="pause" />
                            <input type="hidden" name="reason" value="Admin paused" />
                            <button className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-700 hover:bg-amber-100">Pause</button>
                          </form>
                        )}
                        {l.listing_status !== 'removed' && (
                          <form action={updateListingStatus}>
                            <input type="hidden" name="listing_id" value={l.id} />
                            <input type="hidden" name="action" value="remove" />
                            <input type="hidden" name="reason" value="Admin removed" />
                            <button className="rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100">Remove</button>
                          </form>
                        )}
                        {l.slug && (
                          <a href={`/services/${l.slug}`} target="_blank" className="rounded-lg border px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">View</a>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
