import Link from 'next/link'

const notifications = [
  {
    id: 'seller-notify-1',
    type: 'New Order',
    title: 'You received a new order',
    message: 'John Doe placed a new order for Kindle Ebook Formatting.',
    time: '8 min ago',
    unread: true,
    href: '/dashboard/orders/TK-1024',
  },
  {
    id: 'seller-notify-2',
    type: 'New Message',
    title: 'Buyer sent a message',
    message: 'John Doe asked for an update on chapter spacing and TOC.',
    time: '22 min ago',
    unread: true,
    href: '/dashboard/messages/seller-msg-2001',
  },
  {
    id: 'seller-notify-3',
    type: 'Order Completed',
    title: 'A buyer completed an order',
    message: 'Sarah Lee marked order TK-1025 as complete.',
    time: '1 hour ago',
    unread: false,
    href: '/dashboard/orders/TK-1025',
  },
  {
    id: 'seller-notify-4',
    type: 'Review Received',
    title: 'You received a new review',
    message: 'A buyer left a 5-star review on your recent delivery.',
    time: 'Yesterday',
    unread: false,
    href: '/seller/tasklystudio',
  },
]

function getTypeClasses(type: string) {
  if (type === 'New Order') return 'bg-blue-50 text-blue-700'
  if (type === 'New Message') return 'bg-indigo-50 text-indigo-700'
  if (type === 'Order Completed') return 'bg-emerald-50 text-emerald-700'
  return 'bg-amber-50 text-amber-700'
}

export default function SellerNotificationsPage() {
  const unreadCount = notifications.filter((item) => item.unread).length

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          Seller Notifications
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Notifications</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {notifications.length}
          </h2>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Unread</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {unreadCount}
          </h2>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Latest Activity</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            New Order
          </h2>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Recent Notifications</h2>

        <div className="space-y-4">
          {notifications.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`block rounded-2xl border p-5 transition hover:shadow-sm ${
                item.unread ? 'bg-blue-50/40 border-blue-100' : 'bg-slate-50'
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getTypeClasses(
                    item.type
                  )}`}
                >
                  {item.type}
                </span>

                <span className="text-sm text-slate-500">{item.time}</span>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                {item.title}
              </h3>

              <p className="text-sm leading-6 text-slate-600">{item.message}</p>

              {item.unread && (
                <div className="mt-4 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                  Unread
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}