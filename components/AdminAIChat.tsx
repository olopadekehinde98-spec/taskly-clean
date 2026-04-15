'use client'

import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'ai'; text: string }

const QUICK_QUESTIONS = [
  'Give me a full platform summary',
  'Show me revenue report',
  'Who signed up recently?',
  'Any suspicious or flagged users?',
  'Show recent support tickets',
  'Any violations or disputes?',
  'Show recent orders',
  'Who applied to be a seller?',
]

const SESSION_KEY = 'admin_ai_session'

export default function AdminAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hi! I'm your admin AI with full platform access. I can report on revenue, orders, users, gigs, violations, disputes, support tickets, messages, seller applications, flagged accounts, and more. What do you need?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') return crypto.randomUUID()
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) return stored
    const fresh = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, fresh)
    return fresh
  })
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text?: string) {
    const msg = text ?? input.trim()
    if (!msg || loading) return

    const history = messages
      .filter(m => m.role !== 'ai' || messages.indexOf(m) > 0)
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }))

    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history, session_id: sessionId }),
      })
      const data = await res.json()
      // Persist session_id returned by server
      if (data.session_id && typeof window !== 'undefined') localStorage.setItem(SESSION_KEY, data.session_id)
      setMessages(prev => [...prev, { role: 'ai', text: data.result ?? data.error ?? 'Something went wrong.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Failed to reach AI. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-3xl border bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-gradient-to-r from-[#0d2818] to-[#28a84e]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3ecf68] to-[#163522] text-white text-lg">🤖</div>
        <div>
          <p className="font-bold text-slate-900 text-sm">Admin AI Assistant</p>
          <p className="text-xs text-slate-500">Powered by Claude · Live platform data</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Quick questions */}
      <div className="px-6 py-3 border-b bg-slate-50 flex gap-2 flex-wrap">
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={loading}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:border-[#dae8df] hover:text-[#3ecf68] transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#3ecf68] to-[#163522] text-sm mt-0.5">🤖</div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-gradient-to-r from-[#3ecf68] to-[#163522] text-white rounded-tr-sm'
                : 'bg-slate-100 text-slate-800 rounded-tl-sm'
            }`}>
              {m.text}
            </div>
            {m.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-600 text-xs font-bold text-white mt-0.5">A</div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#3ecf68] to-[#163522] text-sm">🤖</div>
            <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 flex gap-1.5 items-center">
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about users, gigs, violations, orders..."
          disabled={loading}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#dae8df] focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="rounded-xl bg-gradient-to-r from-[#3ecf68] to-[#163522] px-4 py-2.5 text-sm font-bold text-white hover:from-[#3ecf68] hover:to-[#163522] transition-all disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </section>
  )
}
