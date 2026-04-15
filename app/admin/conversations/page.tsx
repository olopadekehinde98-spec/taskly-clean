import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminAIConversationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/buyer')

  // Group by session — fetch recent sessions with first/last message
  const { data: raw } = await supabase
    .from('ai_conversations')
    .select('id, user_id, session_id, role, message, feature, created_at, profiles!ai_conversations_user_id_fkey(display_name, email)')
    .order('created_at', { ascending: false })
    .limit(400)

  // Group by session_id
  const sessionMap = new Map<string, any>()
  for (const row of (raw || [])) {
    if (!sessionMap.has(row.session_id)) {
      sessionMap.set(row.session_id, {
        session_id: row.session_id,
        user: row.profiles,
        feature: row.feature,
        first_at: row.created_at,
        messages: [],
      })
    }
    sessionMap.get(row.session_id).messages.push(row)
  }

  const sessions = Array.from(sessionMap.values())
    .sort((a, b) => new Date(b.first_at).getTime() - new Date(a.first_at).getTime())

  const featureLabel: Record<string, string> = {
    support_chat: '💬 Support',
    assist_loop: '🤖 Assist Loop',
    admin_ai: '🔐 Admin AI',
  }

  return (
    <main className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#3ecf68]">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">AI Conversations</h1>
        <p className="mt-1 text-sm text-slate-500">All AI chat sessions across support, assist loop, and admin AI.</p>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="rounded-3xl border bg-white p-12 text-center text-slate-500">No AI conversations yet.</div>
        ) : (
          sessions.map(session => (
            <details key={session.session_id} className="rounded-3xl border bg-white shadow-sm overflow-hidden">
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-[#0d2818] px-3 py-1 text-xs font-medium text-[#3ecf68]">
                    {featureLabel[session.feature] || session.feature}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {(session.user as any)?.display_name || (session.user as any)?.email || 'Unknown user'}
                    </p>
                    <p className="text-xs text-slate-500">{(session.user as any)?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">{new Date(session.first_at).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{session.messages.length} messages</p>
                </div>
              </summary>
              <div className="border-t px-6 py-4 space-y-3 bg-slate-50">
                {[...session.messages].reverse().map((m: any) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === 'user' ? 'bg-[#3ecf68] text-white' : 'bg-white border text-slate-800'
                    }`}>
                      <p className={`mb-1 text-xs font-medium ${m.role === 'user' ? 'text-[#3ecf68]' : 'text-slate-400'}`}>
                        {m.role === 'user' ? 'User' : 'AI'}
                      </p>
                      <p className="leading-5 whitespace-pre-wrap">{m.message}</p>
                      <p className={`mt-1 text-xs ${m.role === 'user' ? 'text-[#3ecf68]' : 'text-slate-400'}`}>
                        {new Date(m.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))
        )}
      </div>
    </main>
  )
}
