import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_STYLES: Record<string, string> = {
  pending_requirements: 'bg-amber-50 text-amber-700',
  active:               'bg-blue-50 text-blue-700',
  delivered:            'bg-indigo-50 text-indigo-700',
  revision_requested:   'bg-orange-50 text-orange-700',
  completed:            'bg-emerald-50 text-emerald-700',
  cancelled:            'bg-slate-100 text-slate-600',
  disputed:             'bg-red-50 text-red-700',
}

export default async function SellerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, order_status, subtotal_amount, seller_net_amount, created_at,
      buyer:profiles!orders_buyer_id_fkey ( display_name, email ),
      listings ( title, slug ),
      listing_packages ( name, tier )
    `)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-12 text-center">
          <div className="text-4xl mb-3">📦</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h2>
          <p className="text-slate-500 text-sm">Orders from buyers will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b text-xs text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Earnings</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => {
                const buyer = order.buyer
                const listing = order.listings
                const pkg = order.listing_packages
                const statusClass = STATUS_STYLES[order.order_status] ?? 'bg-slate-100 text-slate-600'
                return (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-mono text-xs text-slate-500">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-900 max-w-[180px]">
                      <span className="line-clamp-1">{listing?.title ?? 'Service'}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {buyer?.display_name ?? buyer?.email ?? 'Buyer'}
                    </td>
                    <td className="px-4 py-4 text-slate-600 capitalize">
                      {pkg?.name ?? pkg?.tier ?? '—'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass}`}>
                        {order.order_status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-emerald-700">
                      ${Number(order.seller_net_amount ?? order.subtotal_amount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/dashboard/orders/${order.id}`} className="font-medium text-blue-600 hover:underline text-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
