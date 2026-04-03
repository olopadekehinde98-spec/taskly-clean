import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SellerAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_seller, is_admin, display_name')
    .eq('id', user.id)
    .single()

  if (!profile?.is_seller && !profile?.is_admin) redirect('/start-selling')

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // All listings for this seller
  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, listing_status, total_orders, average_rating')
    .eq('seller_id', user.id)
    .order('total_orders', { ascending: false })

  const listingIds = listings?.map(l => l.id) ?? []

  // Orders breakdown
  const [{ data: todayOrders }, { data: weekOrders }, { data: monthOrders }, { data: allOrders }] = await Promise.all([
    listingIds.length > 0
      ? supabase.from('orders').select('id, seller_net_amount, subtotal_amount, order_status').in('listing_id', listingIds).gte('created_at', todayStart)
      : { data: [] },
    listingIds.length > 0
      ? supabase.from('orders').select('id, seller_net_amount, subtotal_amount, order_status').in('listing_id', listingIds).gte('created_at', weekStart)
      : { data: [] },
    listingIds.length > 0
      ? supabase.from('orders').select('id, seller_net_amount, subtotal_amount, order_status').in('listing_id', listingIds).gte('created_at', monthStart)
      : { data: [] },
    listingIds.length > 0
      ? supabase.from('orders').select('id, seller_net_amount, subtotal_amount, order_status').in('listing_id', listingIds)
      : { data: [] },
  ])

  function calcRevenue(orders: any[] | null) {
    return orders?.filter(o => o.order_status === 'completed').reduce((s: number, o: any) => s + Number(o.seller_net_amount ?? o.subtotal_amount ?? 0), 0) ?? 0
  }

  const todayRev = calcRevenue(todayOrders)
  const weekRev = calcRevenue(weekOrders)
  const monthRev = calcRevenue(monthOrders)
  const allRev = calcRevenue(allOrders)

  const liveListings = listings?.filter(l => l.listing_status === 'live').length ?? 0
  const totalOrders = allOrders?.length ?? 0

  // Per-listing stats
  const listingStats = listings?.map(l => {
    const lOrders = allOrders?.filter(o => (o as any).listing_id === l.id) ?? []
    const lRev = lOrders.filter(o => o.order_status === 'completed').reduce((s, o) => s + Number((o as any).seller_net_amount ?? (o as any).subtotal_amount ?? 0), 0)
    return { ...l, orderCount: lOrders.length, revenue: lRev }
  }) ?? []

  function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
    return (
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Seller Analytics</p>
        <h1 className="text-3xl font-bold text-slate-900">Performance Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Real data from your listings and orders</p>
      </div>

      {/* Summary row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">${allRev.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">All time</p>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Orders</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalOrders}</p>
          <p className="text-xs text-slate-400 mt-1">All time</p>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Live Listings</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{liveListings}</p>
          <p className="text-xs text-slate-400 mt-1">of {listings?.length ?? 0} total</p>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">This Month</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">${monthRev.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">{monthOrders?.length ?? 0} orders (30d)</p>
        </div>
      </div>

      {/* Period breakdown */}
      <section className="grid gap-6 xl:grid-cols-3">
        {[
          { label: 'Today', orders: todayOrders, rev: todayRev },
          { label: 'Last 7 Days', orders: weekOrders, rev: weekRev },
          { label: 'Last 30 Days', orders: monthOrders, rev: monthRev },
        ].map(({ label, orders, rev }) => (
          <div key={label} className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="mb-4 text-lg font-semibold text-slate-900">{label}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Orders" value={orders?.length ?? 0} />
              <StatCard label="Revenue" value={`$${rev.toFixed(2)}`} />
              <StatCard label="Completed" value={orders?.filter(o => o.order_status === 'completed').length ?? 0} />
              <StatCard label="Active" value={orders?.filter(o => o.order_status === 'active' || o.order_status === 'revision_requested').length ?? 0} />
            </div>
          </div>
        ))}
      </section>

      {/* Per-listing breakdown */}
      {listingStats.length > 0 && (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-900">Listing Performance</h2>
          <div className="space-y-4">
            {listingStats.map(l => (
              <div key={l.id} className="rounded-2xl bg-slate-50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{l.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${l.listing_status === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{l.listing_status}</span>
                      {l.average_rating > 0 && <span className="text-xs text-slate-500">⭐ {Number(l.average_rating).toFixed(1)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-6 shrink-0 text-center">
                    <div>
                      <p className="text-xl font-bold text-slate-900">{l.orderCount}</p>
                      <p className="text-xs text-slate-500">Orders</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-emerald-600">${l.revenue.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Revenue</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Growth tips */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Growth Tips</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 text-sm text-slate-600">
          {[
            { icon: '📸', tip: 'Add high-quality images to your listings to increase click-through rates.' },
            { icon: '🏷️', tip: 'Use specific, buyer-intent keywords in your title and tags to improve search visibility.' },
            { icon: '⚡', tip: 'Respond to order requests quickly — buyers prefer sellers with fast response times.' },
            { icon: '⭐', tip: 'Deliver exceptional work to earn 5-star reviews and unlock higher trust tiers.' },
            { icon: '💼', tip: 'Offer all three package tiers (Basic, Standard, Premium) to capture different budgets.' },
            { icon: '📣', tip: 'Share your listing links on social media to drive external traffic.' },
          ].map(({ icon, tip }) => (
            <div key={tip} className="rounded-2xl bg-slate-50 p-4">
              <span className="text-2xl">{icon}</span>
              <p className="mt-2">{tip}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
