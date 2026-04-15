import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    httpClient: Stripe.createFetchHttpClient(),
  })
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata!

    const supabase = await createClient()

    const subtotal = Number(meta.subtotal_cents) / 100
    const platformFee = Math.round(subtotal * 0.10 * 100) / 100
    const sellerNet = Math.round((subtotal - platformFee) * 100) / 100
    const deliveryDays = Number(meta.delivery_days)
    const dueAt = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000).toISOString()

    const { data: order, error } = await supabase.from('orders').insert({
      buyer_id: meta.buyer_id,
      seller_id: meta.seller_id,
      listing_id: meta.listing_id,
      package_id: meta.package_id,
      order_status: 'active',
      payment_status: 'captured',
      currency: 'USD',
      subtotal_amount: subtotal,
      platform_fee_amount: platformFee,
      seller_net_amount: sellerNet,
      requirements_text: meta.requirements_text || null,
      requirements_submitted_at: meta.requirements_text ? new Date().toISOString() : null,
      due_at: dueAt,
      stripe_session_id: session.id,
      stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    }).select('id').single()

    if (error) {
      console.error('Order creation failed:', error.message)
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
    }

    // Notify buyer
    await supabase.from('notifications').insert({
      user_id: meta.buyer_id,
      type: 'order',
      title: 'Order Confirmed',
      body: `Your payment of $${subtotal.toFixed(2)} is held in escrow. The seller will begin work shortly.`,
      link: `/buyer/orders/${order.id}`,
      is_read: false,
    })

    // Notify seller
    await supabase.from('notifications').insert({
      user_id: meta.seller_id,
      type: 'order',
      title: 'New Order Received!',
      body: `You have a new order for "${meta.package_name}". Check your dashboard.`,
      link: `/dashboard/orders/${order.id}`,
      is_read: false,
    })
  }

  return NextResponse.json({ received: true })
}
