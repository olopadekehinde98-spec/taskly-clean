'use client'

import { useState, useRef } from 'react'

export type Attachment = { name: string; url: string }

export default function FileAttach({
  attachments,
  onChange,
  bucket = 'attachments',
}: {
  attachments: Attachment[]
  onChange: (files: Attachment[]) => void
  bucket?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    setError('')
    setUploading(true)
    const uploaded: Attachment[] = []
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('bucket', bucket)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.error) { setError(data.error); break }
        uploaded.push({ name: file.name, url: data.url })
      }
      if (uploaded.length > 0) onChange([...attachments, ...uploaded])
    } finally {
      setUploading(false)
    }
  }

  function remove(url: string) {
    onChange(attachments.filter(a => a.url !== url))
  }

  return (
    <div className="space-y-2">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map(a => (
            <div key={a.url} className="flex items-center gap-1.5 rounded-xl border bg-slate-50 px-3 py-1.5 text-xs">
              <span>📎</span>
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-[#3ecf68] hover:underline max-w-[140px] truncate">{a.name}</a>
              <button onClick={() => remove(a.url)} className="text-slate-400 hover:text-red-500 ml-1">✕</button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-xs font-medium text-slate-500 hover:border-[#dae8df] hover:text-[#3ecf68] transition-all disabled:opacity-50"
      >
        {uploading ? '⏳ Uploading...' : '📎 Attach file'}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={e => { if (e.target.files?.length) handleFiles(e.target.files) }}
      />
    </div>
  )
}
