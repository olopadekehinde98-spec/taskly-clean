import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function moneyToNumber(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, '').trim()
  return cleaned ? Number(cleaned) : 0
}

function deliveryToDays(value: string) {
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : 1
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const listing_id = String(formData.get('listing_id') || '').trim()
    if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 })

    // Verify ownership
    const { data: existing } = await supabase
      .from('listings')
      .select('id, seller_id, listing_status')
      .eq('id', listing_id)
      .eq('seller_id', user.id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    const title = String(formData.get('title') || '').trim()
    const categoryIdRaw = String(formData.get('category_id') || '').trim()
    const tags = String(formData.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean)
    const short_description = String(formData.get('short_description') || '').trim()
    const coverImageUrl = String(formData.get('cover_image') || '').trim()
    const category_id = categoryIdRaw ? parseInt(categoryIdRaw, 10) : null

    const { error: updateError } = await supabase
      .from('listings')
      .update({
        title,
        category_id: category_id && !isNaN(category_id) ? category_id : null,
        short_description,
        full_description: short_description,
        tags,
        cover_image_url: coverImageUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listing_id)
      .eq('seller_id', user.id)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    // Update packages (upsert by tier)
    for (const tier of ['basic', 'standard', 'premium']) {
      const name = String(formData.get(`${tier}_title`) || '').trim() || tier.charAt(0).toUpperCase() + tier.slice(1)
      const price_usd = moneyToNumber(String(formData.get(`${tier}_price`) || '0'))
      const delivery_days = deliveryToDays(String(formData.get(`${tier}_delivery`) || '3 days'))
      const description = String(formData.get(`${tier}_includes`) || '').trim()

      const { data: existing_pkg } = await supabase
        .from('listing_packages')
        .select('id')
        .eq('listing_id', listing_id)
        .eq('tier', tier)
        .single()

      if (existing_pkg) {
        await supabase.from('listing_packages').update({ name, price_usd, delivery_days, description }).eq('id', existing_pkg.id)
      } else {
        await supabase.from('listing_packages').insert({ listing_id, tier, name, price_usd, delivery_days, description, revisions: tier === 'basic' ? 1 : tier === 'standard' ? 2 : 3 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
