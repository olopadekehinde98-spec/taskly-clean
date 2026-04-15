import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/buyer')

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id, created_at, last_message_at,
      a:profiles!conversations_participant_a_fkey(display_name, email, username),
      b:profiles!conversations_participant_b_fkey(display_name, email, username)
    `)
    .order('last_message_at', { ascending: false })
    .limit(100)

  // Get unread counts per conversation from messages table
  const { data: unreadMsgs } = await supabase
    .from('messages')
    .select('conversation_id')
    .eq('is_read', false)

  const unreadMap: Record<string, number> = {}
  for (const m of unreadMsgs ?? []) {
    unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] ?? 0) + 1
  }

  return (
    <main className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#3ecf68]">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">All Messages</h1>
        <p className="mt-1 text-sm text-slate-500">View all conversations between users.</p>
      </div>

      <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        {!conversations || conversations.length === 0 ? (
          <div className="py-16 text-center text-slate-500">No conversations yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Participant A</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Participant B</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Last Message</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">Unread</th>
                <th className="px-6 py-3 text-left font-medium text-slate-600">View</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {conversations.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{c.a?.display_name || '—'}</p>
                    <p className="text-xs text-slate-500">{c.a?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{c.b?.display_name || '—'}</p>
                    <p className="text-xs text-slate-500">{c.b?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {c.last_message_at ? new Date(c.last_message_at).toLocaleDateString() : new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {unreadMap[c.id] ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">{unreadMap[c.id]} unread</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">All read</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <a href={`/admin/messages/${c.id}`} className="rounded-xl bg-[#3ecf68] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#28a84e]">
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
