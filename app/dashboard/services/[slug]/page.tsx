import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditGigForm from './EditGigForm'

type Props = { params: Promise<{ slug: string }> }

export default async function EditServicePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listing } = await supabase
    .from('listings')
    .select(`
      id, title, slug, short_description, cover_image_url, listing_status, tags, category_id,
      categories(id, name),
      listing_packages(id, tier, name, description, price_usd, delivery_days, revisions)
    `)
    .eq('slug', slug)
    .eq('seller_id', user.id)
    .single()

  if (!listing) notFound()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, icon')
    .order('name')

  return <EditGigForm listing={listing as any} categories={categories ?? []} />
}
