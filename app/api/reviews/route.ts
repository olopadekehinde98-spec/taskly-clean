import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { order_id, rating, title, body } = await req.json()
    if (!order_id || !rating || !body?.trim()) {
      return NextResponse.json({ error: 'order_id, rating, and body required' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })
    }

    // Verify buyer owns this completed order
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_status, seller_id, listing_id')
      .eq('id', order_id)
      .eq('buyer_id', user.id)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.order_status !== 'completed') {
      return NextResponse.json({ error: 'Can only review completed orders' }, { status: 400 })
    }

    // Check for duplicate review
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('order_id', order_id)
      .single()

    if (existing) return NextResponse.json({ error: 'You have already reviewed this order' }, { status: 409 })

    const { error } = await supabase.from('reviews').insert({
      order_id,
      listing_id: order.listing_id,
      reviewer_id: user.id,
      seller_id: order.seller_id,
      rating,
      title: title?.trim() || null,
      body: body.trim(),
      is_public: true,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase.from('notifications').insert({
      user_id: order.seller_id,
      type: 'review',
      title: 'New Review Received',
      body: `A buyer left you a ${rating}-star review. Check your profile to see it.`,
      link: `/dashboard/profile`,
      is_read: false,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
