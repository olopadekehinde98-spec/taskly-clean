import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminAIChat from '@/components/AdminAIChat'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalSellers },
    { count: liveListings },
    { count: pendingListings },
    { count: openDisputes },
    { count: totalOrders },
    { data: recentListings },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_seller', true),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('listing_status', 'live'),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
    supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('id, title, listing_status, moderation_status, created_at, profiles(display_name)').order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('id, display_name, email, is_seller, is_admin, account_status, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    { label: 'Total Users', value: totalUsers ?? 0, color: 'text-slate-900', href: '/admin/users' },
    { label: 'Active Sellers', value: totalSellers ?? 0, color: 'text-blue-600', href: '/admin/users' },
    { label: 'Live Listings', value: liveListings ?? 0, color: 'text-emerald-600', href: '/admin/services' },
    { label: 'Pending Review', value: pendingListings ?? 0, color: 'text-amber-600', href: '/admin/moderation' },
    { label: 'Open Disputes', value: openDisputes ?? 0, color: 'text-red-600', href: '/admin/disputes' },
    { label: 'Total Orders', value: totalOrders ?? 0, color: 'text-indigo-600', href: '/admin' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-red-600">Admin Panel</p>
        <h1 className="text-3xl font-bold text-slate-900">Platform Overview</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-slate-500">{s.label}</p>
            <h2 className={`mt-2 text-3xl font-bold ${s.color}`}>{s.value}</h2>
          </Link>
        ))}
      </div>

      {(pendingListings ?? 0) > 0 && (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-amber-800">{pendingListings} listing{(pendingListings ?? 0) !== 1 ? 's' : ''} awaiting moderation</p>
              <p className="text-sm text-amber-700">Review and approve or deny pending listings.</p>
            </div>
          </div>
          <Link href="/admin/moderation" className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
            Review Now
          </Link>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-2">
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Listings</h2>
            <Link href="/admin/services" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {!recentListings || recentListings.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No listings yet</p>
          ) : (
            <div className="space-y-3">
              {recentListings.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{l.title}</p>
                    <p className="text-xs text-slate-500">{(l.profiles as any)?.display_name ?? 'Unknown seller'}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${l.moderation_status === 'pending' ? 'bg-amber-100 text-amber-700' : l.listing_status === 'live' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {l.moderation_status === 'pending' ? 'Pending' : l.listing_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Users</h2>
            <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          {!recentUsers || recentUsers.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No users yet</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{u.display_name ?? u.email ?? 'User'}</p>
                    <p className="text-xs text-slate-500">{u.is_admin ? 'Admin' : u.is_seller ? 'Seller' : 'Buyer'}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${u.account_status === 'active' || !u.account_status ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {u.account_status ?? 'active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <AdminAIChat />

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Admin Priorities (from Platform Blueprint)</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: '🛡️', title: 'Moderation', desc: 'Review pending listings before they go live', href: '/admin/moderation' },
            { icon: '⚖️', title: 'Disputes', desc: 'Resolve open buyer-seller disputes', href: '/admin/disputes' },
            { icon: '🚨', title: 'Violations', desc: 'Review rule violators and take action', href: '/admin/violations' },
            { icon: '👥', title: 'Users', desc: 'Manage accounts, bans, and verifications', href: '/admin/users' },
          ].map(p => (
            <Link key={p.title} href={p.href} className="rounded-2xl border p-4 hover:bg-slate-50 transition-colors">
              <div className="text-2xl mb-2">{p.icon}</div>
              <p className="font-semibold text-slate-900 text-sm">{p.title}</p>
              <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
