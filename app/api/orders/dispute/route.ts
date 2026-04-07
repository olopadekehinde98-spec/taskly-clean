import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { order_id, issue_type, description, requested_outcome } = await req.json()
    if (!order_id || !issue_type || !description?.trim()) {
      return NextResponse.json({ error: 'order_id, issue_type, and description required' }, { status: 400 })
    }

    // Verify this user is buyer or seller of the order
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_status, buyer_id, seller_id, listings(title)')
      .eq('id', order_id)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (['completed', 'cancelled', 'disputed'].includes(order.order_status)) {
      return NextResponse.json({ error: 'Cannot open dispute on this order' }, { status: 400 })
    }

    // Insert dispute
    const { error: disputeError } = await supabase
      .from('disputes')
      .insert({
        order_id,
        opened_by: user.id,
        issue_type,
        description,
        requested_outcome: requested_outcome || null,
        status: 'open',
      })

    if (disputeError) return NextResponse.json({ error: disputeError.message }, { status: 500 })

    // Mark order as disputed
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        order_status: 'disputed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)

    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

    const listingTitle = (order.listings as any)?.title ?? 'an order'
    const otherUserId = user.id === order.buyer_id ? order.seller_id : order.buyer_id

    await supabase.from('notifications').insert({
      user_id: otherUserId,
      type: 'order',
      title: 'Dispute Opened',
      body: `A dispute has been opened on "${listingTitle}". Our team will review it shortly.`,
      link: user.id === order.buyer_id ? `/dashboard/orders/${order_id}` : `/buyer/orders/${order_id}`,
      is_read: false,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
