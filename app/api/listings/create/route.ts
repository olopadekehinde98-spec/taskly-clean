import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

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

    const { data: profile } = await supabase.from('profiles').select('is_seller, is_admin').eq('id', user.id).single()
    if (!profile?.is_seller && !profile?.is_admin) {
      return NextResponse.json({ error: 'Seller account required' }, { status: 403 })
    }

    const formData = await req.formData()
    const title = String(formData.get('title') || '').trim()
    const categoryId = String(formData.get('category_id') || '').trim()
    const tags = String(formData.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean)
    const short_description = String(formData.get('short_description') || '').trim()

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const slug = `${slugify(title)}-${Date.now()}`

    // Resolve category name for legacy category field
    let categoryName = categoryId
    if (categoryId && categoryId.length > 10) {
      const { data: cat } = await supabase.from('categories').select('name').eq('id', categoryId).single()
      if (cat) categoryName = cat.name
    }

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        seller_id: user.id,
        title,
        slug,
        category_id: categoryId.length > 10 ? categoryId : undefined,
        category: categoryName,
        short_description,
        full_description: short_description,
        tags,
        listing_status: 'draft',
        moderation_status: 'pending',
        visibility_status: 'hidden',
      })
      .select()
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: listingError?.message ?? 'Could not create listing' }, { status: 500 })
    }

    const packages = [
      { listing_id: listing.id, tier: 'basic', package_name: 'basic', title: String(formData.get('basic_title') || '').trim() || 'Basic', description: String(formData.get('basic_includes') || '').trim(), price_usd: moneyToNumber(String(formData.get('basic_price') || '0')), delivery_days: deliveryToDays(String(formData.get('basic_delivery') || '3 days')), revisions: 1 },
      { listing_id: listing.id, tier: 'standard', package_name: 'standard', title: String(formData.get('standard_title') || '').trim() || 'Standard', description: String(formData.get('standard_includes') || '').trim(), price_usd: moneyToNumber(String(formData.get('standard_price') || '0')), delivery_days: deliveryToDays(String(formData.get('standard_delivery') || '5 days')), revisions: 2 },
      { listing_id: listing.id, tier: 'premium', package_name: 'premium', title: String(formData.get('premium_title') || '').trim() || 'Premium', description: String(formData.get('premium_includes') || '').trim(), price_usd: moneyToNumber(String(formData.get('premium_price') || '0')), delivery_days: deliveryToDays(String(formData.get('premium_delivery') || '7 days')), revisions: 3 },
    ]

    const { error: pkgError } = await supabase.from('listing_packages').insert(packages)
    if (pkgError) return NextResponse.json({ error: pkgError.message }, { status: 500 })

    return NextResponse.json({ success: true, listing_id: listing.id, slug: listing.slug })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
