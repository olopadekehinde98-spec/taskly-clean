'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

const ISSUE_TYPES = [
  'Delivery does not match requirements',
  'Seller not responding',
  'Serious quality issue',
  'Missing files / incomplete delivery',
  'Other serious issue',
]

export default function BuyerDisputePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0])
  const [description, setDescription] = useState('')
  const [requestedOutcome, setRequestedOutcome] = useState('full_refund')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) { setError('Please describe the issue.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: id, issue_type: issueType, description: description.trim(), requested_outcome: requestedOutcome }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      router.push(`/buyer/orders/${id}/dispute/submitted`)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-red-600">Open Dispute</p>
          <h1 className="text-3xl font-bold text-slate-900">Open a Dispute</h1>
          <p className="mt-2 text-sm text-slate-500">Only open a dispute if you were unable to resolve the issue through messaging or revision requests.</p>
        </div>

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Dispute Reason <span className="text-red-500">*</span></label>
              <select
                value={issueType}
                onChange={e => setIssueType(e.target.value)}
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all"
              >
                {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Dispute Details <span className="text-red-500">*</span></label>
              <textarea
                rows={7}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explain clearly what happened, what was expected, and why the issue could not be resolved through revision or messaging."
                required
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all resize-none"
              />
              <p className="mt-1 text-xs text-slate-400">{description.length} characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Requested Outcome</label>
              <select
                value={requestedOutcome}
                onChange={e => setRequestedOutcome(e.target.value)}
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all"
              >
                <option value="full_refund">Full refund</option>
                <option value="partial_refund">Partial refund</option>
                <option value="revision">Revision / redo the work</option>
                <option value="cancellation">Order cancellation</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting…' : 'Submit Dispute'}
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
