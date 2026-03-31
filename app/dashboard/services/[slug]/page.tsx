type Props = {
  params: Promise<{ slug: string }>
}

type Service = {
  title: string
  category: string
  tags: string
  description: string
  status: string
  basicTitle: string
  basicPrice: string
  basicDelivery: string
  basicIncludes: string
  standardTitle: string
  standardPrice: string
  standardDelivery: string
  standardIncludes: string
  premiumTitle: string
  premiumPrice: string
  premiumDelivery: string
  premiumIncludes: string
}

const serviceMap: Record<string, Service> = {
  'kindle-ebook-formatting': {
    title: 'I will format your Kindle ebook professionally for Amazon KDP',
    category: 'Publishing',
    tags: 'Kindle Formatting, KDP, Ebook Layout',
    description:
      'Professional Kindle ebook formatting for Amazon KDP with clean chapter layout, clickable table of contents, proper spacing, and polished reader-friendly formatting.',
    status: 'Active',
    basicTitle: 'Basic Formatting',
    basicPrice: '$30',
    basicDelivery: '2 days',
    basicIncludes: 'Basic layout cleanup and formatting',
    standardTitle: 'Standard KDP Formatting',
    standardPrice: '$50',
    standardDelivery: '3 days',
    standardIncludes: 'Clickable TOC, full formatting cleanup, polished layout',
    premiumTitle: 'Premium Full Formatting',
    premiumPrice: '$80',
    premiumDelivery: '5 days',
    premiumIncludes: 'Complete formatting, advanced cleanup, export-ready package',
  },
  'amazon-appeal-letter': {
    title: 'I will write a strong Amazon appeal letter and POA',
    category: 'Business',
    tags: 'Amazon Appeal, POA, Seller Support',
    description:
      'Detailed Amazon appeal and plan of action writing service for sellers dealing with account issues, listing issues, and policy-related suspensions.',
    status: 'Active',
    basicTitle: 'Basic Appeal Draft',
    basicPrice: '$25',
    basicDelivery: '1 day',
    basicIncludes: 'Simple draft with core appeal structure',
    standardTitle: 'Standard Appeal + POA',
    standardPrice: '$45',
    standardDelivery: '2 days',
    standardIncludes: 'Full appeal and POA structure with better clarity',
    premiumTitle: 'Premium Appeal Package',
    premiumPrice: '$70',
    premiumDelivery: '3 days',
    premiumIncludes: 'Appeal, POA, detailed wording refinement, final review',
  },
  'ebook-editing-service': {
    title: 'I will edit and proofread your ebook professionally',
    category: 'Writing',
    tags: 'Proofreading, Editing, Manuscript Review',
    description:
      'Clear, professional editing and proofreading for ebooks, guides, and manuscripts to improve grammar, structure, readability, and overall presentation.',
    status: 'Draft',
    basicTitle: 'Basic Proofreading',
    basicPrice: '$20',
    basicDelivery: '2 days',
    basicIncludes: 'Grammar and typo correction',
    standardTitle: 'Standard Editing',
    standardPrice: '$30',
    standardDelivery: '3 days',
    standardIncludes: 'Editing, proofreading, readability cleanup',
    premiumTitle: 'Premium Full Edit',
    premiumPrice: '$55',
    premiumDelivery: '5 days',
    premiumIncludes: 'Complete edit, polish, and detailed manuscript cleanup',
  },
}

export default async function EditServicePage({ params }: Props) {
  const { slug } = await params
  const service = serviceMap[slug]

  if (!service) {
    return (
      <main className="space-y-8">
        <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
          <h1 className="mb-4 text-3xl font-bold text-slate-900">Gig not found</h1>
          <p className="text-slate-600">
            The gig you are trying to edit does not exist yet.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          Seller Dashboard
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Edit Gig</h1>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <section className="rounded-3xl border bg-white p-8 shadow-sm">
          <form className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Gig Title
              </label>
              <input
                type="text"
                defaultValue={service.title}
                className="w-full rounded-2xl border px-4 py-3 outline-none"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  defaultValue={service.category}
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                >
                  <option>Publishing</option>
                  <option>Business</option>
                  <option>Writing</option>
                  <option>Design</option>
                  <option>Web & Tech</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tags
                </label>
                <input
                  type="text"
                  defaultValue={service.tags}
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                rows={5}
                defaultValue={service.description}
                className="w-full rounded-2xl border px-4 py-3 outline-none"
              />
            </div>

            <div>
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                Pricing Packages
              </h2>

              <div className="grid gap-6 xl:grid-cols-3">
                <div className="rounded-3xl border bg-slate-50 p-5">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">Basic</h3>

                  <div className="space-y-4">
                    <input
                      type="text"
                      defaultValue={service.basicTitle}
                      className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    />
                    <input
                      type="text"
                      defaultValue={service.basicPrice}
                      className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    />
                    <select
                      defaultValue={service.basicDelivery}
                      className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    >
                      <option>1 day</option>
                      <option>2 days</option>
                      <option>3 days</option>
                      <option>5 days</option>
                    </select>
                    <textarea
                      rows={4}
                      defaultValue={service.basicIncludes}
                      className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-3xl border bg-slate-50 p-5">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">Standard</h3>

                  <div className="space-y-4">
                    <input
                      type="text"
                      defaultValue={service.standardTitle}
                      className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    />
                    <input
                      type="text"
                      defaultValue={service.standardPrice}
                      className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    />
                    <select
                      defaultValue={service.standardDelivery}
                      className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    >
                      <option>2 days</option>
                      <option>3 days</option>
                      <option>5 days</option>
                      <option>7 days</option>
                    </select>
                    <textarea
                      rows={4}
                      defaultValue={service.standardIncludes}
                      className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-3xl border bg-slate-50 p-5">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">Premium</h3>

                  <div className="space-y-4">
                    <input
                      type="text"
                      defaultValue={service.premiumTitle}
                      className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    />
                    <input
                      type="text"
                      defaultValue={service.premiumPrice}
                      className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    />
                    <select
                      defaultValue={service.premiumDelivery}
                      className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    >
                      <option>3 days</option>
                      <option>5 days</option>
                      <option>7 days</option>
                      <option>10 days</option>
                    </select>
                    <textarea
                      rows={4}
                      defaultValue={service.premiumIncludes}
                      className="w-full rounded-2xl border bg-white px-4 py-3 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-dashed bg-slate-50 p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">Gig Images & Attachments</p>
                  <p className="text-sm text-slate-500">
                    Update cover image, sample files, previews, or supporting assets
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-2xl border px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Select Files
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                  existing-cover-image.png
                </div>
                <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                  existing-sample.pdf
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Real upload and storage will be connected later.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                defaultValue={service.status}
                className="w-full rounded-2xl border px-4 py-3 outline-none"
              >
                <option>Active</option>
                <option>Draft</option>
                <option>Paused</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
              >
                Update Gig
              </button>

              <button
                type="button"
                className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
              >
                Save Draft
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Ranking Improvement Tips
            </h2>

            <div className="space-y-4 text-sm leading-7 text-slate-600">
              <p>Keep the title clear and keyword-focused.</p>
              <p>Use tags that match what buyers actually search for.</p>
              <p>Improve the first sentence of the description to match the service title.</p>
              <p>Package variety improves conversion and gives buyers clearer value options.</p>
              <p>Review underperforming gigs and refresh the offer structure if needed.</p>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Edit Rule
            </h2>

            <p className="text-sm leading-7 text-slate-600">
              Updating a gig should improve relevance, clarity, and conversion.
              Better titles, stronger tags, and better package value help ranking performance.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}