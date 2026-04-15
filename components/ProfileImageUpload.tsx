'use client'

import { useState, useRef } from 'react'

interface Props {
  currentLetter: string
  currentAvatarUrl?: string | null
}

export default function ProfileImageUpload({ currentLetter, currentAvatarUrl }: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const form = new FormData()
      form.append('file', file)
      form.append('bucket', 'avatars')

      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      // Save avatar_url to profile
      await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: data.url }),
      })

      setAvatarUrl(data.url)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-700">Profile Image</p>

      <div
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-36 w-36 cursor-pointer items-center justify-center rounded-full overflow-hidden bg-gradient-to-r from-[#3ecf68] to-[#163522] text-4xl font-bold text-white hover:opacity-90 transition-opacity"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <span>{currentLetter}</span>
        )}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm font-medium text-white">Change</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="hidden"
        name="avatar_url"
        value={avatarUrl ?? ''}
      />

      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="hidden"
        onChange={handleUpload}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mt-4 rounded-2xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
      >
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {avatarUrl && !error && <p className="mt-2 text-xs text-emerald-600">✓ Image saved</p>}
    </div>
  )
}
