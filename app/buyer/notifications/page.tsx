import Link from 'next/link'

const notifications = [
  {
    id: 'buyer-notify-1',
    type: 'Delivery Submitted',
    title: 'Your seller submitted a delivery',
    message: 'Taskly Studio submitted the delivery for order BY-2001.',
    time: '10 min ago',
    unread: true,
    href: '/buyer/orders/BY-2001/delivered',
  },
  {
    id: 'buyer-notify-2',
    type: 'New Message',
    title: 'You received a new message',
    message: 'Taskly Studio sent you a message about your ebook formatting project.',
    time: '35 min ago',
    unread: true,
    href: '/buyer/messages/msg-1001',
  },
  {
    id: 'buyer-notify-3',
    type: 'Order Completed',
    title: 'Order marked complete',
    message: 'Your order BY-2002 has been marked complete and is ready for review.',
    time: '2 hours ago',
    unread: false,
    href: '/buyer/orders/BY-2002/completed',
  },
  {
    id: 'buyer-notify-4',
    type: 'Review Reminder',
    title: 'Leave a review',
    message: 'Your recent order is complete. Leave a review to help future buyers.',
    time: 'Yesterday',
    unread: false,
    href: '/buyer/orders/BY-2002/review',
  },
]

function getTypeClasses(type: string) {
  if (type === 'Delivery Submitted') return 'bg-blue-50 text-blue-700'
  if (type === 'New Message') return 'bg-indigo-50 text-indigo-700'
  if (type === 'Order Completed') return 'bg-emerald-50 text-emerald-700'
  return 'bg-amber-50 text-amber-700'
}

export default function BuyerNotificationsPage() {
  const unreadCount = notifications.filter((item) => item.unread).length

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          Buyer Notifications
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
            Delivery Update
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