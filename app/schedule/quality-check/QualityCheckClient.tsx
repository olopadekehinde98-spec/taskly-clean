'use client'

import { useState } from 'react'
import Link from 'next/link'

type ScoreKey = 'title_clarity' | 'description_quality' | 'pricing_competitiveness' | 'niche_fit'

type Result = {
  overall_score: number
  scores: Record<ScoreKey, number>
  strengths: string[]
  improvements: string[]
  rewritten_title: string
  rewritten_description_intro: string
}

const SCORE_LABELS: Record<ScoreKey, string> = {
  title_clarity: 'Title Clarity',
  description_quality: 'Description Quality',
  pricing_competitiveness: 'Pricing',
  niche_fit: 'Niche Fit',
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={`font-bold ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

export default function QualityCheckClient({
  listingId, title, category, description, price, deliveryDays, slug,
}: {
  listingId: string
  title: string
  category: string
  description: string
  price: number
  deliveryDays: number
  slug: string
}) {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function runCheck() {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'listing_quality_checker',
          payload: { title, category, description, price, delivery_days: deliveryDays },
        }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResult(data.result)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const overallColor = result
    ? result.overall_score >= 80 ? 'text-emerald-600' : result.overall_score >= 60 ? 'text-amber-600' : 'text-red-600'
    : ''

  return (
    <div className="space-y-6">
      {!result && !loading && (
        <div className="rounded-3xl border bg-white p-8 shadow-sm text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to analyse your listing</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            Our AI will score your listing across 4 dimensions and give you specific suggestions to improve it.
          </p>
          <button
            onClick={runCheck}
            className="rounded-2xl bg-gradient-to-r from-purple-600 to-[#163522] px-8 py-3 font-semibold text-white hover:from-purple-700 hover:to-[#163522] transition-all"
          >
            Run AI Quality Check →
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-3xl border bg-white p-12 shadow-sm text-center">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 mb-4" />
          <p className="text-slate-600 font-medium">Analysing your listing…</p>
          <p className="text-slate-400 text-sm mt-1">This takes a few seconds</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <>
          {/* Overall score */}
          <div className="rounded-3xl border bg-white p-8 shadow-sm text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-2">Overall Score</p>
            <p className={`text-7xl font-black ${overallColor}`}>{result.overall_score}</p>
            <p className="text-slate-400 text-sm mt-1">out of 100</p>
          </div>

          {/* Score breakdown */}
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-slate-900">Score Breakdown</h2>
            <div className="space-y-5">
              {(Object.keys(SCORE_LABELS) as ScoreKey[]).map(key => (
                <ScoreBar key={key} label={SCORE_LABELS[key]} score={result.scores[key] ?? 0} />
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border bg-emerald-50 p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-emerald-900">✅ Strengths</h2>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-emerald-800 flex gap-2"><span>•</span><span>{s}</span></li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border bg-amber-50 p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-amber-900">💡 Improvements</h2>
              <ul className="space-y-2">
                {result.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-amber-800 flex gap-2"><span>•</span><span>{s}</span></li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI suggestions */}
          {(result.rewritten_title || result.rewritten_description_intro) && (
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-slate-900">✍️ AI Suggestions</h2>
              {result.rewritten_title && (
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Suggested Title</p>
                  <p className="rounded-2xl bg-purple-50 px-4 py-3 text-sm font-medium text-purple-900">{result.rewritten_title}</p>
                </div>
              )}
              {result.rewritten_description_intro && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Suggested Description Opening</p>
                  <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 leading-6">{result.rewritten_description_intro}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/dashboard/services/${slug}`}
              className="rounded-2xl bg-[#3ecf68] px-6 py-3 font-semibold text-white hover:bg-[#28a84e] transition-colors"
            >
              Edit Listing →
            </Link>
            <button
              onClick={runCheck}
              className="rounded-2xl border px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Re-run Check
            </button>
            <Link
              href="/schedule"
              className="rounded-2xl border px-6 py-3 font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              ← Back to Listings
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
