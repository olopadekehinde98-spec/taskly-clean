import { createClient } from '@/lib/supabase/server'
import { updateListingStatus } from '../actions'

export default async function AdminModerationPage() {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id, title, slug, listing_status, moderation_status, category, tags, short_description, created_at,
      profiles ( display_name, email, username ),
      listing_packages ( price_usd, tier )
    `)
    .eq('moderation_status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-red-600">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Moderation Queue</h1>
        <p className="mt-1 text-sm text-slate-500">
          {listings?.length ?? 0} listing{(listings?.length ?? 0) !== 1 ? 's' : ''} awaiting review
        </p>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="rounded-3xl border bg-white p-16 text-center shadow-sm">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-slate-900">Queue is clear</h2>
          <p className="mt-2 text-slate-500 text-sm">No listings are pending moderation review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing: any) => {
            const basicPkg = listing.listing_packages?.find((p: any) => p.tier === 'basic') ?? listing.listing_packages?.[0]
            const seller = listing.profiles
            return (
              <div key={listing.id} className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-xs font-medium">Pending Review</span>
                      <span className="text-xs text-slate-400">{new Date(listing.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{listing.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{listing.short_description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>👤 {seller?.display_name ?? seller?.email ?? 'Unknown'}</span>
                      {listing.category && <span>📂 {listing.category}</span>}
                      {basicPkg && <span>💰 from ${Number(basicPkg.price_usd).toFixed(2)}</span>}
                    </div>
                    {Array.isArray(listing.tags) && listing.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {listing.tags.slice(0, 5).map((tag: string) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <form action={updateListingStatus}>
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <input type="hidden" name="action" value="approve" />
                      <input type="hidden" name="reason" value="Admin approved after review" />
                      <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
                        ✓ Approve
                      </button>
                    </form>
                    <form action={updateListingStatus}>
                      <input type="hidden" name="listing_id" value={listing.id} />
                      <input type="hidden" name="action" value="deny" />
                      <input type="hidden" name="reason" value="Does not meet platform standards" />
                      <button className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors">
                        ✗ Deny
                      </button>
                    </form>
                    <a href={`/services/${listing.slug}`} target="_blank" className="rounded-xl border px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                      Preview
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
