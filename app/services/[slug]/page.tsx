'use client'

import Link from 'next/link'
import { useState } from 'react'

type Props = {
  params: Promise<{ slug: string }>
}

type Service = {
  title: string
  seller: string
  sellerUsername: string
  level: string
  rating: number
  reviews: number
  delivery: string
  category: string
  description: string
  tags: string[]
  keywordScore: number
  conversionScore: number
  trustScore: number
  packages: {
    name: string
    title: string
    price: string
    delivery: string
    includes: string
  }[]
}

const serviceMap: Record<string, Service> = {
  'kindle-ebook-formatting': {
    title: 'I will format your Kindle ebook professionally for Amazon KDP',
    seller: 'Taskly Studio',
    sellerUsername: 'tasklystudio',
    level: 'Top Seller',
    rating: 4.9,
    reviews: 128,
    delivery: '3 days',
    category: 'Publishing',
    description:
      'Professional Kindle ebook formatting for Amazon KDP with clean chapter layout, clickable table of contents, proper spacing, and polished reader-friendly formatting.',
    tags: ['Kindle Formatting', 'KDP', 'Ebook Layout', 'Amazon KDP'],
    keywordScore: 33,
    conversionScore: 18,
    trustScore: 37,
    packages: [
      {
        name: 'Basic',
        title: 'Basic Formatting',
        price: '$30',
        delivery: '2 days',
        includes: 'Basic layout cleanup and formatting',
      },
      {
        name: 'Standard',
        title: 'Standard KDP Formatting',
        price: '$50',
        delivery: '3 days',
        includes: 'Clickable TOC, full formatting cleanup, polished layout',
      },
      {
        name: 'Premium',
        title: 'Premium Full Formatting',
        price: '$80',
        delivery: '5 days',
        includes: 'Complete formatting, advanced cleanup, export-ready package',
      },
    ],
  },
  'amazon-appeal-letter': {
    title: 'I will write a strong Amazon appeal letter and POA',
    seller: 'Taskly Studio',
    sellerUsername: 'tasklystudio',
    level: 'Top Seller',
    rating: 4.8,
    reviews: 94,
    delivery: '2 days',
    category: 'Business',
    description:
      'Detailed Amazon appeal and plan of action writing service for sellers dealing with account issues, listing issues, and policy-related suspensions.',
    tags: ['Amazon Appeal', 'POA', 'Seller Support', 'Reinstatement'],
    keywordScore: 31,
    conversionScore: 17,
    trustScore: 36,
    packages: [
      {
        name: 'Basic',
        title: 'Basic Appeal Draft',
        price: '$25',
        delivery: '1 day',
        includes: 'Simple draft with core appeal structure',
      },
      {
        name: 'Standard',
        title: 'Standard Appeal + POA',
        price: '$45',
        delivery: '2 days',
        includes: 'Full appeal and POA structure with better clarity',
      },
      {
        name: 'Premium',
        title: 'Premium Appeal Package',
        price: '$70',
        delivery: '3 days',
        includes: 'Appeal, POA, detailed wording refinement, final review',
      },
    ],
  },
  'ebook-editing-service': {
    title: 'I will edit and proofread your ebook professionally',
    seller: 'Taskly Studio',
    sellerUsername: 'tasklystudio',
    level: 'Top Seller',
    rating: 4.9,
    reviews: 76,
    delivery: '2 days',
    category: 'Writing',
    description:
      'Clear, professional editing and proofreading for ebooks, guides, and manuscripts to improve grammar, structure, readability, and overall presentation.',
    tags: ['Proofreading', 'Editing', 'Manuscript Review', 'Ebook Editing'],
    keywordScore: 29,
    conversionScore: 16,
    trustScore: 35,
    packages: [
      {
        name: 'Basic',
        title: 'Basic Proofreading',
        price: '$20',
        delivery: '2 days',
        includes: 'Grammar and typo correction',
      },
      {
        name: 'Standard',
        title: 'Standard Editing',
        price: '$30',
        delivery: '3 days',
        includes: 'Editing, proofreading, readability cleanup',
      },
      {
        name: 'Premium',
        title: 'Premium Full Edit',
        price: '$55',
        delivery: '5 days',
        includes: 'Complete edit, polish, and detailed manuscript cleanup',
      },
    ],
  },
}

