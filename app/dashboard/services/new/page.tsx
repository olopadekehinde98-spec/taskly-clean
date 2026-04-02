'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GigImageUpload from '@/components/GigImageUpload'

export default function NewServicePage() {
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
      router.push('/dashboard/services?success=Gig created successfully')
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
        <h1 className="text-3xl font-bold text-slate-900">Create New Gig</h1>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Cover Image */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Gig Cover Image</label>
              <GigImageUpload value={coverImage} onChange={setCoverImage} />
              <input type="hidden" name="cover_image" value={coverImage} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Gig Title</label>
              <input
                name="title"
                type="text"
                required
                placeholder="I will format your Kindle ebook professionally"
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                <select name="category" className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500">
                  <option>Publishing</option>
                  <option>Business</option>
                  <option>Writing</option>
                  <option>Design</option>
                  <option>Web & Tech</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Tags</label>
                <input
                  name="tags"
                  type="text"
                  placeholder="Kindle Formatting, KDP, Ebook Layout"
                  className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="short_description"
                rows={5}
                required
                placeholder="Describe what you offer, who it is for, and what makes the result valuable."
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900">Pricing Packages</h2>
              <div className="grid gap-6 xl:grid-cols-3">
                {(['basic', 'standard', 'premium'] as const).map((tier, idx) => (
                  <div key={tier} className="rounded-3xl border bg-slate-50 p-5">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900 capitalize">{tier}</h3>
                    <div className="space-y-4">
                      <input name={`${tier}_title`} type="text" placeholder={`${tier} package title`} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-blue-500" />
                      <input name={`${tier}_price`} type="text" placeholder={`$${[30, 50, 80][idx]}`} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-blue-500" />
                      <select name={`${tier}_delivery`} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-blue-500">
                        {['1 day','2 days','3 days','5 days','7 days','10 days'].slice(idx).map(d => <option key={d}>{d}</option>)}
                      </select>
                      <textarea name={`${tier}_includes`} rows={4} placeholder={`What is included in ${tier}?`} className="w-full rounded-2xl border bg-white px-4 py-3 outline-none focus:border-blue-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Gig →'}
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-slate-900">💡 Tips</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>✅ Upload a high-quality cover image — it increases clicks</li>
              <li>✅ Use a clear, specific title</li>
              <li>✅ Describe exactly what buyers receive</li>
              <li>✅ Gigs go through a quick moderation review before going live</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  )
}
