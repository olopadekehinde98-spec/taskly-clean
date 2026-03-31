type Props = {
  params: Promise<{ id: string }>
}

export default async function BuyerDisputeSubmittedPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">
          !
        </div>

        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-red-600">
          Dispute Submitted
        </p>

        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          Dispute opened for {id}
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-slate-600">
          The dispute request is now in the UI flow. Later, this should notify the seller and move the case into admin review.
        </p>

        <div className="mb-8 rounded-3xl bg-slate-50 p-6 text-left">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            What should happen later
          </h2>

          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>• Dispute record should be saved to the database.</p>
            <p>• Seller should receive immediate notification.</p>
            <p>• Admin should receive the case in a dispute review queue.</p>
            <p>• Final resolution should update the order state.</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/buyer/orders"
            className="rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
          >
            Back to Buyer Orders
          </a>

          <a
            href={`/buyer/orders/${id}`}
            className="rounded-2xl border px-6 py-3 font-medium text-slate-700"
          >
            View Order
          </a>
        </div>
      </div>
    </main>
  )
}