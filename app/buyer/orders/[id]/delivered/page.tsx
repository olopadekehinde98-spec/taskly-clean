type Props = {
  params: Promise<{ id: string }>
}

export default async function BuyerDeliveredOrderPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
            Buyer Delivery Review
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Order {id}</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="space-y-8">
            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                Delivery Submitted
              </h2>
              <p className="mb-6 leading-7 text-slate-700">
                The seller has submitted the delivery for your review. You can inspect the work, message the seller, request a revision, mark the order as complete, or open a dispute if there is a serious issue.
              </p>

              <div className="rounded-2xl border border-dashed bg-slate-50 p-6 text-sm text-slate-500">
                Delivered files preview UI will be connected later with backend file storage.
              </div>
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                Delivery Message
              </h2>
              <p className="leading-7 text-slate-700">
                Your order has been completed and the files are ready. Please review the delivery and let me know if everything looks good.
              </p>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Buyer Actions
              </h2>

              <div className="space-y-3">
                <a
                  href={`/buyer/orders/${id}/completed`}
                  className="block w-full rounded-2xl bg-emerald-600 px-5 py-3 text-center font-medium text-white"
                >
                  Mark as Complete
                </a>

                <a
                  href={`/buyer/orders/${id}/revision`}
                  className="block w-full rounded-2xl border px-5 py-3 text-center font-medium text-slate-700"
                >
                  Request Revision
                </a>

                <a
                  href={`/buyer/orders/${id}/dispute`}
                  className="block w-full rounded-2xl border border-red-300 px-5 py-3 text-center font-medium text-red-600"
                >
                  Open Dispute
                </a>

                <button className="w-full rounded-2xl border px-5 py-3 font-medium text-slate-700">
                  Message Seller
                </button>
              </div>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900">
                Review Rule
              </h2>
              <p className="text-sm leading-7 text-slate-600">
                Use revision for normal corrections. Use dispute only when there is a serious problem that cannot be resolved through normal delivery or revision flow.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}