'use client'

import { useState } from 'react'

export default function SaveListingButton({ listingId }: { listingId: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      const method = saved ? 'DELETE' : 'POST'
      const res = await fetch('/api/listings/save', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId }),
      })
      if (res.ok) setSaved(!saved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`mt-3 block w-full rounded-2xl border px-5 py-3 text-center font-medium transition-colors ${
        saved
          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {loading ? '...' : saved ? '❤️ Saved' : '🤍 Save Service'}
    </button>
  )
}
