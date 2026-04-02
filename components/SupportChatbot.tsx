'use client'

import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'ai'; text: string }

const QUICK_QUESTIONS = [
  'How do I place an order?',
  'How do refunds work?',
  'How do I open a dispute?',
  'When do sellers get paid?',
  'How do I report a user?',
]

export default function SupportChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hi! 👋 I'm the TasklyClean support assistant. Ask me anything about orders, payments, disputes, or platform rules — or I'll connect you to a real person if needed." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [escalated, setEscalated] = useState(false)
  const [ticketCreated, setTicketCreated] = useState(false)
  const [ticketNumber, setTicketNumber] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  async function send(text?: string) {
    const msg = text ?? input.trim()
    if (!msg || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', text: msg }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: 'support_chat', payload: { message: msg } }),
      })
      const data = await res.json()
      const aiText = data.result ?? 'Sorry, something went wrong. Please try again.'

      setMessages(prev => [...prev, { role: 'ai', text: aiText }])

      const allMessages = [...newMessages, { role: 'ai' as const, text: aiText }]

      // Auto-save ticket when conversation reaches 3+ messages or AI escalates
      const shouldSave = (data.escalate && !ticketCreated) || (!ticketCreated && allMessages.length >= 4)
      if (shouldSave) {
        if (data.escalate) setEscalated(true)
        const conversation = allMessages.map(m => ({ role: m.role, text: m.text }))
        const ticketRes = await fetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary: data.summary || msg, conversation, auto_save: !data.escalate }),
        })
        const ticketData = await ticketRes.json()
        if (ticketData.ticket_number) setTicketNumber(ticketData.ticket_number)
        setTicketCreated(true)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl shadow-lg shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-700 transition-all"
        aria-label="Support chat"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl border bg-white shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-lg">🤖</div>
            <div>
              <p className="font-bold text-sm">TasklyClean Support</p>
              <p className="text-xs text-blue-100">
                {escalated ? '🟡 Connected to human support' : '🟢 AI Assistant · Online'}
              </p>
            </div>
          </div>

          {messages.length <= 1 && (
            <div className="px-4 py-3 border-b bg-slate-50 flex gap-2 flex-wrap">
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => send(q)} disabled={loading}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="h-72 overflow-y-auto px-4 py-4 space-y-3 flex flex-col">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'ai' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm mt-0.5">🤖</div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}>{m.text}</div>
              </div>
            ))}
            {ticketCreated && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 text-center">
                ✅ {escalated ? 'Connected to human support.' : 'Conversation saved.'} {ticketNumber && <span className="font-bold">Ticket: {ticketNumber}</span>}
              </div>
            )}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm">🤖</div>
                <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 flex gap-1.5 items-center">
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t px-3 py-3 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Type your question..."
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
            />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm font-bold text-white hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-40">
              →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
