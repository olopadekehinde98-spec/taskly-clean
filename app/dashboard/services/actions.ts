'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function moneyToNumber(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, '').trim()
  return cleaned ? Number(cleaned) : 0
}

function deliveryToDays(value: string) {
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : 1
}

function splitTags(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function createGig(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/error?message=You must be logged in to create a gig')
  }

  const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('id, is_seller, email, username')
  .eq('id', user.id)
  .maybeSingle()

  if (profileError || !profile) {
    redirect(`/error?message=${encodeURIComponent(profileError?.message || 'Profile not found')}`)
  }

  if (!profile.is_seller) {
    redirect('/error?message=Your account is not seller-enabled yet')
  }

  const title = String(formData.get('title') || '').trim()
  const category = String(formData.get('category') || '').trim()
  const tags = splitTags(String(formData.get('tags') || ''))
  const short_description = String(formData.get('short_description') || '').trim()

  if (!title || !category) {
    redirect('/error?message=Title and category are required')
  }

  const baseSlug = slugify(title)
  const slug = `${baseSlug}-${Date.now()}`

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .insert({
      seller_id: user.id,
      title,
      slug,
      category,
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
    redirect(`/error?message=${encodeURIComponent(listingError?.message || 'Could not create listing row')}`)
  }

  const packages = [
    {
      listing_id: listing.id,
      package_name: 'basic',
      title: String(formData.get('basic_title') || '').trim() || 'Basic Package',
      description: String(formData.get('basic_includes') || '').trim(),
      price: moneyToNumber(String(formData.get('basic_price') || '0')),
      delivery_days: deliveryToDays(String(formData.get('basic_delivery') || '1 day')),
      revisions: 1,
    },
    {
      listing_id: listing.id,
      package_name: 'standard',
      title: String(formData.get('standard_title') || '').trim() || 'Standard Package',
      description: String(formData.get('standard_includes') || '').trim(),
      price: moneyToNumber(String(formData.get('standard_price') || '0')),
      delivery_days: deliveryToDays(String(formData.get('standard_delivery') || '2 days')),
      revisions: 2,
    },
    {
      listing_id: listing.id,
      package_name: 'premium',
      title: String(formData.get('premium_title') || '').trim() || 'Premium Package',
      description: String(formData.get('premium_includes') || '').trim(),
      price: moneyToNumber(String(formData.get('premium_price') || '0')),
      delivery_days: deliveryToDays(String(formData.get('premium_delivery') || '3 days')),
      revisions: 3,
    },
  ]

  const { error: packageError } = await supabase
    .from('listing_packages')
    .insert(packages)

  if (packageError) {
    redirect(`/error?message=${encodeURIComponent(packageError.message)}`)
  }

  revalidatePath('/dashboard/services')
  redirect('/dashboard/services?success=Gig created successfully')
}

export async function updateGig(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/error?message=You must be logged in to update a gig')
  }

  const listingId = String(formData.get('listing_id') || '').trim()
  const slug = String(formData.get('slug') || '').trim()
  const title = String(formData.get('title') || '').trim()
  const category = String(formData.get('category') || '').trim()
  const tags = splitTags(String(formData.get('tags') || ''))
  const description = String(formData.get('description') || '').trim()
  const status = String(formData.get('status') || 'draft').trim().toLowerCase()

  const allowedStatus = ['draft', 'in_review', 'live', 'paused', 'denied', 'removed']
  const listingStatus = allowedStatus.includes(status) ? status : 'draft'
  const visibilityStatus = listingStatus === 'live' ? 'visible' : 'hidden'

  const { error: listingError } = await supabase
    .from('listings')
    .update({
      title,
      category,
      tags,
      short_description: description,
      full_description: description,
      listing_status: listingStatus,
      visibility_status: visibilityStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .eq('seller_id', user.id)

  if (listingError) {
    redirect(`/error?message=${encodeURIComponent(listingError.message)}`)
  }

  const packageUpdates = [
    {
      package_name: 'basic',
      title: String(formData.get('basic_title') || '').trim(),
      description: String(formData.get('basic_includes') || '').trim(),
      price: moneyToNumber(String(formData.get('basic_price') || '0')),
      delivery_days: deliveryToDays(String(formData.get('basic_delivery') || '1 day')),
    },
    {
      package_name: 'standard',
      title: String(formData.get('standard_title') || '').trim(),
      description: String(formData.get('standard_includes') || '').trim(),
      price: moneyToNumber(String(formData.get('standard_price') || '0')),
      delivery_days: deliveryToDays(String(formData.get('standard_delivery') || '2 days')),
    },
    {
      package_name: 'premium',
      title: String(formData.get('premium_title') || '').trim(),
      description: String(formData.get('premium_includes') || '').trim(),
      price: moneyToNumber(String(formData.get('premium_price') || '0')),
      delivery_days: deliveryToDays(String(formData.get('premium_delivery') || '3 days')),
    },
  ]

  for (const pkg of packageUpdates) {
    const { error } = await supabase
      .from('listing_packages')
      .update({
        title: pkg.title,
        description: pkg.description,
        price: pkg.price,
        delivery_days: pkg.delivery_days,
        updated_at: new Date().toISOString(),
      })
      .eq('listing_id', listingId)
      .eq('package_name', pkg.package_name)

    if (error) {
      redirect(`/error?message=${encodeURIComponent(error.message)}`)
    }
  }

  revalidatePath('/dashboard/services')
  revalidatePath(`/dashboard/services/${slug}`)
  revalidatePath(`/services/${slug}`)
  redirect(`/dashboard/services/${slug}?success=Gig updated successfully`)
}