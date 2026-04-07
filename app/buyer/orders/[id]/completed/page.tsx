'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function BuyerOrderCompletedPage() {
  const { id } = useParams<{ id: string }>()
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/orders/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: id }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setStatus('error') }
        else setStatus('done')
      })
      .catch(() => { setError('Something went wrong.'); setStatus('error') })
  }, [id])

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 animate-pulse">Completing order…</p>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-xl rounded-3xl border bg-white p-10 text-center shadow-sm">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Link href={`/buyer/orders/${id}`} className="rounded-2xl border px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Back to Order
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl">
          ✅
        </div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">Order Completed</p>
        <h1 className="mb-4 text-4xl font-bold text-slate-900">Delivery Accepted!</h1>
        <p className="mx-auto mb-8 max-w-md text-slate-600">
          Payment has been released to the seller. Thank you for using Taskly!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href={`/buyer/orders/${id}/review`} className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors">
            Leave a Review →
          </Link>
          <Link href="/buyer/orders" className="rounded-2xl border px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Back to Orders
          </Link>
        </div>
      </div>
    </main>
  )
}
