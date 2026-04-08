'use client'

import { useState } from 'react'
import FileAttach, { type Attachment } from '@/components/FileAttach'

type Ticket = {
  id: string
  ticket_number?: string
  summary: string
  status: string
  created_at: string
  conversation: { role: string; text: string; content?: string }[]
  admin_replies: { text: string; created_at: string; attachments?: Attachment[] }[]
  thread: { role: 'buyer' | 'admin'; text: string; created_at: string }[]
  profiles: { display_name?: string; email?: string; avatar_url?: string } | null
}

export default function AdminSupportTickets({ tickets }: { tickets: Ticket[] }) {
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [reply, setReply] = useState('')
  const [status, setStatus] = useState('open')
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [localTickets, setLocalTickets] = useState(tickets)

  async function sendReply() {
    if (!selected || !reply.trim()) return
    setLoading(true)
    try {
      await fetch('/api/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: selected.id, reply: reply.trim(), status, attachments }),
      })
      // Update local state
      const newReply = { text: reply.trim(), created_at: new Date().toISOString(), attachments }
      const newThreadMsg = { role: 'admin' as const, text: reply.trim(), created_at: new Date().toISOString() }
      setLocalTickets(prev => prev.map(t => t.id === selected.id
        ? { ...t, status, admin_replies: [...(t.admin_replies ?? []), newReply], thread: [...(t.thread ?? []), newThreadMsg] }
        : t
      ))
      setSelected(prev => prev ? { ...prev, status, admin_replies: [...(prev.admin_replies ?? []), newReply], thread: [...(prev.thread ?? []), newThreadMsg] } : null)
      setReply('')
      setAttachments([])
    } finally {
      setLoading(false)
    }
  }

  const open = localTickets.filter(t => t.status === 'open')
  const resolved = localTickets.filter(t => t.status !== 'open')

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* Ticket list */}
      <div className="space-y-3">
        {open.length === 0 && resolved.length === 0 && (
          <div className="rounded-3xl border bg-white p-8 text-center text-slate-400">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-medium">No support tickets yet</p>
            <p className="text-sm mt-1">Tickets appear here when users escalate from the chat bot.</p>
          </div>
        )}

        {open.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">Open ({open.length})</p>
            {open.map(t => (
              <TicketCard key={t.id} ticket={t} selected={selected?.id === t.id} onClick={() => { setSelected(t); setStatus(t.status) }} />
            ))}
          </div>
        )}

        {resolved.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 px-1 mt-4">Resolved ({resolved.length})</p>
            {resolved.map(t => (
              <TicketCard key={t.id} ticket={t} selected={selected?.id === t.id} onClick={() => { setSelected(t); setStatus(t.status) }} />
            ))}
          </div>
        )}
      </div>

      {/* Ticket detail */}
      {selected ? (
        <div className="rounded-3xl border bg-white shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900">{selected.summary}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                From: {selected.profiles?.display_name ?? 'Guest'} ({selected.profiles?.email ?? 'unknown'}) · {new Date(selected.created_at).toLocaleString()}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${selected.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {selected.status}
            </span>
          </div>

          {/* Conversation */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 max-h-96">
            {/* Original AI chat */}
            {selected.conversation?.filter(m => m.role !== 'system').length > 0 && (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Original AI Chat</p>
                <div className="space-y-2 max-h-36 overflow-y-auto rounded-2xl bg-slate-50 p-3 mb-4">
                  {selected.conversation.filter(m => m.role !== 'system').map((m, i) => (
                    <div key={i} className={`text-xs p-2 rounded-xl ${m.role === 'user' ? 'bg-blue-50 text-blue-800' : 'bg-white text-slate-700 border'}`}>
                      <span className="font-semibold capitalize">{m.role === 'user' ? 'Buyer' : 'AI'}: </span>{m.text ?? m.content}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Unified thread */}
            {(selected.thread?.length ?? 0) > 0 && (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Conversation Thread</p>
                {selected.thread.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      m.role === 'admin' ? 'bg-red-600 text-white' : 'bg-blue-50 text-blue-900 border border-blue-100'
                    }`}>
                      <p className={`text-[10px] font-bold mb-1 ${m.role === 'admin' ? 'text-red-200' : 'text-blue-500'}`}>
                        {m.role === 'admin' ? '🛡️ You (Admin)' : '👤 Buyer'}
                      </p>
                      <p>{m.text}</p>
                      <p className={`text-[10px] mt-1 ${m.role === 'admin' ? 'text-red-200' : 'text-slate-400'}`}>
                        {new Date(m.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {(selected.thread?.length ?? 0) === 0 && (selected.admin_replies?.length ?? 0) === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No replies yet. Be the first to respond.</p>
            )}
          </div>

          {/* Reply box */}
          <div className="border-t px-6 py-4 space-y-3 bg-slate-50">
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Write your reply to the user..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
            <FileAttach attachments={attachments} onChange={setAttachments} bucket="attachments" />
            <div className="flex items-center gap-3">
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="open">Keep Open</option>
                <option value="resolved">Mark Resolved</option>
              </select>
              <button
                onClick={sendReply}
                disabled={loading || !reply.trim()}
                className="ml-auto rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-bold text-white hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-40"
              >
                {loading ? 'Sending...' : 'Send Reply →'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border bg-white p-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-medium text-slate-600">Select a ticket to view and reply</p>
        </div>
      )}
    </div>
  )
}

function TicketCard({ ticket, selected, onClick }: { ticket: Ticket; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-4 transition-all mb-2 ${selected ? 'border-blue-500 bg-blue-50' : 'bg-white hover:bg-slate-50'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900 line-clamp-2">{ticket.summary}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${ticket.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {ticket.status}
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-1">
        {ticket.profiles?.display_name ?? 'Guest'} · {new Date(ticket.created_at).toLocaleDateString()}
      </p>
      {(ticket.thread?.length ?? 0) > 0 && (
        <p className="text-xs text-blue-600 mt-1">
          {ticket.thread.filter(m => m.role === 'buyer').length > 0 && (
            <span className="text-amber-600">● Buyer replied · </span>
          )}
          {ticket.thread.length} message{ticket.thread.length !== 1 ? 's' : ''}
        </p>
      )}
    </button>
  )
}
