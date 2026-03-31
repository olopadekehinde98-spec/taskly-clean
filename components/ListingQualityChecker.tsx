'use client'

import { useState } from 'react'

interface QualityResult {
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

interface Props {
  title: string
  category: string
  description: string
  price: number
  deliveryDays: number
  onApplySuggestion?: (field: 'title' | 'description', value: string) => void
}

export default function ListingQualityChecker({ title, category, description, price, deliveryDays, onApplySuggestion }: Props) {
  const [result, setResult] = useState<QualityResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function checkQuality() {
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
      if (data.error) throw new Error(data.error)
      setResult(data.result)
    } catch (err: any) {
      setError(err.message ?? 'Failed to check quality')
    } finally {
      setLoading(false)
    }
  }

  function scoreColor(score: number) {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-amber-600'
    return 'text-red-500'
  }

  function scoreBar(score: number) {
    const pct = (score / 10) * 100
    const color = score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-amber-500' : 'bg-red-500'
    return (
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">AI Quality Checker</h3>
            <p className="text-xs text-slate-500">Powered by Claude AI</p>
          </div>
        </div>
        <button
          onClick={checkQuality}
          disabled={loading || !title || !description}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-blue-700 transition-colors"
        >
          {loading ? 'Analysing...' : 'Check Quality'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-5 mt-4">
          {/* Overall score */}
          <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
            <div className={`text-4xl font-bold ${scoreColor(result.overall_score)}`}>
              {result.overall_score}<span className="text-xl">/10</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Overall Quality Score</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {result.overall_score >= 8 ? 'Great listing! Ready to publish.' :
                 result.overall_score >= 6 ? 'Good, but a few improvements will boost conversions.' :
                 'Needs work before publishing for best results.'}
              </p>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Score Breakdown</h4>
            {Object.entries(result.scores).map(([key, val]) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-600 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className={`text-xs font-semibold ${scoreColor(val)}`}>{val}/10</span>
                </div>
                {scoreBar(val)}
              </div>
            ))}
          </div>

          {/* Strengths */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">✅ Strengths</h4>
            <ul className="space-y-1">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-green-500 mt-0.5">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">🔧 Improvements</h4>
            <ul className="space-y-1">
              {result.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-amber-500 mt-0.5">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestions */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">💡 AI Suggestions</h4>

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-blue-700">Suggested Title</span>
                {onApplySuggestion && (
                  <button
                    onClick={() => onApplySuggestion('title', result.rewritten_title)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Apply →
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-800">{result.rewritten_title}</p>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-blue-700">Suggested Opening</span>
                {onApplySuggestion && (
                  <button
                    onClick={() => onApplySuggestion('description', result.rewritten_description_intro)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Apply →
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-800">{result.rewritten_description_intro}</p>
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <p className="text-xs text-slate-400 text-center mt-2">
          Fill in your listing details above, then click Check Quality for AI feedback.
        </p>
      )}
    </div>
  )
}