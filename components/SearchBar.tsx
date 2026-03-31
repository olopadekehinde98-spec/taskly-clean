'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmed = query.trim()

    if (!trimmed) {
      router.push('/services')
      return
    }

    router.push(`/services?search=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for ebook formatting, Amazon appeal, proofreading..."
        className="w-full rounded-2xl border border-white/30 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
      />

      <button
        type="submit"
        className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-medium text-white"
      >
        Search
      </button>
    </form>
  )
}