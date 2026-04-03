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
      {/* Hamburger button — only on small screens */}
      <button
        className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
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
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/20" />
          <nav
            className="absolute left-0 right-0 top-[57px] bg-white border-b shadow-lg px-4 py-3 space-y-1"
            onClick={e => e.stopPropagation()}
          >
            <Link href="/services" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Browse Services
            </Link>
            <Link href="/categories" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Categories
            </Link>

            {isLoggedIn && !isAdmin && (
              <>
                <Link href="/buyer" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  My Orders
                </Link>
                <Link href="/messages" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Messages
                </Link>
                <Link href="/buyer/notifications" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Notifications
                </Link>
                {isSeller && (
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100">
                    Seller Hub
                  </Link>
                )}
                {!isSeller && (
                  <Link href="/start-selling" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100">
                    Start Selling
                  </Link>
                )}
              </>
            )}

            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100">
                Admin Panel
              </Link>
            )}

            {!isLoggedIn && (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  Sign In
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 text-center">
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
