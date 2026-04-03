import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { logout } from "@/app/auth/actions"
import NavbarMobile from "@/components/NavbarMobile"

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile: { display_name?: string | null; email?: string | null; username?: string | null; is_seller?: boolean; is_admin?: boolean; avatar_url?: string | null } | null = null
  let unreadCount = 0

  if (user) {
    const { data } = await supabase.from("profiles").select("display_name, email, username, is_seller, is_admin, avatar_url").eq("id", user.id).single()
    profile = data
    const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false)
    unreadCount = count ?? 0
  }

  const isSeller = profile?.is_seller ?? false
  const isAdmin = profile?.is_admin ?? false
  const username = profile?.username ?? null
  const displayName = profile?.display_name ?? (profile?.email ?? user?.email ?? '').split('@')[0]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white shadow-md shadow-blue-500/30">T</div>
          <div className="leading-tight hidden sm:block">
            <span className="block text-base font-bold text-slate-900">TasklyClean</span>
            <span className="block text-[9px] uppercase tracking-[0.2em] text-slate-400">Marketplace</span>
          </div>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/services" className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">Browse</Link>
          <Link href="/categories" className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">Categories</Link>
          {user && !isAdmin && (
            <>
              <Link href="/buyer" className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">My Orders</Link>
              <Link href="/messages" className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">Messages</Link>
              {isSeller && <Link href="/dashboard" className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">Seller Hub</Link>}
            </>
          )}
          {isAdmin && (
            <Link href="/admin" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">Admin Panel</Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <NavbarMobile isSeller={isSeller} isAdmin={isAdmin} isLoggedIn={!!user} />

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              {/* Notifications */}
              <Link
                href={isAdmin ? "/admin" : "/buyer/notifications"}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
              </Link>

              {/* Avatar menu */}
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-bold text-white overflow-hidden shadow-sm">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    displayName[0]?.toUpperCase() ?? 'U'
                  )}
                </div>
                <div className="hidden xl:block">
                  <p className="text-xs font-semibold text-slate-900 leading-none">{displayName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{isAdmin ? 'Admin' : isSeller ? 'Seller' : 'Buyer'}</p>
                </div>
              </div>

              {!isSeller && !isAdmin && (
                <Link href="/start-selling" className="hidden sm:inline-flex items-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                  Sell
                </Link>
              )}

              <form action={logout}>
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  Log Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Sign In
              </Link>
              <Link href="/signup" className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
