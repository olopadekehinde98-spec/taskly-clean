import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

type Props = { params: Promise<{ id: string }> }

export default async function AdminConversationPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/buyer')

  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      id, created_at,
      listings(title),
      buyer:profiles!conversations_buyer_id_fkey(id, display_name, email),
      seller:profiles!conversations_seller_id_fkey(id, display_name, email)
    `)
    .eq('id', id)
    .single()

  if (!conversation) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, sender_id, created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  const buyerId = (conversation as any).buyer?.id
  const sellerId = (conversation as any).seller?.id

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/messages" className="rounded-xl border px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Conversation View</h1>
          <p className="text-sm text-slate-500">{(conversation as any).listings?.title || 'No service linked'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-[#edfbf2] p-4">
          <p className="text-xs font-medium uppercase text-[#3ecf68]">Buyer</p>
          <p className="mt-1 font-semibold text-slate-900">{(conversation as any).buyer?.display_name || '—'}</p>
          <p className="text-xs text-slate-500">{(conversation as any).buyer?.email}</p>
        </div>
        <div className="rounded-2xl border bg-emerald-50 p-4">
          <p className="text-xs font-medium uppercase text-emerald-600">Seller</p>
          <p className="mt-1 font-semibold text-slate-900">{(conversation as any).seller?.display_name || '—'}</p>
          <p className="text-xs text-slate-500">{(conversation as any).seller?.email}</p>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4" style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {!messages || messages.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No messages yet.</p>
        ) : (
          messages.map((m: any) => {
            const isBuyer = m.sender_id === buyerId
            return (
              <div key={m.id} className={`flex ${isBuyer ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                  isBuyer ? 'bg-[#edfbf2] text-slate-800' : 'bg-emerald-50 text-slate-800'
                }`}>
                  <p className={`mb-1 text-xs font-medium ${isBuyer ? 'text-[#3ecf68]' : 'text-emerald-600'}`}>
                    {isBuyer ? (conversation as any).buyer?.display_name : (conversation as any).seller?.display_name}
                  </p>
                  <p className="leading-5">{m.content}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(m.created_at).toLocaleString()}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </main>
  )
}
