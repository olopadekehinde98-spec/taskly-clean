import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function SellerIndexPage() {
  const supabase = await createClient()

  const { data: sellers } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url, bio, avg_rating, total_reviews, total_orders')
    .eq('is_seller', true)
    .not('username', 'is', null)
    .order('total_orders', { ascending: false })
    .limit(12)

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#3ecf68]">Community</p>
        <h1 className="mb-4 text-4xl font-bold text-slate-900">Browse Sellers</h1>
        <p className="mb-10 text-slate-500">Discover top-rated freelancers ready to help with your next project.</p>

        {!sellers || sellers.length === 0 ? (
          <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No sellers yet</h2>
            <p className="text-slate-500">Be the first to start selling on Taskly.</p>
            <Link href="/start-selling" className="mt-6 inline-block rounded-2xl bg-[#3ecf68] px-6 py-3 font-medium text-white hover:bg-[#28a84e] transition-colors">
              Start Selling
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sellers.map((seller: any) => (
              <Link
                key={seller.id}
                href={`/seller/${seller.username}`}
                className="rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  {seller.avatar_url ? (
                    <img src={seller.avatar_url} alt={seller.display_name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d4f5e4] text-xl font-bold text-[#3ecf68]">
                      {(seller.display_name ?? 'S')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900">{seller.display_name ?? seller.username}</p>
                    <p className="text-xs text-slate-400">@{seller.username}</p>
                  </div>
                </div>

                {seller.bio && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{seller.bio}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-slate-500">
                  {seller.avg_rating > 0 && (
                    <span className="text-amber-500 font-medium">★ {Number(seller.avg_rating).toFixed(1)}</span>
                  )}
                  {seller.total_orders > 0 && (
                    <span>📦 {seller.total_orders} orders</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
