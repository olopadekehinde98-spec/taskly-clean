type Props = {
  params: Promise<{ id: string }>
}

export default async function BuyerOrderCompletedPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
          ✓
        </div>

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          Order Completed
        </p>

        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          Order {id} marked as complete
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-slate-600">
          The buyer completion state is now recorded in the UI flow. Later, this will update seller analytics, completion rate, earnings release, and buyer history.
        </p>

        <div className="mb-8 rounded-3xl bg-slate-50 p-6 text-left">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            What completion should affect later
          </h2>

          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>• Seller completion metrics</p>
            <p>• Order history records</p>
            <p>• Buyer completed orders list</p>
            <p>• Earnings settlement and analytics updates</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={`/buyer/orders/${id}/review`}
            className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
          >
            Leave Review
          </a>

          <a
            href="/buyer/orders"
            className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
          >
            Back to Buyer Orders
          </a>
        </div>
      </div>
    </main>
  )
}