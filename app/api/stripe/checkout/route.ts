import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    httpClient: Stripe.createFetchHttpClient(),
  })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { listing_id, package_id, requirements_text } = await req.json()
    if (!listing_id || !package_id) {
      return NextResponse.json({ error: 'listing_id and package_id required' }, { status: 400 })
    }

    // Fetch listing
    const { data: listing } = await supabase
      .from('listings')
      .select('id, title, slug, seller_id, listing_status')
      .eq('id', listing_id)
      .eq('listing_status', 'live')
      .single()

    if (!listing) return NextResponse.json({ error: 'Listing not found or not live' }, { status: 404 })
    if (listing.seller_id === user.id) return NextResponse.json({ error: 'Cannot order your own listing' }, { status: 400 })

    // Fetch package
    const { data: pkg } = await supabase
      .from('listing_packages')
      .select('id, tier, name, price_usd, delivery_days')
      .eq('id', package_id)
      .eq('listing_id', listing_id)
      .single()

    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

    const subtotalCents = Math.round(Number(pkg.price_usd) * 100)
    const buyerFeeCents = Math.round(subtotalCents * 0.05)
    const totalCents = subtotalCents + buyerFeeCents

    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taskly-clean.vercel.app'

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: totalCents,
            product_data: {
              name: listing.title,
              description: `${pkg.name} package · ${pkg.delivery_days}-day delivery`,
            },
          },
        },
      ],
      metadata: {
        buyer_id: user.id,
        seller_id: listing.seller_id,
        listing_id,
        package_id,
        package_tier: pkg.tier,
        package_name: pkg.name,
        subtotal_cents: String(subtotalCents),
        buyer_fee_cents: String(buyerFeeCents),
        total_cents: String(totalCents),
        delivery_days: String(pkg.delivery_days),
        requirements_text: (requirements_text ?? '').slice(0, 500),
      },
      customer_email: user.email ?? undefined,
      success_url: `${origin}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/services/${listing.slug}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err.message, err.type)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
