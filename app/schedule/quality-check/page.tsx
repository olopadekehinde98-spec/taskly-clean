import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import QualityCheckClient from './QualityCheckClient'

type Props = { searchParams: Promise<{ id?: string }> }

export default async function QualityCheckPage({ searchParams }: Props) {
  const { id } = await searchParams
  if (!id) redirect('/schedule')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: listing } = await supabase
    .from('listings')
    .select(`
      id, title, slug, description, listing_status,
      categories ( name ),
      listing_packages ( tier, price_usd, delivery_days )
    `)
    .eq('id', id)
    .eq('seller_id', user.id)
    .single()

  if (!listing) notFound()

  const basicPkg = (listing.listing_packages as any[])?.find(p => p.tier === 'basic') ?? (listing.listing_packages as any[])?.[0]

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-purple-600">AI Tools</p>
        <h1 className="text-3xl font-bold text-slate-900">Listing Quality Check</h1>
        <p className="mt-2 text-slate-500">AI-powered feedback to improve your listing and attract more buyers.</p>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Checking</p>
        <h2 className="text-xl font-bold text-slate-900">{listing.title}</h2>
        <p className="text-sm text-slate-500 mt-1">{(listing.categories as any)?.name ?? 'Uncategorized'}</p>
      </div>

      <QualityCheckClient
        listingId={listing.id}
        title={listing.title}
        category={(listing.categories as any)?.name ?? ''}
        description={listing.description ?? ''}
        price={basicPkg?.price_usd ?? 0}
        deliveryDays={basicPkg?.delivery_days ?? 0}
        slug={(listing as any).slug ?? ''}
      />
    </div>
  )
}