export default function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [saved, setSaved] = useState(false)

  const [resolvedSlug, setResolvedSlug] = useState<string | null>(null)

  Promise.resolve(params).then((p) => {
    if (resolvedSlug === null) setResolvedSlug(p.slug)
  })

  if (!resolvedSlug) {
    return null
  }

  const service = serviceMap[resolvedSlug]

  if (!service) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-10 text-center shadow-sm">
          <h1 className="mb-4 text-3xl font-bold">Service not found</h1>
          <p className="text-slate-600">
            The service you are trying to view does not exist yet.
          </p>
        </div>
      </main>
    )
  }

  const totalRankScore =
    service.keywordScore + service.conversionScore + service.trustScore

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-6 h-72 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600" />

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                {service.category}
              </span>

              <button
                type="button"
                onClick={() => setSaved(!saved)}
                className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                  saved
                    ? 'bg-red-50 text-red-600'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {saved ? 'Saved to Favorites' : 'Save Service'}
              </button>
            </div>

            <h1 className="mb-3 text-3xl font-bold text-slate-900">
              {service.title}
            </h1>

            <p className="mb-5 text-slate-600">
              by{' '}
              <Link
                href={`/seller/${service.sellerUsername}`}
                className="font-medium text-blue-600"
              >
                {service.seller}
              </Link>
            </p>

            <div className="mb-6 flex gap-6 text-sm text-slate-600">
              <span>⭐ {service.rating} ({service.reviews} reviews)</span>
              <span>{service.delivery} delivery</span>
            </div>

            <div className="mb-8">
              <h2 className="mb-3 text-xl font-semibold">Keyword Tags</h2>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="mb-3 text-xl font-semibold">About this service</h2>
              <p className="leading-7 text-slate-700">{service.description}</p>
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold">Packages</h2>

              <div className="grid gap-6 xl:grid-cols-3">
                {service.packages.map((pkg) => (
                  <div key={pkg.name} className="rounded-3xl border bg-slate-50 p-5">
                    <p className="mb-2 text-sm font-medium text-blue-600">{pkg.name}</p>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900">
                      {pkg.title}
                    </h3>
                    <p className="mb-3 text-2xl font-bold text-slate-900">{pkg.price}</p>
                    <p className="mb-3 text-sm text-slate-500">{pkg.delivery}</p>
                    <p className="text-sm leading-6 text-slate-600">{pkg.includes}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8 rounded-3xl bg-slate-50 p-6">
              <h2 className="mb-5 text-xl font-semibold text-slate-900">
                Why this service ranks well
              </h2>

              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex justify-between text-sm text-slate-600">
                    <span>Keyword Relevance</span>
                    <span>{service.keywordScore} / 35</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200">
                    <div
                      className="h-3 rounded-full bg-blue-600"
                      style={{ width: `${(service.keywordScore / 35) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm text-slate-600">
                    <span>Conversion Performance</span>
                    <span>{service.conversionScore} / 20</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200">
                    <div
                      className="h-3 rounded-full bg-indigo-600"
                      style={{ width: `${(service.conversionScore / 20) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-sm text-slate-600">
                    <span>Trust & Seller Strength</span>
                    <span>{service.trustScore} / 45</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200">
                    <div
                      className="h-3 rounded-full bg-purple-600"
                      style={{ width: `${(service.trustScore / 45) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                Total ranking score:{' '}
                <span className="font-semibold text-slate-900">
                  {totalRankScore}/100
                </span>
                . Services rank higher when they match buyer keywords well, convert strongly, and maintain high seller performance.
              </p>
            </div>

            <div className="rounded-3xl border bg-slate-50 p-6">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">
                Review Summary
              </h2>

              <div className="mb-5 flex items-center gap-4">
                <div className="text-4xl font-bold text-slate-900">4.9</div>
                <div>
                  <p className="text-amber-500">★★★★★</p>
                  <p className="text-sm text-slate-500">{service.reviews} verified reviews</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium text-slate-900">Excellent delivery and communication</p>
                    <span className="text-sm text-amber-500">★★★★★</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-700">
                    Very professional service. The final result was exactly what I needed.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium text-slate-900">Smooth process and quality result</p>
                    <span className="text-sm text-amber-500">★★★★☆</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-700">
                    Clear communication and strong final quality. I would order again.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="mb-3 text-xl font-semibold">What is included</h2>
              <ul className="space-y-2 text-slate-700">
                <li>• Professional service delivery</li>
                <li>• Clear communication</li>
                <li>• Quality review before submission</li>
                <li>• Revision support based on package</li>
              </ul>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border bg-white p-6 shadow-sm">
          <p className="mb-2 text-sm text-slate-500">Starting package</p>
          <p className="mb-4 text-3xl font-bold text-blue-600">
            {service.packages[0].price}
          </p>

          <div className="mb-6 flex items-center justify-between text-sm text-slate-600">
            <span>Delivery</span>
            <span>{service.packages[0].delivery}</span>
          </div>

          <Link
            href={`/order/${resolvedSlug}`}
            className="mb-3 block w-full rounded-2xl bg-blue-600 px-5 py-3 text-center font-medium text-white"
          >
            Continue
          </Link>

          <button className="w-full rounded-2xl border px-5 py-3 font-medium text-slate-700">
            Contact Seller
          </button>

          <div className="mt-6 border-t pt-6">
            <p className="mb-2 text-sm font-medium text-slate-700">Seller</p>
            <Link
              href={`/seller/${service.sellerUsername}`}
              className="text-blue-600"
            >
              {service.seller}
            </Link>
          </div>
        </aside>
      </div>
    </main>
  )
}