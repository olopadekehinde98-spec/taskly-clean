import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SellerMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id, updated_at, seller_unread,
      profiles!conversations_buyer_id_fkey ( display_name, avatar_url ),
      listings ( title, slug ),
      messages ( content, created_at, sender_id )
    `)
    .eq('seller_id', user!.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="rounded-3xl border bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Messages</h1>

      {!conversations || conversations.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-12 text-center">
          <div className="text-4xl mb-3">💬</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No conversations yet</h2>
          <p className="text-slate-500 text-sm">Buyers will message you here about your services.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv: any) => {
            const buyer = conv.profiles
            const lastMsg = Array.isArray(conv.messages)
              ? conv.messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
              : null

            return (
              <Link
                key={conv.id}
                href={`/dashboard/messages/${conv.id}`}
                className={`block rounded-2xl border p-5 transition hover:shadow-sm ${conv.seller_unread ? 'border-blue-200 bg-blue-50' : 'bg-slate-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {(buyer?.display_name ?? 'B')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900">{buyer?.display_name ?? 'Buyer'}</p>
                      <span className="text-xs text-slate-500">
                        {conv.updated_at ? new Date(conv.updated_at).toLocaleDateString() : ''}
                      </span>
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
                  {conv.seller_unread && (
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
