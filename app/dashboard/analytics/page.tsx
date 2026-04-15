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
    .select('id, title, slug, listing_status, total_orders, average_rating, total_reviews')
    .eq('seller_id', user.id)
    .order('total_orders', { ascending: false })

  const listingIds = listings?.map(l => l.id) ?? []

  // Parallel fetch: orders + views
  const [
    { data: allOrders },
    { data: todayOrders },
    { data: weekOrders },
    { data: monthOrders },
    { data: allViews },
    { data: todayViews },
    { data: weekViews },
    { data: monthViews },
  ] = await Promise.all([
    listingIds.length > 0
      ? supabase.from('orders').select('id, listing_id, seller_net_amount, subtotal_amount, order_status').in('listing_id', listingIds)
      : { data: [] },
    listingIds.length > 0
      ? supabase.from('orders').select('id, listing_id, seller_net_amount, subtotal_amount, order_status').in('listing_id', listingIds).gte('created_at', todayStart)
      : { data: [] },
    listingIds.length > 0
      ? supabase.from('orders').select('id, listing_id, seller_net_amount, subtotal_amount, order_status').in('listing_id', listingIds).gte('created_at', weekStart)
      : { data: [] },
    listingIds.length > 0
      ? supabase.from('orders').select('id, listing_id, seller_net_amount, subtotal_amount, order_status').in('listing_id', listingIds).gte('created_at', monthStart)
      : { data: [] },
    // Views (event_type: view | click | impression)
    listingIds.length > 0
      ? supabase.from('listing_views').select('listing_id, event_type, created_at').in('listing_id', listingIds)
      : { data: [] },
    listingIds.length > 0
      ? supabase.from('listing_views').select('listing_id, event_type').in('listing_id', listingIds).gte('created_at', todayStart)
      : { data: [] },
    listingIds.length > 0
      ? supabase.from('listing_views').select('listing_id, event_type').in('listing_id', listingIds).gte('created_at', weekStart)
      : { data: [] },
    listingIds.length > 0
      ? supabase.from('listing_views').select('listing_id, event_type').in('listing_id', listingIds).gte('created_at', monthStart)
      : { data: [] },
  ])

  function calcRevenue(orders: any[] | null) {
    return orders?.filter(o => o.order_status === 'completed')
      .reduce((s: number, o: any) => s + Number(o.seller_net_amount ?? o.subtotal_amount ?? 0), 0) ?? 0
  }

  function countViews(views: any[] | null) {
    return views?.filter(v => v.event_type === 'view').length ?? 0
  }

  function countClicks(views: any[] | null) {
    return views?.filter(v => v.event_type === 'click').length ?? 0
  }

  const allRev = calcRevenue(allOrders)
  const todayRev = calcRevenue(todayOrders)
  const weekRev = calcRevenue(weekOrders)
  const monthRev = calcRevenue(monthOrders)

  const totalViews = countViews(allViews)
  const totalClicks = countClicks(allViews)
  const liveListings = listings?.filter(l => l.listing_status === 'live').length ?? 0
  const totalOrders = allOrders?.length ?? 0

  // Per-listing stats
  const listingStats = listings?.map(l => {
    const lAllOrders = allOrders?.filter(o => (o as any).listing_id === l.id) ?? []
    const lRev = lAllOrders.filter(o => o.order_status === 'completed')
      .reduce((s, o) => s + Number((o as any).seller_net_amount ?? (o as any).subtotal_amount ?? 0), 0)

    const lViewsAll = allViews?.filter(v => v.listing_id === l.id) ?? []
    const lViewsToday = todayViews?.filter(v => v.listing_id === l.id) ?? []
    const lViewsWeek = weekViews?.filter(v => v.listing_id === l.id) ?? []
    const lViewsMonth = monthViews?.filter(v => v.listing_id === l.id) ?? []

    return {
      ...l,
      orderCount: lAllOrders.length,
      revenue: lRev,
      views: {
        today: lViewsToday.filter(v => v.event_type === 'view').length,
        week: lViewsWeek.filter(v => v.event_type === 'view').length,
        month: lViewsMonth.filter(v => v.event_type === 'view').length,
        all: lViewsAll.filter(v => v.event_type === 'view').length,
      },
      clicks: {
        today: lViewsToday.filter(v => v.event_type === 'click').length,
        week: lViewsWeek.filter(v => v.event_type === 'click').length,
        month: lViewsMonth.filter(v => v.event_type === 'click').length,
        all: lViewsAll.filter(v => v.event_type === 'click').length,
      },
    }
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
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#3ecf68]">Seller Analytics</p>
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
          <p className="text-sm text-slate-500">Total Views</p>
          <p className="mt-2 text-3xl font-bold text-[#3ecf68]">{totalViews}</p>
          <p className="text-xs text-slate-400 mt-1">{totalClicks} order clicks</p>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">This Month</p>
          <p className="mt-2 text-3xl font-bold text-[#3ecf68]">${monthRev.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-1">{monthOrders?.length ?? 0} orders (30d)</p>
        </div>
      </div>

      {/* Views / Orders period breakdown */}
      <section className="grid gap-6 xl:grid-cols-3">
        {[
          { label: 'Today', orders: todayOrders, rev: todayRev, views: todayViews },
          { label: 'Last 7 Days', orders: weekOrders, rev: weekRev, views: weekViews },
          { label: 'Last 30 Days', orders: monthOrders, rev: monthRev, views: monthViews },
        ].map(({ label, orders, rev, views }) => (
          <div key={label} className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="mb-4 text-lg font-semibold text-slate-900">{label}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard label="👁 Views" value={countViews(views)} />
              <StatCard label="🖱 Clicks" value={countClicks(views)} />
              <StatCard label="📦 Orders" value={orders?.length ?? 0} />
              <StatCard label="💰 Revenue" value={`$${rev.toFixed(2)}`} />
            </div>
          </div>
        ))}
      </section>

      {/* Per-listing breakdown with views/clicks/orders */}
      {listingStats.length > 0 && (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-900">Per Gig Analytics</h2>
          <div className="space-y-4">
            {listingStats.map(l => (
              <div key={l.id} className="rounded-2xl border bg-slate-50 p-5">
                {/* Gig title + status */}
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{l.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${l.listing_status === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {l.listing_status}
                      </span>
                      {l.average_rating > 0 && <span className="text-xs text-slate-500">⭐ {Number(l.average_rating).toFixed(1)} ({l.total_reviews})</span>}
                    </div>
                  </div>
                  <a href={`/services/${l.slug}`} target="_blank" className="shrink-0 rounded-xl border px-3 py-1 text-xs font-medium text-slate-600 hover:bg-white">
                    View Gig →
                  </a>
                </div>

                {/* Daily / Weekly / Monthly grid */}
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { period: 'Today', views: l.views.today, clicks: l.clicks.today },
                    { period: 'Last 7 Days', views: l.views.week, clicks: l.clicks.week },
                    { period: 'Last 30 Days', views: l.views.month, clicks: l.clicks.month },
                  ].map(({ period, views, clicks }) => (
                    <div key={period} className="rounded-xl bg-white border p-4">
                      <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">{period}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-lg font-bold text-[#3ecf68]">{views}</p>
                          <p className="text-xs text-slate-500">Views</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-[#3ecf68]">{clicks}</p>
                          <p className="text-xs text-slate-500">Clicks</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* All-time totals */}
                <div className="mt-3 flex gap-6 border-t pt-3 text-center">
                  <div>
                    <p className="text-xl font-bold text-slate-900">{l.views.all}</p>
                    <p className="text-xs text-slate-500">Total Views</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#3ecf68]">{l.clicks.all}</p>
                    <p className="text-xs text-slate-500">Total Clicks</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{l.orderCount}</p>
                    <p className="text-xs text-slate-500">Orders</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-emerald-600">${l.revenue.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">Revenue</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-700">
                      {l.views.all > 0 ? `${((l.orderCount / l.views.all) * 100).toFixed(1)}%` : '—'}
                    </p>
                    <p className="text-xs text-slate-500">Conv. Rate</p>
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
            { icon: '📸', tip: 'Add high-quality images to increase click-through rates.' },
            { icon: '🏷️', tip: 'Use specific, buyer-intent keywords in your title and tags.' },
            { icon: '⚡', tip: 'Respond to order requests quickly — buyers prefer fast sellers.' },
            { icon: '⭐', tip: 'Deliver exceptional work to earn 5-star reviews.' },
            { icon: '💼', tip: 'Offer all three packages (Basic/Standard/Premium) to capture all budgets.' },
            { icon: '📣', tip: 'Share your listing on social media to drive external traffic.' },
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
