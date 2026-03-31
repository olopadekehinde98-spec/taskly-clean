import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function statusColor(status: string) {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700'
  if (status === 'active' || status === 'in_progress') return 'bg-blue-50 text-blue-700'
  if (status === 'delivered') return 'bg-purple-50 text-purple-700'
  if (status === 'disputed') return 'bg-red-50 text-red-700'
  return 'bg-amber-50 text-amber-700'
}

export default async function BuyerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id, status, amount_usd, created_at, package_tier,
      listings ( title, slug ),
      profiles!orders_seller_id_fkey ( display_name, username )
    `)
    .eq('buyer_id', user!.id)
    .order('created_at', { ascending: false })

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
              <tr className="border-b text-sm text-slate-500">
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
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 font-mono text-xs text-slate-500">
                    {order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-900 max-w-[200px]">
                    <span className="line-clamp-1">{order.listings?.title ?? 'Service'}</span>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {order.profiles?.display_name ?? 'Seller'}
                  </td>
                  <td className="px-4 py-4 text-slate-600 capitalize">
                    {order.package_tier ?? 'basic'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor(order.status)}`}>
                      {order.status?.replace('_', ' ') ?? 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    ${Number(order.amount_usd ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/buyer/orders/${order.id}`} className="font-medium text-blue-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
