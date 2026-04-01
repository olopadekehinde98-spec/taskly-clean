'use client'

import { useState, useRef } from 'react'

export default function GigImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || '')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      return
    }
    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('bucket', 'gig-images')
      fd.append('folder', 'gigs')

      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()

      if (data.error) { setError(data.error); return }

      setPreview(data.url)
      onChange(data.url)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          preview ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30'
        }`}
        style={{ minHeight: 180 }}
      >
        {preview ? (
          <>
            <img src={preview} alt="Gig cover" className="w-full h-44 object-cover rounded-2xl" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
              <p className="text-white text-sm font-semibold">Click to change</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
            <span className="text-4xl">{uploading ? '⏳' : '🖼️'}</span>
            <p className="text-sm font-semibold text-slate-700">{uploading ? 'Uploading...' : 'Upload Gig Cover Image'}</p>
            <p className="text-xs text-slate-400">Drag & drop or click · JPG, PNG, WEBP · Max 10MB</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-2xl">
            <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}
