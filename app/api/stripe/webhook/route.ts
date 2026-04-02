import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })

export async function POST(req: NextRequest) {
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

    // Create the order in escrow
    const { data: order, error } = await supabase.from('orders').insert({
      buyer_id: meta.buyer_id,
      seller_id: meta.seller_id,
      listing_id: meta.listing_id,
      package_name: meta.package_name,
      project_title: meta.project_title,
      requirements: meta.requirements,
      price: Number(meta.price_cents) / 100,
      buyer_fee: Number(meta.buyer_fee_cents) / 100,
      total_paid: Number(meta.total_cents) / 100,
      status: 'active',
      payment_status: 'escrowed',
      stripe_session_id: session.id,
      stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    }).select().single()

    if (error) {
      console.error('Order creation failed:', error.message)
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
    }

    // Notify buyer
    await supabase.from('notifications').insert({
      user_id: meta.buyer_id,
      type: 'order',
      title: 'Order Confirmed',
      message: `Your order for "${meta.project_title || meta.package_name}" has been placed and payment is held in escrow.`,
      read: false,
    })

    // Notify seller
    await supabase.from('notifications').insert({
      user_id: meta.seller_id,
      type: 'order',
      title: 'New Order Received',
      message: `You have a new order: "${meta.project_title || meta.package_name}". Check your orders dashboard.`,
      read: false,
    })
  }

  return NextResponse.json({ received: true })
}
