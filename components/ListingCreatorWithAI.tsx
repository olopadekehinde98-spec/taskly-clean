'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = { id: string; name: string; slug: string; icon: string }

type QualityResult = {
  overall_score: number
  scores: {
    title_clarity: number
    description_quality: number
    pricing_competitiveness: number
    niche_fit: number
  }
  strengths: string[]
  improvements: string[]
  rewritten_title: string
  rewritten_description_intro: string
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 10) * 100)
  const color = value >= 7 ? 'bg-emerald-500' : value >= 4 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{value}/10</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function ListingCreatorWithAI({ categories }: { categories: Category[] }) {
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')

  const [basicTitle, setBasicTitle] = useState('')
  const [basicPrice, setBasicPrice] = useState('')
  const [basicDelivery, setBasicDelivery] = useState('3 days')
  const [basicIncludes, setBasicIncludes] = useState('')

  const [standardTitle, setStandardTitle] = useState('')
  const [standardPrice, setStandardPrice] = useState('')
  const [standardDelivery, setStandardDelivery] = useState('5 days')
  const [standardIncludes, setStandardIncludes] = useState('')

  const [premiumTitle, setPremiumTitle] = useState('')
  const [premiumPrice, setPremiumPrice] = useState('')
  const [premiumDelivery, setPremiumDelivery] = useState('7 days')
  const [premiumIncludes, setPremiumIncludes] = useState('')

  // AI state
  const [checking, setChecking] = useState(false)
  const [quality, setQuality] = useState<QualityResult | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const selectedCategory = categories.find(c => c.id === categoryId)

  async function runAICheck() {
    if (!title.trim() || !description.trim()) {
      setAiError('Please fill in at least the title and description before checking.')
      return
    }
    setChecking(true)
    setAiError(null)
    setQuality(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'listing_quality_checker',
          payload: {
            title,
            category: selectedCategory?.name ?? '',
            description,
            price: basicPrice || '0',
            delivery_days: basicDelivery,
          },
        }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setQuality(json.result)
    } catch (err: any) {
      setAiError(err.message ?? 'AI check failed')
    } finally {
      setChecking(false)
    }
  }

  function applyAISuggestions() {
    if (!quality) return
    if (quality.rewritten_title) setTitle(quality.rewritten_title)
    if (quality.rewritten_description_intro) setDescription(quality.rewritten_description_intro)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    const formData = new FormData()
    formData.set('title', title)
    formData.set('category_id', categoryId)
    formData.set('tags', tags)
    formData.set('short_description', description)
    formData.set('basic_title', basicTitle)
    formData.set('basic_price', basicPrice)
    formData.set('basic_delivery', basicDelivery)
    formData.set('basic_includes', basicIncludes)
    formData.set('standard_title', standardTitle)
    formData.set('standard_price', standardPrice)
    formData.set('standard_delivery', standardDelivery)
    formData.set('standard_includes', standardIncludes)
    formData.set('premium_title', premiumTitle)
    formData.set('premium_price', premiumPrice)
    formData.set('premium_delivery', premiumDelivery)
    formData.set('premium_includes', premiumIncludes)

    try {
      const res = await fetch('/api/listings/create', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error ?? 'Failed to create listing')
      router.push('/schedule?success=Listing created successfully')
    } catch (err: any) {
      setSubmitError(err.message ?? 'Failed to create listing')
      setSubmitting(false)
    }
  }

  const scoreColor = (score: number) =>
    score >= 7 ? 'text-emerald-600' : score >= 4 ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
      {/* Listing Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-slate-900">Listing Details</h2>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Listing Title *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                type="text"
                placeholder="I will professionally format your Kindle ebook"
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#dae8df]"
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Category *</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#dae8df]"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                  {categories.length === 0 && (
                    <>
                      <option value="publishing">Publishing</option>
                      <option value="writing">Writing</option>
                      <option value="design">Design</option>
                      <option value="business">Business</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Tags (comma separated)</label>
                <input
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  type="text"
                  placeholder="ebook, formatting, kindle"
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#dae8df]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description *</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe what you offer, who it is for, and what makes the result valuable."
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#dae8df] resize-none"
                required
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-slate-900">Pricing Packages</h2>
          <div className="grid gap-5 xl:grid-cols-3">
            {[
              { label: 'Basic', title: basicTitle, setTitle: setBasicTitle, price: basicPrice, setPrice: setBasicPrice, delivery: basicDelivery, setDelivery: setBasicDelivery, includes: basicIncludes, setIncludes: setBasicIncludes, days: ['1 day','2 days','3 days','5 days'] },
              { label: 'Standard', title: standardTitle, setTitle: setStandardTitle, price: standardPrice, setPrice: setStandardPrice, delivery: standardDelivery, setDelivery: setStandardDelivery, includes: standardIncludes, setIncludes: setStandardIncludes, days: ['2 days','3 days','5 days','7 days'] },
              { label: 'Premium', title: premiumTitle, setTitle: setPremiumTitle, price: premiumPrice, setPrice: setPremiumPrice, delivery: premiumDelivery, setDelivery: setPremiumDelivery, includes: premiumIncludes, setIncludes: setPremiumIncludes, days: ['3 days','5 days','7 days','10 days'] },
            ].map(pkg => (
              <div key={pkg.label} className="rounded-2xl border bg-slate-50 p-5 space-y-3">
                <h3 className="font-semibold text-slate-900">{pkg.label}</h3>
                <input
                  value={pkg.title}
                  onChange={e => pkg.setTitle(e.target.value)}
                  type="text"
                  placeholder={`${pkg.label} package title`}
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none"
                />
                <input
                  value={pkg.price}
                  onChange={e => pkg.setPrice(e.target.value)}
                  type="text"
                  placeholder="$30"
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none"
                />
                <select
                  value={pkg.delivery}
                  onChange={e => pkg.setDelivery(e.target.value)}
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none"
                >
                  {pkg.days.map(d => <option key={d}>{d}</option>)}
                </select>
                <textarea
                  value={pkg.includes}
                  onChange={e => pkg.setIncludes(e.target.value)}
                  rows={3}
                  placeholder="What's included?"
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none resize-none"
                />
              </div>
            ))}
          </div>
        </section>

        {submitError && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-[#edfbf2] px-6 py-3 font-medium text-white disabled:opacity-50 hover:bg-[#edfbf2] transition-colors"
          >
            {submitting ? 'Saving...' : 'Save Listing'}
          </button>
          <button
            type="button"
            onClick={runAICheck}
            disabled={checking}
            className="rounded-2xl border border-purple-300 bg-purple-50 px-6 py-3 font-medium text-purple-700 disabled:opacity-50 hover:bg-purple-100 transition-colors"
          >
            {checking ? 'Checking...' : '✨ AI Quality Check'}
          </button>
        </div>
      </form>

      {/* AI Quality Panel */}
      <aside className="space-y-5">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-slate-900">AI Quality Checker</h2>
          <p className="text-sm text-slate-500 mb-4">
            Click <strong>AI Quality Check</strong> to score your listing and get improvement suggestions before publishing.
          </p>

          {aiError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
              {aiError}
            </div>
          )}

          {checking && (
            <div className="rounded-2xl bg-purple-50 p-6 text-center">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-sm text-purple-700 font-medium">Analyzing your listing...</p>
            </div>
          )}

          {quality && !checking && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-slate-50 p-5 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Overall Score</p>
                <p className={`text-5xl font-bold ${scoreColor(quality.overall_score)}`}>
                  {quality.overall_score}<span className="text-2xl text-slate-400">/10</span>
                </p>
              </div>

              <div className="space-y-3">
                <ScoreBar label="Title Clarity" value={quality.scores.title_clarity} />
                <ScoreBar label="Description Quality" value={quality.scores.description_quality} />
                <ScoreBar label="Pricing" value={quality.scores.pricing_competitiveness} />
                <ScoreBar label="Niche Fit" value={quality.scores.niche_fit} />
              </div>

              {quality.strengths.length > 0 && (
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Strengths</p>
                  <ul className="space-y-1">
                    {quality.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-emerald-800 flex gap-2"><span>✓</span><span>{s}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {quality.improvements.length > 0 && (
                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Improvements</p>
                  <ul className="space-y-1">
                    {quality.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-amber-800 flex gap-2"><span>→</span><span>{s}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {(quality.rewritten_title || quality.rewritten_description_intro) && (
                <div className="rounded-2xl bg-[#edfbf2] p-4 space-y-3">
                  <p className="text-xs font-semibold text-[#3ecf68] uppercase tracking-wide">AI Suggestions</p>
                  {quality.rewritten_title && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Suggested Title:</p>
                      <p className="text-sm font-medium text-slate-900">{quality.rewritten_title}</p>
                    </div>
                  )}
                  {quality.rewritten_description_intro && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Suggested Intro:</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{quality.rewritten_description_intro}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={applyAISuggestions}
                    className="w-full rounded-xl bg-[#edfbf2] px-4 py-2 text-sm font-medium text-white hover:bg-[#edfbf2] transition-colors"
                  >
                    Apply AI Suggestions
                  </button>
                </div>
              )}
            </div>
          )}

          {!quality && !checking && !aiError && (
            <div className="rounded-2xl bg-slate-50 p-6 text-center space-y-2">
              <div className="text-3xl">🎯</div>
              <p className="text-sm text-slate-500">Your AI quality score will appear here</p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Tips for a great listing</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2"><span className="text-[#3ecf68]">•</span> Use specific, searchable keywords in your title</li>
            <li className="flex gap-2"><span className="text-[#3ecf68]">•</span> Explain your process and what buyers receive</li>
            <li className="flex gap-2"><span className="text-[#3ecf68]">•</span> Price competitively for your niche</li>
            <li className="flex gap-2"><span className="text-[#3ecf68]">•</span> Aim for an AI score of 7+ before publishing</li>
          </ul>
        </div>
      </aside>
    </div>
  )
}
