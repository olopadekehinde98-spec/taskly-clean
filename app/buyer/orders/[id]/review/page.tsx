'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function BuyerReviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Please select a star rating.'); return }
    if (!body.trim()) { setError('Please write a review.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: id, rating, title: title.trim() || null, body: body.trim() }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      router.push(`/buyer/orders/${id}/review/submitted`)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const displayRating = hovered || rating

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#3ecf68]">Leave a Review</p>
          <h1 className="text-3xl font-bold text-slate-900">How was your experience?</h1>
        </div>

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="mb-3 block text-sm font-medium text-slate-700">Overall Rating <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    <span className={star <= displayRating ? 'text-amber-400' : 'text-slate-200'}>★</span>
                  </button>
                ))}
              </div>
              {displayRating > 0 && (
                <p className="mt-2 text-sm text-slate-500">
                  {displayRating === 1 && 'Poor'}
                  {displayRating === 2 && 'Fair'}
                  {displayRating === 3 && 'Good'}
                  {displayRating === 4 && 'Very Good'}
                  {displayRating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Review Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Summarize your experience (optional)"
                maxLength={100}
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-[#3ecf68] focus:ring-2 focus:ring-[#3ecf68]/20 transition-all"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Written Review <span className="text-red-500">*</span></label>
              <textarea
                rows={6}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Share your experience with this seller and the quality of their work."
                required
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-[#3ecf68] focus:ring-2 focus:ring-[#3ecf68]/20 transition-all resize-none"
              />
              <p className="mt-1 text-xs text-slate-400">{body.length} characters</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-[#3ecf68] px-6 py-3 font-medium text-white hover:bg-[#28a84e] transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting…' : 'Submit Review'}
              </button>
              <Link href={`/buyer/orders/${id}`} className="rounded-2xl border px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Skip
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
