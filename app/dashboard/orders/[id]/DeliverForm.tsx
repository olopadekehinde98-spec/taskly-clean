'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function DeliverForm({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    setFiles(prev => {
      const combined = [...prev, ...picked]
      return combined.slice(0, 5) // max 5 files
    })
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim() && files.length === 0) {
      setError('Please add a delivery message or attach at least one file.')
      return
    }
    setLoading(true)
    setError('')

    try {
      // Upload files first
      const uploadedUrls: string[] = []
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('bucket', 'attachments')
        fd.append('folder', `orders/${orderId}`)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.error) { setError(`Upload failed: ${data.error}`); setLoading(false); return }
        uploadedUrls.push(data.url)
      }

      // Submit delivery
      const res = await fetch('/api/orders/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          delivery_note: note.trim(),
          attachment_urls: uploadedUrls,
        }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      router.push(`/dashboard/orders/${orderId}/delivered`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Delivery Message</label>
        <textarea
          rows={5}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Describe what you've delivered and any instructions for the buyer..."
          className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
        />
      </div>

      {/* File upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Attachments <span className="text-slate-400 font-normal">(optional · max 5 files · 10MB each)</span></label>
        <div
          className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-blue-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <p className="text-sm text-slate-500">Click to attach files</p>
          <p className="text-xs text-slate-400 mt-1">Images, PDFs, ZIPs, docs accepted</p>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,.pdf,.zip,.doc,.docx,.txt,.xlsx,.csv"
            onChange={handleFiles}
            className="hidden"
          />
        </div>

        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-2 text-sm">
                <span className="text-slate-700 truncate max-w-[240px]">📎 {f.name}</span>
                <span className="text-xs text-slate-400 mx-2">{(f.size / 1024).toFixed(0)} KB</span>
                <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? (files.length > 0 ? 'Uploading & submitting…' : 'Submitting…') : 'Submit Delivery →'}
      </button>
    </form>
  )
}
