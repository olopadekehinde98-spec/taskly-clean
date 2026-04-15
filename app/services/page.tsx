import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ search?: string; category?: string }> }) {
  const { search, category } = await searchParams
  const supabase = await createClient()

  const { data: categories } = await supabase.from("categories").select("id, name, slug, icon").eq("is_active", true).order("sort_order")

  let query = supabase.from("listings").select(`id, title, slug, short_description, cover_image_url, average_rating, total_reviews, listing_packages ( price_usd, tier ), profiles ( display_name, avatar_url, trust_tier ), categories ( name, icon )`).eq("listing_status", "live").order("total_orders", { ascending: false })

  if (search) query = query.ilike("title", `%${search}%`)
  if (category) {
    const cat = categories?.find(c => c.slug === category)
    if (cat) query = query.eq("category_id", cat.id)
  }

  const { data: listings } = await query.limit(48)

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold text-slate-900">{search ? `Results for "${search}"` : "All Services"}</h1>
          <p className="mt-1 text-slate-500 text-sm">{listings?.length ?? 0} services available</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="rounded-2xl bg-white border p-4">
            <h3 className="mb-3 font-semibold text-slate-900 text-sm">Categories</h3>
            <ul className="space-y-1">
              <li><Link href="/services" className={`block rounded-xl px-3 py-2 text-sm ${!category ? "bg-[#edfbf2] text-[#3ecf68] font-medium" : "text-slate-600 hover:bg-slate-50"}`}>All Categories</Link></li>
              {categories?.map(cat => (
                <li key={cat.id}><Link href={`/services?category=${cat.slug}`} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${category === cat.slug ? "bg-[#edfbf2] text-[#3ecf68] font-medium" : "text-slate-600 hover:bg-slate-50"}`}><span>{cat.icon}</span><span>{cat.name}</span></Link></li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="flex-1">
          {!listings?.length ? (
            <div className="rounded-2xl bg-white border p-16 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-slate-900">No services found</h3>
              <p className="mt-1 text-sm text-slate-500">{search ? `No results for "${search}"` : "No services yet."}</p>
              <Link href="/services" className="mt-4 inline-block rounded-xl bg-[#3ecf68] px-5 py-2 text-sm text-white">Browse all</Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing: any) => {
                const pkg = listing.listing_packages?.find((p: any) => p.tier === "basic") ?? listing.listing_packages?.[0]
                return (
                  <Link key={listing.id} href={`/services/${listing.slug ?? listing.id}`} className="group rounded-2xl bg-white border overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-[#3ecf68] to-[#163522] overflow-hidden">
                      {listing.cover_image_url ? <img src={listing.cover_image_url} alt={listing.title} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-4xl">{listing.categories?.icon ?? "💼"}</div>}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-7 w-7 rounded-full bg-[#edfbf2] flex items-center justify-center text-xs font-bold text-white">{(listing.profiles?.display_name ?? "S")[0].toUpperCase()}</div>
                        <span className="text-xs text-slate-500">{listing.profiles?.display_name ?? "Seller"}</span>
                        {listing.profiles?.trust_tier === "top" && <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Top Seller</span>}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2">{listing.title}</h3>
                      {listing.total_reviews > 0 && <div className="flex items-center gap-1 mb-3"><span className="text-amber-400 text-xs">★</span><span className="text-xs font-semibold">{Number(listing.average_rating).toFixed(1)}</span><span className="text-xs text-slate-400">({listing.total_reviews})</span></div>}
                      <div className="flex items-center justify-between border-t pt-3 mt-3">
                        <span className="text-xs text-slate-400">Starting at</span>
                        <span className="text-sm font-bold text-slate-900">${Number(pkg?.price_usd ?? 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
