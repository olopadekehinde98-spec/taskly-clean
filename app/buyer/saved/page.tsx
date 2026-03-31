import Link from 'next/link'

const savedServices = [
  {
    slug: 'kindle-ebook-formatting',
    title: 'I will format your Kindle ebook professionally for Amazon KDP',
    seller: 'Taskly Studio',
    price: '$50',
    category: 'Publishing',
    tags: ['Kindle Formatting', 'KDP', 'Ebook Layout'],
  },
  {
    slug: 'amazon-appeal-letter',
    title: 'I will write a strong Amazon appeal letter and POA',
    seller: 'Taskly Studio',
    price: '$45',
    category: 'Business',
    tags: ['Amazon Appeal', 'POA', 'Seller Support'],
  },
  {
    slug: 'ebook-editing-service',
    title: 'I will edit and proofread your ebook professionally',
    seller: 'Taskly Studio',
    price: '$30',
    category: 'Writing',
    tags: ['Proofreading', 'Editing', 'Manuscript Review'],
  },
]

export default function BuyerSavedPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          Buyer Dashboard
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Saved Services</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Saved Count</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {savedServices.length}
          </h2>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Favorite Category</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Publishing
          </h2>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Recently Saved</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Kindle Ebook Formatting
          </h2>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {savedServices.map((service) => (
          <div
            key={service.slug}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {service.category}
              </span>

              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                Saved
              </span>
            </div>

            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              {service.title}
            </h2>

            <p className="mb-3 text-sm text-slate-600">by {service.seller}</p>

            <div className="mb-4 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="mb-4 text-sm font-medium text-slate-900">
              Starting at {service.price}
            </p>

            <div className="flex items-center justify-between">
              <Link
                href={`/services/${service.slug}`}
                className="font-medium text-blue-600"
              >
                View service
              </Link>

              <button className="text-sm font-medium text-slate-500">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}