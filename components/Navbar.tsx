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
  const displayName = profile?.display_name ?? (profile?.email ?? user?.email ?? '').split('@')[0]

  return (
    <header className="sticky top-0 z-50 bg-[#0d2818]/95 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3ecf68] text-sm font-black text-[#0d2818] shadow-md shadow-[#3ecf68]/30">T</div>
          <div className="leading-tight hidden sm:block">
            <span className="block text-base font-bold text-white" style={{ fontFamily: 'Fraunces, serif' }}>Taskly</span>
            <span className="block text-[9px] uppercase tracking-[0.2em] text-white/40">Marketplace</span>
          </div>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/services" className="rounded-xl px-3 py-2 text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white">Browse</Link>
          <Link href="/categories" className="rounded-xl px-3 py-2 text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white">Categories</Link>
          {user && !isAdmin && (
            <>
              <Link href="/buyer" className="rounded-xl px-3 py-2 text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white">My Orders</Link>
              <Link href="/messages" className="rounded-xl px-3 py-2 text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white">Messages</Link>
              {isSeller && <Link href="/dashboard" className="rounded-xl px-3 py-2 text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white">Seller Hub</Link>}
            </>
          )}
          {isAdmin && (
            <Link href="/admin" className="rounded-xl bg-red-900/40 px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-900/60">Admin Panel</Link>
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
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/65 hover:bg-white/10 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#3ecf68] px-1 text-[10px] font-bold text-[#0d2818]">{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
              </Link>

              {/* Avatar */}
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3ecf68] text-xs font-bold text-[#0d2818] overflow-hidden shadow-sm">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    displayName[0]?.toUpperCase() ?? 'U'
                  )}
                </div>
                <div className="hidden xl:block">
                  <p className="text-xs font-semibold text-white leading-none">{displayName}</p>
                  <p className="text-[10px] text-white/40 mt-0.5 capitalize">{isAdmin ? 'Admin' : isSeller ? 'Seller' : 'Buyer'}</p>
                </div>
              </div>

              {!isSeller && !isAdmin && (
                <Link href="/start-selling" className="hidden sm:inline-flex items-center rounded-xl border border-[#3ecf68]/30 bg-[#3ecf68]/10 px-3 py-2 text-xs font-semibold text-[#3ecf68] hover:bg-[#3ecf68]/20">
                  Sell
                </Link>
              )}

              <form action={logout}>
                <button className="rounded-xl border border-white/15 px-3 py-2 text-xs font-medium text-white/55 hover:bg-white/10 hover:text-white">
                  Log Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-white/65 hover:bg-white/10 hover:text-white">
                Sign In
              </Link>
              <Link href="/signup" className="rounded-xl bg-[#3ecf68] px-4 py-2 text-sm font-semibold text-[#0d2818] shadow-md shadow-[#3ecf68]/25 hover:bg-[#52e07a]">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
