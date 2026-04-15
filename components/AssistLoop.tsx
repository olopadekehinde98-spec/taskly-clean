'use client'

import { useState, useRef, useEffect } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

interface Props {
  context: string
  userName?: string
  role?: 'buyer' | 'seller'
}

const BUYER_PROMPTS = [
  'How do I place an order?',
  'How do I open a dispute?',
  'When will I get a refund?',
  'How do I message a seller?',
]

const SELLER_PROMPTS = [
  'How do I improve my listing?',
  'How do I increase my response rate?',
  'When do I get paid?',
  'How do I handle a revision request?',
]

export default function AssistLoop({ context, userName, role = 'buyer' }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  // Persist session_id in localStorage so history survives page reloads
  const [sessionId] = useState(() => {
    if (typeof window === 'undefined') return crypto.randomUUID()
    const key = `assist_session_${role}`
    const stored = localStorage.getItem(key)
    if (stored) return stored
    const fresh = crypto.randomUUID()
    localStorage.setItem(key, fresh)
    return fresh
  })
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const quickPrompts = role === 'seller' ? SELLER_PROMPTS : BUYER_PROMPTS

  useEffect(() => {
    if (!open) return
    if (historyLoaded) return
    setHistoryLoaded(true)

    // Try to load previous session from API
    fetch('/api/ai/assist/history?session_id=' + sessionId)
      .then(r => r.json())
      .then(data => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages)
        } else {
          setMessages([{
            role: 'assistant',
            content: `Hi ${userName || 'there'}! 👋 I'm your TasklyClean assistant. What do you need help with?`,
          }])
        }
      })
      .catch(() => {
        setMessages([{
          role: 'assistant',
          content: `Hi ${userName || 'there'}! 👋 I'm your TasklyClean assistant. What do you need help with?`,
        }])
      })
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    setLoading(true)

    const userMsg: Message = { role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, context, history, session_id: sessionId }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, I had trouble responding. Please try again.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <>
      {/* Floating button — offset from support chat which is at bottom-right */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-20 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#0d2818] shadow-lg hover:bg-[#0d2818] transition-all"
        title="AI Assistant"
      >
        <span className="text-xl">{open ? '✕' : '🤖'}</span>
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex w-80 flex-col rounded-3xl border border-[#dae8df] bg-white shadow-2xl overflow-hidden"
          style={{ maxHeight: '520px' }}>
          {/* Header */}
          <div className="flex items-center gap-3 bg-[#0d2818] px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white text-sm font-bold">
              AI
            </div>
            <div>
              <p className="text-sm font-semibold text-white">TasklyClean Assistant</p>
              <p className="text-xs text-[#3ecf68]">{context}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ maxHeight: '320px' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-5 ${
                  m.role === 'user'
                    ? 'bg-[#0d2818] text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-3 py-2">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts — only on first message */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1">
              {quickPrompts.map(p => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="rounded-full border border-[#dae8df] bg-[#0d2818] px-2 py-1 text-xs text-[#3ecf68] hover:bg-[#0d2818] transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t p-2 flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(input)
                }
              }}
              placeholder="Ask anything..."
              rows={1}
              className="flex-1 resize-none rounded-2xl border px-3 py-2 text-sm outline-none focus:border-[#dae8df]"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="rounded-2xl bg-[#0d2818] px-3 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-[#0d2818] transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
