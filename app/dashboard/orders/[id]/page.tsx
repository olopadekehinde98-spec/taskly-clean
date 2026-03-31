type Props = {
  params: Promise<{ id: string }>
}

const orderMap: Record<
  string,
  {
    id: string
    buyer: string
    service: string
    package: string
    price: string
    deliveryTime: string
    status: string
    requirements: string
    createdAt: string
  }
> = {
  'TK-1024': {
    id: 'TK-1024',
    buyer: 'John Doe',
    service: 'Kindle Ebook Formatting',
    package: 'Standard',
    price: '$50',
    deliveryTime: '3 days',
    status: 'In Progress',
    requirements:
      'Please format my ebook for Amazon KDP with clickable table of contents and clean chapter layout.',
    createdAt: 'March 28, 2026',
  },
  'TK-1025': {
    id: 'TK-1025',
    buyer: 'Sarah Lee',
    service: 'Amazon Appeal Letter',
    package: 'Standard',
    price: '$45',
    deliveryTime: '2 days',
    status: 'Completed',
    requirements:
      'I need an appeal letter and POA for an Amazon related account issue.',
    createdAt: 'March 26, 2026',
  },
}

function getStatusClasses(status: string) {
  if (status === 'Completed') return 'bg-emerald-50 text-emerald-700'
  if (status === 'In Progress') return 'bg-blue-50 text-blue-700'
  return 'bg-amber-50 text-amber-700'
}

export default async function SellerOrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = orderMap[id]

  if (!order) {
    return (
      <main className="space-y-8">
        <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
          <h1 className="mb-4 text-3xl font-bold text-slate-900">Order not found</h1>
          <p className="text-slate-600">
            The seller order you are trying to view does not exist yet.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
          Seller Order Details
        </p>
        <h1 className="text-3xl font-bold text-slate-900">{order.id}</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-8">
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">{order.service}</h2>
              <span
                className={`rounded-full px-3 py-1 text-sm ${getStatusClasses(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Buyer</p>
                <p className="mt-1 font-medium text-slate-900">{order.buyer}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Package</p>
                <p className="mt-1 font-medium text-slate-900">{order.package}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Price</p>
                <p className="mt-1 font-medium text-slate-900">{order.price}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Delivery Time</p>
                <p className="mt-1 font-medium text-slate-900">{order.deliveryTime}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Buyer Requirements</h2>
            <p className="leading-7 text-slate-700">{order.requirements}</p>
          </div>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Submit Delivery</h2>

            <form className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Delivery Message
                </label>
                <textarea
                  rows={6}
                  placeholder="Write a delivery message for the buyer..."
                  className="w-full rounded-2xl border px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-slate-700">
                  Upload Delivery Files
                </label>

                <div className="rounded-3xl border border-dashed bg-slate-50 p-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">Attach delivery files</p>
                      <p className="text-sm text-slate-500">
                        Final documents, exports, revised versions, or project files
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
                      final-kdp-format.docx
                    </div>
                    <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                      final-export.pdf
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    Real upload and storage will be connected later.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href={`/dashboard/orders/${id}/delivered`}
                  className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
                >
                  Submit Delivery
                </a>

                <button
                  type="button"
                  className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
                >
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Order Summary</h2>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Order ID</span>
                <span className="font-medium text-slate-900">{order.id}</span>
              </div>

              <div className="flex justify-between">
                <span>Buyer</span>
                <span className="font-medium text-slate-900">{order.buyer}</span>
              </div>

              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-medium text-slate-900">{order.price}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Order Progress</h2>

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="mt-1 h-4 w-4 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-medium text-slate-900">Order Placed</p>
                  <p className="text-sm text-slate-500">{order.createdAt}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 h-4 w-4 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium text-slate-900">Work In Progress</p>
                  <p className="text-sm text-slate-500">Active seller work state</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 h-4 w-4 rounded-full bg-slate-300" />
                <div>
                  <p className="font-medium text-slate-900">Delivery Submitted</p>
                  <p className="text-sm text-slate-500">Pending final delivery</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}