import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      httpClient: Stripe.createFetchHttpClient(),
    })
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: 1000,
          product_data: { name: 'Test' },
        },
      }],
      success_url: 'https://taskly-clean.vercel.app/order/confirmation',
      cancel_url: 'https://taskly-clean.vercel.app',
    })
    return NextResponse.json({ ok: true, url: session.url?.slice(0, 50) + '...' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, type: err.type })
  }
}
