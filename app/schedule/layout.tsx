import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { logout } from '@/app/auth/actions'

export default async function ScheduleLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_seller, is_admin, email')
    .eq('id', user.id)
    .single()

  if (!profile?.is_seller && !profile?.is_admin) {
    redirect('/start-selling')
  }

  return (
    <main className="min-h-screen bg-[#fdfaf4]">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dae8df] bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="mb-1 text-xl font-bold text-[#0d2818]" style={{ fontFamily: 'Fraunces, serif' }}>Listing Studio</h2>
            <p className="text-xs text-[#7a9a86]">{user.email}</p>
          </div>
          <p className="mb-6 text-sm text-[#7a9a86]">Create and manage your listings with AI assistance.</p>
          <nav className="space-y-1">
            <Link href="/schedule" className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#4a6958] hover:bg-[#edfbf2] hover:text-[#0d2818]">
              My Listings
            </Link>
            <Link href="/schedule/new" className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#3ecf68] bg-[#edfbf2] hover:bg-[#3ecf68]/20">
              + Create New Listing
            </Link>
            <Link href="/dashboard" className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#4a6958] hover:bg-[#edfbf2] hover:text-[#0d2818]">
              Seller Dashboard
            </Link>
            <Link href="/dashboard/orders" className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#4a6958] hover:bg-[#edfbf2] hover:text-[#0d2818]">
              Orders
            </Link>
            <Link href="/dashboard/messages" className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#4a6958] hover:bg-[#edfbf2] hover:text-[#0d2818]">
              Messages
            </Link>
          </nav>
          <form action={logout} className="mt-6">
            <button className="w-full rounded-2xl border border-[#dae8df] px-4 py-3 text-sm font-medium text-[#4a6958] hover:bg-[#edfbf2]">
              Log Out
            </button>
          </form>
        </aside>
        <section>{children}</section>
      </div>
    </main>
  )
}
