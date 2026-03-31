import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { logout } from "@/app/auth/actions"

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile: { email?: string | null; username?: string | null; is_seller?: boolean; is_admin?: boolean } | null = null
  let unreadCount = 0

  if (user) {
    const { data } = await supabase.from("profiles").select("email, username, is_seller, is_admin").eq("id", user.id).single()
    profile = data
    const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false)
    unreadCount = count ?? 0
  }

  const username = profile?.username ?? null
  const isSeller = profile?.is_seller ?? false
  const isAdmin = profile?.is_admin ?? false

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-bold text-white shadow-sm">T</div>
          <div className="leading-tight">
            <span className="block text-lg font-bold text-slate-900">TasklyClean</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-500">Marketplace</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-700 lg:flex">
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/categories">Categories</Link>
          {!user && <><Link href="/login">Sign In</Link><Link href="/signup" className="rounded-xl bg-blue-600 px-4 py-2 text-white">Join</Link></>}
          {user && !isAdmin && (
            <>
              <Link href="/buyer">Buying</Link>
              <Link href="/messages">Messages</Link>
              {!isSeller && <Link href="/start-selling">Become a Seller</Link>}
              {isSeller && <Link href="/dashboard">Selling</Link>}
              {isSeller && <Link href="/schedule">Listings</Link>}
              {isSeller && username && <Link href={`/seller/${username}`}>My Profile</Link>}
            </>
          )}
          {user && isAdmin && <Link href="/admin">Admin Panel</Link>}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href={isAdmin ? "/admin" : "/buyer/notifications"} className="relative flex h-11 w-11 items-center justify-center rounded-2xl border text-slate-700">
                <span className="text-lg">🔔</span>
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
              </Link>
              <form action={logout}><button className="rounded-xl border px-4 py-2 text-sm text-slate-700">Log Out</button></form>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="rounded-xl border px-4 py-2 text-sm text-slate-700">Sign In</Link>
              <Link href="/signup" className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white">Join</Link>
            </div>
          )}
        </div>
      </div>
      {user && <div className="border-t bg-slate-50 px-4 py-2 text-xs text-slate-500">{profile?.email ?? user.email}{isAdmin ? " • admin" : isSeller ? " • seller" : " • buyer"}</div>}
    </header>
  )
}
