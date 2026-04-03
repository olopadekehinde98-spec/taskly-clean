import { createClient } from '@/lib/supabase/server'

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ flagged?: string }>
}) {
  const { flagged } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('reviews')
    .select(`
      id, rating, title, body, is_public, created_at,
      listings ( title, slug ),
      reviewer:profiles!reviews_reviewer_id_fkey ( display_name, email ),
      seller:profiles!reviews_seller_id_fkey ( display_name, email )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  // "flagged" filter = hidden reviews (is_public = false)
  if (flagged === '1') query = query.eq('is_public', false)

  const { data: reviews, error } = await query

  async function toggleReviewVisibility(formData: FormData) {
    'use server'
    const id = String(formData.get('review_id') || '')
    const hide = formData.get('hide') === '1'
    if (!id) return
    const { createClient: sc } = await import('@/lib/supabase/server')
    const sup = await sc()
    await sup.from('reviews').update({ is_public: !hide }).eq('id', id)
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/admin/reviews')
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-red-600">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Reviews</h1>
        <p className="mt-1 text-sm text-slate-500">{reviews?.length ?? 0} review{(reviews?.length ?? 0) !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex gap-2">
        <a href="/admin/reviews" className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${!flagged ? 'bg-slate-800 text-white' : 'border bg-white text-slate-600 hover:bg-slate-50'}`}>All Reviews</a>
        <a href="/admin/reviews?flagged=1" className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${flagged === '1' ? 'bg-slate-800 text-white' : 'border bg-white text-slate-600 hover:bg-slate-50'}`}>🚩 Flagged</a>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Reviews table may not exist yet. Create it in Supabase to enable this section.
        </div>
      )}

      {!reviews || reviews.length === 0 ? (
        <div className="rounded-3xl border bg-white p-16 text-center shadow-sm">
          <div className="text-5xl mb-4">⭐</div>
          <h2 className="text-xl font-bold text-slate-900">No reviews found</h2>
          <p className="mt-2 text-slate-500 text-sm">Reviews will appear here once buyers start leaving feedback.</p>
        </div>
      ) : (
        <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs text-slate-500 uppercase tracking-wide">
                  <th className="px-5 py-3">Review</th>
                  <th className="px-5 py-3">Listing</th>
                  <th className="px-5 py-3">Buyer</th>
                  <th className="px-5 py-3">Seller</th>
                  <th className="px-5 py-3">Rating</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r: any) => (
                  <tr key={r.id} className="border-t hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-sm text-slate-700 line-clamp-2">{r.body ?? r.title ?? '—'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(r.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {r.listings?.slug ? (
                        <a href={`/services/${r.listings.slug}`} target="_blank" className="hover:underline text-blue-600">{r.listings.title}</a>
                      ) : r.listings?.title ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{r.reviewer?.display_name ?? r.reviewer?.email ?? '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{r.seller?.display_name ?? r.seller?.email ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900">{'⭐'.repeat(Math.min(r.rating, 5))}</span>
                      <span className="text-xs text-slate-400 ml-1">{r.rating}/5</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${!r.is_public ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {!r.is_public ? '🚩 Hidden' : 'Published'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <form action={toggleReviewVisibility}>
                        <input type="hidden" name="review_id" value={r.id} />
                        <input type="hidden" name="hide" value={r.is_public ? '1' : '0'} />
                        <button className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${!r.is_public ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'}`}>
                          {!r.is_public ? 'Publish' : '🚩 Hide'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
