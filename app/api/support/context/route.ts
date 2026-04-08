import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ context: null })

    const [{ data: orders }, { data: tickets }, { data: profile }] = await Promise.all([
      supabase
        .from('orders')
        .select('id, order_status, subtotal_amount, created_at, listings(title)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('support_tickets')
        .select('ticket_number, summary, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('profiles')
        .select('display_name, is_seller')
        .eq('id', user.id)
        .single(),
    ])

    const contextLines: string[] = [
      `User: ${profile?.display_name ?? user.email} (${profile?.is_seller ? 'Buyer & Seller' : 'Buyer'})`,
    ]

    if (orders?.length) {
      contextLines.push(`\nRecent orders (${orders.length}):`)
      orders.forEach(o => {
        const title = (o.listings as any)?.title ?? 'Unknown service'
        contextLines.push(`- Order ${o.id.slice(0, 8).toUpperCase()}: "${title}" · Status: ${o.order_status} · $${Number(o.subtotal_amount).toFixed(2)} · ${new Date(o.created_at).toLocaleDateString()}`)
      })
    } else {
      contextLines.push('\nNo orders yet.')
    }

    if (tickets?.length) {
      contextLines.push(`\nSupport tickets:`)
      tickets.forEach(t => {
        contextLines.push(`- ${t.ticket_number ?? 'TKT'}: "${t.summary}" · Status: ${t.status} · ${new Date(t.created_at).toLocaleDateString()}`)
      })
    }

    return NextResponse.json({ context: contextLines.join('\n') })
  } catch {
    return NextResponse.json({ context: null })
  }
}
