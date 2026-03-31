import Link from 'next/link'

const orders = [
  {
    id: 'TK-1024',
    service: 'Kindle Ebook Formatting',
    buyer: 'John Doe',
    status: 'In Progress',
    amount: '$50',
  },
  {
    id: 'TK-1025',
    service: 'Amazon Appeal Letter',
    buyer: 'Sarah Lee',
    status: 'Completed',
    amount: '$45',
  },
  {
    id: 'TK-1026',
    service: 'Ebook Editing Service',
    buyer: 'Michael Ray',
    status: 'Pending',
    amount: '$30',
  },
]

function getStatusClasses(status: string) {
  if (status === 'Completed') return 'bg-emerald-50 text-emerald-700'
  if (status === 'In Progress') return 'bg-blue-50 text-blue-700'
  return 'bg-amber-50 text-amber-700'
}

export default function OrdersPage() {
  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Orders</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b text-sm text-slate-500">
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b last:border-0">
                <td className="px-4 py-4 font-medium text-slate-900">{order.id}</td>
                <td className="px-4 py-4 text-slate-700">{order.service}</td>
                <td className="px-4 py-4 text-slate-700">{order.buyer}</td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${getStatusClasses(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-4 font-semibold text-slate-900">{order.amount}</td>
                <td className="px-4 py-4">
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="font-medium text-blue-600"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}