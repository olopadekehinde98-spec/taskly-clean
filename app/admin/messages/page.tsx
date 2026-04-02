import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/buyer')

  // Fetch all conversations between buyers and sellers
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id,
      created_at,
      buyer_unread,
      seller_unread,
      listings(title),
      buyer:profiles!conversations_buyer_id_fkey(display_name, email, username),
      seller:profiles!conversations_seller_id_fkey(display_name, email, username)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <main className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">All Messages</h1>
        <p className="mt-1 text-sm text-slate-500">View all conversations between buyers and sellers.</p>
      </div>

      <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        {!conversations || conversations.length === 0 ? (
          <div className="py-16 text-center text-slate-500">No conversations yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Buyer</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Seller</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Service</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Started</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Unread</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">View</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {conversations.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{c.buyer?.display_name || c.buyer?.email || '—'}</p>
                    <p className="text-xs text-slate-500">{c.buyer?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{c.seller?.display_name || c.seller?.email || '—'}</p>
                    <p className="text-xs text-slate-500">{c.seller?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-700 max-w-xs truncate">
                    {c.listings?.title || '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {(c.buyer_unread || c.seller_unread) ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">Unread</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Read</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`/admin/messages/${c.id}`}
                      className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      View Chat
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
