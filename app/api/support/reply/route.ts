import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { ticket_id, reply, status, attachments } = await req.json()
    if (!ticket_id || !reply) return NextResponse.json({ error: 'ticket_id and reply required' }, { status: 400 })

    // Fetch existing ticket
    const { data: ticket, error: fetchErr } = await supabase
      .from('support_tickets')
      .select('admin_replies')
      .eq('id', ticket_id)
      .single()

    if (fetchErr) throw fetchErr

    const replies = ticket.admin_replies ?? []
    replies.push({ text: reply, created_at: new Date().toISOString(), attachments: attachments ?? [] })

    const { error } = await supabase
      .from('support_tickets')
      .update({
        admin_replies: replies,
        status: status ?? 'open',
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticket_id)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
