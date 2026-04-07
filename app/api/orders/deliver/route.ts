import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { order_id, delivery_note, attachment_urls } = body
    if (!order_id) return NextResponse.json({ error: 'order_id required' }, { status: 400 })

    // Verify this order belongs to the seller and is in a deliverable state
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_status, buyer_id, listings(title)')
      .eq('id', order_id)
      .eq('seller_id', user.id)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (!['active', 'revision_requested'].includes(order.order_status)) {
      return NextResponse.json({ error: 'Order is not in a deliverable state' }, { status: 400 })
    }

    const { error } = await supabase
      .from('orders')
      .update({
        order_status: 'delivered',
        delivery_note: delivery_note || null,
        attachment_urls: attachment_urls?.length ? attachment_urls : null,
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .eq('seller_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const listingTitle = (order.listings as any)?.title ?? 'your service'

    await supabase.from('notifications').insert({
      user_id: order.buyer_id,
      type: 'order',
      title: 'Delivery Ready for Review',
      body: `The seller has delivered "${listingTitle}". Please review and accept the delivery.`,
      link: `/buyer/orders/${order_id}`,
      is_read: false,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
