import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { order_id, revision_title, revision_details } = await req.json()
    if (!order_id || !revision_details?.trim()) {
      return NextResponse.json({ error: 'order_id and revision_details required' }, { status: 400 })
    }

    const { data: order } = await supabase
      .from('orders')
      .select('id, order_status, seller_id, listings(title)')
      .eq('id', order_id)
      .eq('buyer_id', user.id)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.order_status !== 'delivered') {
      return NextResponse.json({ error: 'Can only request revision on a delivered order' }, { status: 400 })
    }

    const { error } = await supabase
      .from('orders')
      .update({
        order_status: 'revision_requested',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .eq('buyer_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const listingTitle = (order.listings as any)?.title ?? 'your service'
    const reason = revision_title ? `${revision_title}: ${revision_details}` : revision_details

    // Persist revision details so the seller can see exactly what needs changing
    await supabase.from('revisions').insert({
      order_id,
      buyer_id: user.id,
      reason,
    })

    await supabase.from('notifications').insert({
      user_id: order.seller_id,
      type: 'order',
      title: 'Revision Requested',
      body: `The buyer has requested a revision for "${listingTitle}". Check your order for details.`,
      link: `/dashboard/orders/${order_id}`,
      is_read: false,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
