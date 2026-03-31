'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
}

export default function BuyerConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [sellerName, setSellerName] = useState('Seller')
  const [listingTitle, setListingTitle] = useState<string | null>(null)
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

      supabase
        .from('conversations')
        .select(`
          id,
          profiles!conversations_seller_id_fkey ( display_name ),
          listings ( title ),
          messages ( id, sender_id, content, created_at )
        `)
        .eq('id', conversationId)
        .eq('buyer_id', user.id)
        .single()
        .then(({ data }) => {
          if (!data) return
          setSellerName((data.profiles as any)?.display_name ?? 'Seller')
          setListingTitle((data.listings as any)?.title ?? null)
          const msgs = Array.isArray(data.messages)
            ? [...data.messages].sort((a: Message, b: Message) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            : []
          setMessages(msgs)
          setLoading(false)
        })

      // Mark as read
      supabase.from('conversations').update({ buyer_unread: false }).eq('id', conversationId).then(() => {})
    })
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || !conversationId || !userId || sending) return
    setSending(true)
    const supabase = createClient()
    const content = input.trim()
    setInput('')
    const { data } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: userId, content })
      .select()
      .single()
    if (data) {
      setMessages(prev => [...prev, data])
      await supabase.from('conversations').update({ updated_at: new Date().toISOString(), seller_unread: true }).eq('id', conversationId)
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
            <h1 className="text-xl font-bold text-slate-900">{sellerName}</h1>
            {listingTitle && <p className="text-xs text-blue-600 mt-0.5">{listingTitle}</p>}
          </div>
        </div>

        <div className="space-y-4 px-6 py-6 min-h-[300px] max-h-[480px] overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-8">No messages yet. Say hello!</p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                msg.sender_id === userId ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
              }`}>
                <p>{msg.content}</p>
                <p className={`mt-1 text-xs ${msg.sender_id === userId ? 'text-blue-100' : 'text-slate-500'}`}>
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
              className="flex-1 rounded-2xl border px-4 py-3 text-sm outline-none resize-none"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="rounded-2xl bg-blue-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {sending ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
