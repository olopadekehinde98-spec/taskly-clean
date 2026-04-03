import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BuyerNotificationsClient from '@/components/BuyerNotificationsClient'

export const metadata = { title: 'Notifications — Seller Dashboard' }

export default async function SellerNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Map DB columns to component-expected names
  const items = (notifications ?? []).map(n => ({
    ...n,
    read: n.is_read,
    message: n.body ?? '',
    href: n.link ?? undefined,
  }))
  const unreadCount = items.filter(n => !n.read).length

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
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{items.length}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Unread</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{unreadCount}</h2>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Latest Activity</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            {items.length > 0 ? (items[0].type ?? 'Notification') : 'None'}
          </h2>
        </div>
      </div>

      <BuyerNotificationsClient notifications={items} userId={user.id} />
    </div>
  )
}
