import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/messages')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_seller, is_admin')
    .eq('id', user.id)
    .single()

  // Fetch conversations where user is participant_a or participant_b
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id, last_message_at,
      a:profiles!conversations_participant_a_fkey ( id, display_name, avatar_url ),
      b:profiles!conversations_participant_b_fkey ( id, display_name, avatar_url )
    `)
    .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
    .order('last_message_at', { ascending: false })
    .limit(50)

  if (!conversations || conversations.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
          </div>
          <div className="rounded-3xl border bg-white p-16 text-center shadow-sm">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No conversations yet</h2>
            <p className="text-slate-500 text-sm mb-6">Your conversations will appear here.</p>
            <Link href="/services" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              Browse Services
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Get unread counts per conversation
  const convIds = conversations.map((c: any) => c.id)
  const { data: unreadRows } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', convIds)
    .eq('receiver_id', user.id)
    .eq('is_read', false)

  const unreadByConv = new Set(unreadRows?.map((r: any) => r.conversation_id) ?? [])

  // Get last message per conversation
  const { data: lastMsgs } = await supabase
    .from('messages')
    .select('conversation_id, body, sender_id, created_at')
    .in('conversation_id', convIds)
    .order('created_at', { ascending: false })

  const lastMsgByConv: Record<string, { body: string; sender_id: string }> = {}
  for (const m of lastMsgs ?? []) {
    if (!lastMsgByConv[(m as any).conversation_id]) {
      lastMsgByConv[(m as any).conversation_id] = { body: (m as any).body, sender_id: (m as any).sender_id }
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
          <p className="mt-1 text-sm text-slate-500">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="space-y-3">
          {conversations.map((conv: any) => {
            const other = conv.a?.id === user.id ? conv.b : conv.a
            const isUnread = unreadByConv.has(conv.id)
            const lastMsg = lastMsgByConv[conv.id]
            const href = profile?.is_seller
              ? `/dashboard/messages/${conv.id}`
              : `/buyer/messages/${conv.id}`

            return (
              <Link
                key={conv.id}
                href={href}
                className={`block rounded-2xl border p-5 transition hover:shadow-sm ${isUnread ? 'border-blue-200 bg-blue-50' : 'bg-white'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {(other?.display_name ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="font-semibold text-slate-900 truncate">
                        {other?.display_name ?? 'User'}
                      </p>
                      <span className="text-xs text-slate-400 shrink-0">
                        {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    {lastMsg && (
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {lastMsg.sender_id === user.id ? 'You: ' : ''}{lastMsg.body}
                      </p>
                    )}
                  </div>
                  {isUnread && <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0 mt-2" />}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
