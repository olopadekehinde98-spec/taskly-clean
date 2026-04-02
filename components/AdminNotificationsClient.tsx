'use client'

import { useState } from 'react'

type Event = {
  type: string
  icon: string
  title: string
  detail: string
  time: string
  severity: 'info' | 'warning' | 'danger'
}

const FILTERS = ['All', 'New User', 'New Order', 'New Gig', 'Violation', 'Dispute', 'Support Ticket']

const severityStyles = {
  info: 'border-slate-100 bg-white',
  warning: 'border-amber-100 bg-amber-50',
  danger: 'border-red-100 bg-red-50',
}

const badgeStyles = {
  'New User': 'bg-blue-100 text-blue-700',
  'New Order': 'bg-indigo-100 text-indigo-700',
  'New Gig': 'bg-purple-100 text-purple-700',
  'Violation': 'bg-red-100 text-red-700',
  'Dispute': 'bg-orange-100 text-orange-700',
  'Support Ticket': 'bg-amber-100 text-amber-700',
}

export default function AdminNotificationsClient({ events }: { events: Event[] }) {
  const [filter, setFilter] = useState('All')
  const [aiSummary, setAiSummary] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)

  const filtered = filter === 'All' ? events : events.filter(e => e.type === filter)

  const counts = {
    total: events.length,
    violations: events.filter(e => e.type === 'Violation').length,
    disputes: events.filter(e => e.type === 'Dispute').length,
    tickets: events.filter(e => e.type === 'Support Ticket').length,
    newUsers: events.filter(e => e.type === 'New User').length,
    newOrders: events.filter(e => e.type === 'New Order').length,
  }

  async function getAISummary() {
    setLoadingAI(true)
    try {
      const res = await fetch('/api/ai/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Summarise the last 7 days of platform activity in 4-6 bullet points. Focus on: ${counts.newUsers} new sign-ups, ${counts.newOrders} new orders, ${counts.violations} violations, ${counts.disputes} disputes, ${counts.tickets} support tickets. Flag anything that needs urgent attention.`
        }),
      })
      const data = await res.json()
      setAiSummary(data.result ?? 'Could not generate summary.')
    } finally {
      setLoadingAI(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Events', value: counts.total, color: 'text-slate-900' },
          { label: 'New Users', value: counts.newUsers, color: 'text-blue-600' },
          { label: 'New Orders', value: counts.newOrders, color: 'text-indigo-600' },
          { label: 'Violations', value: counts.violations, color: 'text-red-600' },
          { label: 'Disputes', value: counts.disputes, color: 'text-orange-600' },
          { label: 'Support Tickets', value: counts.tickets, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border bg-white p-4 shadow-sm text-center">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* AI Summary */}
      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <p className="font-bold text-slate-900">AI Activity Summary</p>
          </div>
          <button
            onClick={getAISummary}
            disabled={loadingAI}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
          >
            {loadingAI ? 'Generating...' : aiSummary ? 'Refresh Summary' : 'Generate AI Summary'}
          </button>
        </div>
        {aiSummary ? (
          <div className="rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {aiSummary}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Click "Generate AI Summary" to get an AI-powered briefing of all platform activity.</p>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              filter === f
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f} {f !== 'All' && `(${events.filter(e => e.type === f).length})`}
          </button>
        ))}
      </div>

      {/* Event feed */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border bg-white p-12 text-center text-slate-400">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-medium">No events in this category</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((e, i) => (
            <div key={i} className={`rounded-2xl border px-5 py-4 flex items-start gap-4 ${severityStyles[e.severity]}`}>
              <span className="text-2xl mt-0.5">{e.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeStyles[e.type as keyof typeof badgeStyles] ?? 'bg-slate-100 text-slate-600'}`}>
                    {e.type}
                  </span>
                  <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                </div>
                <p className="text-xs text-slate-500 truncate">{e.detail}</p>
              </div>
              <p className="shrink-0 text-xs text-slate-400">{new Date(e.time).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
