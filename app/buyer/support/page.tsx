import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'My Support Tickets — TasklyClean' }

export default async function BuyerSupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Support</p>
        <h1 className="text-3xl font-bold text-slate-900">My Support Tickets</h1>
        <p className="mt-1 text-sm text-slate-500">
          These are tickets created from your support chat conversations. Admin replies will appear here.
        </p>
      </div>

      {!tickets || tickets.length === 0 ? (
        <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">
          <p className="text-4xl mb-4">💬</p>
          <p className="text-lg font-semibold text-slate-900 mb-2">No support tickets yet</p>
          <p className="text-sm text-slate-500">Use the Support Chat button at the bottom of any page to get help. Tickets are created automatically when you need human support.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">
                      {ticket.ticket_number ?? 'TKT'}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      ticket.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{ticket.summary}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(ticket.created_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Original messages */}
              {Array.isArray(ticket.conversation) && ticket.conversation.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Conversation</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto rounded-2xl bg-slate-50 p-3">
                    {ticket.conversation.map((msg: any, i: number) => (
                      <div key={i} className={`text-xs p-2 rounded-xl ${msg.role === 'user' ? 'bg-blue-50 text-blue-800' : 'bg-white text-slate-700 border'}`}>
                        <span className="font-semibold capitalize">{msg.role}: </span>{msg.content}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin replies */}
              {Array.isArray(ticket.admin_replies) && ticket.admin_replies.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Admin Replies</p>
                  {ticket.admin_replies.map((r: any, i: number) => (
                    <div key={i} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-sm text-slate-800">{r.text}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(r.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {(!ticket.admin_replies || ticket.admin_replies.length === 0) && ticket.status !== 'resolved' && (
                <div className="rounded-2xl bg-slate-50 border px-4 py-3">
                  <p className="text-xs text-slate-500">Waiting for admin reply. You will receive a notification when they respond.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
