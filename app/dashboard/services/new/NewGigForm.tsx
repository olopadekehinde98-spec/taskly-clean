'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GigImageUpload from '@/components/GigImageUpload'

type Category = { id: number; name: string; icon: string | null }

export default function NewGigForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [coverImage, setCoverImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    if (coverImage) fd.set('cover_image', coverImage)

    try {
      const res = await fetch('/api/listings/create', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      router.push('/dashboard/services?success=Gig created and sent for review')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#3ecf68]">Seller Dashboard</p>
        <h1 className="text-3xl font-bold text-slate-900">Create New Gig</h1>
        <p className="mt-1 text-sm text-slate-500">Your gig will be reviewed by our team before going live.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

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
                placeholder="I will format your Kindle ebook professionally"
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-[#3ecf68] focus:ring-2 focus:ring-[#3ecf68]/20 transition-all"
              />
              <p className="mt-1 text-xs text-slate-400">Start with "I will..." for best results</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Category <span className="text-red-500">*</span></label>
                <select
                  name="category_id"
                  required
                  className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-[#3ecf68] bg-white"
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
                  placeholder="Kindle Formatting, KDP, Ebook Layout"
                  className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-[#3ecf68] focus:ring-2 focus:ring-[#3ecf68]/20 transition-all"
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
                placeholder="Describe what you offer, who it is for, and what makes the result valuable."
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-[#3ecf68] focus:ring-2 focus:ring-[#3ecf68]/20 transition-all"
              />
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900">Pricing Packages</h2>
              <div className="grid gap-6 xl:grid-cols-3">
                {(['basic', 'standard', 'premium'] as const).map((tier, idx) => (
                  <div key={tier} className="rounded-3xl border bg-slate-50 p-5">
                    <h3 className="mb-4 text-lg font-semibold capitalize text-slate-900">{tier}</h3>
                    <div className="space-y-3">
                      <input
                        name={`${tier}_title`}
                        type="text"
                        placeholder={`${tier.charAt(0).toUpperCase() + tier.slice(1)} package title`}
                        className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-[#3ecf68]"
                      />
                      <input
                        name={`${tier}_price`}
                        type="text"
                        placeholder={`Price e.g. $${[30, 50, 80][idx]}`}
                        className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-[#3ecf68]"
                      />
                      <select
                        name={`${tier}_delivery`}
                        className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-[#3ecf68]"
                      >
                        {['1 day', '2 days', '3 days', '5 days', '7 days', '10 days', '14 days'].slice(idx).map(d => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                      <textarea
                        name={`${tier}_includes`}
                        rows={3}
                        placeholder={`What's included in ${tier}?`}
                        className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-[#3ecf68]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r [#3ecf68] px-8 py-3 font-semibold text-white hover:from-[#3ecf68] hover:to-[#163522] transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Submit for Review →'}
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-slate-900">💡 Tips</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>✅ Upload a high-quality cover image</li>
              <li>✅ Use a clear, specific title starting with "I will..."</li>
              <li>✅ Describe exactly what buyers receive</li>
              <li>✅ Set competitive pricing in each package</li>
              <li>✅ Gigs go through moderation before going live</li>
            </ul>
          </div>
          <div className="rounded-3xl border bg-[#edfbf2] p-6">
            <h2 className="mb-2 text-sm font-bold text-[#3ecf68]">⏱ Review Time</h2>
            <p className="text-sm text-[#28a84e]">Most gigs are reviewed within 24 hours. You'll get notified when it goes live.</p>
          </div>
        </aside>
      </div>
    </main>
  )
}
