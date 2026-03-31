'use client'

import { useState } from 'react'

interface JobBrief {
  title: string
  category: string
  budget_min: number
  budget_max: number
  delivery_days: number
  description: string
  requirements: string[]
  skills_needed: string[]
}

interface Props {
  onApply?: (brief: JobBrief) => void
}

export default function JobPostAssistant({ onApply }: Props) {
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState<JobBrief | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generateBrief() {
    if (!notes.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: 'job_post_assistant', payload: { notes } }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.result)
    } catch (err: any) {
      setError(err.message ?? 'Failed to generate brief')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">✍️</span>
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">AI Job Post Assistant</h3>
          <p className="text-xs text-slate-500">Describe your project in plain language — AI will write the brief</p>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="e.g. I need someone to design a logo for my new bakery called Sunrise Bakes. It should feel warm and modern. I need it in 3 days and my budget is around $50-100."
        className="w-full rounded-xl border px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
        rows={4}
      />

      <button
        onClick={generateBrief}
        disabled={loading || !notes.trim()}
        className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white disabled:opacity-50 hover:bg-blue-700 transition-colors"
      >
        {loading ? 'Writing your brief...' : '✨ Generate Job Brief'}
      </button>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900 text-sm">Your Generated Brief</h4>
            {onApply && (
              <button
                onClick={() => onApply(result)}
                className="rounded-xl bg-green-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
              >
                Use This Brief →
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400 mb-1">Category</p>
              <p className="text-sm font-semibold text-slate-900">{result.category}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400 mb-1">Budget</p>
              <p className="text-sm font-semibold text-slate-900">${result.budget_min}–${result.budget_max}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400 mb-1">Deadline</p>
              <p className="text-sm font-semibold text-slate-900">{result.delivery_days} days</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400 mb-1">Skills</p>
              <p className="text-sm font-semibold text-slate-900">{result.skills_needed.slice(0, 2).join(', ')}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Title</p>
            <p className="text-sm text-slate-800 font-medium">{result.title}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.description}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Requirements</p>
            <ul className="space-y-1">
              {result.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-blue-500 mt-0.5">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}