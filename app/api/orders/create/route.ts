import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { listing_id, package_id, requirements_text } = await req.json()
    if (!listing_id || !package_id) return NextResponse.json({ error: 'listing_id and package_id required' }, { status: 400 })

    // Fetch listing + package to get seller and pricing
    const { data: listing } = await supabase
      .from('listings')
      .select('id, seller_id, listing_status')
      .eq('id', listing_id)
      .eq('listing_status', 'live')
      .single()

    if (!listing) return NextResponse.json({ error: 'Listing not found or not live' }, { status: 404 })
    if (listing.seller_id === user.id) return NextResponse.json({ error: 'You cannot order your own listing' }, { status: 400 })

    const { data: pkg } = await supabase
      .from('listing_packages')
      .select('id, tier, price_usd, delivery_days')
      .eq('id', package_id)
      .eq('listing_id', listing_id)
      .single()

    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 })

    const subtotal = Number(pkg.price_usd)
    const platformFeeRate = 0.10  // 10% platform fee
    const platformFeeAmount = Math.round(subtotal * platformFeeRate * 100) / 100
    const sellerNetAmount = Math.round((subtotal - platformFeeAmount) * 100) / 100
    const dueAt = new Date(Date.now() + pkg.delivery_days * 24 * 60 * 60 * 1000).toISOString()

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        seller_id: listing.seller_id,
        listing_id,
        package_id,
        order_status: 'active',
        payment_status: 'pending',
        currency: 'USD',
        subtotal_amount: subtotal,
        platform_fee_amount: platformFeeAmount,
        seller_net_amount: sellerNetAmount,
        requirements_text: requirements_text || null,
        requirements_submitted_at: requirements_text ? new Date().toISOString() : null,
        due_at: dueAt,
      })
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Notify seller
    await supabase.from('notifications').insert({
      user_id: listing.seller_id,
      type: 'order',
      title: 'New Order Received!',
      body: `You have a new order. Requirements have been submitted.`,
      link: `/dashboard/orders/${order.id}`,
      is_read: false,
    })

    // Notify buyer
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'order',
      title: 'Order Placed Successfully',
      body: `Your order has been placed. The seller will begin work shortly.`,
      link: `/buyer/orders/${order.id}`,
      is_read: false,
    })

    return NextResponse.json({ order_id: order.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
