'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GigImageUpload from '@/components/GigImageUpload'

type Package = { id?: string; tier: string; name: string; description: string; price_usd: number; delivery_days: number; revisions: number }
type Category = { id: number; name: string; icon?: string | null }

type Listing = {
  id: string
  title: string
  slug: string
  short_description: string
  cover_image_url: string | null
  listing_status: string
  tags: string[] | null
  category_id: number | null
  categories: { id: number; name: string } | null
  listing_packages: Package[]
}

export default function EditGigForm({ listing, categories }: { listing: Listing; categories: Category[] }) {
  const router = useRouter()
  const [coverImage, setCoverImage] = useState(listing.cover_image_url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const pkgFor = (tier: string): Package =>
    listing.listing_packages?.find(p => p.tier === tier) ?? { tier, name: '', description: '', price_usd: 0, delivery_days: 3, revisions: 1 }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const fd = new FormData(e.currentTarget)
    if (coverImage) fd.set('cover_image', coverImage)
    fd.set('listing_id', listing.id)

    try {
      const res = await fetch('/api/listings/update', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setSuccess('Gig updated successfully!')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Seller Dashboard</p>
        <h1 className="text-3xl font-bold text-slate-900">Edit Gig</h1>
        <p className="mt-1 text-sm text-slate-500">Status: <span className={`font-semibold ${listing.listing_status === 'live' ? 'text-emerald-600' : 'text-amber-600'}`}>{listing.listing_status}</span></p>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Gig Cover Image</label>
              <GigImageUpload value={coverImage} onChange={setCoverImage} />
              <input type="hidden" name="cover_image" value={coverImage} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Gig Title <span className="text-red-500">*</span></label>
              <input
                name="title"
                type="text"
                required
                defaultValue={listing.title}
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                <select
                  name="category_id"
                  defaultValue={listing.category_id ?? ''}
                  className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Tags</label>
                <input
                  name="tags"
                  type="text"
                  defaultValue={(listing.tags ?? []).join(', ')}
                  placeholder="Kindle Formatting, KDP, Ebook Layout"
                  className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 transition-all"
                />
                <p className="mt-1 text-xs text-slate-400">Separate with commas</p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description <span className="text-red-500">*</span></label>
              <textarea
                name="short_description"
                rows={5}
                required
                defaultValue={listing.short_description}
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900">Pricing Packages</h2>
              <div className="grid gap-6 xl:grid-cols-3">
                {(['basic', 'standard', 'premium'] as const).map((tier, idx) => {
                  const pkg = pkgFor(tier)
                  return (
                    <div key={tier} className="rounded-3xl border bg-slate-50 p-5">
                      <h3 className="mb-4 text-lg font-semibold capitalize text-slate-900">{tier}</h3>
                      <div className="space-y-3">
                        <input
                          name={`${tier}_title`}
                          type="text"
                          defaultValue={pkg.name}
                          placeholder={`${tier.charAt(0).toUpperCase() + tier.slice(1)} package title`}
                          className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                        <input
                          name={`${tier}_price`}
                          type="text"
                          defaultValue={pkg.price_usd ? `$${pkg.price_usd}` : ''}
                          placeholder={`Price e.g. $${[30, 50, 80][idx]}`}
                          className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                        <select
                          name={`${tier}_delivery`}
                          defaultValue={`${pkg.delivery_days} day${pkg.delivery_days !== 1 ? 's' : ''}`}
                          className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                        >
                          {['1 day', '2 days', '3 days', '5 days', '7 days', '10 days', '14 days'].map(d => (
                            <option key={d}>{d}</option>
                          ))}
                        </select>
                        <textarea
                          name={`${tier}_includes`}
                          rows={3}
                          defaultValue={pkg.description}
                          placeholder={`What's included in ${tier}?`}
                          className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <a
                href={`/services/${listing.slug}`}
                target="_blank"
                className="rounded-2xl border px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Preview Gig →
              </a>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Ranking Tips</h2>
            <div className="space-y-2 text-sm leading-7 text-slate-600">
              <p>Keep the title clear and keyword-focused.</p>
              <p>Use tags that match what buyers search for.</p>
              <p>Better package variety improves conversion.</p>
              <p>Upload a high-quality cover image.</p>
            </div>
          </div>
          <div className="rounded-3xl border bg-amber-50 p-6">
            <p className="text-sm font-semibold text-amber-800 mb-1">Note on Live Gigs</p>
            <p className="text-xs text-amber-700">Editing a live gig re-submits it for review. It stays live until reviewed.</p>
          </div>
        </aside>
      </div>
    </main>
  )
}
