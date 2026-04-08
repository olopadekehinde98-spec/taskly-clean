import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { ticket_id, message } = await req.json()
    if (!ticket_id || !message?.trim()) {
      return NextResponse.json({ error: 'ticket_id and message required' }, { status: 400 })
    }

    // Verify ticket belongs to this user
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('id, thread, status, user_id, ticket_number')
      .eq('id', ticket_id)
      .eq('user_id', user.id)
      .single()

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    if (ticket.status === 'resolved') {
      return NextResponse.json({ error: 'This ticket is resolved. Please open a new ticket.' }, { status: 400 })
    }

    const thread = (ticket.thread as any[]) ?? []
    thread.push({ role: 'buyer', text: message.trim(), created_at: new Date().toISOString() })

    const { error } = await supabase
      .from('support_tickets')
      .update({ thread, status: 'open', updated_at: new Date().toISOString() })
      .eq('id', ticket_id)

    if (error) throw error

    // Notify all admins
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true)

    if (admins?.length) {
      await supabase.from('notifications').insert(
        admins.map(a => ({
          user_id: a.id,
          type: 'support',
          title: 'Buyer Reply on Support Ticket',
          body: `A buyer replied to ticket ${ticket.ticket_number ?? ticket_id.slice(0, 8)}. Check admin support.`,
          link: '/admin/support',
          is_read: false,
        }))
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
