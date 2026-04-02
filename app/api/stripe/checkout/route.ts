import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { listingId, packageIndex, projectTitle, requirements } = await req.json()

    if (!listingId || packageIndex === undefined) {
      return NextResponse.json({ error: 'Missing listingId or packageIndex' }, { status: 400 })
    }

    // Fetch listing from DB
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*, profiles(id, display_name, email)')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Get the selected package — listings store packages as JSON array
    const packages = listing.packages ?? []
    const pkg = packages[packageIndex]
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

    const priceInCents = Math.round(Number(pkg.price) * 100)
    const buyerFeeInCents = Math.round(priceInCents * 0.05)
    const totalInCents = priceInCents + buyerFeeInCents

    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: totalInCents,
            product_data: {
              name: listing.title,
              description: `${pkg.name} package · Delivery: ${pkg.delivery_days} days`,
            },
          },
        },
      ],
      metadata: {
        buyer_id: user.id,
        seller_id: (listing.profiles as any)?.id ?? listing.seller_id,
        listing_id: listingId,
        package_index: String(packageIndex),
        package_name: pkg.name,
        price_cents: String(priceInCents),
        buyer_fee_cents: String(buyerFeeInCents),
        total_cents: String(totalInCents),
        project_title: projectTitle ?? '',
        requirements: (requirements ?? '').slice(0, 500),
      },
      customer_email: user.email,
      success_url: `${origin}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/services/${listing.slug}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
