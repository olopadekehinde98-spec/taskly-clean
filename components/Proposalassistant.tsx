'use client'

import { useState } from 'react'

interface ProposalResult {
  proposal: string
  suggested_price: number
  suggested_delivery_days: number
  key_selling_points: string[]
}

interface Props {
  jobTitle: string
  jobDescription: string
  sellerSkills: string
  sellerExperience: string
  onApply?: (proposal: string, price: number, days: number) => void
}

export default function ProposalAssistant({ jobTitle, jobDescription, sellerSkills, sellerExperience, onApply }: Props) {
  const [result, setResult] = useState<ProposalResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generateProposal() {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'proposal_assistant',
          payload: {
            job_title: jobTitle,
            job_description: jobDescription,
            seller_skills: sellerSkills,
            seller_experience: sellerExperience,
          },
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.result)
    } catch (err: any) {
      setError(err.message ?? 'Failed to generate proposal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">AI Proposal Assistant</h3>
            <p className="text-xs text-slate-500">Let AI help you write a winning proposal</p>
          </div>
        </div>
        <button
          onClick={generateProposal}
          disabled={loading || !jobTitle}
          className="rounded-xl bg-[#0d2818] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-[#0d2818] transition-colors"
        >
          {loading ? 'Writing...' : '✨ Generate'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#0d2818] p-3">
              <p className="text-xs text-[#3ecf68] mb-1">Suggested Price</p>
              <p className="text-lg font-bold text-[#3ecf68]">${result.suggested_price}</p>
            </div>
            <div className="rounded-xl bg-[#0d2818] p-3">
              <p className="text-xs text-[#3ecf68] mb-1">Delivery</p>
              <p className="text-lg font-bold text-[#3ecf68]">{result.suggested_delivery_days} days</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Your Proposal</p>
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {result.proposal}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Key Selling Points</p>
            <ul className="space-y-1">
              {result.key_selling_points.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-[#3ecf68] mt-0.5">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {onApply && (
            <button
              onClick={() => onApply(result.proposal, result.suggested_price, result.suggested_delivery_days)}
              className="w-full rounded-xl bg-[#0d2818] py-2.5 text-sm font-medium text-white hover:bg-[#0d2818] transition-colors"
            >
              Use This Proposal →
            </button>
          )}
        </div>
      )}
    </div>
  )
}