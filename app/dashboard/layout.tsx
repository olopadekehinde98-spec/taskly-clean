import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-3xl border bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="mb-1 text-xl font-bold text-slate-900">
              Seller Dashboard
            </h2>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>

          <p className="mb-6 text-sm text-slate-500">
            Manage services, orders, analytics, and ranking.
          </p>

          <nav className="space-y-2">
            <Link href="/dashboard" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Overview
            </Link>
            <Link href="/dashboard/orders" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Orders
            </Link>
            <Link href="/dashboard/messages" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Messages
            </Link>
            <Link href="/dashboard/services" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              My Services
            </Link>
            <Link href="/dashboard/analytics" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Analytics
            </Link>
            <Link href="/dashboard/notifications" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Notifications
            </Link>
            <Link href="/dashboard/profile" className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Edit Profile
            </Link>
          </nav>

          <form action={logout} className="mt-6">
            <button className="w-full rounded-2xl border px-4 py-3 text-sm font-medium text-slate-700">
              Log Out
            </button>
          </form>
        </aside>

        <section>{children}</section>
      </div>
    </main>
  )
}