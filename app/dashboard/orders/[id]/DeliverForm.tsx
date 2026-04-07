'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeliverForm({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, delivery_note: note.trim() }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      router.push(`/dashboard/orders/${orderId}/delivered`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Delivery Message</label>
        <textarea
          name="delivery_note"
          rows={5}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Describe what you've delivered and any instructions for the buyer..."
          className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
        />
      </div>
      <p className="text-xs text-slate-400">File upload coming soon. For now, include links or instructions in your message.</p>
      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Submit Delivery →'}
      </button>
    </form>
  )
}
