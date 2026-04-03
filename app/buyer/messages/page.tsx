import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function BuyerMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Conversations where user is participant_a or participant_b
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id, last_message_at, created_at,
      participant_a, participant_b,
      a:profiles!conversations_participant_a_fkey ( id, display_name, avatar_url, username ),
      b:profiles!conversations_participant_b_fkey ( id, display_name, avatar_url, username )
    `)
    .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
    .order('last_message_at', { ascending: false })
    .limit(50)

  // Get unread counts per conversation
  const convIds = (conversations ?? []).map(c => c.id)
  const { data: unreadMsgs } = convIds.length > 0
    ? await supabase
        .from('messages')
        .select('conversation_id')
        .eq('receiver_id', user.id)
        .eq('is_read', false)
        .in('conversation_id', convIds)
    : { data: [] }

  const unreadMap: Record<string, number> = {}
  for (const m of unreadMsgs ?? []) {
    unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] ?? 0) + 1
  }

  // Get last message per conversation
  const { data: lastMsgs } = convIds.length > 0
    ? await supabase
        .from('messages')
        .select('conversation_id, body, sender_id, created_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  const lastMsgMap: Record<string, any> = {}
  for (const m of lastMsgs ?? []) {
    if (!lastMsgMap[m.conversation_id]) lastMsgMap[m.conversation_id] = m
  }

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Messages</h1>

      {!conversations || conversations.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-12 text-center">
          <div className="text-4xl mb-3">💬</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No conversations yet</h2>
          <p className="text-slate-500 text-sm">Messages will appear here when you contact a seller.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv: any) => {
            // The "other" participant
            const other = conv.participant_a === user.id ? conv.b : conv.a
            const unreadCount = unreadMap[conv.id] ?? 0
            const lastMsg = lastMsgMap[conv.id]

            return (
              <Link
                key={conv.id}
                href={`/buyer/messages/${conv.id}`}
                className={`block rounded-2xl border p-5 transition hover:shadow-sm ${unreadCount > 0 ? 'border-blue-200 bg-blue-50/60' : 'bg-slate-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {(other?.display_name ?? 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900">{other?.display_name ?? 'User'}</p>
                      <span className="text-xs text-slate-500">
                        {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    {lastMsg && (
                      <p className="text-sm text-slate-600 line-clamp-1">
                        {lastMsg.sender_id === user.id ? 'You: ' : ''}{lastMsg.body}
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shrink-0">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
