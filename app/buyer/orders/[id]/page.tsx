type Props = {
  params: Promise<{ id: string }>
}

const orderMap: Record<
  string,
  {
    id: string
    service: string
    seller: string
    package: string
    price: string
    deliveryTime: string
    status: string
    requirements: string
    createdAt: string
  }
> = {
  'BY-2001': {
    id: 'BY-2001',
    service: 'Kindle Ebook Formatting',
    seller: 'Taskly Studio',
    package: 'Standard',
    price: '$50',
    deliveryTime: '3 days',
    status: 'In Progress',
    requirements:
      'Please format my ebook for Amazon KDP with clickable table of contents and clean chapter layout.',
    createdAt: 'March 28, 2026',
  },
  'BY-2002': {
    id: 'BY-2002',
    service: 'Amazon Appeal Letter',
    seller: 'Taskly Studio',
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

export default async function BuyerOrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = orderMap[id]

  if (!order) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border bg-white p-10 text-center shadow-sm">
          <h1 className="mb-4 text-3xl font-bold text-slate-900">Order not found</h1>
          <p className="text-slate-600">
            The buyer order you are trying to view does not exist yet.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
            Buyer Order Details
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
                  <p className="text-sm text-slate-500">Seller</p>
                  <p className="mt-1 font-medium text-slate-900">{order.seller}</p>
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
              <h2 className="mb-6 text-xl font-bold text-slate-900">Order Progress</h2>

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
                    <p className="font-medium text-slate-900">Seller Started Work</p>
                    <p className="text-sm text-slate-500">In progress</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 h-4 w-4 rounded-full bg-slate-300" />
                  <div>
                    <p className="font-medium text-slate-900">Delivery Submitted</p>
                    <p className="text-sm text-slate-500">Pending seller delivery</p>
                  </div>
                </div>
              </div>
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
                  <span>Package</span>
                  <span className="font-medium text-slate-900">{order.package}</span>
                </div>

                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-medium text-slate-900">{order.price}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Buyer Actions</h2>
              <div className="space-y-3">
                <a
                  href={`/buyer/orders/${id}/delivered`}
                  className="block w-full rounded-2xl bg-blue-600 px-5 py-3 text-center font-medium text-white"
                >
                  Review Delivery
                </a>
                <button className="w-full rounded-2xl border px-5 py-3 font-medium text-slate-700">
                  Message Seller
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}