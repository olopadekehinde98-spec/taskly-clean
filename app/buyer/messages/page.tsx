import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function BuyerMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id, created_at, updated_at, buyer_unread,
      profiles!conversations_seller_id_fkey ( display_name, avatar_url, username ),
      listings ( title, slug ),
      messages ( content, created_at, sender_id )
    `)
    .eq('buyer_id', user!.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Messages</h1>

      {!conversations || conversations.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-12 text-center">
          <div className="text-4xl mb-3">💬</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No conversations yet</h2>
          <p className="text-slate-500 text-sm">Messages from sellers will appear here once you place an order.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv: any) => {
            const seller = conv.profiles
            const lastMsg = Array.isArray(conv.messages)
              ? conv.messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
              : null
            const timeAgo = conv.updated_at
              ? new Date(conv.updated_at).toLocaleDateString()
              : ''

            return (
              <Link
                key={conv.id}
                href={`/buyer/messages/${conv.id}`}
                className={`block rounded-2xl border p-5 transition hover:shadow-sm ${conv.buyer_unread ? 'border-blue-200 bg-blue-50' : 'bg-slate-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {(seller?.display_name ?? 'S')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900">{seller?.display_name ?? 'Seller'}</p>
                      <span className="text-xs text-slate-500">{timeAgo}</span>
                    </div>
                    {conv.listings && (
                      <p className="text-xs text-blue-600 mb-1 font-medium">{conv.listings.title}</p>
                    )}
                    {lastMsg && (
                      <p className="text-sm text-slate-600 line-clamp-1">
                        {lastMsg.sender_id === user!.id ? 'You: ' : ''}{lastMsg.content}
                      </p>
                    )}
                  </div>
                  {conv.buyer_unread && (
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0 mt-2" />
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
