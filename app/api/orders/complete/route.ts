import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { order_id } = await req.json()
    if (!order_id) return NextResponse.json({ error: 'order_id required' }, { status: 400 })

    const { data: order } = await supabase
      .from('orders')
      .select('id, order_status, seller_id, listings(title)')
      .eq('id', order_id)
      .eq('buyer_id', user.id)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.order_status !== 'delivered') {
      return NextResponse.json({ error: 'Order must be in delivered state to complete' }, { status: 400 })
    }

    const { error } = await supabase
      .from('orders')
      .update({
        order_status: 'completed',
        payment_status: 'released',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .eq('buyer_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const listingTitle = (order.listings as any)?.title ?? 'your service'

    await supabase.from('notifications').insert({
      user_id: order.seller_id,
      type: 'order',
      title: 'Order Completed!',
      body: `The buyer has accepted the delivery for "${listingTitle}". Payment will be released to your account.`,
      link: `/dashboard/orders/${order_id}`,
      is_read: false,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
