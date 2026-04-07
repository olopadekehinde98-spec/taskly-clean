'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function BuyerRevisionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [revisionTitle, setRevisionTitle] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!details.trim()) { setError('Please describe what needs to be revised.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: id, revision_title: revisionTitle.trim(), revision_details: details.trim() }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      router.push(`/buyer/orders/${id}/revision/submitted`)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Revision Request</p>
          <h1 className="text-3xl font-bold text-slate-900">Request a Revision</h1>
        </div>

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Revision Title</label>
              <input
                type="text"
                value={revisionTitle}
                onChange={e => setRevisionTitle(e.target.value)}
                placeholder="What needs to be changed? (optional)"
                maxLength={100}
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Revision Details <span className="text-red-500">*</span></label>
              <textarea
                rows={7}
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Clearly explain what should be revised and what part of the delivery does not match your requirements."
                required
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
              <p className="mt-1 text-xs text-slate-400">{details.length} characters</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting…' : 'Submit Revision Request'}
              </button>
              <Link href={`/buyer/orders/${id}`} className="rounded-2xl border px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Back
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
