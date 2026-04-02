'use client'

import { useState } from 'react'

type Props = {
  listingId: string
  packageIndex: number
  projectTitle: string
  requirements: string
  totalDisplay: string
}

export default function StripeCheckoutButton({ listingId, packageIndex, projectTitle, requirements, totalDisplay }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCheckout() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, packageIndex, projectTitle, requirements }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Checkout failed')
        return
      }
      window.location.href = data.url
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Redirecting to Stripe...' : `Pay ${totalDisplay} — Secure Checkout`}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-center text-xs text-slate-400">
        Powered by Stripe · 256-bit SSL · Payment held in escrow
      </p>
    </div>
  )
}
