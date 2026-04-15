'use client'

import Link from 'next/link'
import { useState } from 'react'

type ServiceCardProps = {
  slug: string
  title: string
  seller: string
  level: string
  rating: number
  reviews: number
  price: string
  delivery: string
  category: string
  tags: string[]
}

export default function ServiceCard({
  slug,
  title,
  seller,
  level,
  rating,
  reviews,
  price,
  delivery,
  category,
  tags,
}: ServiceCardProps) {
  const [saved, setSaved] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <Link href={`/services/${slug}`} className="block">
        <div className="h-44 bg-gradient-to-r from-[#3ecf68] to-[#163522]" />
      </Link>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-[#edfbf2] px-3 py-1 text-xs font-medium text-[#3ecf68]">
            {category}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{level}</span>
            <button
              type="button"
              onClick={() => setSaved(!saved)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                saved
                  ? 'bg-red-50 text-red-600'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <Link href={`/services/${slug}`} className="block">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
        </Link>

        <p className="mb-3 text-sm text-gray-600">by {seller}</p>

        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <span>⭐ {rating} ({reviews})</span>
          <span>{delivery}</span>
        </div>

        <div className="text-right text-base font-bold text-[#3ecf68]">
          Starting at {price}
        </div>
      </div>
    </div>
  )
}