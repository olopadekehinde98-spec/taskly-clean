import Link from 'next/link'

type Props = {
  params: Promise<{ slug: string }>
}

const categoryMap: Record<
  string,
  {
    title: string
    description: string
    subcategories: string[]
    services: {
      slug: string
      title: string
      seller: string
      price: string
      rating: string
      tags: string[]
    }[]
  }
> = {
  publishing: {
    title: 'Publishing & Formatting',
    description:
      'Services for Kindle formatting, ebook layout, PDF cleanup, and digital publishing preparation.',
    subcategories: [
      'Kindle Formatting',
      'Ebook Layout',
      'KDP Setup',
      'PDF Cleanup',
      'Manuscript Formatting',
    ],
    services: [
      {
        slug: 'kindle-ebook-formatting',
        title: 'I will format your Kindle ebook professionally for Amazon KDP',
        seller: 'Taskly Studio',
        price: '$50',
        rating: '4.9',
        tags: ['Kindle Formatting', 'KDP', 'Ebook Layout'],
      },
    ],
  },
  'amazon-support': {
    title: 'Amazon Support',
    description:
      'Services for appeal letters, POA writing, account review, and policy support.',
    subcategories: [
      'Appeal Letters',
      'POA Writing',
      'Account Review',
      'Policy Guidance',
      'Seller Support',
    ],
    services: [
      {
        slug: 'amazon-appeal-letter',
        title: 'I will write a strong Amazon appeal letter and POA',
        seller: 'Taskly Studio',
        price: '$45',
        rating: '4.8',
        tags: ['Amazon Appeal', 'POA', 'Seller Support'],
      },
    ],
  },
  'writing-editing': {
    title: 'Writing & Editing',
    description:
      'Services for proofreading, editing, rewriting, and manuscript polishing.',
    subcategories: [
      'Proofreading',
      'Book Editing',
      'Rewriting',
      'Grammar Cleanup',
      'Manuscript Review',
    ],
    services: [
      {
        slug: 'ebook-editing-service',
        title: 'I will edit and proofread your ebook professionally',
        seller: 'Taskly Studio',
        price: '$30',
        rating: '4.9',
        tags: ['Proofreading', 'Editing', 'Manuscript Review'],
      },
    ],
  },
  'design-services': {
    title: 'Design Services',
    description:
      'Services for banners, gig images, thumbnails, and digital branding.',
    subcategories: [
      'Gig Images',
      'Banners',
      'Branding',
      'Thumbnails',
      'Social Graphics',
    ],
    services: [],
  },
  'web-tech': {
    title: 'Web & Tech Help',
    description:
      'Services for websites, landing pages, bug fixes, and deployment help.',
    subcategories: [
      'Landing Pages',
      'Bug Fixes',
      'Website Edits',
      'Deployment',
      'Technical Setup',
    ],
    services: [],
  },
  'business-services': {
    title: 'Business Services',
    description:
      'Services for admin support, documents, virtual tasks, and business help.',
    subcategories: [
      'Admin Support',
      'Document Preparation',
      'Virtual Assistance',
      'Presentation Cleanup',
      'Business Tasks',
    ],
    services: [],
  },
}

export default async function CategoryDetailsPage({ params }: Props) {
  const { slug } = await params
  const category = categoryMap[slug]

  if (!category) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-10 text-center shadow-sm">
          <h1 className="mb-4 text-3xl font-bold text-slate-900">Category not found</h1>
          <p className="text-slate-600">
            This category does not exist yet.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <Link href="/categories" className="mb-4 inline-block text-sm font-medium text-blue-600">
            ← Back to Categories
          </Link>

          <h1 className="mb-4 text-4xl font-bold text-slate-900">
            {category.title}
          </h1>

          <p className="max-w-3xl text-slate-600">
            {category.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-slate-900">Subcategories</h2>

            <div className="space-y-3">
              {category.subcategories.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="space-y-8">
            <section className="rounded-3xl border bg-white p-8 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-slate-900">
                Services in {category.title}
              </h2>

              {category.services.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">
                  No services attached yet for this category.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {category.services.map((service) => (
                    <div
                      key={service.slug}
                      className="rounded-2xl border bg-slate-50 p-5"
                    >
                      <h3 className="mb-3 text-lg font-semibold text-slate-900">
                        {service.title}
                      </h3>

                      <p className="mb-2 text-sm text-slate-600">
                        by {service.seller}
                      </p>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {service.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white px-3 py-1 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
                        <span>⭐ {service.rating}</span>
                        <span>{service.price}</span>
                      </div>

                      <Link
                        href={`/services/${service.slug}`}
                        className="font-medium text-blue-600"
                      >
                        View Service
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                Category Growth Note
              </h2>

              <p className="text-sm leading-7 text-slate-600">
                This category page structure is stronger than the old one because each category now has its own dedicated page, its own subcategories, and attached services. That is much closer to how a real marketplace should behave.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}