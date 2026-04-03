import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const LEVEL_LADDER = [
  { name: 'New Seller', gig_limit: 5 },
  { name: 'Rising Seller', gig_limit: 7 },
  { name: 'Skilled Seller', gig_limit: 10 },
  { name: 'Top Seller', gig_limit: 15 },
  { name: 'Elite Seller', gig_limit: 20 },
]

function getLevel(totalOrders: number) {
  if (totalOrders >= 100) return { ...LEVEL_LADDER[4], index: 4 }
  if (totalOrders >= 50) return { ...LEVEL_LADDER[3], index: 3 }
  if (totalOrders >= 20) return { ...LEVEL_LADDER[2], index: 2 }
  if (totalOrders >= 5) return { ...LEVEL_LADDER[1], index: 1 }
  return { ...LEVEL_LADDER[0], index: 0 }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: listings },
    { data: activeOrders, count: activeCount },
    { data: completedOrders, count: completedCount },
    { data: revenueResult },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('profiles').select('display_name, trust_tier, average_rating').eq('id', user!.id).single(),
    supabase.from('listings').select('id, title, listing_status, total_orders').eq('seller_id', user!.id),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('seller_id', user!.id).in('order_status', ['active', 'delivered', 'revision_requested']),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('seller_id', user!.id).eq('order_status', 'completed'),
    supabase.from('orders').select('seller_net_amount, subtotal_amount').eq('seller_id', user!.id).eq('order_status', 'completed'),
    supabase.from('orders').select(`
      id, order_status, subtotal_amount, seller_net_amount, created_at,
      listings ( title ),
      profiles!orders_buyer_id_fkey ( display_name )
    `).eq('seller_id', user!.id).order('created_at', { ascending: false }).limit(5),
  ])

  const totalRevenue = revenueResult?.reduce((sum: number, o: any) => sum + Number(o.seller_net_amount ?? o.subtotal_amount ?? 0), 0) ?? 0
  const totalCompletedOrders = completedCount ?? 0
  const level = getLevel(totalCompletedOrders)
  const nextLevel = LEVEL_LADDER[level.index + 1] ?? null
  const gigsUsed = listings?.length ?? 0
  const gigLimit = level.gig_limit
  const rating = profile?.average_rating ?? 0

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Seller Dashboard</p>
        <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Active Orders</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{activeCount ?? 0}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Completed Orders</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{totalCompletedOrders}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Seller Rating</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{rating > 0 ? Number(rating).toFixed(1) : '—'}</h2>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Seller Level & Gig Capacity</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Current Level</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">{level.name}</h3>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex justify-between"><span>Gig Limit</span><span className="font-semibold text-slate-900">{gigLimit}</span></div>
                <div className="flex justify-between"><span>Gigs Created</span><span className="font-semibold text-slate-900">{gigsUsed}</span></div>
                <div className="flex justify-between"><span>Remaining Slots</span><span className="font-semibold text-slate-900">{Math.max(0, gigLimit - gigsUsed)}</span></div>
              </div>
              <div className="mt-5 h-3 rounded-full bg-slate-200">
                <div className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600" style={{ width: `${Math.min(100, (gigsUsed / gigLimit) * 100)}%` }} />
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Next Unlock</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">{nextLevel?.name ?? 'Max Level'}</h3>
              {nextLevel && (
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Reach <span className="font-semibold text-slate-900">{nextLevel.name}</span> to unlock <span className="font-semibold text-slate-900">{nextLevel.gig_limit} gigs</span>.
                </p>
              )}
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm text-slate-600">
                  <span>Orders to next level</span>
                  <span className="font-semibold">{totalCompletedOrders}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200">
                  <div className="h-3 rounded-full bg-purple-600" style={{ width: `${Math.min(100, (totalCompletedOrders / (nextLevel ? [0,5,20,50,100][level.index + 1] : 100)) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Seller Level Ladder</h2>
          <div className="space-y-3">
            {LEVEL_LADDER.map((l, i) => (
              <div key={l.name} className={`rounded-2xl p-4 ${i === level.index ? 'border-2 border-purple-200 bg-purple-50' : 'bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${i === level.index ? 'text-purple-800' : 'text-slate-900'}`}>{l.name}</span>
                  <span className={`text-sm ${i === level.index ? 'text-purple-700' : 'text-slate-600'}`}>{l.gig_limit} gigs</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-8 text-center">
            <p className="text-slate-500 text-sm">No orders yet. Create a gig to start selling.</p>
            <Link href="/schedule" className="mt-3 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm text-white">Create a Listing</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{(order.listings as any)?.title ?? 'Service'}</p>
                  <p className="text-sm text-slate-500">{(order.profiles as any)?.display_name ?? 'Buyer'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-emerald-700">${Number(order.seller_net_amount ?? order.subtotal_amount ?? 0).toFixed(2)}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    order.order_status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                    order.order_status === 'active' ? 'bg-blue-50 text-blue-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>{order.order_status?.replace(/_/g, ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
