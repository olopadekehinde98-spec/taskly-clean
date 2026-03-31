import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function statusColor(status: string) {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700'
  if (status === 'active' || status === 'in_progress') return 'bg-blue-50 text-blue-700'
  if (status === 'delivered') return 'bg-purple-50 text-purple-700'
  return 'bg-amber-50 text-amber-700'
}

export default async function BuyerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: activeOrders, count: activeCount },
    { data: completedOrders, count: completedCount },
    { data: savedServices, count: savedCount },
    { data: unreadMessages, count: unreadMsgCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('buyer_id', user!.id).in('status', ['active', 'in_progress', 'delivered']),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('buyer_id', user!.id).eq('status', 'completed'),
    supabase.from('saved_listings').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('buyer_id', user!.id).eq('buyer_unread', true),
    supabase.from('orders').select(`
      id, status, amount_usd, created_at,
      listings ( title ),
      profiles!orders_seller_id_fkey ( display_name )
    `).eq('buyer_id', user!.id).order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Active Orders', value: activeCount ?? 0 },
    { label: 'Completed Orders', value: completedCount ?? 0 },
    { label: 'Saved Services', value: savedCount ?? 0 },
    { label: 'Unread Messages', value: unreadMsgCount ?? 0 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Buyer Dashboard</p>
        <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-3xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">{s.label}</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">{s.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
            <Link href="/buyer/orders" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>

          {!recentOrders || recentOrders.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center">
              <p className="text-slate-500 text-sm">No orders yet.</p>
              <Link href="/services" className="mt-3 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm text-white">Browse Services</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{(order.listings as any)?.title ?? 'Service'}</p>
                    <p className="text-sm text-slate-500">{(order.profiles as any)?.display_name ?? 'Seller'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">${Number(order.amount_usd ?? 0).toFixed(2)}</span>
                    <span className={`w-fit rounded-full px-3 py-1 text-sm capitalize ${statusColor(order.status)}`}>{order.status?.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/services" className="flex items-center gap-3 rounded-2xl bg-blue-50 p-4 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors">
              <span className="text-lg">🔍</span> Browse Services
            </Link>
            <Link href="/buyer/orders" className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              <span className="text-lg">📦</span> My Orders
            </Link>
            <Link href="/buyer/messages" className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              <span className="text-lg">💬</span> Messages
            </Link>
            <Link href="/buyer/saved" className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
              <span className="text-lg">❤️</span> Saved Services
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
