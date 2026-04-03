import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_STYLES: Record<string, string> = {
  pending_requirements: 'bg-amber-50 text-amber-700',
  active:               'bg-blue-50 text-blue-700',
  delivered:            'bg-purple-50 text-purple-700',
  revision_requested:   'bg-orange-50 text-orange-700',
  completed:            'bg-emerald-50 text-emerald-700',
  cancelled:            'bg-slate-100 text-slate-600',
  disputed:             'bg-red-50 text-red-700',
}

export default async function BuyerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, order_status, subtotal_amount, created_at,
      listings ( title, slug ),
      seller:profiles!orders_seller_id_fkey ( display_name, username ),
      listing_packages ( name, tier )
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
        <Link href="/services" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Browse Services
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-12 text-center">
          <div className="text-4xl mb-3">📦</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No orders yet</h2>
          <p className="text-slate-500 text-sm mb-6">Find a service and place your first order.</p>
          <Link href="/services" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b text-xs text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => {
                const pkg = order.listing_packages
                const statusClass = STATUS_STYLES[order.order_status] ?? 'bg-amber-50 text-amber-700'
                return (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-mono text-xs text-slate-500">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-900 max-w-[200px]">
                      <span className="line-clamp-1">{order.listings?.title ?? 'Service'}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {order.seller?.display_name ?? 'Seller'}
                    </td>
                    <td className="px-4 py-4 text-slate-600 capitalize">
                      {pkg?.name ?? pkg?.tier ?? '—'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClass}`}>
                        {order.order_status?.replace(/_/g, ' ') ?? 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      ${Number(order.subtotal_amount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/buyer/orders/${order.id}`} className="font-medium text-blue-600 hover:underline text-sm">
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
