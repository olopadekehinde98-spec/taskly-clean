import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OrderForm from './OrderForm'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tier?: string }>
}

export default async function OrderPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { tier } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/order/${slug}`)

  const { data: listing } = await supabase
    .from('listings')
    .select(`
      id, title, slug, short_description, cover_image_url, seller_id,
      listing_status,
      categories(name, icon),
      profiles!listings_seller_id_fkey(id, display_name, username, avatar_url, response_time),
      listing_packages(id, tier, name, price_usd, delivery_days, description, revisions)
    `)
    .eq('slug', slug)
    .eq('listing_status', 'live')
    .single()

  if (!listing) notFound()

  // Can't order your own gig
  if (listing.seller_id === user.id) redirect(`/services/${slug}`)

  const packages: any[] = (listing as any).listing_packages ?? []
  packages.sort((a, b) => {
    const order = { basic: 0, standard: 1, premium: 2 }
    return (order[a.tier as keyof typeof order] ?? 3) - (order[b.tier as keyof typeof order] ?? 3)
  })

  const selectedTier = tier || packages[0]?.tier || 'basic'

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#3ecf68]">Checkout</p>
          <h1 className="text-3xl font-bold text-slate-900">Complete Your Order</h1>
        </div>

        <OrderForm listing={listing as any} packages={packages} selectedTier={selectedTier} userId={user.id} />
      </div>
    </main>
  )
}
