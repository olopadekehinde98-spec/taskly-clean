'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  body: string
  created_at: string
  is_read: boolean
}

export default function BuyerConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [otherName, setOtherName] = useState('User')
  const [otherId, setOtherId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    params.then(p => setConversationId(p.id))
  }, [params])

  useEffect(() => {
    if (!conversationId) return
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)

      // Load conversation + participants
      supabase
        .from('conversations')
        .select(`
          id, participant_a, participant_b,
          a:profiles!conversations_participant_a_fkey ( id, display_name ),
          b:profiles!conversations_participant_b_fkey ( id, display_name )
        `)
        .eq('id', conversationId)
        .single()
        .then(({ data: conv }) => {
          if (!conv) { setLoading(false); return }

          const other = conv.participant_a === user.id ? (conv as any).b : (conv as any).a
          setOtherName(other?.display_name ?? 'User')
          setOtherId(other?.id ?? null)

          // Load messages
          supabase
            .from('messages')
            .select('id, sender_id, receiver_id, body, created_at, is_read')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .then(({ data: msgs }) => {
              setMessages(msgs ?? [])
              setLoading(false)

              // Mark incoming messages as read
              supabase
                .from('messages')
                .update({ is_read: true })
                .eq('conversation_id', conversationId)
                .eq('receiver_id', user.id)
                .eq('is_read', false)
                .then(() => {})
            })
        })
    })
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || !conversationId || !userId || !otherId || sending) return
    setSending(true)
    const supabase = createClient()
    const body = input.trim()
    setInput('')

    const { data } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: otherId,
        body,
      })
      .select()
      .single()

    if (data) {
      setMessages(prev => [...prev, data])
      // Update last_message_at on conversation
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId)
    }
    setSending(false)
  }

  if (loading) {
    return (
      <div className="rounded-3xl border bg-white p-16 text-center shadow-sm">
        <p className="text-slate-500">Loading conversation...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b px-6 py-5 flex items-center gap-3">
          <Link href="/buyer/messages" className="text-slate-400 hover:text-slate-600 text-xl">←</Link>
          <div>
            <p className="text-xs text-slate-500">Conversation with</p>
            <h1 className="text-xl font-bold text-slate-900">{otherName}</h1>
          </div>
        </div>

        <div className="space-y-4 px-6 py-6 min-h-[300px] max-h-[480px] overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-8">No messages yet. Say hello!</p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                msg.sender_id === userId ? 'bg-[#3ecf68] text-white' : 'bg-slate-100 text-slate-800'
              }`}>
                <p>{msg.body}</p>
                <p className={`mt-1 text-xs ${msg.sender_id === userId ? 'text-[#edfbf2]' : 'text-slate-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t px-6 py-5">
          <div className="flex gap-3">
            <textarea
              rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Write your message..."
              className="flex-1 rounded-2xl border px-4 py-3 text-sm outline-none resize-none focus:border-[#dae8df]"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="rounded-2xl bg-[#3ecf68] px-5 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-[#28a84e] transition-colors"
            >
              {sending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
