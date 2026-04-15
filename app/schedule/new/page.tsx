import { createClient } from '@/lib/supabase/server'
import { ListingCreatorWithAI } from '@/components/ListingCreatorWithAI'

export default async function NewScheduleListingPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#3ecf68]">Listing Studio</p>
        <h1 className="text-3xl font-bold text-slate-900">Create New Listing</h1>
        <p className="mt-1 text-slate-500 text-sm">Use the AI quality checker to score and improve your listing before publishing.</p>
      </div>
      <ListingCreatorWithAI categories={categories ?? []} />
    </div>
  )
}
