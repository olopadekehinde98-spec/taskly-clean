import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import AssistLoop from '@/components/AssistLoop'

export default async function BuyerLayout({
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

  const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()

  return (
    <main className="min-h-screen bg-[#fdfaf4]">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-3xl border border-[#dae8df] bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="mb-1 text-xl font-bold text-[#0d2818]" style={{ fontFamily: 'Fraunces, serif' }}>
              Buyer Dashboard
            </h2>
            <p className="text-xs text-[#7a9a86]">{user.email}</p>
          </div>

          <p className="mb-6 text-sm text-[#7a9a86]">
            Manage orders, saved services, and conversations.
          </p>

          <nav className="space-y-1">
            <Link href="/buyer" className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#4a6958] hover:bg-[#edfbf2] hover:text-[#0d2818]">
              Overview
            </Link>
            <Link href="/buyer/orders" className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#4a6958] hover:bg-[#edfbf2] hover:text-[#0d2818]">
              My Orders
            </Link>
            <Link href="/buyer/messages" className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#4a6958] hover:bg-[#edfbf2] hover:text-[#0d2818]">
              Messages
            </Link>
            <Link href="/buyer/saved" className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#4a6958] hover:bg-[#edfbf2] hover:text-[#0d2818]">
              Saved Services
            </Link>
            <Link href="/buyer/notifications" className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#4a6958] hover:bg-[#edfbf2] hover:text-[#0d2818]">
              Notifications
            </Link>
            <Link href="/buyer/support" className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#4a6958] hover:bg-[#edfbf2] hover:text-[#0d2818]">
              Support Tickets
            </Link>
            <Link href="/buyer/settings" className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#4a6958] hover:bg-[#edfbf2] hover:text-[#0d2818]">
              Account Settings
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
      <AssistLoop context="Buyer Dashboard" userName={profile?.display_name || user.email?.split('@')[0]} role="buyer" />
    </main>
  )
}