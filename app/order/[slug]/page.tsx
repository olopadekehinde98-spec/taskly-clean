type Props = {
  params: Promise<{ slug: string }>
}

type OrderService = {
  title: string
  seller: string
  sellerUsername: string
  packages: {
    name: string
    title: string
    price: string
    delivery: string
    includes: string
  }[]
}

const serviceMap: Record<string, OrderService> = {
  'kindle-ebook-formatting': {
    title: 'I will format your Kindle ebook professionally for Amazon KDP',
    seller: 'Taskly Studio',
    sellerUsername: 'tasklystudio',
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

export default async function OrderPage({ params }: Props) {
  const { slug } = await params
  const service = serviceMap[slug]

  if (!service) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-10 text-center shadow-sm">
          <h1 className="mb-4 text-3xl font-bold text-slate-900">Order page not found</h1>
          <p className="text-slate-600">
            The service you are trying to order does not exist yet.
          </p>
        </div>
      </main>
    )
  }

  const selectedPackage = service.packages[1]

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
            Checkout
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Complete Your Order</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="rounded-3xl border bg-white p-8 shadow-sm">
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-bold text-slate-900">
                {service.title}
              </h2>
              <p className="text-sm text-slate-600">
                Seller: {service.seller}
              </p>
            </div>

            <div className="mb-8 rounded-3xl bg-slate-50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Selected Package
              </h3>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    {selectedPackage.name}
                  </p>
                  <h4 className="mt-1 text-xl font-bold text-slate-900">
                    {selectedPackage.title}
                  </h4>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedPackage.includes}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    {selectedPackage.price}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedPackage.delivery}
                  </p>
                </div>
              </div>
            </div>

            <form className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Project Title
                </label>
                <input
                  type="text"
                  placeholder="Enter a short project title"
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Requirements / Instructions
                </label>
                <textarea
                  rows={7}
                  placeholder="Describe what you need clearly so the seller can deliver the service correctly."
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-slate-700">
                  Upload Project Files
                </label>

                <div className="rounded-3xl border border-dashed bg-slate-50 p-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">Attach files</p>
                      <p className="text-sm text-slate-500">
                        Manuscripts, briefs, screenshots, or supporting documents
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
                      manuscript.docx
                    </div>
                    <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                      project-brief.pdf
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    Real upload and storage will be connected later.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href="/order/confirmation"
                  className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
                >
                  Continue to Confirmation
                </a>

                <a
                  href={`/services/${slug}`}
                  className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
                >
                  Back to Service
                </a>
              </div>
            </form>
          </section>

          <aside className="h-fit rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-slate-900">Order Summary</h2>

            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Package</span>
                <span className="font-medium text-slate-900">
                  {selectedPackage.name}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-medium text-slate-900">
                  {selectedPackage.delivery}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Seller</span>
                <span className="font-medium text-slate-900">
                  {service.seller}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <div className="mb-3 flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-900">
                  {selectedPackage.price}
                </span>
              </div>

              <div className="mb-3 flex justify-between text-sm">
                <span className="text-slate-600">Service Fee</span>
                <span className="font-medium text-slate-900">$5</span>
              </div>

              <div className="flex justify-between text-base font-bold text-slate-900">
                <span>Total</span>
                <span>
                  ${Number(selectedPackage.price.replace('$', '')) + 5}
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-900">
                Payment Notice
              </p>
              <p className="text-sm leading-6 text-slate-600">
                Real payment integration will be connected later through Stripe or Paystack.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}