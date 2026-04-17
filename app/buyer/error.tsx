'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function BuyerError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border bg-white p-10 shadow-sm text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-500 text-sm mb-6">An error occurred in this section. Please try again.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-2xl bg-[#3ecf68] px-6 py-3 text-sm font-semibold text-white hover:bg-[#28a84e] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/buyer"
            className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
