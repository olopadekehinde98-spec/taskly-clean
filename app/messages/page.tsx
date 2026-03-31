import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/messages')

  // Fetch all conversations where this user is either buyer or seller
  const [{ data: asBuyer }, { data: asSeller }] = await Promise.all([
    supabase
      .from('conversations')
      .select(`
        id, updated_at, buyer_unread, seller_unread,
        profiles!conversations_seller_id_fkey ( display_name, avatar_url ),
        listings ( title, slug ),
        messages ( content, created_at, sender_id )
      `)
      .eq('buyer_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('conversations')
      .select(`
        id, updated_at, buyer_unread, seller_unread,
        profiles!conversations_buyer_id_fkey ( display_name, avatar_url ),
        listings ( title, slug ),
        messages ( content, created_at, sender_id )
      `)
      .eq('seller_id', user.id)
      .order('updated_at', { ascending: false }),
  ])

  const buyerConvs = (asBuyer ?? []).map((c: any) => ({ ...c, role: 'buyer' as const, otherUser: c.profiles }))
  const sellerConvs = (asSeller ?? []).map((c: any) => ({ ...c, role: 'seller' as const, otherUser: c.profiles }))

  // Merge and sort by updated_at
  const allConversations = [...buyerConvs, ...sellerConvs]
    .sort((a, b) => new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime())

  const hasUnread = allConversations.some(c =>
    (c.role === 'buyer' && c.buyer_unread) || (c.role === 'seller' && c.seller_unread)
  )

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
          <p className="mt-1 text-sm text-slate-500">
            {allConversations.length} conversation{allConversations.length !== 1 ? 's' : ''}
            {hasUnread ? ' · Some unread' : ''}
          </p>
        </div>

        {allConversations.length === 0 ? (
          <div className="rounded-3xl border bg-white p-16 text-center shadow-sm">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No conversations yet</h2>
            <p className="text-slate-500 text-sm mb-6">Your conversations with buyers and sellers will appear here.</p>
            <Link href="/services" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {allConversations.map((conv: any) => {
              const isUnread = conv.role === 'buyer' ? conv.buyer_unread : conv.seller_unread
              const href = conv.role === 'buyer'
                ? `/buyer/messages/${conv.id}`
                : `/dashboard/messages/${conv.id}`
              const lastMsg = Array.isArray(conv.messages)
                ? conv.messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
                : null

              return (
                <Link
                  key={`${conv.role}-${conv.id}`}
                  href={href}
                  className={`block rounded-2xl border p-5 transition hover:shadow-sm ${isUnread ? 'border-blue-200 bg-blue-50' : 'bg-white'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {(conv.otherUser?.display_name ?? '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {conv.otherUser?.display_name ?? 'User'}
                          </p>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                            conv.role === 'buyer' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {conv.role === 'buyer' ? 'as buyer' : 'as seller'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">
                          {conv.updated_at ? new Date(conv.updated_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      {conv.listings && (
                        <p className="text-xs text-blue-600 mb-0.5 font-medium truncate">{conv.listings.title}</p>
                      )}
                      {lastMsg && (
                        <p className="text-sm text-slate-500 line-clamp-1">
                          {lastMsg.sender_id === user.id ? 'You: ' : ''}{lastMsg.content}
                        </p>
                      )}
                    </div>
                    {isUnread && <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0 mt-2" />}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
