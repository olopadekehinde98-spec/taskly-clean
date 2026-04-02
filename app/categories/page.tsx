import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon, description')
    .eq('is_active', true)
    .order('sort_order')

  // Get real listing count per category
  const { data: counts } = await supabase
    .from('listings')
    .select('category_id')
    .eq('listing_status', 'live')

  const countMap: Record<string, number> = {}
  for (const row of counts ?? []) {
    if (row.category_id) countMap[row.category_id] = (countMap[row.category_id] ?? 0) + 1
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
            Marketplace Categories
          </p>
          <h1 className="mb-4 text-4xl font-bold text-slate-900">Explore service categories</h1>
          <p className="max-w-2xl text-slate-600">
            Browse all service categories on TasklyClean and find the right freelancer for your project.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        {!categories || categories.length === 0 ? (
          <div className="rounded-3xl border bg-white p-16 text-center">
            <p className="text-4xl mb-4">📂</p>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No categories yet</h2>
            <p className="text-slate-500 text-sm">Categories will appear here once they are added to the platform.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((cat: any) => {
              const serviceCount = countMap[cat.id] ?? 0
              return (
                <Link
                  key={cat.slug}
                  href={`/services?category=${cat.slug}`}
                  className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                    {cat.icon ?? '💼'}
                  </div>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">{cat.name}</h2>
                    <span className="text-sm text-slate-500">
                      {serviceCount} {serviceCount === 1 ? 'service' : 'services'}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="mb-5 text-sm leading-7 text-slate-600">{cat.description}</p>
                  )}
                  <span className="font-medium text-blue-600">Browse services →</span>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
