import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_admin, email, display_name').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/buyer')

  // Pending counts for badges
  const [{ count: pendingMod }, { count: openDisputes }] = await Promise.all([
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
    supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
  ])

  const nav = [
    { href: '/admin', label: 'Overview', icon: '📊' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/moderation', label: 'Moderation Queue', icon: '🔍', badge: pendingMod },
    { href: '/admin/services', label: 'All Services', icon: '💼' },
    { href: '/admin/disputes', label: 'Disputes', icon: '⚖️', badge: openDisputes },
    { href: '/admin/violations', label: 'Rule Violators', icon: '🚨' },
    { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  ]

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-3xl border bg-white p-6 shadow-sm">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-xs font-bold text-white">A</span>
              <h2 className="text-xl font-bold text-slate-900">Admin Panel</h2>
            </div>
            <p className="text-xs text-slate-500 truncate">{profile.email || user.email}</p>
          </div>
          <nav className="space-y-1">
            {nav.map(n => (
              <Link key={n.href} href={n.href} className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                <span className="flex items-center gap-2.5">
                  <span>{n.icon}</span>
                  <span>{n.label}</span>
                </span>
                {(n.badge ?? 0) > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">{n.badge}</span>
                )}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t pt-4">
            <Link href="/" className="flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50">
              <span>🏠</span><span>Back to Site</span>
            </Link>
          </div>
          <form action={logout} className="mt-2">
            <button className="w-full rounded-2xl border px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">Log Out</button>
          </form>
        </aside>
        <section>{children}</section>
      </div>
    </main>
  )
}
