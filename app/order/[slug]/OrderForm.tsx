'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Package = { id: string; tier: string; name: string; price_usd: number; delivery_days: number; description: string; revisions: number }

export default function OrderForm({
  listing,
  packages,
  selectedTier,
  userId,
}: {
  listing: any
  packages: Package[]
  selectedTier: string
  userId: string
}) {
  const router = useRouter()
  const [tier, setTier] = useState(selectedTier)
  const [requirements, setRequirements] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pkg = packages.find(p => p.tier === tier) ?? packages[0]
  if (!pkg) return <p className="text-slate-500">No packages found for this listing.</p>

  const subtotal = Number(pkg.price_usd)
  const buyerFee = Math.round(subtotal * 0.05 * 100) / 100
  const total = subtotal + buyerFee

  const seller = listing.profiles
  const sellerName = seller?.display_name || 'Seller'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!requirements.trim()) { setError('Please describe your requirements before placing the order.'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          package_id: pkg.id,
          requirements_text: requirements.trim(),
        }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      router.push(`/order/confirmation?order_id=${data.order_id}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const tierColors: Record<string, string> = {
    basic: 'border-slate-200',
    standard: 'border-blue-400 ring-2 ring-blue-100',
    premium: 'border-indigo-400 ring-2 ring-indigo-100',
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Left: form */}
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        {/* Listing header */}
        <div className="mb-6 flex items-start gap-4">
          {listing.cover_image_url ? (
            <img src={listing.cover_image_url} alt={listing.title} className="h-16 w-16 rounded-2xl object-cover shrink-0" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl shrink-0">
              {(listing.categories as any)?.icon ?? '💼'}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-900">{listing.title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              by <span className="font-medium text-slate-700">{sellerName}</span>
              {seller?.response_time && <span className="ml-2 text-slate-400">· Responds in {seller.response_time}</span>}
            </p>
          </div>
        </div>

        {/* Package selector */}
        {packages.length > 1 && (
          <div className="mb-6">
            <p className="mb-3 text-sm font-semibold text-slate-700">Select Package</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {packages.map(p => (
                <button
                  key={p.tier}
                  type="button"
                  onClick={() => setTier(p.tier)}
                  className={`rounded-2xl border p-4 text-left transition-all ${tier === p.tier ? tierColors[p.tier] + ' bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{p.tier}</p>
                  <p className="mt-1 font-semibold text-slate-900">{p.name}</p>
                  <p className="mt-1 text-xl font-bold text-blue-600">${Number(p.price_usd).toFixed(2)}</p>
                  <p className="mt-1 text-xs text-slate-500">{p.delivery_days}-day delivery</p>
                  {p.revisions != null && (
                    <p className="text-xs text-slate-500">{p.revisions === -1 ? 'Unlimited' : p.revisions} revision{p.revisions !== 1 ? 's' : ''}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected package details */}
        <div className="mb-6 rounded-2xl bg-slate-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{pkg.tier}</p>
              <p className="mt-1 font-semibold text-slate-900">{pkg.name}</p>
              {pkg.description && <p className="mt-1 text-sm text-slate-600">{pkg.description}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-slate-900">${subtotal.toFixed(2)}</p>
              <p className="text-sm text-slate-500">{pkg.delivery_days} days</p>
            </div>
          </div>
        </div>

        {/* Requirements form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Requirements / Instructions <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={7}
              value={requirements}
              onChange={e => setRequirements(e.target.value)}
              required
              placeholder="Describe exactly what you need. Include any specific details, examples, or files the seller should know about."
              className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
            <p className="mt-1 text-xs text-slate-400">{requirements.length} characters · Be specific to get the best result</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}`}
            </button>
            <a
              href={`/services/${listing.slug}`}
              className="rounded-2xl border px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back to Gig
            </a>
          </div>
        </form>
      </section>

      {/* Right: order summary */}
      <aside className="h-fit rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-slate-900">Order Summary</h2>

        <div className="space-y-4 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Package</span>
            <span className="font-medium capitalize text-slate-900">{pkg.tier} — {pkg.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span className="font-medium text-slate-900">{pkg.delivery_days} days</span>
          </div>
          {pkg.revisions != null && (
            <div className="flex justify-between">
              <span>Revisions</span>
              <span className="font-medium text-slate-900">{pkg.revisions === -1 ? 'Unlimited' : pkg.revisions}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Seller</span>
            <span className="font-medium text-slate-900">{sellerName}</span>
          </div>
        </div>

        <div className="mt-5 space-y-3 border-t pt-5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-slate-600">Buyer fee</span>
              <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">5%</span>
            </div>
            <span className="font-medium">${buyerFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-3 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
          <p className="text-xs font-semibold text-emerald-800 mb-1">🔒 Secure Escrow</p>
          <p className="text-xs text-emerald-700 leading-5">
            Your payment is held safely and only released to the seller after you accept the delivery.
          </p>
        </div>

        <div className="mt-3 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500 leading-5">
            <span className="font-semibold text-slate-700">💡 Platform fee:</span> The 5% buyer fee helps maintain the platform and secure your payment.
          </p>
        </div>
      </aside>
    </div>
  )
}
