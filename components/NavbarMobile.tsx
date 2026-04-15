'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  isSeller: boolean
  isAdmin: boolean
  isLoggedIn: boolean
}

export default function NavbarMobile({ isSeller, isAdmin, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Hamburger button */}
      <button
        className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl text-white/65 hover:bg-white/10"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <nav
            className="absolute left-0 right-0 top-[57px] bg-[#163522] border-b border-white/10 shadow-xl px-4 py-3 space-y-1"
            onClick={e => e.stopPropagation()}
          >
            <Link href="/services" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
              Browse Services
            </Link>
            <Link href="/categories" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
              Categories
            </Link>

            {isLoggedIn && !isAdmin && (
              <>
                <Link href="/buyer" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                  My Orders
                </Link>
                <Link href="/messages" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                  Messages
                </Link>
                <Link href="/buyer/notifications" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                  Notifications
                </Link>
                {isSeller && (
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-[#3ecf68] bg-[#3ecf68]/10 hover:bg-[#3ecf68]/20">
                    Seller Hub
                  </Link>
                )}
                {!isSeller && (
                  <Link href="/start-selling" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-[#3ecf68] bg-[#3ecf68]/10 hover:bg-[#3ecf68]/20">
                    Start Selling
                  </Link>
                )}
              </>
            )}

            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-red-400 bg-red-900/30 hover:bg-red-900/50">
                Admin Panel
              </Link>
            )}

            {!isLoggedIn && (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                  Sign In
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-bold text-[#0d2818] bg-[#3ecf68] hover:bg-[#52e07a] text-center">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  )
}
