import Link from 'next/link'

const categories = [
  {
    slug: 'publishing',
    title: 'Publishing & Formatting',
    description:
      'Kindle formatting, ebook layout, manuscript styling, and publishing support.',
    count: '24 services',
    icon: '📘',
  },
  {
    slug: 'amazon-support',
    title: 'Amazon Support',
    description:
      'Appeal letters, POA writing, account review, and seller guidance.',
    count: '18 services',
    icon: '🛒',
  },
  {
    slug: 'writing-editing',
    title: 'Writing & Editing',
    description:
      'Proofreading, editing, rewriting, and manuscript improvement.',
    count: '31 services',
    icon: '✍️',
  },
  {
    slug: 'design-services',
    title: 'Design Services',
    description:
      'Gig images, banners, branding, and digital design assets.',
    count: '22 services',
    icon: '🎨',
  },
  {
    slug: 'web-tech',
    title: 'Web & Tech Help',
    description:
      'Landing pages, website edits, deployment help, and technical setup.',
    count: '14 services',
    icon: '💻',
  },
  {
    slug: 'business-services',
    title: 'Business Services',
    description:
      'Document prep, virtual support, admin help, and business tasks.',
    count: '16 services',
    icon: '📈',
  },
]

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
            Marketplace Categories
          </p>
          <h1 className="mb-4 text-4xl font-bold text-slate-900">
            Explore service categories
          </h1>
          <p className="max-w-2xl text-slate-600">
            Browse major service categories and open dedicated category pages with subcategories and related services.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                {category.icon}
              </div>

              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {category.title}
                </h2>
                <span className="text-sm text-slate-500">{category.count}</span>
              </div>

              <p className="mb-5 text-sm leading-7 text-slate-600">
                {category.description}
              </p>

              <span className="font-medium text-blue-600">
                Open category
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}