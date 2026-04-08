'use client'

import { useState } from 'react'

type Ticket = {
  id: string
  ticket_number: string | null
  summary: string
  status: string
  conversation: any[]
  admin_replies: any[]
  thread: any[]
  created_at: string
  updated_at: string
}

export default function BuyerSupportClient({ tickets }: { tickets: Ticket[] }) {
  const [expanded, setExpanded] = useState<string | null>(tickets[0]?.id ?? null)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [sending, setSending] = useState<string | null>(null)
  const [localThreads, setLocalThreads] = useState<Record<string, any[]>>({})
  const [error, setError] = useState<string | null>(null)

  async function sendReply(ticketId: string) {
    const text = replyText[ticketId]?.trim()
    if (!text) return
    setSending(ticketId)
    setError(null)
    try {
      const res = await fetch('/api/support/buyer-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, message: text }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      // Optimistically append to local thread
      setLocalThreads(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] ?? []), { role: 'buyer', text, created_at: new Date().toISOString() }],
      }))
      setReplyText(prev => ({ ...prev, [ticketId]: '' }))
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSending(null)
    }
  }

  if (!tickets.length) {
    return (
      <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">
        <p className="text-4xl mb-4">💬</p>
        <p className="text-lg font-semibold text-slate-900 mb-2">No support tickets yet</p>
        <p className="text-sm text-slate-500">
          Use the Support Chat button at the bottom of any page to get help. Tickets are created automatically when you need human support.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {tickets.map(ticket => {
        const isOpen = expanded === ticket.id
        const thread = [...(ticket.thread ?? []), ...(localThreads[ticket.id] ?? [])]
        const hasAdminReplied = thread.some(m => m.role === 'admin') || (ticket.admin_replies?.length ?? 0) > 0
        const isResolved = ticket.status === 'resolved'

        return (
          <div key={ticket.id} className="rounded-3xl border bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setExpanded(isOpen ? null : ticket.id)}
              className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 rounded-full px-2.5 py-1 shrink-0">
                  {ticket.ticket_number ?? 'TKT'}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold shrink-0 ${
                  isResolved ? 'bg-emerald-100 text-emerald-700' :
                  hasAdminReplied ? 'bg-indigo-100 text-indigo-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {isResolved ? 'Resolved' : hasAdminReplied ? 'Admin Replied' : 'Awaiting Reply'}
                </span>
                <p className="font-semibold text-slate-900 truncate">{ticket.summary}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-400">{new Date(ticket.updated_at ?? ticket.created_at).toLocaleDateString()}</span>
                <span className="text-slate-400">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t px-6 pb-6 pt-5 space-y-5">
                {/* Original AI conversation */}
                {Array.isArray(ticket.conversation) && ticket.conversation.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Original Conversation</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto rounded-2xl bg-slate-50 p-3">
                      {ticket.conversation.filter((m: any) => m.role !== 'system').map((msg: any, i: number) => (
                        <div key={i} className={`text-xs p-2 rounded-xl ${msg.role === 'user' ? 'bg-blue-50 text-blue-800' : 'bg-white text-slate-700 border'}`}>
                          <span className="font-semibold capitalize">{msg.role === 'user' ? 'You' : 'AI'}: </span>{msg.content ?? msg.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Thread */}
                {thread.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Conversation Thread</p>
                    <div className="space-y-3">
                      {thread.map((msg: any, i: number) => (
                        <div key={i} className={`flex ${msg.role === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                            msg.role === 'buyer'
                              ? 'bg-blue-600 text-white'
                              : 'bg-emerald-50 border border-emerald-100 text-slate-800'
                          }`}>
                            <p className={`text-[10px] font-semibold mb-1 ${msg.role === 'buyer' ? 'text-blue-200' : 'text-emerald-600'}`}>
                              {msg.role === 'buyer' ? 'You' : '🛡️ Support Team'}
                            </p>
                            <p className="leading-5">{msg.text}</p>
                            <p className={`text-[10px] mt-1 ${msg.role === 'buyer' ? 'text-blue-200' : 'text-slate-400'}`}>
                              {new Date(msg.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {thread.length === 0 && (ticket.admin_replies?.length ?? 0) === 0 && (
                  <div className="rounded-2xl bg-slate-50 border px-4 py-3">
                    <p className="text-xs text-slate-500">⏳ Waiting for admin reply. You will be notified when they respond.</p>
                  </div>
                )}

                {/* Reply box */}
                {!isResolved && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Reply</p>
                    <div className="flex gap-3">
                      <textarea
                        rows={3}
                        value={replyText[ticket.id] ?? ''}
                        onChange={e => setReplyText(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        placeholder="Type your follow-up message..."
                        className="flex-1 rounded-2xl border px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => sendReply(ticket.id)}
                        disabled={sending === ticket.id || !replyText[ticket.id]?.trim()}
                        className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {sending === ticket.id ? 'Sending…' : 'Send Reply →'}
                      </button>
                    </div>
                  </div>
                )}

                {isResolved && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                    <p className="text-xs font-semibold text-emerald-700">✅ This ticket has been resolved. If you need further help, start a new support chat.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
