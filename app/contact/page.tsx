'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [ticketNum, setTicketNum] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) { setError('Please fill in all required fields.'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: subject.trim(),
          conversation: [
            { role: 'user', text: message.trim() },
          ],
          contact_name: name.trim(),
          contact_email: email.trim(),
        }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setTicketNum(data.ticket_number)
      setSubmitted(true)
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full rounded-3xl border bg-white p-10 shadow-sm text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Ticket Submitted!</h1>
          <p className="text-slate-600 mb-4">Your support ticket has been created. Our team will respond shortly.</p>
          {ticketNum && (
            <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3 mb-6">
              <p className="text-xs text-slate-500">Ticket Number</p>
              <p className="font-mono font-bold text-blue-700 text-lg">{ticketNum}</p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Link href="/buyer/support" className="rounded-2xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 text-center">View My Tickets</Link>
            <Link href="/" className="rounded-2xl border px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 text-center">Back to Home</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Support</p>
          <h1 className="text-4xl font-bold text-slate-900">Contact Us</h1>
          <p className="mt-3 text-slate-500">Fill in the form below and our team will get back to you as soon as possible.</p>
        </div>

        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Subject <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                placeholder="e.g. Issue with my order, Account problem..."
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Message <span className="text-red-500">*</span></label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                rows={6}
                placeholder="Describe your issue or question in detail..."
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Support Ticket →'}
            </button>
          </form>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 text-center border-t pt-6">
            <div>
              <div className="text-2xl mb-1">💬</div>
              <p className="text-xs font-semibold text-slate-700">Support Chat</p>
              <p className="text-xs text-slate-500">Use the chat button on any page</p>
            </div>
            <div>
              <div className="text-2xl mb-1">⏱️</div>
              <p className="text-xs font-semibold text-slate-700">Response Time</p>
              <p className="text-xs text-slate-500">Usually within 24 hours</p>
            </div>
            <div>
              <div className="text-2xl mb-1">📋</div>
              <p className="text-xs font-semibold text-slate-700">Track Tickets</p>
              <p className="text-xs text-slate-500"><Link href="/buyer/support" className="underline text-blue-600">View your tickets</Link></p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
